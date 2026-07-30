/**
 * Contribution status — polls DK's /check-application-status for a payment.
 *
 * Payment completion is confirmed here (a boolean from DK), never by trusting
 * the browser's success_url redirect. On confirmation we move our record to
 * `paid`. Requires the DK_* env vars (see lib/dk.ts).
 */

import { dkCheckStatus } from "@/lib/dk";
import {
  markPaymentStatus,
  bumpPoll,
  markCancelledIfPending,
} from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rateLimit";

// The return page polls this every ~3s for up to ~10 tries, so the ceiling is
// set well above legitimate use while still blocking it being driven as a
// reference-guessing or DK-proxying oracle.
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60_000;

export async function GET(req: Request) {
  const limited = rateLimit(
    `paystatus:${clientIp(req)}`,
    RATE_LIMIT,
    RATE_WINDOW_MS,
  );
  if (limited) return limited;

  const ref = new URL(req.url).searchParams.get("ref")?.trim();
  if (!ref) {
    return Response.json(
      { success: false, error: "Missing payment reference." },
      { status: 400 },
    );
  }

  // Record the poll (last_polled_at + poll_count); no-op when no DB is configured.
  await bumpPoll(ref);

  // Stripe sends the donor to cancel_url (…&result=cancel) when they leave
  // without paying, and the return page echoes that back here. `final=1` marks
  // the last poll of its cycle.
  const params = new URL(req.url).searchParams;
  const wasCancelled = params.get("result") === "cancel";
  const isFinalPoll = params.get("final") === "1";

  try {
    const r = await dkCheckStatus(ref);

    // Persist the confirmation once payment is complete. DK is the only thing
    // that can put a payment into `paid`.
    if (r.status === "paid") {
      await markPaymentStatus(ref, "paid", {
        eventType: "status_poll",
        dkResponseCode: r.code,
      });
      return Response.json({ status: "paid", code: r.code });
    }

    // Record an abandoned checkout, but only on the final poll — deliberately
    // conservative, because `cancelled` is terminal and the sweep stops checking
    // a terminal row. Marking it on the first poll would risk writing off a
    // payment that DK simply had not confirmed yet, which is the expensive
    // mistake; leaving it `redirected` for the sweep to expire is the cheap one.
    // The check above means we only get here with DK still saying "not paid".
    if (wasCancelled && isFinalPoll) {
      await markCancelledIfPending(ref);
      return Response.json({ status: "cancelled", code: r.code });
    }

    return Response.json({ status: r.status, code: r.code });
  } catch (err) {
    console.error("[/api/payment/status] DK request failed", err);
    return Response.json(
      { success: false, error: "Couldn't reach the payment gateway." },
      { status: 502 },
    );
  }
}
