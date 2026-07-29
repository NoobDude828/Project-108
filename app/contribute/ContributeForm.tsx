"use client";

import { useMemo, useRef, useState } from "react";
import { COUNTRIES, dialCodeOptions } from "./countries";

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

// Mirrors DK's published fee model (Stripe 4.15% + DK 0.7% + $0.60 fixed,
// ROUND_HALF_UP) so the figure shown matches what Stripe charges to the cent.
// The server recomputes this independently — this is for disclosure only.
const FEE_PCT = 0.0485;
const FEE_FIXED = 0.6;
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const money = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
  const fee = amountValid ? round2(amountNum * FEE_PCT + FEE_FIXED) : 0;
  const total = amountValid ? round2(amountNum + fee) : 0;

  function validate(): string | null {
    if (!amountValid)
      return `Enter a contribution amount between $${MIN_USD} and $${money(MAX_USD)}.`;
    if (!form.donorName.trim()) return "Please enter your full name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.donorEmail.trim()))
      return "Please enter a valid email address.";
    if (!form.donorPhone.trim()) return "Please enter your phone number.";
    if (!form.country) return "Please select your country.";
    if (!form.addressLine1.trim()) return "Please enter your address.";
    if (!form.city.trim()) return "Please enter your city or town.";
    if (!form.state.trim()) return "Please enter your state, province, or region.";
    if (!form.postalCode.trim()) return "Please enter your postal or ZIP code.";
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

    const payload = {
      amount: amountNum,
      donorName: form.donorName.trim(),
      donorEmail: form.donorEmail.trim(),
      phoneCountryCode: form.phoneCountryCode,
      donorPhone: form.donorPhone.trim(),
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

              <p id="amount-fee" className="contribute-fee" aria-live="polite">
                {amountValid ? (
                  <>
                    A processing fee of{" "}
                    <strong>${money(fee)}</strong> is added at checkout, so you
                    will be charged{" "}
                    <strong className="contribute-fee__total">
                      ${money(total)}
                    </strong>
                    . Project 108 receives your full ${money(amountNum)}.
                  </>
                ) : (
                  <>
                    A processing fee of 4.85% plus $0.60 is added at checkout.
                    Project 108 receives the full amount you enter.
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
                <span className="field__lbl">Phone number</span>
                <input
                  type="tel"
                  value={form.donorPhone}
                  onChange={(e) => update("donorPhone", e.target.value)}
                  inputMode="numeric"
                  autoComplete="tel-national"
                  required
                />
              </label>
            </div>

            <label className="field">
              <span className="field__lbl">Address</span>
              <input
                type="text"
                value={form.addressLine1}
                onChange={(e) => update("addressLine1", e.target.value)}
                placeholder="Street address"
                autoComplete="address-line1"
                required
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
                <span className="field__lbl">City / town</span>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  autoComplete="address-level2"
                  required
                />
              </label>
              <label className="field">
                <span className="field__lbl">State / province / region</span>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  autoComplete="address-level1"
                  required
                />
              </label>
            </div>

            <div className="form-row form-row--double">
              <label className="field">
                <span className="field__lbl">Postal / ZIP code</span>
                <input
                  type="text"
                  value={form.postalCode}
                  onChange={(e) => update("postalCode", e.target.value)}
                  autoComplete="postal-code"
                  required
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
