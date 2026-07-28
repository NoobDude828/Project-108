/**
 * Same-origin proxy for the 108 submission API.
 *
 * The browser POSTs to /api/submit/patrons (or /volunteers); this handler runs
 * on the server (no CORS) and forwards the body to the upstream API. We do this
 * because the upstream service at gmc.bt/api was rejecting browser preflight
 * OPTIONS requests, which silently blocked every form submission.
 *
 * Status code, body and content-type are passed through so the client can keep
 * handling 201 / 400 / 409 / 500 the same way — with two hardening measures
 * added after the BtCIRT penetration test:
 *
 *  1. Per-IP rate limiting. The endpoints previously accepted unlimited traffic
 *     (10 parallel POSTs in 330ms all succeeded), which is what made bulk CID /
 *     email enumeration and record-flooding practical.
 *  2. The upstream 409 body is replaced with a single generic message. Upstream
 *     returns distinct strings ("A submission with this CID already exists" vs
 *     "...this email already exists" vs "An organization registration with this
 *     contact email already exists"), which told an attacker *which* identifier
 *     matched and under which flow it was registered. The client only branches
 *     on the 409 status, never the text, so this is safe.
 *
 * Note: the 201-vs-409 distinction itself is still observable. Fully closing
 * that oracle means returning an identical response for new and duplicate
 * submissions, which removes the "you are already registered" feedback — a
 * product decision, and it also needs the upstream dedup fix (unscoped
 * email/CID uniqueness) to be worth doing.
 */

import { clientIp, rateLimit } from "@/lib/rateLimit";

const UPSTREAM = "https://gmc.bt/api";
const ALLOWED_ROLES = new Set(["patrons", "volunteers"]);

// A person registers once. Anything beyond a handful per minute from one IP is
// automation, not a human filling in a form.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

export async function POST(
  req: Request,
  ctx: { params: Promise<{ role: string }> },
) {
  const { role } = await ctx.params;
  if (!ALLOWED_ROLES.has(role)) {
    return Response.json(
      { success: false, error: "Unknown submission role" },
      { status: 400 },
    );
  }

  const limited = rateLimit(
    `submit:${clientIp(req)}`,
    RATE_LIMIT,
    RATE_WINDOW_MS,
  );
  if (limited) return limited;

  const body = await req.text();

  let upstream: Response;
  try {
    upstream = await fetch(`${UPSTREAM}/${role}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      // Edge networks sometimes cache POST responses oddly; opt out.
      cache: "no-store",
    });
  } catch (err) {
    console.error("[/api/submit] upstream fetch failed", err);
    return Response.json(
      {
        success: false,
        error: "Couldn't reach the submission service.",
      },
      { status: 502 },
    );
  }

  // Collapse the upstream's field-specific duplicate messages into one generic
  // string so the response cannot be used to identify which CID/email matched.
  if (upstream.status === 409) {
    return Response.json(
      { success: false, error: "This identifier is already registered." },
      { status: 409 },
    );
  }

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") || "application/json",
    },
  });
}
