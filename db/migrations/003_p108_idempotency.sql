-- Project 108 — payment idempotency.
--
-- Without this, every POST /api/payment/checkout generated a fresh
-- application_no, so a client retry after a network error (or a double-click)
-- minted a SECOND live Stripe session for the same intent — and the donor could
-- pay both. The client now sends a stable key per checkout intent and reuses it
-- on retry; the server returns the original session instead of creating another.
--
-- Idempotent and safe to re-run. Apply after 001 and 002.
--   dev  = Neon neondb
--   prod = docker gmcdb

BEGIN;

ALTER TABLE p108_payments
  ADD COLUMN IF NOT EXISTS idempotency_key text;

-- Partial unique index: enforces one payment per key while still allowing the
-- many historical rows that predate this column (all NULL). This constraint is
-- what makes concurrent duplicate submissions safe — the loser of the race gets
-- a unique violation and then reads back the winner's session.
CREATE UNIQUE INDEX IF NOT EXISTS uq_p108_payments_idempotency_key
  ON p108_payments (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

COMMIT;
