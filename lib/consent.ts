/**
 * The single source of truth for the "stay in touch" permission.
 *
 * Whatever we ask for at the moment someone gives us their email address is the
 * only thing we may ever use it for. If the wording mentions only the 1 November
 * livestream, then once that day passes those addresses are spent — we could not
 * write to them again about anything else, however much they might want to hear
 * from us. So the scope is deliberately broader than the single event.
 *
 * There must be exactly ONE permission and ONE wording. Every place a person can
 * opt in — this checkout box, and the link in the thank-you email when it exists —
 * must import this constant rather than restate it, so they cannot drift apart and
 * grant different scopes.
 *
 * The record of an opt-in lives on the payment row (see migration 006); there is no
 * subscriber table, and we do not add anyone to gmc-app's `newsletters` list, whose
 * automated stream includes job postings and so is wider than this wording allows.
 * `consentedEmails()` in lib/db.ts is the send list.
 *
 * CONSENT_VERSION is stored alongside each opt-in. If the wording is ever
 * revised, bump the version: existing records then remain provable evidence of
 * what that person actually agreed to, rather than being silently reinterpreted
 * under new wording.
 */

export const CONSENT_VERSION = "2026-07-v1";

export const CONSENT_TEXT =
  "Yes, please send me the livestream link for November 1st, and keep me " +
  "connected to Project 108 and the wider Gelephu Mindfulness City vision.";

/** Recorded with every opt-in, so the granted scope is auditable after the fact. */
export type ConsentRecord = {
  granted: boolean;
  text: string;
  version: string;
};

export function consentRecord(granted: boolean): ConsentRecord {
  return { granted, text: CONSENT_TEXT, version: CONSENT_VERSION };
}
