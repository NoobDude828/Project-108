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
const FEE_PCT = 0.0485;
const FEE_FIXED = 0.6;

function round2HalfUp(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function computeFees(base: number): {
  feeTotal: number;
  customerPays: number;
  netToProject: number;
} {
  const feeTotal = round2HalfUp(base * FEE_PCT + FEE_FIXED);
  return {
    feeTotal,
    customerPays: round2HalfUp(base + feeTotal),
    // Fees are added on top, so the project is made whole at the base amount.
    // Flagged computed_unconfirmed until DK confirms the net in writing.
    netToProject: round2HalfUp(base),
  };
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
