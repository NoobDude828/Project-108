/**
 * The single source of truth for the "stay in touch" permission.
 *
 * Whatever we ask permission for is the only thing that address may ever be used
 * for. If the wording mentioned only the 1 November link, the list would be finished
 * on 2 November — so the scope is deliberately broader than the single event.
 *
 * There must be exactly ONE permission and ONE wording. Every door onto the list —
 * the "Stay connected" card on the scroll page, the /sign-up page the acknowledgement
 * email links to, and the tick-box at checkout — imports these constants rather than
 * restating them, so they cannot drift apart and grant different scopes. The failure
 * that prevents is a single list where some addresses may be written to and others
 * may not, with nothing on the record to tell them apart.
 *
 * CONSENT_VERSION is stored with every opt-in, alongside the exact text the person
 * saw. When the wording changes, bump the version: earlier records then remain
 * provable evidence of what that person actually agreed to, rather than being
 * silently reinterpreted under new wording.
 */

/**
 * 2026-08-v2 — client's wording, verbatim, 21 August 2026.
 *
 * Changed from 2026-07-v1 only in "November 1st" -> "November 1". Immaterial in
 * meaning, but the wording IS the permission, so it gets a version of its own rather
 * than being edited in place. Records already stored under v1 keep their own text.
 */
export const CONSENT_VERSION = "2026-08-v2";

export const CONSENT_TEXT =
  "Yes, please send me the livestream link for November 1, and keep me connected " +
  "to Project 108 and the wider Gelephu Mindfulness City vision.";

/**
 * Who is collecting the address. Stated on every form, because a person is entitled
 * to know who will hold it before they hand it over.
 */
export const CONSENT_CONTROLLER = "Gelephu Mindfulness City Authority, Bhutan";

/** The short note on how addresses are held and how to come off the list. */
export const CONSENT_NOTICE_PATH = "/privacy";

/** Recorded with every opt-in, so the granted scope is auditable after the fact. */
export type ConsentRecord = {
  granted: boolean;
  text: string;
  version: string;
};

export function consentRecord(granted: boolean): ConsentRecord {
  return { granted, text: CONSENT_TEXT, version: CONSENT_VERSION };
}
