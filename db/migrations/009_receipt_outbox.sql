-- Project 108 — retry bookkeeping for the acknowledgement receipt.
--
-- `receipt_email_sent_at` has existed since 002, but a single timestamp cannot run a
-- reliable send. Two things go wrong with it alone:
--
--   Stamp first, then send  -> an SMTP failure leaves the row marked sent and the
--                              donor never receives anything, silently.
--   Send first, then stamp  -> a crash between the two sends it twice, and two
--                              concurrent callers (the status poll and the
--                              reconciliation sweep) can both send.
--
-- So this is an outbox claim instead. A caller claims an attempt by incrementing
-- `receipt_attempts` and setting `receipt_last_attempt_at`, which no other caller
-- can do again until the claim window expires; only a confirmed send sets
-- `receipt_email_sent_at`. A crash mid-send therefore costs a delay, never a lost or
-- duplicated receipt.
--
-- Idempotent. Apply after 008.

BEGIN;

ALTER TABLE p108_payments
  -- Bounded, so a permanently undeliverable address (a typo, a closed mailbox)
  -- cannot be retried forever.
  ADD COLUMN IF NOT EXISTS receipt_attempts integer NOT NULL DEFAULT 0,
  -- When the current attempt was claimed. The claim expires after a fixed window,
  -- which is what makes a crashed attempt recoverable.
  ADD COLUMN IF NOT EXISTS receipt_last_attempt_at timestamptz,
  -- Kept for diagnosis: "why did this donor not get their receipt?" should be
  -- answerable from the row rather than from log archaeology.
  ADD COLUMN IF NOT EXISTS receipt_last_error text;

-- Drives the sweep's back-fill query: paid, not yet sent, still worth trying.
CREATE INDEX IF NOT EXISTS idx_p108_payments_receipt_pending
  ON p108_payments (paid_confirmed_at)
  WHERE status = 'paid' AND receipt_email_sent_at IS NULL;

COMMIT;
