/**
 * Postgres access for the payment records (dev/testing).
 *
 * Reads DATABASE_URL (set in .env.development to the Neon test DB, where the
 * p108_* tables were migrated — 001 + 002). When DATABASE_URL is unset, every
 * helper is a no-op, so mock/proxy modes without a DB still work and production
 * (where gmc-app owns persistence) is unaffected.
 *
 * All writes are best-effort: a DB failure is logged but never blocks the
 * payment request. The pool is a globalThis singleton so dev HMR doesn't leak
 * connections (same pattern as app/api/online).
 */

import { Pool } from "pg";

function makePool(): Pool | null {
  const cs = process.env.DATABASE_URL;
  if (!cs) return null;
  const needsSsl = cs.includes("neon.tech") || /sslmode=require/.test(cs);
  return new Pool({
    connectionString: cs,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });
}

const g = globalThis as unknown as { __p108Pool?: Pool | null };
export const pool: Pool | null =
  g.__p108Pool !== undefined ? g.__p108Pool : (g.__p108Pool = makePool());

export function dbEnabled(): boolean {
  return pool !== null;
}

export type PaymentInsert = {
  applicationNo: string;
  amount: number;
  currency?: string;
  // Money components (computed from DK's fee formula — see lib/dk.ts computeFees).
  feeTotal?: number;
  customerPays?: number;
  netToProject?: number;
  requestHash?: string;
  /** Client-supplied, stable per checkout intent. Unique when present. */
  idempotencyKey?: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  country?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  message?: string;
  successUrl?: string;
  cancelUrl?: string;
};

type EventOpts = {
  fromStatus?: string | null;
  toStatus?: string;
  actor?: "system" | "cron" | "user";
  eventType?: string;
  httpStatus?: number;
  dkResponseCode?: string;
  detail?: unknown;
};

