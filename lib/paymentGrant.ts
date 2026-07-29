/**
 * Short-lived grants for the unlisted contribution page.
 *
 * The checkout route is gated by PAYMENT_ACCESS_TOKEN, but a browser form
 * cannot hold that value: it would end up in the page HTML, and leaking it
 * would permanently defeat the gate on a live-money endpoint.
 *
 * Instead the /contribute server component mints a grant that is signed with the
 * same secret and expires in minutes. Checkout accepts either the raw token
 * (for our own server-side calls) or a valid unexpired grant. A leaked grant is
 * bounded — it stops working shortly, and it can never be used to derive the
 * secret.
 *
 * Format: <expiry-ms>.<hex hmac-sha256 of the expiry>
 */

import crypto from "node:crypto";

const TTL_MS = 15 * 60 * 1000; // long enough to fill the form, short enough to matter

function secret(): string {
  return process.env.PAYMENT_ACCESS_TOKEN || "";
}

/** Mint a grant. Returns "" when no secret is configured (gate is then off). */
export function mintGrant(): string {
  const s = secret();
  if (!s) return "";
  const exp = String(Date.now() + TTL_MS);
  const sig = crypto.createHmac("sha256", s).update(exp).digest("hex");
  return `${exp}.${sig}`;
}

/** Verify a grant: correct signature and not expired. */
export function verifyGrant(grant: string): boolean {
  const s = secret();
  if (!s || !grant) return false;

  const dot = grant.indexOf(".");
  if (dot <= 0) return false;
  const exp = grant.slice(0, dot);
  const sig = grant.slice(dot + 1);

  if (!/^\d+$/.test(exp)) return false;

  const expected = crypto.createHmac("sha256", s).update(exp).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  // Compare before checking expiry so the work is constant regardless of outcome.
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  return Number(exp) > Date.now();
}
