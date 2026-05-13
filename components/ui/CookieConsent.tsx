"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "p108_cookie_consent";

declare function gtag(...args: unknown[]): void;

function disableAnalytics() {
  if (typeof gtag === "function") {
    gtag("consent", "update", { analytics_storage: "denied" });
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // First visit — show banner; analytics already running (granted by default)
      setVisible(true);
    } else if (stored === "denied") {
      // Returning visitor who previously opted out — disable immediately
      disableAnalytics();
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "granted");
    setVisible(false);
  }

  function optOut() {
    localStorage.setItem(STORAGE_KEY, "denied");
    disableAnalytics();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie notice">
      <p className="cookie-banner__text">
        We use analytics to understand how visitors experience this site — page
        views, scroll depth, and button clicks — so we can improve it. No
        personal data is collected or shared.{" "}
        {/* <Link href="/privacy" className="cookie-banner__link">
          Privacy notice
        </Link> */}
      </p>
      <div className="cookie-banner__actions">
        <button
          type="button"
          className="cookie-banner__btn cookie-banner__btn--accept"
          onClick={dismiss}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
