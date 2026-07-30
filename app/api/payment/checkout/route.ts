/**
 * Contribution checkout — Project 108 calls the DK Bank Stripe gateway directly.
 *
 * The browser POSTs {amount + donor details}; this server route validates,
 * computes the fee components, persists a durable record, then asks DK to create
 * a Stripe Checkout session and returns the `session_url` for the browser to
 * redirect to. The card is entered on Stripe's hosted page (PCI SAQ-A); we
 * confirm completion later by polling /api/payment/status — never the redirect.
 *
 * Required server env (real values live in the untracked server .env):
 *   DK_API_BASE, DK_API_KEY, DK_SUBMERCHANT_ID, DK_ACCOUNT, DK_AGENCY_NAME  (see lib/dk.ts)
 *   PAYMENT_RETURN_URL   absolute HTTPS base for the return page — DK requires HTTPS;
 *                        the success/cancel URLs are built from it.
 */

import crypto from "node:crypto";
import {
  dkCreateCheckout,
  makeApplicationNo,
  dkErrorStatus,
  computeFees,
  baseForTotal,
} from "@/lib/dk";
import {
  insertPaymentCreated,
  markPaymentStatus,
  findByIdempotencyKey,
  isUniqueViolation,
} from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { verifyGrant } from "@/lib/paymentGrant";
import { consentRecord } from "@/lib/consent";

const MIN_USD = 1; // DK minimum transaction is $1.00
const MAX_USD = 1_000_000; // sane upper cap

/**
 * Pre-launch access gate.
 *
 * There is deliberately no payment UI on the site yet, but this route is
 * publicly reachable and — with production DK credentials — mints *live* Stripe
 * sessions. Left open it is an abuse surface: card-testing against a live
 * gateway, and payment-row flooding. While PAYMENT_ACCESS_TOKEN is set, callers
 * must present it, so only our own verification requests get through.
 *
 * REMOVE this (and replace it with the real anti-abuse controls a public
 * donation form needs — captcha/proof-of-work plus tighter limits) at the point
 * the contribution UI actually launches. If the var is unset the route is open,
 * which is correct once the form is public but must be a deliberate choice.
 */
const PAYMENT_ACCESS_TOKEN = process.env.PAYMENT_ACCESS_TOKEN || "";

