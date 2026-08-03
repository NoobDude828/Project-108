-- Project 108 — subscribers who are NOT donors.
--
-- 007 dropped the p108_subscribers table 006 created, correctly: at that point the
-- only way to consent was the tick-box inside checkout, so every consenter had a
-- payment row and the table was a duplicate of it.
--
-- That is no longer true. The sign-up page (/sign-up) lets anyone ask for the
-- 1 November livestream link without giving money, and those people have no payment
-- row to live on. So the table comes back — this time holding something nothing else
-- holds.
--
-- The list is therefore the UNION of two sources, and stays one list:
--   p108_payments    consent captured at checkout  (donors)
--   p108_subscribers consent captured on /sign-up  (everyone else)
-- lib/db.ts consentedEmails() reads both and de-duplicates on lower(email).
--
-- Still nothing to do with gmc-app's `newsletters` table. That list fires on news,
-- events, announcements AND job postings — wider than the wording we ask for here.
--
-- Idempotent. Apply after 007.

BEGIN;

CREATE TABLE IF NOT EXISTS p108_subscribers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text NOT NULL,
  name            text,
  -- Provenance only, never used for scoping: every door grants the same permission
  -- by design, which is the whole point of one wording.
  source          text NOT NULL DEFAULT 'signup',
  -- The wording as granted, and its version. A bare boolean cannot answer "what
  -- exactly did this person agree to?", which is the only question that matters if
  -- the scope is challenged or the wording is later revised.
  consent_text    text NOT NULL,
  consent_version text NOT NULL,
  consent_at      timestamptz NOT NULL DEFAULT now(),
  -- Off-ramp. A list with no way off it is not a list we should be sending from.
  unsubscribed_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Case-insensitive, unlike gmc-app's own newsletters.email constraint. Signing up
-- twice must update one row, not create "Foo@x.com" and "foo@x.com" as two people.
CREATE UNIQUE INDEX IF NOT EXISTS uq_p108_subscribers_email
  ON p108_subscribers (lower(email));

-- Serves the export and the send list, both of which want live subscribers only.
CREATE INDEX IF NOT EXISTS idx_p108_subscribers_active
  ON p108_subscribers (consent_at) WHERE unsubscribed_at IS NULL;

COMMIT;
