/**
 * Server-side validation for the public submission proxy.
 *
 * BtCIRT findings 5.4, 5.5 and 5.6. The proxy used to forward `await req.text()`
 * upstream unread, so anything the client sent reached gmc.bt's schema and its
 * Postgres columns directly. Three consequences the report demonstrated:
 *
 *   5.4  a countryCode of 200+ chars, or containing CRLF, a NUL byte, or a URL,
 *        produced an unhandled upstream exception surfaced as HTTP 500;
 *   5.5  a NUL byte or a 5000-character string in name / orgName / message / email
 *        did the same — Postgres text columns reject U+0000 outright;
 *   5.6  volunteerCount sent as the STRING "999999999999999999999" was coerced by
 *        Zod's z.coerce.number() to 1e21 and accepted, with no upper bound.
 *
 * Validating here rather than only upstream is the right layer for two reasons: it is
 * the trust boundary the request actually crosses first, and it means a malformed
 * request costs nothing upstream — the crash surface is not merely handled, it is
 * never reached.
 *
 * The caps are deliberately generous. This rejects abuse, not unusual-but-real people:
 * long names, long organisation names and multi-paragraph messages all pass.
 */

/** Field caps. Email follows RFC 5321's practical maximum. */
const CAPS = {
  name: 200,
  contactName: 200,
  orgName: 300,
  orgType: 60,
  email: 254,
  phone: 32,
  countryCode: 6,
  country: 60,
  cid: 20,
  nationality: 20,
  address: 300,
  city: 120,
  state: 120,
  postalCode: 20,
  message: 5000,
  website: 300,
} as const;

/** Anything beyond these is not a field we forward. */
const KNOWN_FIELDS = new Set([...Object.keys(CAPS), "volunteerCount"]);

/**
 * Control characters have no place in any of these fields.
 *
 * U+0000 is the one that actually crashes Postgres, but CR and LF matter too: a
 * newline in a single-line field is the shape of a header-injection or log-forging
 * attempt, and the report specifically demonstrated CRLF in countryCode.
 */
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

/** Newlines are permitted in the free-text message only. */
const NEWLINES = /[\r\n]/;

const COUNTRY_CODE = /^\+?[0-9]{1,4}$/;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
/** Digits, spaces and the usual punctuation people type into a phone field. */
const PHONE = /^[0-9+\-()\s]{4,32}$/;

/** A real integer, not a string Zod will coerce, and within a sane range. */
const MAX_VOLUNTEER_COUNT = 100_000;

export type ValidationResult =
  | { ok: true; body: string }
  | { ok: false; message: string; field?: string };

/**
 * Validate and re-serialise a submission body.
 *
 * Returns the JSON to forward — re-serialised from the parsed and checked values, so
 * nothing that was not inspected can ride along. Unknown keys are dropped rather than
 * rejected: the upstream form may gain fields before this does, and silently
 * forwarding an unvetted key is exactly what this exists to prevent.
 *
 * Error messages name only the field and the rule. They never echo the value back,
 * which would turn this into a reflection point.
 */
export function validateSubmission(raw: string): ValidationResult {
  if (raw.length > 64 * 1024) {
    return { ok: false, message: "That submission is too large." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, message: "Invalid request body." };
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, message: "Invalid request body." };
  }

  const input = parsed as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (!KNOWN_FIELDS.has(key)) continue; // dropped, not forwarded
    if (value === null || value === undefined || value === "") continue;

    if (key === "volunteerCount") {
      // Must already BE a number. A numeric string is exactly the 5.6 bypass.
      if (typeof value !== "number" || !Number.isInteger(value)) {
        return {
          ok: false,
          field: key,
          message: "Number of volunteers must be a whole number.",
        };
      }
      if (value < 1 || value > MAX_VOLUNTEER_COUNT) {
        return {
          ok: false,
          field: key,
          message: `Number of volunteers must be between 1 and ${MAX_VOLUNTEER_COUNT}.`,
        };
      }
      out[key] = value;
      continue;
    }

    if (typeof value !== "string") {
      return { ok: false, field: key, message: "Invalid value." };
    }

    const v = value.trim();
    const cap = CAPS[key as keyof typeof CAPS];
    if (cap !== undefined && v.length > cap) {
      return { ok: false, field: key, message: `That value is too long.` };
    }
    if (CONTROL_CHARS.test(v)) {
      return { ok: false, field: key, message: "That value contains characters we cannot accept." };
    }
    if (key !== "message" && NEWLINES.test(v)) {
      return { ok: false, field: key, message: "That value contains characters we cannot accept." };
    }
    if (key === "countryCode" && !COUNTRY_CODE.test(v)) {
      return { ok: false, field: key, message: "Enter a valid dialling code." };
    }
    if (key === "email" && !EMAIL.test(v)) {
      return { ok: false, field: key, message: "Enter a valid email address." };
    }
    if (key === "phone" && !PHONE.test(v)) {
      return { ok: false, field: key, message: "Enter a valid phone number." };
    }
    out[key] = v;
  }

  return { ok: true, body: JSON.stringify(out) };
}

/**
 * Field names the client is allowed to see errors about — the ones its own forms
 * actually render.
 *
 * BtCIRT finding 5.7: the proxy echoed upstream's Zod `fieldErrors` verbatim, which
 * disclosed internal server-side names the browser never sends. `volunteerCountMale`
 * and `volunteerCountFemale` were enumerated this way (the UI labels them only "men"
 * and "women"), giving an attacker the schema for free. Upstream errors are now
 * filtered to this list and anything else is dropped.
 */
const PUBLIC_FIELDS = new Set(Object.keys(CAPS).concat("volunteerCount"));

export function filterUpstreamFieldErrors(body: string): string {
  try {
    const parsed = JSON.parse(body) as {
      error?: unknown;
      details?: { fieldErrors?: Record<string, unknown> };
    };
    const incoming = parsed.details?.fieldErrors;
    if (!incoming || typeof incoming !== "object") {
      return JSON.stringify({ success: false, error: "Please check the form." });
    }
    const kept: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(incoming)) {
      if (PUBLIC_FIELDS.has(k)) kept[k] = v;
    }
    return JSON.stringify({
      success: false,
      error: "Please check the form.",
      ...(Object.keys(kept).length > 0 ? { details: { fieldErrors: kept } } : {}),
    });
  } catch {
    return JSON.stringify({ success: false, error: "Please check the form." });
  }
}
