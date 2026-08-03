/**
 * Subscriber export — how the list is read without an admin page.
 *
 * Project 108 has no auth system and should not grow one for this. Building a login,
 * sessions and a user table so that one person can occasionally fetch a list of
 * addresses would be a large new attack surface for a small need. Instead this is a
 * machine endpoint behind a shared secret, the same pattern as
 * /api/payment/reconcile:
 *
 *   curl -H "X-Subscribe-Secret: $SUBSCRIBE_SECRET" \
 *        https://108.gmc.bt/api/subscribers/export > subscribers.csv
 *
 * CSV because the destination is a mail tool or a spreadsheet, not a screen. Add
 * `?format=json` if something needs to consume it programmatically.
 *
 * `?version=` pins the export to a consent wording. Use it: sending to everyone
 * regardless of what they agreed to is precisely the failure the versioning exists
 * to prevent.
 *
 * Fails closed — 404, not 401 — when SUBSCRIBE_SECRET is unset or wrong, so an
 * unauthorised caller cannot even confirm the endpoint exists. This returns every
 * address we hold; it must never be reachable because a secret was forgotten.
 */

import { consentedEmails } from "@/lib/db";
import { exportSecretMatches, subscribeSecretConfigured } from "@/lib/subscribeToken";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

/** Neutralise anything Excel would evaluate as a formula. */
function csvCell(v: string | null): string {
  const s = (v ?? "").replace(/"/g, '""');
  const risky = /^[=+\-@\t\r]/.test(s);
  return `"${risky ? "'" + s : s}"`;
}

export async function GET(req: Request) {
  // Rate limited even behind the secret: a leaked secret should not also mean
  // unlimited bulk extraction.
  const limited = rateLimit(`export:${clientIp(req)}`, 10, 60_000);
  if (limited) return limited;

  if (!subscribeSecretConfigured()) {
    console.error("[/api/subscribers/export] SUBSCRIBE_SECRET is not set");
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  if (!exportSecretMatches(req.headers.get("x-subscribe-secret") || "")) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const version = url.searchParams.get("version") || undefined;

  let contacts;
  try {
    contacts = await consentedEmails({ version });
  } catch (err) {
    console.error("[/api/subscribers/export] query failed", err);
    return Response.json({ error: "Export failed." }, { status: 503 });
  }

  if (url.searchParams.get("format") === "json") {
    return Response.json(
      { count: contacts.length, version: version ?? "all", contacts },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }

  const rows = [
    "email,name,consented_at,consent_version,source",
    ...contacts.map((c) =>
      [
        csvCell(c.email),
        csvCell(c.name),
        csvCell(c.consentAt?.toISOString() ?? ""),
        csvCell(c.consentVersion),
        csvCell(c.source),
      ].join(","),
    ),
  ].join("\r\n");

  return new Response(rows, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="p108-subscribers.csv"',
      "Cache-Control": "no-store",
      // Never let an intermediary or a browser hold on to this.
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
