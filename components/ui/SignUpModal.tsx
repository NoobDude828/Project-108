"use client";

import { useEffect, useRef, useState } from "react";
import SignUpFields from "./SignUpFields";

/**
 * "Stay connected" modal, opened from the live-broadcast card.
 *
 * Before this, that card's button was `<a href="#">` — which scrolled the reader back
 * to the top of the page and did nothing else, on the one card whose entire purpose
 * was collecting an address.
 *
 * Follows the same conventions as FormModal / OrgFormModal: opened by a CustomEvent
 * that public/scroll/form.js dispatches, closes on Escape or backdrop click, locks
 * body scroll while open, and restores focus to whatever opened it. It also listens
 * for clicks on [data-open-signup] directly, so the button works even if form.js has
 * not finished loading — this is the one card that must not fail.
 *
 * The form itself is SignUpFields, shared with /sign-up so the modal and the page the
 * acknowledgement email links to cannot drift apart.
 */

export default function SignUpModal() {
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleOpen = () => {
      openerRef.current = document.activeElement as HTMLElement | null;
      setOpen(true);
    };
    window.addEventListener("p108:open-signup", handleOpen);

    // Belt and braces: bind the trigger here too, so the button is live from the
    // moment React hydrates rather than waiting on form.js.
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest(
        "[data-open-signup]",
      );
      if (!target) return;
      e.preventDefault();
      handleOpen();
    };
    document.addEventListener("click", onClick);

    // Deep link, so the card's URL can be shared and land on the open form.
    // Dispatched rather than setting state here, so opening has exactly one path
    // through handleOpen — which also records what to return focus to.
    if (new URLSearchParams(window.location.search).get("form") === "signup") {
      window.dispatchEvent(new CustomEvent("p108:open-signup"));
    }

    return () => {
      window.removeEventListener("p108:open-signup", handleOpen);
      document.removeEventListener("click", onClick);
    };
  }, []);

  // Escape closes, and body scroll is locked while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Focus into the sheet on open; return it to the opener on close, so a keyboard
  // user is not dropped at the top of a very long scroll page.
  useEffect(() => {
    if (open) {
      sheetRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    } else {
      openerRef.current?.focus?.();
    }
  }, [open]);

  return (
    <div
      className={`form-modal signup-modal${open ? " is-open" : ""}`}
      aria-hidden={!open}
      role="dialog"
      aria-modal="true"
      aria-label="Stay connected with Project 108"
    >
      <div
        className="form-modal__backdrop"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div className="form-modal__sheet" ref={sheetRef}>
        <button
          type="button"
          className="form-modal__close"
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          ×
        </button>
        <p className="form-modal__lbl">Project 108 · Bhutan</p>
        <h2 className="form-modal__ttl">
          Be with us on <em>November&nbsp;1</em>.
        </h2>
        <p className="form-modal__lede">
          All 108 Jangchub Chortens will be raised together in a single day.
          Leave your name and email and we will send you the livestream link.
        </p>
        {open ? <SignUpFields source="card" autoFocus /> : null}
      </div>
    </div>
  );
}
