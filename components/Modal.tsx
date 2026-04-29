"use client";

import { useState, useEffect, useCallback } from "react";

type Role = "patron" | "volunteer";

interface ModalState {
  open: boolean;
  role: Role;
  sent: boolean;
}

export default function Modal() {
  const [state, setState] = useState<ModalState>({
    open: false,
    role: "patron",
    sent: false,
  });

  const open = useCallback((role: Role = "patron") => {
    setState({ open: true, role, sent: false });
  }, []);

  const close = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  useEffect(() => {
    (window as any).openP108Modal = open;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!state.open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setState((s) => ({ ...s, sent: true }));
  };

  return (
    <div className="p108-modal" onClick={close}>
      <div className="p108-modal__panel" onClick={(e) => e.stopPropagation()}>
        <button
          className="p108-modal__close"
          onClick={close}
          aria-label="Close"
        >
          ×
        </button>
        <div className="p108-modal__eyebrow">An Invitation to Participate</div>
        <h3 className="p108-modal__title">
          {state.sent ? "Thank you" : "Begin the Conversation"}
        </h3>
        {state.sent ? (
          <>
            <div className="p108-modal__check">✓</div>
            <p className="p108-modal__intro" style={{ textAlign: "center" }}>
              Your message has reached us. We'll be in touch soon.
              <br />
              Preparations are already underway.
            </p>
          </>
        ) : (
          <>
            <p className="p108-modal__intro">
              Whether you wish to become a patron of a chorten or join the
              build, please share a few details and we'll be in touch.
            </p>
            <form onSubmit={submit}>
              <div className="p108-field p108-field--radio">
                <label>
                  I would like to <span className="p108-req">*</span>
                </label>
                <div className="p108-radio-group">
                  <label className={state.role === "patron" ? "on" : ""}>
                    <input
                      type="radio"
                      name="role"
                      checked={state.role === "patron"}
                      onChange={() =>
                        setState((s) => ({ ...s, role: "patron" }))
                      }
                    />
                    <span>Become a Patron</span>
                  </label>
                  <label className={state.role === "volunteer" ? "on" : ""}>
                    <input
                      type="radio"
                      name="role"
                      checked={state.role === "volunteer"}
                      onChange={() =>
                        setState((s) => ({ ...s, role: "volunteer" }))
                      }
                    />
                    <span>Volunteer</span>
                  </label>
                </div>
              </div>
              <div className="p108-field">
                <label>
                  Name <span className="p108-req">*</span>
                </label>
                <input type="text" required defaultValue="" />
              </div>
              <div className="p108-field">
                <label>
                  Email <span className="p108-req">*</span>
                </label>
                <input type="email" required defaultValue="" />
              </div>
              <div className="p108-field">
                <label>
                  Country <span className="p108-req">*</span>
                </label>
                <input type="text" required defaultValue="" />
              </div>
              <div className="p108-field">
                <label>Message</label>
                <textarea placeholder="A few words about your interest, dedication, or any questions you have." />
              </div>
              <button className="p108-modal__submit" type="submit">
                Send
              </button>
              <p className="p108-modal__note">
                We'll get back to you within a few days. Or email us directly:{" "}
                <a href="mailto:108@gmc.bt">108@gmc.bt</a>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
