/**
 * DK Bank (Digital Kidu) "Stripe Payment Processing API" client.
 *
 * Project 108 calls DK directly (server-side) using the DK_* env vars. The DK
 * key is server-only (never NEXT_PUBLIC), read only inside these route handlers.
 *
 * Contract per "Stripe Payment Processing API Documentation v2.pdf":
 *   POST {DK_API_BASE}/checkout                       → create Stripe session
 *   GET  {DK_API_BASE}/check-application-status?...   → poll completion (boolean)
 * Auth header: X-Gravitee-Api-Key.
 */

import crypto from "node:crypto";

const DK_API_BASE = (process.env.DK_API_BASE || "").replace(/\/+$/, "");
const DK_API_KEY = process.env.DK_API_KEY || "";
const DK_SUBMERCHANT_ID = process.env.DK_SUBMERCHANT_ID || "";
const DK_ACCOUNT = process.env.DK_ACCOUNT || "";
const DK_AGENCY_NAME = process.env.DK_AGENCY_NAME || "";

const DK_TIMEOUT_MS = 20_000;

// No placeholders, no empty sends: every DK credential must be
// supplied via the environment. If any is missing/empty we throw loudly rather
// than send a blank or guessed value to DK.
function assertDkConfig(): void {
  const missing = (
    [
      ["DK_API_BASE", DK_API_BASE],
      ["DK_API_KEY", DK_API_KEY],
      ["DK_SUBMERCHANT_ID", DK_SUBMERCHANT_ID],
      ["DK_ACCOUNT", DK_ACCOUNT],
      ["DK_AGENCY_NAME", DK_AGENCY_NAME],
    ] as const
  )
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length > 0) {
    throw new Error(
      `DK payment mode is enabled but required env vars are missing/empty: ${missing.join(", ")}`,
    );
  }
}

// DK's published fee model (v2 PDF): Stripe 4.15% + DK 0.7% + fixed $0.60,
// ROUND_HALF_UP to 2dp, ADDED ON TOP — the customer pays base + fees. We know
// the formula, so we compute/store it; DK never returns the settled fee.
export const FEE_FORMULA_VERSION = "v2_4.85pct_plus_0.60";

/**
 * All fee arithmetic runs in INTEGER CENTS, never in floating-point dollars.
 *
 * 4.85% of $10.00 is exactly $0.485, which must round half-up to $0.49. In binary
 * floating point that product is 0.48499999999999998…, so the obvious
 * `Math.round(x * 100) / 100` rounds it DOWN and undercharges by a cent — and $10
 * is not a contrived example, it is a figure people actually give. Ties land on
 * every base of $10.00, $30.00, $50.00 and so on. Integers make the tie exact and
 * the rounding decision explicit, which is the only defensible way to compute
 * money that someone is charged.
 *
 * 485/10000 is 4.85% expressed exactly; +5000 before the integer division is the
 * half-up bias.
 */
const FEE_PCT_NUM = 485; // 4.85% as a fraction of 10000
const FEE_PCT_DEN = 10000;
const FEE_FIXED_CENTS = 60;

const toCents = (dollars: number) => Math.round(dollars * 100);
const toDollars = (cents: number) => cents / 100;

function feeCents(baseCents: number): number {
  // ROUND_HALF_UP on the percentage component, then add the fixed component,
  // which is already whole cents and needs no rounding.
  const pct = Math.floor((baseCents * FEE_PCT_NUM + FEE_PCT_DEN / 2) / FEE_PCT_DEN);
  return pct + FEE_FIXED_CENTS;
}

export function computeFees(base: number): {
  feeTotal: number;
  customerPays: number;
  netToProject: number;
} {
  const baseCents = toCents(base);
  const fee = feeCents(baseCents);
  return {
    feeTotal: toDollars(fee),
    customerPays: toDollars(baseCents + fee),
    // Fees are added on top, so the project is made whole at the base amount.
    // Flagged computed_unconfirmed until DK confirms the net in writing.
    netToProject: toDollars(baseCents),
  };
}

/**
 * Inverse of computeFees: the base amount to send DK so the donor is charged
 * exactly `total`.
 *
 * Needed because covering the processing fee is the donor's choice. DK always
 * grosses up whatever `amount` we send, so there are two cases:
 *
 *   covering the fee     -> send the offer itself; DK charges offer + fee, and
 *                           the project receives the full offer.
 *   NOT covering the fee -> the donor should be charged exactly what they
 *                           offered, so we must send a SMALLER base that grosses
 *                           up to it. The project then receives that smaller
 *                           figure and absorbs the difference.
 *
 * Not every total is exactly reachable. Because the fee is itself rounded to
 * cents, the achievable totals step unevenly: for a $10 target, base 8.96 charges
 * $9.99 and base 8.97 charges $10.01 — $10.00 does not exist. So this returns the
 * largest base whose total does NOT exceed the target.
 *
 * Erring under is deliberate. Charging even a cent more than the figure the donor
 * chose is the precise thing that reads as a penalty, and this is the last screen
 * before payment; a cent less is harmless.
 */
