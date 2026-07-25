-- Project 108 — payment module schema
-- Idempotent and namespaced (p108_ prefix, public schema) so it never collides
-- with gmc's own tables and is safe to re-run. gen_random_uuid() is core in PG13+.
-- Applied from the server against: dev = Neon neondb, prod = docker gmcdb.

BEGIN;

-- ---------------------------------------------------------------------------
-- p108_payments — system of record, one row per contribution attempt.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS p108_payments (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_no        text NOT NULL UNIQUE,
  amount                numeric(12,2) NOT NULL CHECK (amount >= 1),
  currency              text NOT NULL DEFAULT 'usd',
  status                text NOT NULL DEFAULT 'created'
                          CHECK (status IN ('created','redirected','pending',
                                            'paid','failed','cancelled','expired')),
  donor_name            text NOT NULL,
  donor_email           text NOT NULL,
  donor_phone           text,
  donor_country         text,
  donor_address_line1   text,
  donor_address_line2   text,
  donor_city            text,
  donor_state           text,
  donor_postal_code     text,
  message               text,
  dk_session_id         text,
  dk_response_code      text,
  dk_response_message   text,
  success_url           text,
  cancel_url            text,
  source                text NOT NULL DEFAULT 'project108',
  receipt_email_sent_at timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  paid_confirmed_at     timestamptz
);

CREATE INDEX IF NOT EXISTS idx_p108_payments_status     ON p108_payments (status);
CREATE INDEX IF NOT EXISTS idx_p108_payments_created_at ON p108_payments (created_at);
CREATE INDEX IF NOT EXISTS idx_p108_payments_email      ON p108_payments (donor_email);

-- ---------------------------------------------------------------------------
-- p108_payment_events — append-only audit log, one row per transition / call.
-- (Append-only is enforced in the application; consider a least-privilege role
--  with UPDATE/DELETE revoked once gmc-app connects with a dedicated user.)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS p108_payment_events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id       uuid REFERENCES p108_payments(id) ON DELETE CASCADE,
  application_no   text NOT NULL,
  event_type       text NOT NULL,
  from_status      text,
  to_status        text,
  actor            text NOT NULL DEFAULT 'system'
                     CHECK (actor IN ('system','cron','user')),
  http_status      integer,
  dk_response_code text,
  detail           jsonb,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_p108_events_payment ON p108_payment_events (payment_id);
CREATE INDEX IF NOT EXISTS idx_p108_events_appno   ON p108_payment_events (application_no);
CREATE INDEX IF NOT EXISTS idx_p108_events_created ON p108_payment_events (created_at);

-- ---------------------------------------------------------------------------
-- p108_settlements — stub for importing DK/bank settlement statements later,
-- so true financial reconciliation can be added without a schema change.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS p108_settlements (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  statement_ref  text,
  application_no text,
  settled_amount numeric(12,2),
  currency       text,
  settled_at     timestamptz,
  raw            jsonb,
  imported_at    timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- updated_at auto-touch on p108_payments.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION p108_touch_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_p108_payments_updated ON p108_payments;
CREATE TRIGGER trg_p108_payments_updated
  BEFORE UPDATE ON p108_payments
  FOR EACH ROW EXECUTE FUNCTION p108_touch_updated_at();

COMMIT;
