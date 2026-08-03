/**
 * Public sign-up — the second door onto the list.
 *
 * Unlike /api/payment/checkout this endpoint CANNOT be token-gated: its whole
 * purpose is that anyone in the world can reach it. So it carries its own abuse
 * controls rather than relying on a shared secret:
 *
 *   - per-IP rate limit, tighter than the payment route because a legitimate person
 *     signs up once;
 *   - a honeypot field that a real form leaves empty;
 *   - a length cap before anything touches the database;
 *   - an identical response whether the address was new, already present, or
 *     rejected. A route that answers "already subscribed" differently is an
 *     email-enumeration oracle, and this list includes donors.
 *
 * The wording is imported from lib/consent.ts, never restated here. That is the
 * point of having one wording: this door and the checkout tick-box grant the same
 * permission, and cannot drift.
 */

import { addSubscriber } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { consentRecord } from "@/lib/consent";

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

const MAX_EMAIL = 254; // RFC 5321 practical maximum
const MAX_NAME = 120;

/** Same body for every outcome. See the enumeration note above. */
const ACCEPTED = {
  success: true,
  message: "Thank you — you are on the list.",
} as const;

export async function POST(req: Request) {
  const limited = rateLimit(
    `subscribe:${clientIp(req)}`,
    RATE_LIMIT,
    RATE_WINDOW_MS,
  );
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ success: false, error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  // Bots fill every field they find; the real form keeps this one empty and hidden.
  const honeypot = typeof body.website === "string" ? body.website.trim() : "";

  if (honeypot) {
    // Answer exactly as success, so a bot learns nothing and stops retrying.
    return Response.json(ACCEPTED, { status: 200 });
  }

  if (
    email.length > MAX_EMAIL ||
    name.length > MAX_NAME ||
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
  ) {
    // The one case worth reporting honestly: the person mistyped their address and
    // would otherwise never receive anything. This leaks no membership information.
    return Response.json(
      { success: false, error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const consent = consentRecord(true);
  try {
    await addSubscriber({
      email,
      name: name || undefined,
      source: "signup",
      consentText: consent.text,
      consentVersion: consent.version,
    });
  } catch (err) {
    // Unlike the newsletter write during checkout, this failure IS the whole
    // request — telling someone they are on the list when they are not would be a
    // promise we cannot keep on 1 November.
    console.error("[/api/subscribe] could not record the sign-up", err);
    return Response.json(
      { success: false, error: "Couldn't record that just now. Please try again." },
      { status: 503 },
    );
  }

  return Response.json(ACCEPTED, { status: 200 });
}