async function addEvent(
  applicationNo: string,
  eventType: string,
  opts: EventOpts = {},
): Promise<void> {
  if (!pool) return;
  try {
    await pool.query(
      `INSERT INTO p108_payment_events
         (payment_id, application_no, event_type, from_status, to_status, actor, http_status, dk_response_code, detail)
       VALUES ((SELECT id FROM p108_payments WHERE application_no = $1), $1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
      [
        applicationNo,
        eventType,
        opts.fromStatus ?? null,
        opts.toStatus ?? null,
        opts.actor ?? "system",
        opts.httpStatus ?? null,
        opts.dkResponseCode ?? null,
        opts.detail != null ? JSON.stringify(opts.detail) : null,
      ],
    );
  } catch (e) {
    console.error("[db] addEvent failed", e);
  }
}

export type ExistingPayment = {
  applicationNo: string;
  status: string;
  dkSessionId: string | null;
};

/**
 * Look up a prior attempt by its client-supplied idempotency key.
 *
 * Lets a retried checkout return the session it already created instead of
 * minting a second live one. Throws on a DB error so the caller can refuse to
 * proceed — silently treating "lookup failed" as "no prior attempt" is exactly
 * how a duplicate charge would slip through.
 */
export async function findByIdempotencyKey(
  key: string,
): Promise<ExistingPayment | null> {
  if (!pool) return null;
  const r = await pool.query(
    `SELECT application_no, status, dk_session_id
       FROM p108_payments WHERE idempotency_key = $1`,
    [key],
  );
  if (r.rowCount === 0) return null;
  const row = r.rows[0];
  return {
    applicationNo: row.application_no,
    status: row.status,
    dkSessionId: row.dk_session_id,
  };
}

/** Postgres unique-violation, i.e. another request won the idempotency race. */
export function isUniqueViolation(e: unknown): boolean {
  return (e as { code?: string })?.code === "23505";
}

/**
 * Move a non-terminal payment to 'cancelled'.
 *
 * Deliberately guarded: it will not touch a row that is already terminal, so a
 * confirmed `paid` can never be overwritten by a stray cancel signal. Returns
 * true only if a row actually transitioned.
 */
export async function markCancelledIfPending(
  applicationNo: string,
): Promise<boolean> {
  if (!pool) return false;
  try {
    const r = await pool.query(
      `UPDATE p108_payments
          SET status = 'cancelled', cancelled_at = now()
        WHERE application_no = $1
          AND status IN ('created','redirected','pending')`,
      [applicationNo],
    );
    if (r.rowCount && r.rowCount > 0) {
      await addEvent(applicationNo, "cancelled_by_return", {
        toStatus: "cancelled",
        actor: "user",
      });
      return true;
    }
    return false;
  } catch (e) {
    console.error("[db] markCancelledIfPending failed", e);
    return false;
  }
}

/**
 * Insert a fresh payment row (status 'created') + a 'created' audit event.
 *
 * THROWS on failure, unlike the status helpers. A payable gateway session must
 * never be handed out for an intent we failed to record — that would be money
 * taken with no trace of it. The caller aborts the checkout instead.
 */
export async function insertPaymentCreated(p: PaymentInsert): Promise<void> {
  if (!pool) return;
  // No try/catch: a failure here must propagate so the caller aborts before a
  // payable session exists. A unique violation on idempotency_key is meaningful
  // to the caller too (another request won the race) — see isUniqueViolation.
  await pool.query(
    `INSERT INTO p108_payments
       (application_no, amount, currency, status, fee_total, customer_pays, net_to_project,
        request_hash, idempotency_key, donor_name, donor_email, donor_phone, donor_country,
        donor_address_line1, donor_address_line2, donor_city, donor_state, donor_postal_code,
        message, success_url, cancel_url, source)
     VALUES ($1,$2,$3,'created',$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,'project108')`,
    [
      p.applicationNo,
      p.amount,
      p.currency ?? "usd",
      p.feeTotal ?? null,
      p.customerPays ?? null,
      p.netToProject ?? null,
      p.requestHash ?? null,
      p.idempotencyKey ?? null,
      p.donorName,
      p.donorEmail,
      p.donorPhone ?? null,
      p.country ?? null,
      p.addressLine1 ?? null,
      p.addressLine2 ?? null,
      p.city ?? null,
      p.state ?? null,
      p.postalCode ?? null,
      p.message ?? null,
      p.successUrl ?? null,
      p.cancelUrl ?? null,
    ],
  );
  // The audit event stays best-effort: the row is already safely recorded, and
  // losing a log line must not fail a checkout that is otherwise valid.
  await addEvent(p.applicationNo, "created", {
    toStatus: "created",
    actor: "user",
    detail: {
      amount: p.amount,
      feeTotal: p.feeTotal,
      customerPays: p.customerPays,
    },
  });
}

/**
 * Move a payment to a new status, stamping the matching per-transition
 * timestamp, and write an audit event that records the from→to transition.
 * Best-effort.
 */
export async function markPaymentStatus(
  applicationNo: string,
  toStatus: string,
  opts: {
    dkSessionId?: string;
    dkResponseCode?: string;
    dkResponseMessage?: string;
    dkResponseDescription?: string;
    actor?: "system" | "cron" | "user";
    eventType?: string;
    httpStatus?: number;
    detail?: unknown;
  } = {},
): Promise<void> {
  if (!pool) return;
  try {
    // Capture the prior status so the audit event records a real transition.
    const prev = await pool.query(
      `SELECT status FROM p108_payments WHERE application_no = $1`,
      [applicationNo],
    );
    const fromStatus: string | null = prev.rows[0]?.status ?? null;

    await pool.query(
      `UPDATE p108_payments
          SET status = $2,
              dk_session_id = COALESCE($3, dk_session_id),
              dk_response_code = COALESCE($4, dk_response_code),
              dk_response_message = COALESCE($5, dk_response_message),
              dk_response_description = COALESCE($6, dk_response_description),
              redirected_at     = CASE WHEN $2 = 'redirected' THEN now() ELSE redirected_at END,
              failed_at         = CASE WHEN $2 = 'failed'      THEN now() ELSE failed_at END,
              cancelled_at      = CASE WHEN $2 = 'cancelled'   THEN now() ELSE cancelled_at END,
              expired_at        = CASE WHEN $2 = 'expired'     THEN now() ELSE expired_at END,
              paid_confirmed_at = CASE WHEN $2 = 'paid'        THEN now() ELSE paid_confirmed_at END
        WHERE application_no = $1`,
      [
        applicationNo,
        toStatus,
        opts.dkSessionId ?? null,
        opts.dkResponseCode ?? null,
        opts.dkResponseMessage ?? null,
        opts.dkResponseDescription ?? null,
      ],
    );

    await addEvent(applicationNo, opts.eventType ?? "status_change", {
      fromStatus,
      toStatus,
      actor: opts.actor ?? "system",
      httpStatus: opts.httpStatus,
      dkResponseCode: opts.dkResponseCode,
      detail: opts.detail,
    });
  } catch (e) {
    console.error("[db] markPaymentStatus failed", e);
  }
}

/** Record a status poll against DK (last_polled_at + poll_count). Best-effort. */
export async function bumpPoll(applicationNo: string): Promise<void> {
  if (!pool) return;
  try {
    await pool.query(
      `UPDATE p108_payments
          SET last_polled_at = now(), poll_count = poll_count + 1
        WHERE application_no = $1`,
      [applicationNo],
    );
  } catch (e) {
    console.error("[db] bumpPoll failed", e);
  }
}
