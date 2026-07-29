/**
 * Reconciliation sweep — server-side confirmation of payments.
 *
 * Why this exists: the return page only polls while the donor keeps the tab
 * open, and real donors close it. Any payment DK confirms after they leave would
 * never be recorded — no `paid`, no receipt, nothing to reconcile the books
 * against. This route polls DK for every payment still awaiting an answer, so
 * confirmation no longer depends on a browser staying open.
 *
 * It also closes the books on abandoned checkouts, which would otherwise sit at
 * `redirected` indefinitely.
 *
 * Invoked by cron (see INFRA.local.md), authenticated with CRON_SECRET:
 *   curl -fsS -X POST https://108.gmc.bt/api/payment/reconcile \
 *        -H "X-Cron-Secret: $CRON_SECRET"
 *
 * Deliberately conservative:
 *  - DK remains the sole authority on `paid`; nothing here infers a payment.
 *  - Batched, so one run cannot hammer DK or block for minutes.
 *  - Sequential with a small delay, to stay well clear of DK's rate limit.
 *  - Every transition is guarded to non-terminal rows, so a confirmed payment
 *    can never be overwritten.
 */

import crypto from "node:crypto";
import { dkCheckStatus } from "@/lib/dk";
import {
  findPendingForSweep,
  markPaymentStatus,
  markExpiredIfPending,
  statusSummary,
  bumpPoll,
  dbEnabled,
  acquireSweepLock,
  recordSweepRun,
} from "@/lib/db";

const CRON_SECRET = process.env.CRON_SECRET || "";

// Leave very recent rows to the browser that is probably still polling them,
// so the two do not race over the same record.
const GRACE_SECONDS = 90;

// A checkout still unconfirmed after this long was abandoned. Stripe sessions
// expire well inside 24h, so nothing recoverable is being written off.
const EXPIRE_AFTER_SECONDS = 24 * 60 * 60;

// Bounded so a backlog drains over several runs rather than one long request.
const BATCH = 25;
const DELAY_MS = 250;

function authorised(req: Request): boolean {
  if (!CRON_SECRET) return false; // fail closed: no secret configured, no access
  const provided = req.headers.get("x-cron-secret") || "";
  const a = Buffer.from(provided);
  const b = Buffer.from(CRON_SECRET);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  if (!authorised(req)) {
    // 404, not 401 — do not confirm the endpoint exists to an unauthorised caller.
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  if (!dbEnabled()) {
    return Response.json(
      { success: false, error: "No database configured." },
      { status: 503 },
    );
  }

  const started = Date.now();

  // Only one sweep at a time. Cron fires on a fixed interval, so a run that
  // takes longer than the interval would otherwise overlap with the next and
  // both would poll the same payments against DK.
  const lock = await acquireSweepLock();
  if (!lock.acquired) {
    await recordSweepRun({
      examined: 0,
      confirmedPaid: 0,
      expired: 0,
      stillPending: 0,
      errors: 0,
      durationMs: Date.now() - started,
      skippedLocked: true,
    });
    return Response.json(
      { success: true, skipped: "another sweep is already running" },
      { status: 200 },
    );
  }

  try {
    return await runSweep(started);
  } finally {
    // Always released, including on an unexpected throw, so a crashed run cannot
    // wedge reconciliation permanently.
    await lock.release();
  }
}

async function runSweep(started: number): Promise<Response> {
  const result = {
    examined: 0,
    confirmedPaid: 0,
    expired: 0,
    stillPending: 0,
    errors: 0,
    refs: { paid: [] as string[], expired: [] as string[] },
  };

  let pending;
  try {
    pending = await findPendingForSweep(GRACE_SECONDS, BATCH);
  } catch (err) {
    console.error("[reconcile] could not read pending payments", err);
    return Response.json(
      { success: false, error: "Could not read pending payments." },
      { status: 503 },
    );
  }

  for (const { applicationNo, ageSeconds } of pending) {
    result.examined += 1;
    try {
      await bumpPoll(applicationNo);
      const dk = await dkCheckStatus(applicationNo);

      if (dk.status === "paid") {
        await markPaymentStatus(applicationNo, "paid", {
          eventType: "sweep_confirmed_paid",
          actor: "cron",
          dkResponseCode: dk.code,
        });
        result.confirmedPaid += 1;
        result.refs.paid.push(applicationNo);
        continue;
      }

      // DK says not completed. Only write it off once it is genuinely stale —
      // "not completed" is indistinguishable from "still in progress".
      if (ageSeconds > EXPIRE_AFTER_SECONDS) {
        if (await markExpiredIfPending(applicationNo)) {
          result.expired += 1;
          result.refs.expired.push(applicationNo);
        }
        continue;
      }

      result.stillPending += 1;
    } catch (err) {
      // One bad row must not abort the batch.
      result.errors += 1;
      console.error(`[reconcile] ${applicationNo} failed`, err);
    }

    if (DELAY_MS) await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  let summary: Awaited<ReturnType<typeof statusSummary>> = [];
  try {
    summary = await statusSummary();
  } catch {
    /* the report is a nicety; never fail the sweep over it */
  }

  const durationMs = Date.now() - started;

  // Persisted, not just logged: this is the auditable record that reconciliation
  // ran, what it settled, and what remains outstanding.
  await recordSweepRun({
    examined: result.examined,
    confirmedPaid: result.confirmedPaid,
    expired: result.expired,
    stillPending: result.stillPending,
    errors: result.errors,
    durationMs,
    detail: { refs: result.refs, summary },
  });

  return Response.json({ success: true, ...result, durationMs, summary });
}
