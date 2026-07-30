-- Project 108 — drop p108_subscribers. There is no separate subscriber table.
--
-- Migration 006 created p108_subscribers on the assumption that Project 108 needed
-- its own list. It does not. The consent is already recorded on the payment row
-- that captured it — `consent_updates`, `consent_text`, `consent_version`,
-- `consent_at` — so a subscriber table would only be a copy of that, able to fall
-- out of step with its own evidence. Query p108_payments instead
-- (see `consentedEmails()` in lib/db.ts).
--
-- Nor does Project 108 write into gmc-app's `newsletters` table, which lives in
-- this same database. Two reasons:
--
--   1. Scope. That list feeds gmc's automated stream — news, events,
--      announcements AND job postings. A donor agreed to the 1 November livestream
--      link and to staying connected to Project 108; they did not agree to be told
--      GMC is hiring. Enrolling them there would send mail outside the permission
--      we asked for, and the wording IS the permission.
--   2. Ownership. gmc-app owns that schema through Drizzle and manages the list at
--      /dashboard/subscribers. Project 108 does not write to another app's tables.
--
-- Safe to run: verified empty in both databases (dev Neon and prod gmcdb) before
-- writing this. The guard below refuses to drop a table that has rows, so it
-- cannot silently discard opt-ins if anything landed in it afterwards.
--
-- Idempotent. Apply after 006.

BEGIN;

DO $$
DECLARE
  n bigint;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = 'p108_subscribers'
  ) THEN
    EXECUTE 'SELECT count(*) FROM p108_subscribers' INTO n;
    IF n > 0 THEN
      RAISE EXCEPTION
        'p108_subscribers has % row(s); preserve them before dropping', n;
    END IF;
    DROP TABLE p108_subscribers;
    RAISE NOTICE 'dropped empty p108_subscribers';
  ELSE
    RAISE NOTICE 'p108_subscribers absent — nothing to do';
  END IF;
END
$$;

COMMIT;
