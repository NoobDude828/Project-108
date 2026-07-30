"use client";

import { useMemo, useRef, useState } from "react";
import { COUNTRIES, dialCodeOptions } from "./countries";
import { CONSENT_TEXT } from "@/lib/consent";

/**
 * Contribution form, presented as the Patronage modal is (same .form-modal
 * classes, so there is no visual drift when this is eventually surfaced from the
 * invitation scene).
 *
 * One deliberate departure from the other modals: the amount is the hero. In the
 * earlier draft all ten fields carried identical weight, so the amount — the
 * entire purpose of the page — looked exactly like the postcode field. It is now
 * set at display scale, and the total the donor will actually be charged is
 * stated plainly rather than tucked under the input, because "you will be
 * charged $11.09, not $10.00" is the most trust-critical fact here.
 */

const MIN_USD = 1;
const MAX_USD = 1_000_000;

/**
 * Mirrors DK's published fee model (Stripe 4.15% + DK 0.7% + $0.60 fixed,
 * ROUND_HALF_UP): the same integer-cent arithmetic as lib/dk.ts, so the figure
 * shown here and the figure charged cannot disagree. Kept in step by the tests
 * that pin both. Disclosure only — the server recomputes and is authoritative.
 *
 * Cents, not dollars: 4.85% of $10.00 is exactly $0.485 and must round up to
 * $0.49, but in floating point the product is 0.48499999999999998 and rounds
 * down. Quoting a cent less here than Stripe charges is the one error this screen
 * must not make.
 */
const FEE_PCT_NUM = 485;
const FEE_PCT_DEN = 10000;
const FEE_FIXED_CENTS = 60;

const toCents = (d: number) => Math.round(d * 100);
const toDollars = (c: number) => c / 100;
const feeCents = (baseCents: number) =>
  Math.floor((baseCents * FEE_PCT_NUM + FEE_PCT_DEN / 2) / FEE_PCT_DEN) +
  FEE_FIXED_CENTS;

const money = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Mirror of the server's baseForTotal (lib/dk.ts) — the largest base that grosses
 * up to `total` without exceeding it. Needed for the not-covering case, where the
 * donor is charged exactly what they offered and the project receives the rest.
 */
function baseCentsForTotal(totalCents: number): number {
  const estimate = Math.round(
    ((totalCents - FEE_FIXED_CENTS) * FEE_PCT_DEN) / (FEE_PCT_DEN + FEE_PCT_NUM),
  );
  let best: number | null = null;
  for (let c = estimate - 5; c <= estimate + 5; c++) {
    if (c <= 0) continue;
    if (c + feeCents(c) <= totalCents && (best === null || c > best)) best = c;
  }
  return best ?? estimate;
}

type Status = "idle" | "submitting" | "redirecting" | "error";

const initialForm = {
  amount: "",
  donorName: "",
  donorEmail: "",
  phoneCountryCode: "+975",
  donorPhone: "",
  country: "BT",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  message: "",
  // Pre-ticked: most donors do choose to cover it, and the project is made
  // whole when they do. Still a choice, not an imposition.
  coversFee: true,
  // Unticked by design — consent must be given, not assumed.
  consentUpdates: false,
};

