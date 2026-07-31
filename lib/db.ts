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

import crypto from "node:crypto";
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
  /** What the donor typed, before any fee arithmetic. */
  offeredAmount?: number;
  /** Did they choose to cover the processing fee? */
  coversFee?: boolean;
  /** What the donor is actually charged. */
  chargedTotal?: number;
  /** Mailing-list permission, stored with the wording it was granted under. */
  consentUpdates?: boolean;
  consentText?: string;
  consentVersion?: string;
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
  /** The URL DK actually returned. Never rebuild this from the id. */
  dkSessionUrl: string | null;
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
    `SELECT application_no, status, dk_session_id, dk_session_url
       FROM p108_payments WHERE idempotency_key = $1`,
    [key],
  );
  if (r.rowCount === 0) return null;
  const row = r.rows[0];
  return {
    applicationNo: row.application_no,
    status: row.status,
    dkSessionId: row.dk_session_id,
    dkSessionUrl: row.dk_session_url,
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
        message, success_url, cancel_url, source,
        offered_amount, covers_fee, charged_total,
        consent_updates, consent_text, consent_version, consent_at)
     VALUES ($1,$2,$3,'created',$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,'project108',
             $21,$22,$23,$24,$25,$26,
             CASE WHEN $24 THEN now() ELSE NULL END)`,
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
      p.offeredAmount ?? null,
      p.coversFee ?? null,
      p.chargedTotal ?? null,
      p.consentUpdates ?? false,
      p.consentText ?? null,
      p.consentVersion ?? null,
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
    dkSessionUrl?: string;
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
              dk_session_url = COALESCE($7, dk_session_url),
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
        opts.dkSessionUrl ?? null,
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

/**
 * Payments that still need an answer from DK.
 *
 * Confirmation otherwise only happens while the donor's browser sits on the
 * return page — and real donors close the tab. Anything DK confirms after they
 * leave would never be recorded without this sweep.
 *
 * `graceSeconds` skips rows created moments ago, which the browser is probably
 * still polling itself, so the two do not race over the same record.
 */
export async function findPendingForSweep(
  graceSeconds: number,
  limit: number,
): Promise<Array<{ applicationNo: string; ageSeconds: number }>> {
  if (!pool) return [];
  const r = await pool.query(
    `SELECT application_no,
            EXTRACT(EPOCH FROM (now() - created_at))::int AS age_seconds
       FROM p108_payments
      WHERE status IN ('created','redirected','pending')
        AND created_at < now() - make_interval(secs => $1::double precision)
      ORDER BY created_at ASC
      LIMIT $2`,
    [graceSeconds, limit],
  );
  return r.rows.map((x) => ({
    applicationNo: x.application_no,
    ageSeconds: x.age_seconds,
  }));
}

/**
 * Claim the sweep lease, so overlapping cron runs cannot both poll the same
 * payments against DK.
 *
 * A lease row rather than pg_try_advisory_lock: advisory locks are session-scoped
 * and silently unreliable through a transaction-pooling pooler (Neon's `-pooler`
 * endpoint, pgbouncer, RDS Proxy), where consecutive queries are not guaranteed
 * the same backend. That was verified — two simultaneous sweeps both "acquired"
 * an advisory lock and both ran.
 *
 * The claim is one atomic UPDATE whose WHERE clause only matches an expired
 * lease, so exactly one caller can win. The lease self-expires, so a process
 * killed mid-sweep cannot wedge reconciliation permanently.
 */
export async function acquireSweepLease(ttlSeconds: number): Promise<{
  acquired: boolean;
  release: () => Promise<void>;
}> {
  if (!pool) return { acquired: false, release: async () => {} };
  const holder = `${process.pid}-${Date.now()}`;
  try {
    const r = await pool.query(
      `UPDATE p108_sweep_lease
          SET holder = $1,
              claimed_at = now(),
              expires_at = now() + make_interval(secs => $2::double precision)
        WHERE id = 1
          AND expires_at <= now()
        RETURNING holder`,
      [holder, ttlSeconds],
    );
    if (r.rowCount !== 1) return { acquired: false, release: async () => {} };

    return {
      acquired: true,
      release: async () => {
        try {
          // Expire it immediately, but only if we still hold it — otherwise a
          // slow run could release a lease that has since been taken over.
          await pool!.query(
            `UPDATE p108_sweep_lease
                SET expires_at = now()
              WHERE id = 1 AND holder = $1`,
            [holder],
          );
        } catch (e) {
          // Not fatal: the lease expires on its own.
          console.error("[db] releasing sweep lease failed", e);
        }
      },
    };
  } catch (e) {
    console.error("[db] acquireSweepLease failed", e);
    return { acquired: false, release: async () => {} };
  }
}

export type SweepOutcome = {
  examined: number;
  confirmedPaid: number;
  expired: number;
  stillPending: number;
  errors: number;
  durationMs: number;
  skippedLocked?: boolean;
  detail?: unknown;
};

/**
 * Persist a sweep run.
 *
 * Replaces writing JSON to stdout, which could not be queried or alerted on and
 * disappeared on log rotation — so "is reconciliation actually working?" had no
 * auditable answer.
 */
export async function recordSweepRun(o: SweepOutcome): Promise<void> {
  if (!pool) return;
  try {
    await pool.query(
      `INSERT INTO p108_sweep_runs
         (finished_at, duration_ms, examined, confirmed_paid, expired,
          still_pending, errors, detail, skipped_locked)
       VALUES (now(), $1,$2,$3,$4,$5,$6,$7::jsonb,$8)`,
      [
        o.durationMs,
        o.examined,
        o.confirmedPaid,
        o.expired,
        o.stillPending,
        o.errors,
        o.detail != null ? JSON.stringify(o.detail) : null,
        o.skippedLocked ?? false,
      ],
    );
  } catch (e) {
    console.error("[db] recordSweepRun failed", e);
  }
}

/**
 * Give up on a checkout that was never completed.
 *
 * Guarded to non-terminal rows so a payment DK has since confirmed can never be
 * expired out from under us. Without this, every abandoned checkout would sit at
 * `redirected` forever and quietly distort the books.
 */
export async function markExpiredIfPending(
  applicationNo: string,
): Promise<boolean> {
  if (!pool) return false;
  try {
    const r = await pool.query(
      `UPDATE p108_payments
          SET status = 'expired', expired_at = now()
        WHERE application_no = $1
          AND status IN ('created','redirected','pending')`,
      [applicationNo],
    );
    if (r.rowCount && r.rowCount > 0) {
      await addEvent(applicationNo, "expired_by_sweep", {
        toStatus: "expired",
        actor: "cron",
      });
      return true;
    }
    return false;
  } catch (e) {
    console.error("[db] markExpiredIfPending failed", e);
    return false;
  }
}

/** Counts and USD totals by status — the daily reconciliation report. */
export async function statusSummary(): Promise<
  Array<{ status: string; count: number; baseTotal: string; chargedTotal: string }>
> {
  if (!pool) return [];
  const r = await pool.query(
    `SELECT status,
            count(*)::int                      AS count,
            COALESCE(sum(amount),0)::text      AS base_total,
            COALESCE(sum(customer_pays),0)::text AS charged_total
       FROM p108_payments
      GROUP BY status
      ORDER BY status`,
  );
  return r.rows.map((x) => ({
    status: x.status,
    count: x.count,
    baseTotal: x.base_total,
    chargedTotal: x.charged_total,
  }));
}

/**
 * Record a sign-up from /sign-up (someone who is not necessarily a donor).
 *
 * Returns nothing about whether the address was already present. The route must not
 * disclose that either: an endpoint that answers "already subscribed" differently
 * from "newly subscribed" is an email-enumeration oracle.
 *
 * Signing up again refreshes the consent and revives a previously unsubscribed
 * address — someone re-consenting is asking to be on the list.
 */
export async function addSubscriber(p: {
  email: string;
  name?: string;
  source?: string;
  consentText: string;
  consentVersion: string;
}): Promise<void> {
  if (!pool) return;
  await pool.query(
    `INSERT INTO p108_subscribers
       (email, name, source, consent_text, consent_version, consent_at, updated_at)
     VALUES ($1,$2,$3,$4,$5, now(), now())
     ON CONFLICT (lower(email)) DO UPDATE
        SET name            = COALESCE(EXCLUDED.name, p108_subscribers.name),
            consent_text    = EXCLUDED.consent_text,
            consent_version = EXCLUDED.consent_version,
            consent_at      = now(),
            unsubscribed_at = NULL,
            updated_at      = now()`,
    [p.email, p.name ?? null, p.source ?? "signup", p.consentText, p.consentVersion],
  );
}

/**
 * Take someone off the list. Idempotent, and deliberately silent about whether the
 * address was ever on it.
 */
export async function unsubscribe(email: string): Promise<void> {
  if (!pool) return;
  await pool.query(
    `UPDATE p108_subscribers
        SET unsubscribed_at = now(), updated_at = now()
      WHERE lower(email) = lower($1) AND unsubscribed_at IS NULL`,
    [email],
  );
  // A donor's consent lives on their payment rows, which are an immutable financial
  // record — so withdrawal is recorded by adding them to the subscribers table in an
  // unsubscribed state, and consentedEmails() excludes them from then on.
  await pool.query(
    `INSERT INTO p108_subscribers
       (email, source, consent_text, consent_version, unsubscribed_at, updated_at)
     SELECT $1, 'unsubscribe', consent_text, consent_version, now(), now()
       FROM p108_payments
      WHERE lower(donor_email) = lower($1) AND consent_updates = true
      ORDER BY consent_at DESC NULLS LAST
      LIMIT 1
     ON CONFLICT (lower(email)) DO UPDATE
        SET unsubscribed_at = now(), updated_at = now()`,
    [email],
  );
}

export type ConsentedContact = {
  email: string;
  name: string | null;
  consentAt: Date;
  consentVersion: string;
  source: string;
};

/**
 * THE send list: everyone who has agreed to hear from Project 108, from either door.
 *
 * One list, two sources — consent captured at checkout lives on the payment row,
 * consent captured on /sign-up lives in p108_subscribers. De-duplicated on
 * lower(email), most recent consent winning, and anyone who has unsubscribed is
 * excluded regardless of which door they came through.
 *
 * `version` pins the send to a specific wording, so revising it later cannot
 * silently widen who counts as having agreed. Pass the version the send is
 * authorised under.
 */
export async function consentedEmails(
  opts: { version?: string } = {},
): Promise<ConsentedContact[]> {
  if (!pool) return [];
  const r = await pool.query(
    `WITH granted AS (
       SELECT donor_email AS email, donor_name AS name, consent_at,
              consent_version, 'contribution' AS source
         FROM p108_payments
        WHERE consent_updates = true AND consent_at IS NOT NULL
       UNION ALL
       SELECT email, name, consent_at, consent_version, source
         FROM p108_subscribers
        WHERE unsubscribed_at IS NULL
     )
     SELECT DISTINCT ON (lower(email)) email, name, consent_at, consent_version, source
       FROM granted
      WHERE ($1::text IS NULL OR consent_version = $1)
        -- Excluded from both sources, so unsubscribing works for donors too.
        AND lower(email) NOT IN (
              SELECT lower(email) FROM p108_subscribers WHERE unsubscribed_at IS NOT NULL
            )
      ORDER BY lower(email), consent_at DESC`,
    [opts.version ?? null],
  );
  return r.rows.map((x) => ({
    email: x.email,
    name: x.name,
    consentAt: x.consent_at,
    consentVersion: x.consent_version,
    source: x.source,
  }));
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
