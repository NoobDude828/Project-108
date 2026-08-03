-- Project 108 — donor choice on the processing fee, and mailing-list consent.
--
-- 1) Fee choice
--    The fee was previously added on top unconditionally, so a $108 offer was
--    charged $113.84 with no say in it. That reads as a penalty on the last screen
--    before payment, which is exactly where people abandon. It is now a choice.
--
--    Both figures are recorded because they diverge once the donor declines:
--      covers_fee = true   offer 108.00 -> charged 113.84, project receives 108.00
--      covers_fee = false  offer 108.00 -> charged 108.00, project receives 102.43
--    `amount` remains the base we send DK; charged_total is what the donor pays.
--
-- 2) Consent
--    Storing the wording and its version alongside the flag, not just a boolean.
--    A bare boolean cannot answer "what exactly did this person agree to?", which
--    is the only question that matters if the scope is ever challenged — or if the
--    wording is later revised.
--
-- Idempotent. Apply after 005.

BEGIN;

ALTER TABLE p108_payments
  -- Did the donor choose to cover the processing fee?
  ADD COLUMN IF NOT EXISTS covers_fee boolean,
  -- What the donor is actually charged (base + fee). Distinct from customer_pays,
  -- which was only ever the covered case.
  ADD COLUMN IF NOT EXISTS charged_total numeric(12,2),
  -- The amount the donor offered, before any fee arithmetic. Kept because when the
  -- fee is not covered, `amount` is a derived, grossed-down figure and no longer
  -- reflects what the person believed they were giving.
  ADD COLUMN IF NOT EXISTS offered_amount numeric(12,2),

  -- Mailing-list permission.
  ADD COLUMN IF NOT EXISTS consent_updates boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_text text,
  ADD COLUMN IF NOT EXISTS consent_version text,
  ADD COLUMN IF NOT EXISTS consent_at timestamptz;

-- The mailing list itself: one list, one permission, whatever the entry point
-- (checkout box, sign-up page, thank-you email link). Email is unique so the same
-- person signing up twice updates rather than duplicates.
CREATE TABLE IF NOT EXISTS p108_subscribers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text NOT NULL,
  name            text,
  -- Where the person opted in, for provenance only — never for scoping, since
  -- every source grants the same permission by design.
  source          text NOT NULL DEFAULT 'contribution',
  consent_text    text NOT NULL,
  consent_version text NOT NULL,
  consent_at      timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_p108_subscribers_email
  ON p108_subscribers (lower(email));

CREATE INDEX IF NOT EXISTS idx_p108_subscribers_active
  ON p108_subscribers (consent_at) WHERE unsubscribed_at IS NULL;

COMMIT;
