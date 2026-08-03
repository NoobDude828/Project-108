/**
 * Send one contribution acknowledgement, exactly once.
 *
 * Called from two places that both legitimately learn a payment succeeded — the
 * status poll the donor's browser makes, and the reconciliation sweep. Neither
 * coordinates with the other, so the claim in claimReceiptSend() is what makes this
 * safe to call from anywhere, any number of times.
 *
 * Never throws. A receipt is important but it is not the payment: nothing here may
 * turn a successful contribution into an error the donor sees. Failures are recorded
 * on the row and retried by the sweep.
 */

import {
  claimReceiptSend,
  markReceiptSent,
  markReceiptFailed,
  findPaidWithoutReceipt,
} from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { contributionReceiptEmail } from "@/lib/emails/receipt";

/**
 * The sign-up page the acknowledgement invites people to — the same page, the same
 * permission, wherever someone joins from.
 *
 * Derived from PAYMENT_RETURN_URL's origin rather than introduced as another variable
 * to forget, and overridable for the case where the two ever live apart. Not a
 * placeholder: if neither is configured this returns null and the caller declines to
 * send rather than mailing a dead link.
 */
function signupUrl(): string | null {
  const explicit = process.env.SIGNUP_URL?.trim();
  if (explicit) return explicit;
  const ret = process.env.PAYMENT_RETURN_URL?.trim();
  if (!ret) return null;
  try {
    return new URL("/sign-up", new URL(ret).origin).toString();
  } catch {
    return null;
  }
}

/**
 * Attempt the receipt for one payment. Returns what happened, for logging only.
 *
 * "skipped" covers every legitimate no-op: already sent, not paid, out of attempts,
 * or another caller holds the claim.
 */
export async function sendReceiptFor(
  applicationNo: string,
): Promise<"sent" | "skipped" | "failed"> {
  const url = signupUrl();
  if (!url) {
    console.error(
      "[receipt] neither SIGNUP_URL nor PAYMENT_RETURN_URL is set — not sending",
    );
    return "failed";
  }

  let claim;
  try {
    claim = await claimReceiptSend(applicationNo);
  } catch (err) {
    console.error(`[receipt] ${applicationNo}: could not claim`, err);
    return "failed";
  }
  if (!claim) return "skipped";

  try {
    const email = contributionReceiptEmail({
      donorName: claim.donorName,
      reference: claim.applicationNo,
      offeredAmount: claim.offeredAmount,
      chargedTotal: claim.chargedTotal,
      currency: claim.currency,
      confirmedAt: claim.paidConfirmedAt ?? new Date(),
      signupUrl: url,
      dedication: claim.dedication ?? undefined,
    });

    const { messageId } = await sendMail({
      to: claim.donorEmail,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });

    await markReceiptSent(claim.applicationNo, messageId);
    console.log(
      `[receipt] ${applicationNo}: sent to ${claim.donorEmail} (attempt ${claim.attempt})`,
    );
    return "sent";
  } catch (err) {
    // The claim is left in place and simply expires, so the sweep retries. Recording
    // the reason on the row means "why did this donor get nothing?" is answerable
    // without trawling logs.
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[receipt] ${applicationNo}: send failed (attempt ${claim.attempt})`, msg);
    await markReceiptFailed(claim.applicationNo, msg);
    return "failed";
  }
}

/**
 * Back-fill: every paid payment still without a receipt.
 *
 * This is what covers a payment confirmed by the sweep rather than by the browser, a
 * relay outage, and payments that completed before this sender existed at all.
 * Sequential by design — the relay is shared with gmc-app and a burst of parallel
 * connections is a good way to get rate limited.
 */
export async function sendPendingReceipts(
  limit = 20,
): Promise<{ sent: number; failed: number; skipped: number }> {
  const out = { sent: 0, failed: 0, skipped: 0 };
  let refs: string[];
  try {
    refs = await findPaidWithoutReceipt(limit);
  } catch (err) {
    console.error("[receipt] back-fill query failed", err);
    return out;
  }
  for (const ref of refs) {
    out[await sendReceiptFor(ref)] += 1;
  }
  return out;
}
