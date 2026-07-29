-- Project 108 — pooler-safe mutual exclusion for the reconciliation sweep.
--
-- The first implementation used pg_try_advisory_lock, which is SESSION-scoped.
-- That is silently unreliable through a transaction-pooling connection pooler
-- (Neon's `-pooler` endpoint, pgbouncer, RDS Proxy…): consecutive queries are not
-- guaranteed the same backend, so the lock and the unlock can land on different
-- connections and two sweeps run concurrently. Verified: two simultaneous sweeps
-- both acquired it and both ran.
--
-- A lease row is correct regardless of pooling:
--   * claimed with a single atomic UPDATE — no session state to lose;
--   * self-expiring, so a process killed mid-sweep does not wedge reconciliation
--     permanently (which a plain boolean "running" flag would);
--   * observable — you can see who holds it and until when.
--
-- Idempotent. Apply after 004.

BEGIN;

CREATE TABLE IF NOT EXISTS p108_sweep_lease (
  -- Single-row table; the CHECK keeps it that way.
  id         integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  holder     text,
  claimed_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT now()
);

-- Seed the row already expired, so the first sweep can claim it immediately.
INSERT INTO p108_sweep_lease (id, holder, claimed_at, expires_at)
VALUES (1, NULL, NULL, now())
ON CONFLICT (id) DO NOTHING;

COMMIT;
