"use client";

import { useState } from "react";
import { CONSENT_TEXT } from "@/lib/consent";

/**
 * Sign-up form — one field, one action.
 *
 * Deliberately NOT the .field / .form-modal treatment used by /contribute. That
 * page is a transaction and looks like one; this page is an invitation, and a boxed
 * two-field form with labels above it made the input the hero instead of the day.
 * The field borrows the amount input's language instead — borderless, a single gold
 * underline that brightens on focus — so it reads as a line to write on.
 *
 * The Name field is gone. Nothing that sends uses a subscriber's name, so it was an
 * optional decision asked of every visitor in exchange for nothing.
 *
 * Consent sits ABOVE the button: it is what pressing the button agrees to, so it has
 * to be read first. On a page whose only purpose is opting in, submitting IS the
 * agreement — a box you must tick to do the only thing available is friction dressed
 * as a choice. The wording is imported, identical to the checkout tick-box, which is
 * what makes this the same permission rather than a second one.
 */

type Status = "idle" | "sending" | "done" | "error";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setStatus("sending");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), website: honeypot }),
      });
      const data: { success?: boolean; error?: string } = await res
        .json()
        .catch(() => ({}));
      if (res.ok && data.success) {
        setStatus("done");
        return;
      }
      setStatus("error");
      setErrorMsg(
        res.status === 429
          ? "Too many attempts just now. Please wait a moment and try again."
          : data.error || "Something went wrong. Please try again.",
      );
    } catch {
      setStatus("error");
      setErrorMsg("Couldn't reach us just now. Please check your connection.");
    }
  }

  // The completed act is the one thing on this page that earns the ceremonial
  // centre; everything else is left-aligned, as an invitation would be.
  if (status === "done") {
    return (
      <div className="su-done" role="status">
        <div className="su-rule" aria-hidden="true" />
        <p className="su-done__ttl">
          You are <em>on the list</em>.
        </p>
        <p className="su-done__body">
          On November 1st we will send you the livestream link and the prayers for
          the day. Until then you will hear from us only when there is something
          worth telling.
        </p>
      </div>
    );
  }

  const busy = status === "sending";

  return (
    <form className="su-form" onSubmit={handleSubmit} noValidate>
      <div className="su-field">
        {/* Visually hidden, not absent: a placeholder is not a label. */}
        <label className="su-sr" htmlFor="su-email">
          Your email address
        </label>
        <input
          id="su-email"
          className="su-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your email address"
          autoComplete="email"
          inputMode="email"
          required
          autoFocus
        />
      </div>

      {/* Honeypot. Off-screen rather than display:none, which some bots detect. */}
      <div aria-hidden="true" className="su-hp">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <p className="su-consent">{CONSENT_TEXT}</p>

      <p className="su-error" role="alert" aria-live="polite" hidden={!errorMsg}>
        {errorMsg}
      </p>

      <button type="submit" className="su-btn" disabled={busy}>
        {busy ? "Sending…" : "Keep me connected"}
      </button>

      <p className="su-micro">Every email carries a way to leave the list.</p>
    </form>
  );
}
