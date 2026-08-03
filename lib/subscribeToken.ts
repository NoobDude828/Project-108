/**
 * Unsubscribe links, and the gate on the subscriber export.
 *
 * An unsubscribe link has to keep working for as long as the address might receive
 * mail, so unlike lib/paymentGrant.ts these tokens carry NO expiry. What they do
 * carry is a signature over the address itself, which means:
 *   - a recipient cannot edit the link to unsubscribe somebody else;
 *   - we do not need a per-subscriber random token column, so an address that signs
 *     up, leaves and returns cannot end up with stale links in old emails.
 *
 * Fails closed. With no SUBSCRIBE_SECRET configured nothing verifies, so the
 * unsubscribe and export routes 404 rather than operate unauthenticated. That is
 * deliberate: an export of every address we hold must never be reachable because a
 * secret was forgotten.
 */

import crypto from "node:crypto";

function secret(): string {
  return process.env.SUBSCRIBE_SECRET || "";
}

export function subscribeSecretConfigured(): boolean {
  return secret().length > 0;
}

/** Normalised so the signature does not depend on how the address was typed. */
function canonical(email: string): string {
  return email.trim().toLowerCase();
}

export function mintUnsubscribeToken(email: string): string {
  const s = secret();
  if (!s) throw new Error("SUBSCRIBE_SECRET is not set — cannot mint an unsubscribe token");
  return crypto.createHmac("sha256", s).update(canonical(email)).digest("hex");
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const s = secret();
  if (!s || !email || !token) return false;
  const expected = crypto.createHmac("sha256", s).update(canonical(email)).digest("hex");
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Constant-time check of the export gate. */
export function exportSecretMatches(provided: string): boolean {
  const s = secret();
  if (!s || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(s);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
