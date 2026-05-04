"use client";

import { useState, useEffect } from "react";

export default function FormModal() {
  const [nationality, setNationality] = useState<
    "bhutanese" | "non-bhutanese" | null
  >(null);

  // Populate country selects as soon as Non-Bhutanese fields mount
  useEffect(() => {
    if (nationality !== "non-bhutanese") return;
    if (typeof window === "undefined") return;
    // Give React one tick to render the selects into the DOM
    const id = setTimeout(() => {
      if (typeof (window as any).__p108PopulateCountries === "function") {
        (window as any).__p108PopulateCountries();
      }
    }, 0);
    return () => clearTimeout(id);
  }, [nationality]);

  return (
    <div
      className="form-modal"
      id="form-modal"
      aria-hidden="true"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-title"
    >
      <div className="form-modal__backdrop" data-close-form="true"></div>
      <div className="form-modal__sheet">
        <span
          className="form-modal__close"
          role="button"
          aria-label="Close"
          tabIndex={0}
          data-close-form="true"
        >
          ×
        </span>
        <p className="form-modal__lbl">Project 108 · Bhutan</p>
        <h3 className="form-modal__ttl" id="form-title">
          Take <em>part</em>.
        </h3>
        <p className="form-modal__lede">
          Leave your details and we will be in touch with the next steps.
        </p>
        <form className="form-modal__form" id="signup-form" noValidate>
          {/* Step 1 — Nationality */}
          <fieldset className="form-row form-row--nationality">
            <legend className="form-row__legend">I am</legend>
            <label
              className={`choice${nationality === "bhutanese" ? " is-selected" : ""}`}
            >
              <input
                type="radio"
                name="nationality"
                value="bhutanese"
                checked={nationality === "bhutanese"}
                onChange={() => setNationality("bhutanese")}
                required
              />
              <span className="choice__box">
                <span className="choice__ttl">Bhutanese</span>
                <span className="choice__sub">Citizen of Bhutan</span>
              </span>
            </label>
            <label
              className={`choice${nationality === "non-bhutanese" ? " is-selected" : ""}`}
            >
              <input
                type="radio"
                name="nationality"
                value="non-bhutanese"
                checked={nationality === "non-bhutanese"}
                onChange={() => setNationality("non-bhutanese")}
                required
              />
              <span className="choice__box">
                <span className="choice__ttl">Non-Bhutanese</span>
                <span className="choice__sub">International supporter</span>
              </span>
            </label>
          </fieldset>

          {/* Step 2 — Shown once nationality is chosen */}
          {nationality && (
            <>
              {/* Patron / Volunteer — present in both flows */}
              {/* <fieldset className="form-row form-row--choice">
                <legend className="visually-hidden">I would like to</legend>
                <label className="choice">
                  <input type="radio" name="role" value="patron" required />
                  <span className="choice__box">
                    <span className="choice__ttl">Patron</span>
                    <span className="choice__sub">Offer a chorten</span>
                  </span>
                </label>
                <label className="choice">
                  <input type="radio" name="role" value="volunteer" required />
                  <span className="choice__box">
                    <span className="choice__ttl">Volunteer</span>
                    <span className="choice__sub">Join the build day</span>
                  </span>
                </label>
              </fieldset> */}

              {nationality === "bhutanese" ? (
                /* Bhutanese flow — CID only */
                <label className="field">
                  <span className="field__lbl">
                    Citizenship Identity Card number
                  </span>
                  <input
                    type="text"
                    name="cid"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="11-digit CID number"
                    required
                  />
                </label>
              ) : (
                /* Non-Bhutanese flow — full form */
                <>
                  <div className="form-row form-row--double">
                    <label className="field">
                      <span className="field__lbl">Full name</span>
                      <input
                        type="text"
                        name="name"
                        autoComplete="name"
                        required
                      />
                    </label>
                    <label className="field">
                      <span className="field__lbl">Email</span>
                      <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        required
                      />
                    </label>
                  </div>
                  <div className="form-row form-row--phone">
                    <label className="field field--cc">
                      <span className="field__lbl">Country code</span>
                      <select name="country_code" required></select>
                    </label>
                    <label className="field">
                      <span className="field__lbl">Phone number</span>
                      <input
                        type="tel"
                        name="phone"
                        autoComplete="tel-national"
                        inputMode="numeric"
                        required
                      />
                    </label>
                  </div>
                  <label className="field">
                    <span className="field__lbl">Country of residence</span>
                    <select name="country" required></select>
                  </label>
                  <label className="field">
                    <span className="field__lbl">
                      Message <span className="field__opt">(optional)</span>
                    </span>
                    <textarea
                      name="message"
                      rows={4}
                      placeholder="Tell us anything that will help us welcome you."
                    ></textarea>
                  </label>
                </>
              )}
            </>
          )}

          {nationality && (
            <>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn--ghost"
                  data-close-form="true"
                >
                  Cancel
                </button>
                <button type="submit" className="btn">
                  Submit
                </button>
              </div>
              <p className="form-modal__small">
                By submitting, you consent to be contacted by the Gelephu
                Mindfulness City Authority.
              </p>
            </>
          )}
        </form>
        <div className="form-modal__thanks" hidden>
          <p className="lbl">Thank you</p>
          <h4>Your message is on its way.</h4>
          <p>We will write to you shortly with next steps.</p>
          <button type="button" className="btn" data-close-form="true">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
