-- Project 108 — store the real session URL, and record sweep runs.
--
-- 1) dk_session_url
--    We persisted only the session id and rebuilt the Stripe URL by string
--    concatenation when replaying an idempotent retry. That hardcodes Stripe's
--    URL shape into our code; if it ever changes, replays send donors to a dead
--    link. DK hands us the full session_url at creation — store it and use it.
--
-- 2) p108_sweep_runs
--    The reconciliation sweep previously "reported" by writing JSON to stdout,
--    which is not a report: it cannot be queried, aggregated, or alerted on, and
--    it is lost on log rotation. Each run is now a row, so the operational
--    question "is reconciliation actually working?" has an auditable answer.
--
-- Idempotent and safe to re-run. Apply after 003.

BEGIN;

ALTER TABLE p108_payments
  ADD COLUMN IF NOT EXISTS dk_session_url text;

CREATE TABLE IF NOT EXISTS p108_sweep_runs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at     timestamptz NOT NULL DEFAULT now(),
  finished_at    timestamptz,
  duration_ms    integer,
  examined       integer NOT NULL DEFAULT 0,
  confirmed_paid integer NOT NULL DEFAULT 0,
  expired        integer NOT NULL DEFAULT 0,
  still_pending  integer NOT NULL DEFAULT 0,
  errors         integer NOT NULL DEFAULT 0,
  -- Refs touched and the per-status totals at the end of the run, so a run can
  -- be reconstructed later without joining against mutated payment rows.
  detail         jsonb,
  -- Set when the run could not acquire the advisory lock, i.e. another sweep was
  -- already in progress. Distinguishes "skipped" from "found nothing".
  skipped_locked boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_p108_sweep_runs_started
  ON p108_sweep_runs (started_at DESC);

COMMIT;
