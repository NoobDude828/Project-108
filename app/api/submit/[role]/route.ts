/**
 * Same-origin proxy for the 108 submission API.
 *
 * The browser POSTs to /api/submit/patrons (or /volunteers); this handler runs
 * on the server (no CORS) and forwards the body to the upstream API. We do this
 * because the upstream service at gmc.bt/api was rejecting browser preflight
 * OPTIONS requests, which silently blocked every form submission.
 *
 * Status code, body and content-type are passed through so the client can keep
 * handling 201 / 400 / 409 / 500 the same way — with two hardening measures
 * added after the BtCIRT penetration test:
 *
 *  1. Per-IP rate limiting. The endpoints previously accepted unlimited traffic
 *     (10 parallel POSTs in 330ms all succeeded), which is what made bulk CID /
 *     email enumeration and record-flooding practical.
 *  2. Server-side validation before anything is forwarded (BtCIRT 5.4/5.5/5.6).
 *     Malformed input used to reach upstream unread and produce HTTP 500s, and a
 *     numeric STRING bypassed the volunteerCount bounds. See lib/submitValidation.ts.
 *  3. Upstream error bodies are no longer passed through verbatim (BtCIRT 5.7).
 *     Their Zod fieldErrors disclosed internal schema names the browser never sends.
 *  4. A short replay guard rejects byte-identical resubmissions (BtCIRT 5.2). Real
 *     deduplication by email/CID belongs upstream, which owns the records; this only
 *     stops the trivial "POST the same body three times" case the report demonstrated.
 *  5. The upstream 409 body is replaced with a single generic message. Upstream
 *     returns distinct strings ("A submission with this CID already exists" vs
 *     "...this email already exists" vs "An organization registration with this
 *     contact email already exists"), which told an attacker *which* identifier
 *     matched and under which flow it was registered. The client only branches
 *     on the 409 status, never the text, so this is safe.
 *
 * Note: the 201-vs-409 distinction itself is still observable. Fully closing
 * that oracle means returning an identical response for new and duplicate
 * submissions, which removes the "you are already registered" feedback — a
 * product decision, and it also needs the upstream dedup fix (unscoped
 * email/CID uniqueness) to be worth doing.
 */

import crypto from "node:crypto";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import {
  validateSubmission,
  filterUpstreamFieldErrors,
} from "@/lib/submitValidation";

const UPSTREAM = "https://gmc.bt/api";
const ALLOWED_ROLES = new Set(["patrons", "volunteers"]);

// A person registers once. Anything beyond a handful per minute from one IP is
// automation, not a human filling in a form.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

export async function POST(
  req: Request,
  ctx: { params: Promise<{ role: string }> },
) {
  const { role } = await ctx.params;
  if (!ALLOWED_ROLES.has(role)) {
    return Response.json(
      { success: false, error: "Unknown submission role" },
      { status: 400 },
    );
  }

  const limited = rateLimit(
    `submit:${clientIp(req)}`,
    RATE_LIMIT,
    RATE_WINDOW_MS,
  );
  if (limited) return limited;

  const raw = await req.text();

  // Validate BEFORE forwarding. A malformed request must cost upstream nothing —
  // the crash surface the report exercised is not merely handled here, it is never
  // reached. `checked` is re-serialised from inspected values only.
  const checked = validateSubmission(raw);
  if (!checked.ok) {
    return Response.json(
      {
        success: false,
        error: checked.message,
        ...(checked.field
          ? { details: { fieldErrors: { [checked.field]: [checked.message] } } }
          : {}),
      },
      { status: 400 },
    );
  }
  const body = checked.body;

  // Replay guard: the same body from the same client twice is a retry or a flood,
  // never two different people. Keyed on the normalised body so a cosmetic
  // whitespace change cannot slip past it.
  const replayKey = `submit-replay:${role}:${crypto
    .createHash("sha256")
    .update(body)
    .digest("hex")}`;
  if (recentlySeen(replayKey)) {
    return Response.json(
      { success: false, error: "This submission has already been received." },
      { status: 409 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${UPSTREAM}/${role}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      // Edge networks sometimes cache POST responses oddly; opt out.
      cache: "no-store",
    });
  } catch (err) {
    console.error("[/api/submit] upstream fetch failed", err);
    return Response.json(
      {
        success: false,
        error: "Couldn't reach the submission service.",
      },
      { status: 502 },
    );
  }

  // Collapse the upstream's field-specific duplicate messages into one generic
  // string so the response cannot be used to identify which CID/email matched.
  if (upstream.status === 409) {
    return Response.json(
      { success: false, error: "This identifier is already registered." },
      { status: 409 },
    );
  }

  const text = await upstream.text();

  // Upstream validation errors are filtered, not forwarded: their Zod fieldErrors
  // named internal fields (volunteerCountMale/Female) that the browser never sends,
  // handing an attacker the server-side schema (BtCIRT 5.7).
  if (upstream.status === 400 || upstream.status === 422) {
    console.warn(`[/api/submit/${role}] upstream rejected a submission`, text.slice(0, 300));
    return new Response(filterUpstreamFieldErrors(text), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Never relay an upstream 5xx body. It is not ours to characterise, and a crash
  // message is exactly the kind of detail that should stay server-side.
  if (upstream.status >= 500) {
    console.error(`[/api/submit/${role}] upstream ${upstream.status}`, text.slice(0, 500));
    return Response.json(
      { success: false, error: "Couldn't submit just now. Please try again." },
      { status: 502 },
    );
  }

  return new Response(text, {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") || "application/json",
    },
  });
}

/**
 * Byte-identical submissions seen in the last few minutes.
 *
 * Per-process and in-memory, like the rate limiter, which is correct for the single
 * PM2 fork this runs as. Not a substitute for upstream deduplication by email/CID —
 * that is the real remedy and it belongs where the records live.
 */
const REPLAY_WINDOW_MS = 10 * 60_000;
const gr = globalThis as unknown as { __p108Replay?: Map<string, number> };
const replays: Map<string, number> =
  gr.__p108Replay ?? (gr.__p108Replay = new Map());

function recentlySeen(key: string): boolean {
  const now = Date.now();
  if (replays.size > 5_000) {
    for (const [k, at] of replays) if (now - at > REPLAY_WINDOW_MS) replays.delete(k);
  }
  const seen = replays.get(key);
  if (seen !== undefined && now - seen < REPLAY_WINDOW_MS) return true;
  replays.set(key, now);
  return false;
}