export default function ContributeForm({ grant }: { grant: string }) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  /**
   * Idempotency key, scoped to the exact payload being submitted.
   *
   * Retrying the *same* contribution must reuse the key, so a network error
   * cannot mint a second live session and double-charge. But if the donor edits
   * anything and submits again that is a NEW intent and needs a NEW key —
   * otherwise the server would hand back the session it created for the old
   * amount and charge the wrong figure. Generated inside the submit handler
   * rather than during render, so it stays out of React's render path.
   */
  const keyRef = useRef<{ signature: string; key: string } | null>(null);

  function idempotencyKeyFor(signature: string): string {
    if (keyRef.current?.signature === signature) return keyRef.current.key;
    const key =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    keyRef.current = { signature, key };
    return key;
  }

  const ccOptions = useMemo(() => dialCodeOptions(), []);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggle(key: "coversFee" | "consentUpdates", value: boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Digits plus a single decimal point, at most two decimals.
  function onAmountChange(raw: string) {
    let v = raw.replace(/[^\d.]/g, "");
    const dot = v.indexOf(".");
    if (dot !== -1) {
      v = v.slice(0, dot + 1) + v.slice(dot + 1).replace(/\./g, "").slice(0, 2);
    }
    update("amount", v);
  }

  const amountNum = Number(form.amount);
  const amountValid =
    Number.isFinite(amountNum) && amountNum >= MIN_USD && amountNum <= MAX_USD;

  /**
   * Two paths from the same offered figure:
   *   covering     charged = offer + fee, project receives the whole offer
   *   not covering charged = the offer itself, project receives offer − fee
   * The base sent to DK differs accordingly, so both figures are derived here and
   * stated plainly — the donor should never discover the difference on Stripe.
   */
  const offeredCents = amountValid ? toCents(amountNum) : 0;
  const baseCents = form.coversFee
    ? offeredCents
    : baseCentsForTotal(offeredCents);
  const fee = amountValid ? toDollars(feeCents(baseCents)) : 0;
  const total = amountValid ? toDollars(baseCents + feeCents(baseCents)) : 0;
  const netToProject = toDollars(baseCents);

  function validate(): string | null {
    if (!amountValid)
      return `Enter a contribution amount between $${MIN_USD} and $${money(MAX_USD)}.`;
    if (!form.donorName.trim()) return "Please enter your full name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.donorEmail.trim()))
      return "Please enter a valid email address.";
    // Phone and address are not required: Stripe asks for billing details on its
    // own page anyway, so requiring them here is the same question twice.
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setErrorMsg(err);
      return;
    }
    setStatus("submitting");
    setErrorMsg(null);

    // `amount` is the figure the donor offered; the server derives the base to
    // send DK from it and `coversFee`, so the two cannot disagree.
    const phone = form.donorPhone.trim();
    const payload = {
      amount: amountNum,
      coversFee: form.coversFee,
      consentUpdates: form.consentUpdates,
      donorName: form.donorName.trim(),
      donorEmail: form.donorEmail.trim(),
      ...(phone ? { phoneCountryCode: form.phoneCountryCode, donorPhone: phone } : {}),
      country: form.country,
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2.trim() || undefined,
      city: form.city.trim(),
      state: form.state.trim(),
      postalCode: form.postalCode.trim(),
      ...(form.message.trim() ? { message: form.message.trim() } : {}),
    };
    const idempotencyKey = idempotencyKeyFor(JSON.stringify(payload));

    try {
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(grant ? { "X-Payment-Access": grant } : {}),
        },
        body: JSON.stringify({
          idempotencyKey,
          ...payload,
        }),
      });

      const data: {
        sessionUrl?: string;
        error?: string;
        details?: { fieldErrors?: Record<string, string[]> };
      } = await res.json().catch(() => ({}));

      if (res.ok && data.sessionUrl) {
        setStatus("redirecting");
        window.location.href = data.sessionUrl;
        return;
      }

      const firstField = data.details?.fieldErrors
        ? Object.values(data.details.fieldErrors).flat().filter(Boolean)[0]
        : null;
      setStatus("error");
      setErrorMsg(
        res.status === 429
          ? "Too many attempts just now. Please wait a moment and try again."
          : res.status === 404
            ? "This contribution page has expired. Please reload and try again."
            : firstField || data.error || "Something went wrong. Please try again.",
      );
    } catch {
      setStatus("error");
      setErrorMsg(
        "Couldn't reach the payment service. Please check your connection and try again.",
      );
    }
  }

  const busy = status === "submitting" || status === "redirecting";

  return (
    <main className="contribute-page">
      <div className="form-modal is-open contribute-modal" aria-hidden="false">
        <div className="form-modal__sheet">
          <p className="form-modal__lbl">Project 108 · Bhutan</p>
          <h1 className="form-modal__ttl">
            Offer a <em>contribution</em>.
          </h1>
          <p className="form-modal__lede">
            Every offering supports the construction, sacred materials, and
            consecration of the 108 Jangchub Chortens. Contributions are received
            in US dollars through a secure checkout.
          </p>

          <form className="form-modal__form" onSubmit={handleSubmit} noValidate>
            {/* The hero: the amount, at display scale. */}
            <div className="contribute-amount">
              <label className="contribute-amount__lbl" htmlFor="amount">
                Contribution amount
              </label>
              <div className="contribute-amount__row">
                <span className="contribute-amount__cur" aria-hidden="true">
                  USD
                </span>
                <input
                  id="amount"
                  ref={amountRef}
                  className="contribute-amount__input"
                  type="text"
                  inputMode="decimal"
                  value={form.amount}
                  onChange={(e) => onAmountChange(e.target.value)}
                  placeholder="0.00"
                  aria-describedby="amount-fee"
                  autoFocus
                  required
                />
              </div>

              {/* The choice sits with the amount, because it changes the amount.
                  Pre-ticked, so the generous path is the effortless one. */}
              <label className="check check--fee">
                <input
                  type="checkbox"
                  checked={form.coversFee}
                  onChange={(e) => toggle("coversFee", e.target.checked)}
                />
                  <span className="check__txt">
                  I would like to cover the processing fee, so the full amount
                  reaches the project.
                </span>
              </label>

              <p id="amount-fee" className="contribute-fee" aria-live="polite">
                {amountValid ? (
                  form.coversFee ? (
                    <>
                      You will be charged{" "}
                      <strong className="contribute-fee__total">
                        ${money(total)}
                      </strong>{" "}
                      — your contribution of ${money(amountNum)} plus $
                      {money(fee)} in processing. Project 108 receives the full{" "}
                      <strong>${money(netToProject)}</strong>.
                    </>
                  ) : (
                    <>
                      You will be charged{" "}
                      <strong className="contribute-fee__total">
                        ${money(total)}
                      </strong>
                      . After ${money(fee)} in processing, Project 108 receives{" "}
                      <strong>${money(netToProject)}</strong>.
                    </>
                  )
                ) : (
                  <>
                    Card processing costs 4.85% plus $0.60. Cover it and the whole
                    of your contribution reaches the project; leave it and it is
                    taken from your contribution instead.
                  </>
                )}
              </p>
            </div>

            <label className="field">
              <span className="field__lbl">Full name</span>
              <input
                type="text"
                value={form.donorName}
                onChange={(e) => update("donorName", e.target.value)}
                autoComplete="name"
                required
              />
            </label>

            <label className="field">
              <span className="field__lbl">Email</span>
              <input
                type="email"
                value={form.donorEmail}
                onChange={(e) => update("donorEmail", e.target.value)}
                autoComplete="email"
                required
              />
            </label>

            <div className="form-row form-row--phone">
              <label className="field field--cc">
                <span className="field__lbl">Country code</span>
                <select
                  value={form.phoneCountryCode}
                  onChange={(e) => update("phoneCountryCode", e.target.value)}
                  required
                >
                  {ccOptions.map(([name, iso, d]) => (
                    <option key={iso + d} value={d}>
                      {d} &nbsp;{name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="field__lbl">
                  Phone number <span className="field__opt">(optional)</span>
                </span>
                <input
                  type="tel"
                  value={form.donorPhone}
                  onChange={(e) => update("donorPhone", e.target.value)}
                  inputMode="numeric"
                  autoComplete="tel-national"
                />
              </label>
            </div>

            <label className="field">
              <span className="field__lbl">Address <span className="field__opt">(optional)</span></span>
              <input
                type="text"
                value={form.addressLine1}
                onChange={(e) => update("addressLine1", e.target.value)}
                placeholder="Street address"
                autoComplete="address-line1"
              />
            </label>

            <label className="field">
              <span className="field__lbl">
                Address line 2 <span className="field__opt">(optional)</span>
              </span>
              <input
                type="text"
                value={form.addressLine2}
                onChange={(e) => update("addressLine2", e.target.value)}
                autoComplete="address-line2"
              />
            </label>

            <div className="form-row form-row--double">
              <label className="field">
                <span className="field__lbl">City / town <span className="field__opt">(optional)</span></span>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  autoComplete="address-level2"
                />
              </label>
              <label className="field">
                <span className="field__lbl">
                  State / region <span className="field__opt">(optional)</span>
                </span>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  autoComplete="address-level1"
                />
              </label>
            </div>

            <div className="form-row form-row--double">
              <label className="field">
                <span className="field__lbl">
                  Postal code <span className="field__opt">(optional)</span>
                </span>
                <input
                  type="text"
                  value={form.postalCode}
                  onChange={(e) => update("postalCode", e.target.value)}
                  autoComplete="postal-code"
                />
              </label>
              <label className="field">
                <span className="field__lbl">Country</span>
                <select
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  required
                >
                  {COUNTRIES.map(([name, iso]) => (
                    <option key={iso} value={iso}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="field">
              <span className="field__lbl">
                Dedication <span className="field__opt">(optional)</span>
              </span>
              <textarea
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                rows={2}
                placeholder="In honour of a loved one, or all sentient beings."
              />
            </label>

            {/* Unticked by design. One list, one permission — the wording is
                imported, never restated, so the checkout box, the sign-up page and
                the thank-you email cannot grant different things. */}
            <label className="check check--consent">
              <input
                type="checkbox"
                checked={form.consentUpdates}
                onChange={(e) => toggle("consentUpdates", e.target.checked)}
              />
              <span className="check__txt">{CONSENT_TEXT}</span>
            </label>

            <p
              className="form-modal__error"
              role="alert"
              aria-live="polite"
              hidden={!errorMsg}
            >
              {errorMsg}
            </p>

            <div className="form-actions contribute-actions">
              <button type="submit" className="btn" disabled={busy}>
                {status === "submitting"
                  ? "Preparing…"
                  : status === "redirecting"
                    ? "Redirecting…"
                    : amountValid
                      ? `Continue — pay $${money(total)}`
                      : "Continue to secure checkout"}
              </button>
            </div>
            <p className="form-modal__small">
              You will be redirected to a secure Stripe checkout to complete your
              payment. Project 108 never sees your card details.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
