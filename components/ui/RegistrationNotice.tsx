"use client";
import { useEffect } from "react";

const REGISTRATION_HREF = "https://sites.google.com/view/gmc-project108";

// One group must be wider than any real viewport, or the seamless-loop trick
// (translate a duplicated track by -50%) leaves a visible gap once a single
// sentence has scrolled past. Repeating the sentence guarantees that.
const REPEATS = 10;

declare function gtag(...args: unknown[]): void;

function trackEvent(name: string, params?: Record<string, string>) {
  if (typeof gtag === "function") gtag("event", name, params ?? {});
}

function Message({ hidden = false }: { hidden?: boolean }) {
  return (
    <span className="reg-marquee__msg" aria-hidden={hidden || undefined}>
      Already registered volunteers are requested to{" "}
      <a
        href={REGISTRATION_HREF}
        target="_blank"
        rel="noopener noreferrer"
        className="reg-marquee__link"
        tabIndex={hidden ? -1 : 0}
        onClick={() => trackEvent("reg_notice_link_click")}
      >
        <em>update their registration here</em>
      </a>{" "}
      ahead of 1st November 2026
      <img
        src="/assets/chorten.png"
        alt=""
        aria-hidden="true"
        className="reg-marquee__glyph"
      />
    </span>
  );
}

export default function RegistrationNotice() {
  // Shifts the status bar down to make room — no dismiss, so this class is
  // permanent for as long as this component is mounted (i.e. always).
  useEffect(() => {
    document.body.classList.add("has-reg-notice");
    return () => {
      document.body.classList.remove("has-reg-notice");
    };
  }, []);

  return (
    <div
      className="reg-marquee"
      role="region"
      aria-label="Volunteer registration update notice"
    >
      <div className="reg-marquee__track">
        <div className="reg-marquee__group">
          {Array.from({ length: REPEATS }, (_, i) => (
            <Message key={`a${i}`} hidden={i > 0} />
          ))}
        </div>
        <div className="reg-marquee__group" aria-hidden="true">
          {Array.from({ length: REPEATS }, (_, i) => (
            <Message key={`b${i}`} hidden />
          ))}
        </div>
      </div>
    </div>
  );
}