/** Constant-time compare so the check cannot be probed by timing. */
function tokenMatches(provided: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(PAYMENT_ACCESS_TOKEN);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// This route is unauthenticated by necessity (donors are anonymous) and every
// accepted call creates a real gateway session plus a payments row, so it is
// rate limited per IP. Without this it can be driven to mass-create DK/Stripe
// sessions and flood the payments table — the same class of finding the
// penetration test raised against the other public POST endpoints.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

type CheckoutBody = Record<string, unknown>;

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export async function POST(req: Request) {
  const limited = rateLimit(
    `payment:${clientIp(req)}`,
    RATE_LIMIT,
    RATE_WINDOW_MS,
  );
  if (limited) return limited;

  // Pre-launch gate (see PAYMENT_ACCESS_TOKEN above). Accepts either the raw
  // token — for our own server-side calls — or a short-lived signed grant minted
  // by the unlisted /contribute page, so that page never has to embed the secret
  // in its HTML. 404 rather than 401 so an unauthorised caller cannot even
  // confirm a payment endpoint exists here.
  if (PAYMENT_ACCESS_TOKEN) {
    const presented = req.headers.get("x-payment-access") || "";
    if (!tokenMatches(presented) && !verifyGrant(presented)) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
  }

  let body: CheckoutBody;
  try {
    body = (await req.json()) as CheckoutBody;
  } catch {
    return Response.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const amount = Number(body.amount);
  const donorName = str(body.donorName);
  const donorEmail = str(body.donorEmail);
  const phoneCountryCode = str(body.phoneCountryCode);
  const donorPhone = str(body.donorPhone);
  const country = str(body.country);
  const addressLine1 = str(body.addressLine1);
  const addressLine2 = str(body.addressLine2);
  const city = str(body.city);
  const state = str(body.state);
  const postalCode = str(body.postalCode);
  const message = str(body.message);

  const fieldErrors: Record<string, string[]> = {};
  if (!Number.isFinite(amount) || amount < MIN_USD || amount > MAX_USD) {
    fieldErrors.amount = [`Enter an amount between $${MIN_USD} and $${MAX_USD}.`];
  } else if (Math.round(amount * 100) !== amount * 100) {
    fieldErrors.amount = ["Amount can have at most two decimal places."];
  }
  if (!donorName) fieldErrors.donorName = ["Please enter your name."];
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(donorEmail)) {
    fieldErrors.donorEmail = ["Please enter a valid email address."];
  }
  // Phone and address are deliberately OPTIONAL. Stripe collects billing details
  // on its own checkout page for card verification, so requiring them here asks
  // the donor for the same thing twice — and Western donors are frequently
  // reluctant to hand over a phone number for a donation at all.
  if (Object.keys(fieldErrors).length > 0) {
    return Response.json(
      { success: false, error: "Please check the form.", details: { fieldErrors } },
      { status: 400 },
    );
  }

  const offeredAmount = Math.round(amount * 100) / 100;

  // Covering the processing fee is the donor's choice.
  //   covering     -> send the offer; DK grosses it up, project receives the offer
  //   not covering -> send a grossed-DOWN base so the donor is charged the offer,
  //                   and the project absorbs the fee (~6%)
  // Defaults to covering when unspecified, matching the long-standing behaviour.
  const coversFee = body.coversFee !== false;
  const roundedAmount = coversFee ? offeredAmount : baseForTotal(offeredAmount);

  // Return URL comes straight from the environment (DK requires a valid HTTPS
  // success/cancel URL — never composed/guessed here).
  const returnBase = process.env.PAYMENT_RETURN_URL?.trim();
  if (!returnBase) {
    console.error("[/api/payment/checkout] PAYMENT_RETURN_URL is not set");
    return Response.json(
      { success: false, error: "Payment return URL is not configured." },
      { status: 500 },
    );
  }

  // Money components from DK's published fee formula (DK never returns the
  // settled fee, so we store our computed values).
  const fees = computeFees(roundedAmount);
  const consent = consentRecord(body.consentUpdates === true);
  // Fingerprint the request for forensic traceability.
  const requestHash = crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        amount: roundedAmount,
        donorName,
        donorEmail,
        donorPhone,
        country,
        addressLine1,
        city,
        state,
        postalCode,
      }),
    )
    .digest("hex");

  // ---- Idempotency -----------------------------------------------------
  // The client sends a stable key per checkout intent and reuses it when
  // retrying. Without this, a retry after a network error (or a double-click)
  // minted a second live gateway session for the same intent and the donor
  // could pay twice.
  const idempotencyKey = str(body.idempotencyKey) || undefined;

  if (idempotencyKey) {
    let prior;
    try {
      prior = await findByIdempotencyKey(idempotencyKey);
    } catch (err) {
      // Refuse rather than guess: treating a failed lookup as "no prior
      // attempt" is precisely how a duplicate charge gets created.
      console.error("[/api/payment/checkout] idempotency lookup failed", err);
      return Response.json(
        { success: false, error: "Couldn't verify the request. Please try again." },
        { status: 503 },
      );
    }
    if (prior?.dkSessionUrl && prior.status !== "failed") {
      // Same intent, already has a session — hand back the original URL verbatim.
      return Response.json(
        { ref: prior.applicationNo, sessionUrl: prior.dkSessionUrl },
        { status: 200 },
      );
    }
  }

  const appNo = makeApplicationNo();
  const successUrl = `${returnBase}?ref=${encodeURIComponent(appNo)}&result=success`;
  const cancelUrl = `${returnBase}?ref=${encodeURIComponent(appNo)}&result=cancel`;

  // Record the intent BEFORE calling DK. This insert is mandatory: handing out
  // a payable session we failed to record would be money taken with no trace.
  try {
    await insertPaymentCreated({
      applicationNo: appNo,
      amount: roundedAmount,
      currency: "usd",
      feeTotal: fees.feeTotal,
      customerPays: fees.customerPays,
      netToProject: fees.netToProject,
      requestHash,
      idempotencyKey,
      offeredAmount,
      coversFee,
      chargedTotal: fees.customerPays,
      consentUpdates: consent.granted,
      consentText: consent.granted ? consent.text : undefined,
      consentVersion: consent.granted ? consent.version : undefined,
      donorName,
      donorEmail,
      donorPhone: [phoneCountryCode, donorPhone].filter(Boolean).join(" "),
      country,
      addressLine1,
      addressLine2: addressLine2 || undefined,
      city,
      state,
      postalCode,
      message: message || undefined,
      successUrl,
      cancelUrl,
    });
  } catch (err) {
    // Lost the idempotency race: a concurrent request with the same key already
    // inserted. Read back its session rather than creating a second one.
    if (isUniqueViolation(err) && idempotencyKey) {
      const winner = await findByIdempotencyKey(idempotencyKey).catch(() => null);
      if (winner?.dkSessionUrl) {
        return Response.json(
          { ref: winner.applicationNo, sessionUrl: winner.dkSessionUrl },
          { status: 200 },
        );
      }
      // The winner exists but has not got its session yet — ask the client to
      // retry with the same key rather than racing it.
      return Response.json(
        { success: false, error: "This contribution is already being prepared. Please try again in a moment." },
        { status: 409 },
      );
    }
    console.error("[/api/payment/checkout] could not record the payment", err);
    return Response.json(
      { success: false, error: "Couldn't start the payment. Please try again." },
      { status: 503 },
    );
  }

  let result;
  try {
    result = await dkCreateCheckout({
      amount: roundedAmount,
      applicationNo: appNo,
      successUrl,
      cancelUrl,
    });
  } catch (err) {
    // Do NOT mark this failed. A timeout or network fault leaves it genuinely
    // ambiguous: DK may already have created the session, and if the donor
    // somehow reaches and pays it, a terminal `failed` would make the sweep skip
    // the row and we would never record the payment. Leaving it non-terminal
    // means reconciliation polls this application_no and resolves it properly —
    // to paid if DK confirms, to expired if it was never completed.
    console.error("[/api/payment/checkout] DK request failed", err);
    await markPaymentStatus(appNo, "created", {
      eventType: "dk_unreachable",
      detail: {
        error: String(err),
        note: "left non-terminal for reconciliation",
      },
    });
    return Response.json(
      { success: false, error: "Couldn't reach the payment gateway. Please try again." },
      { status: 502 },
    );
  }

  if (result.ok) {
    await markPaymentStatus(appNo, "redirected", {
      dkSessionId: result.sessionId,
      // Store the URL DK actually returned. An idempotent replay serves this
      // verbatim rather than rebuilding it from the id, so we never depend on
      // Stripe's URL format staying the same.
      dkSessionUrl: result.sessionUrl,
      eventType: "dk_checkout_response",
      httpStatus: 201,
    });
    return Response.json(
      { ref: appNo, sessionUrl: result.sessionUrl },
      { status: 201 },
    );
  }

  await markPaymentStatus(appNo, "failed", {
    dkResponseCode: result.code,
    dkResponseMessage: result.message,
    dkResponseDescription: result.message,
    eventType: "dk_checkout_response",
    detail: { code: result.code, message: result.message },
  });
  return Response.json(
    {
      success: false,
      error: result.message || "The payment gateway rejected the request.",
      code: result.code,
    },
    { status: dkErrorStatus(result.code) },
  );
}
