-- Project 108 — payment module, standards gap-closure (our side).
-- Adds money components, per-transition timestamps, idempotency/audit fields we
-- CAN capture today, plus nullable columns for data DK does not yet expose
-- (marked "NULL UNTIL DK"). Idempotent (ADD COLUMN IF NOT EXISTS). Safe to re-run.
-- Apply after 001. Dev: Neon neondb. Prod: docker gmcdb (at go-live).

BEGIN;

ALTER TABLE p108_payments
  -- Money: components stored separately, never a single netted number.
  ADD COLUMN IF NOT EXISTS fee_total           numeric(12,2),  -- computed: ROUND_HALF_UP(amount*0.0485 + 0.60, 2)
  ADD COLUMN IF NOT EXISTS customer_pays       numeric(12,2),  -- computed: amount + fee_total
  ADD COLUMN IF NOT EXISTS net_to_project      numeric(12,2),  -- computed (see net_basis); default = base made whole
  ADD COLUMN IF NOT EXISTS net_basis           text NOT NULL DEFAULT 'computed_unconfirmed'
      CHECK (net_basis IN ('computed_unconfirmed','dk_confirmed')),
  ADD COLUMN IF NOT EXISTS fee_formula_version text NOT NULL DEFAULT 'v2_4.85pct_plus_0.60',

  -- Idempotency hardening + fuller DK envelope.
  ADD COLUMN IF NOT EXISTS request_hash            text,
  ADD COLUMN IF NOT EXISTS dk_response_description text,

  -- Per-transition timestamps + poll accounting.
  ADD COLUMN IF NOT EXISTS redirected_at   timestamptz,
  ADD COLUMN IF NOT EXISTS failed_at       timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at    timestamptz,
  ADD COLUMN IF NOT EXISTS expired_at      timestamptz,
  ADD COLUMN IF NOT EXISTS last_polled_at  timestamptz,
  ADD COLUMN IF NOT EXISTS poll_count      integer NOT NULL DEFAULT 0,

  -- === NULL UNTIL DK EXPANDS ITS API (do not expect values today) ===
  ADD COLUMN IF NOT EXISTS dk_payment_intent_id  text,   -- Stripe pi_...
  ADD COLUMN IF NOT EXISTS dk_charge_id          text,   -- Stripe ch_...
  ADD COLUMN IF NOT EXISTS dk_balance_txn_id     text,   -- Stripe txn_...
  ADD COLUMN IF NOT EXISTS settled_amount        numeric(12,2),
  ADD COLUMN IF NOT EXISTS settled_fee           numeric(12,2),
  ADD COLUMN IF NOT EXISTS card_brand            text,
  ADD COLUMN IF NOT EXISTS card_last4            text,
  ADD COLUMN IF NOT EXISTS stripe_receipt_url    text,
  ADD COLUMN IF NOT EXISTS stripe_customer_email text;

-- Manual refund tracking (DK has no refund API; entries are out-of-band ops records).
CREATE TABLE IF NOT EXISTS p108_refunds (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id     uuid NOT NULL REFERENCES p108_payments(id) ON DELETE RESTRICT,
  application_no text NOT NULL,
  amount         numeric(12,2) NOT NULL CHECK (amount > 0),
  currency       text NOT NULL DEFAULT 'usd',
  reason         text,
  status         text NOT NULL DEFAULT 'requested'
      CHECK (status IN ('requested','confirmed_by_dk','rejected')),
  requested_by   text NOT NULL,
  dk_reference   text,
  dk_charge_id   text,   -- NULL until DK exposes it
  created_at     timestamptz NOT NULL DEFAULT now(),
  confirmed_at   timestamptz
);
CREATE INDEX IF NOT EXISTS idx_p108_refunds_payment ON p108_refunds (payment_id);

-- Manual dispute/chargeback tracking (invisible via API; manual entry only).
CREATE TABLE IF NOT EXISTS p108_disputes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id      uuid NOT NULL REFERENCES p108_payments(id) ON DELETE RESTRICT,
  application_no  text NOT NULL,
  amount          numeric(12,2),
  dispute_fee     numeric(12,2),   -- NULL until DK exposes it
  status          text NOT NULL DEFAULT 'open'
      CHECK (status IN ('open','won','lost','withdrawn')),
  reason          text,
  dk_reference    text,
  dk_dispute_id   text,            -- NULL until DK exposes it
  evidence_due_by timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  resolved_at     timestamptz
);
CREATE INDEX IF NOT EXISTS idx_p108_disputes_payment ON p108_disputes (payment_id);

COMMIT;