export function baseForTotal(total: number): number {
  const totalCents = toCents(total);
  // Closed-form estimate, then verified against the forward calculation — the
  // inverse of a rounded function cannot be trusted analytically.
  const estimate = Math.round(
    ((totalCents - FEE_FIXED_CENTS) * FEE_PCT_DEN) / (FEE_PCT_DEN + FEE_PCT_NUM),
  );

  // Walk out from the estimate and keep the largest base that stays within the
  // target. A handful of cents either side is far more than enough — the estimate
  // is never more than a cent or two off.
  let best: number | null = null;
  for (let c = estimate - 5; c <= estimate + 5; c++) {
    if (c <= 0) continue;
    if (c + feeCents(c) <= totalCents && (best === null || c > best)) best = c;
  }

  // Below DK's $1.00 minimum nothing is chargeable anyway; return the estimate
  // and let the route's own validation reject it.
  return toDollars(best ?? estimate);
}

/**
 * DK will not process a base below $1.00, and p108_payments enforces the same floor
 * (CHECK amount >= 1). Both apply to the amount we SEND, which is not the amount the
 * donor typed.
 */
export const MIN_BASE_USD = 1;
const MIN_BASE_CENTS = 100;

/**
 * The smallest offer we can actually accept, given the donor's fee choice.
 *
 *   covering     -> the offer IS the base, so the floor is simply $1.00.
 *   NOT covering -> the base is grossed DOWN from the offer, so a $1.00 offer sends
 *                   a base of $0.38 — under DK's minimum and under the table's CHECK
 *                   constraint. The offer has to be large enough that what remains
 *                   after the fee still clears $1.00, which is $1.65.
 *
 * This existed as a live bug: validation checked the offer against $1.00 and never
 * the derived base, so declining the fee on a $1.00 offer got all the way to the
 * INSERT and failed there with a constraint violation the donor saw as
 * "Couldn't start the payment".
 *
 * Derived from the fee formula rather than hardcoded, so it follows if DK's rates
 * ever change.
 */
export function minOfferUsd(coversFee: boolean): number {
  if (coversFee) return MIN_BASE_USD;
  return (MIN_BASE_CENTS + feeCents(MIN_BASE_CENTS)) / 100;
}

/**
 * Unique application_no ("transaction ID"). DK requires it to be NUMERIC and
 * unique — it is their idempotency key, and ours (UNIQUE in p108_payments) — so a
 * collision is a failed checkout for a real donor.
 *
 * Composed of epoch-ms + a per-process counter + crypto-random digits:
 *  - the counter makes two calls in the same millisecond impossible to collide
 *    within a process (prod is a single PM2 fork, so that covers it);
 *  - the random suffix covers the multi-process case should it ever be scaled.
 *
 * An earlier version used only 3 random digits, which collided roughly 64% of the
 * time over 5,000 same-millisecond calls.
 */
let lastMs = 0;
let seqInMs = 0;

export function makeApplicationNo(): string {
  const now = Date.now();
  if (now === lastMs) {
    seqInMs += 1;
  } else {
    lastMs = now;
    seqInMs = 0;
  }
  // The sequence resets each millisecond, so (timestamp, sequence) is unique
  // within this process by construction — not probabilistically. Four digits
  // allows 10,000 checkouts in a single millisecond before it could wrap.
  const seq = String(seqInMs % 10000).padStart(4, "0");
  // Random tail covers the multi-process case if this is ever scaled out.
  const rand = String(crypto.randomInt(0, 1000)).padStart(3, "0");
  return `${now}${seq}${rand}`;
}

/**
 * DK response codes that represent a transient gateway fault rather than a
 * decision about the request — per their error table: internal error, service
 * unavailable, service/connection timeout, network error, verification service
 * error. Worth retrying; everything else is a verdict and must not be.
 */
const DK_TRANSIENT_CODES = new Set([
  "5000",
  "5002",
  "5003",
  "5004",
  "5005",
  "5006",
]);

