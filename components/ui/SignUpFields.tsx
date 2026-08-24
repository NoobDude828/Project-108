"use client";

import { useState } from "react";
import {
  CONSENT_TEXT,
  CONSENT_CONTROLLER,
  CONSENT_NOTICE_PATH,
} from "@/lib/consent";

/**
 * The sign-up form. ONE component, used by every door onto the list:
 *
 *   - the "Stay connected" card on the scroll page (SignUpModal)
 *   - the /sign-up page, which is where the acknowledgement email's link points
 *
 * Sharing the component is what makes "the same form everywhere" true in fact rather
 * than by intention. If the wording, the tick-box default or the fields are changed,
 * they change in one place and every door changes with them.
 *
 * Name and email only, and one tick-box left UNTICKED. The tick-box is not decoration:
 * consent has to be given, and a pre-ticked box is not given. Nothing is submitted
 * unless it is ticked, because the permission is the entire point of collecting the
 * address.
 *
 * The form states who is collecting the addresses and links to the note on how they
 * are held and how to come off the list.
 */

type Status = "idle" | "sending" | "done" | "error";

export default function SignUpFields({
  autoFocus = false,
  source = "signup",
  onDone,
}: {
  autoFocus?: boolean;
  /** Provenance only — every door grants the same permission. */
  source?: string;
  onDone?: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    // Consent is the point. Without it there is nothing we could lawfully do with
    // the address, so there is nothing to submit.
    if (!consent) {
      setErrorMsg(
        "Please tick the box so we know we may write to you.",
      );
      return;
    }
    setStatus("sending");
    setErrorMsg(null);
    try {
      const basePath = window.location.pathname.startsWith("/108") ? "/108" : "";
      const res = await fetch(`${basePath}/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          source,
          consent: true,
          website: honeypot,
        }),
      });
      const data: { success?: boolean; error?: string } = await res
        .json()
        .catch(() => ({}));
      if (res.ok && data.success) {
        setStatus("done");
        onDone?.();
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

  if (status === "done") {
    return (
      <div className="su-done" role="status">
        <div className="su-rule" aria-hidden="true" />
        <p className="su-done__ttl">
          You are <em>on the list</em>.
        </p>
        <p className="su-done__body">
          On November 1 we will send you the livestream link and the prayers for
          the day. Until then you will hear from us only when there is something
          worth telling.
        </p>
      </div>
    );
  }

  const busy = status === "sending";

  return (
    <form className="su-form" onSubmit={handleSubmit} noValidate>
      <label className="field">
        <span className="field__lbl">Your name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          autoFocus={autoFocus}
        />
      </label>

      <label className="field">
        <span className="field__lbl">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          inputMode="email"
          required
        />
      </label>

      {/* Honeypot. Off-screen rather than display:none, which some bots detect. */}
      <div aria-hidden="true" className="su-hp">
        <label htmlFor={`website-${source}`}>Website</label>
        <input
          id={`website-${source}`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {/* Unticked by design. Consent must be given, not assumed. */}
      <label className="check check--consent">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span className="check__txt">{CONSENT_TEXT}</span>
      </label>

      <p className="su-controller">
        Your address is collected by {CONSENT_CONTROLLER}.{" "}
        <a href={CONSENT_NOTICE_PATH}>
          How we hold it, and how to come off the list
        </a>
        .
      </p>

      <p className="su-error" role="alert" aria-live="polite" hidden={!errorMsg}>
        {errorMsg}
      </p>

      <button type="submit" className="su-btn" disabled={busy}>
        {busy ? "Sending…" : "Keep me connected"}
      </button>

      <p className="su-micro">
        You can leave the list at any time — every email carries a link.
      </p>
    </form>
  );
}
