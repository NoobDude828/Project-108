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
 * Unique application_no ("transaction ID"). DK's UAT requires this to be a
 * NUMERIC value and unique (409 on duplicate), so we use epoch-ms + 3 random
 * digits — a 16-digit number that stays unique across attempts.
 */
export function makeApplicationNo(): string {
  const rand = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${Date.now()}${rand}`;
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
  const res = await dkFetch(
    `/check-application-status?application_no=${encodeURIComponent(applicationNo)}`,
    { method: "GET" },
  );
  const data = (await res.json().catch(() => ({}))) as DkEnvelope;
  // response_data is a boolean here: true = paid/completed.
  return {
    status: data.response_data === true ? "paid" : "pending",
    code: data.response_code,
  };
}