function isTransient(status: number, code?: string): boolean {
  if (code && DK_TRANSIENT_CODES.has(code)) return true;
  // 502/503/504 from the gateway itself, before DK's own envelope is produced.
  return status === 502 || status === 503 || status === 504;
}

/** Map a DK response_code to an appropriate HTTP status for our client. */
export function dkErrorStatus(code?: string): number {
  switch (code) {
    case "4004":
      return 404; // merchant not found
    case "4003":
      return 409; // duplicate
    case "4029":
      return 429; // rate limited
    default:
      if (code && code.startsWith("5")) return 502; // gateway/service errors
      return 400; // 4001/4002/other validation
  }
}

type DkCheckoutOk = { ok: true; sessionUrl: string; sessionId?: string };
type DkCheckoutErr = {
  ok: false;
  httpStatus: number;
  code?: string;
  message?: string;
};
export type DkCheckoutResult = DkCheckoutOk | DkCheckoutErr;

type DkEnvelope = {
  response_code?: string;
  response_message?: string;
  response_description?: string;
  response_data?: unknown;
};

async function dkFetch(path: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DK_TIMEOUT_MS);
  try {
    return await fetch(`${DK_API_BASE}${path}`, {
      ...init,
      headers: {
        "X-Gravitee-Api-Key": DK_API_KEY,
        ...(init.headers || {}),
      },
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Retry wrapper for SAFE, IDEMPOTENT reads only.
 *
 * Deliberately not used for /checkout. That call creates a gateway session, and
 * DK's only idempotency handle is application_no: if a request times out after
 * DK created the session, retrying returns 4003 (duplicate) — and DK does not
 * give the session_url back on a 4003, so the session would be stranded and
 * unreachable. Blind retries there would turn one ambiguous outcome into a lost
 * one. That ambiguity is resolved by reconciliation instead, which polls the
 * status of the application_no we already recorded.
 */
async function withRetry<T>(
  label: string,
  attempt: () => Promise<{ value: T; transient: boolean }>,
  attempts = 3,
): Promise<T> {
  let lastErr: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      const { value, transient } = await attempt();
      if (!transient || i === attempts) return value;
    } catch (e) {
      lastErr = e;
      if (i === attempts) throw e;
    }
    // 250ms, 500ms — short enough to stay inside a request, long enough to let a
    // brief gateway blip pass.
    await new Promise((r) => setTimeout(r, 250 * 2 ** (i - 1)));
    console.warn(`[dk] ${label}: transient failure, retry ${i + 1}/${attempts}`);
  }
  throw lastErr ?? new Error(`[dk] ${label}: exhausted retries`);
}

export async function dkCreateCheckout(args: {
  amount: number;
  applicationNo: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<DkCheckoutResult> {
  assertDkConfig();
  const res = await dkFetch("/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: args.amount,
      currency: "usd",
      agency_name: DK_AGENCY_NAME,
      application_no: args.applicationNo,
      submerchant_id: DK_SUBMERCHANT_ID,
      dk_account: DK_ACCOUNT,
      success_url: args.successUrl,
      cancel_url: args.cancelUrl,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as DkEnvelope;
  const rd = data.response_data;

  if (
    res.ok &&
    data.response_code === "0000" &&
    rd &&
    typeof rd === "object" &&
    typeof (rd as { session_url?: unknown }).session_url === "string"
  ) {
    const obj = rd as { session_url: string; session_id?: string };
    return { ok: true, sessionUrl: obj.session_url, sessionId: obj.session_id };
  }

  return {
    ok: false,
    httpStatus: res.status || 502,
    code: data.response_code,
    message: data.response_description || data.response_message,
  };
}

export type DkStatusResult = { status: "paid" | "pending"; code?: string };

export async function dkCheckStatus(
  applicationNo: string,
): Promise<DkStatusResult> {
  assertDkConfig();
  // Idempotent read, so retrying a transient gateway fault is safe — and it
  // matters: a 5003 timeout swallowed here would otherwise look like "not paid"
  // and, in the sweep, could eventually expire a payment that had in fact
  // completed.
  return withRetry("check-application-status", async () => {
    const res = await dkFetch(
      `/check-application-status?application_no=${encodeURIComponent(applicationNo)}`,
      { method: "GET" },
    );
    const data = (await res.json().catch(() => ({}))) as DkEnvelope;
    const code = data.response_code;

    // Per DK: treat as paid ONLY when response_data is true. Everything else —
    // false, 4004, any error — is "not completed", never an inferred success.
    const value: DkStatusResult = {
      status: data.response_data === true ? "paid" : "pending",
      code,
    };
    return { value, transient: isTransient(res.status, code) };
  });
}
