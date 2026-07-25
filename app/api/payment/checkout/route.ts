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
} from "@/lib/dk";
import { insertPaymentCreated, markPaymentStatus } from "@/lib/db";

const MIN_USD = 1; // DK minimum transaction is $1.00
const MAX_USD = 1_000_000; // sane upper cap

type CheckoutBody = Record<string, unknown>;

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export async function POST(req: Request) {
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
  if (!donorPhone) fieldErrors.donorPhone = ["Please enter your phone number."];
  if (!country) fieldErrors.country = ["Please select your country."];
  if (!addressLine1) fieldErrors.addressLine1 = ["Please enter your address."];
  if (!city) fieldErrors.city = ["Please enter your city or town."];
  if (!state) fieldErrors.state = ["Please enter your state/province/region."];
  if (!postalCode) fieldErrors.postalCode = ["Please enter your postal/ZIP code."];
  if (Object.keys(fieldErrors).length > 0) {
    return Response.json(
      { success: false, error: "Please check the form.", details: { fieldErrors } },
      { status: 400 },
    );
  }

  const roundedAmount = Math.round(amount * 100) / 100;

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

  const appNo = makeApplicationNo();
  const successUrl = `${returnBase}?ref=${encodeURIComponent(appNo)}&result=success`;
  const cancelUrl = `${returnBase}?ref=${encodeURIComponent(appNo)}&result=cancel`;

  // Persist a durable record BEFORE calling DK (so we have it even on failure).
  await insertPaymentCreated({
    applicationNo: appNo,
    amount: roundedAmount,
    currency: "usd",
    feeTotal: fees.feeTotal,
    customerPays: fees.customerPays,
    netToProject: fees.netToProject,
    requestHash,
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

  let result;
  try {
    result = await dkCreateCheckout({
      amount: roundedAmount,
      applicationNo: appNo,
      successUrl,
      cancelUrl,
    });
  } catch (err) {
    console.error("[/api/payment/checkout] DK request failed", err);
    await markPaymentStatus(appNo, "failed", {
      eventType: "dk_error",
      detail: { error: String(err) },
    });
    return Response.json(
      { success: false, error: "Couldn't reach the payment gateway." },
      { status: 502 },
    );
  }

  if (result.ok) {
    await markPaymentStatus(appNo, "redirected", {
      dkSessionId: result.sessionId,
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
