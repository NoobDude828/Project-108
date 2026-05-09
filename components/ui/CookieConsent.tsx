"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "p108_cookie_consent";

declare function gtag(...args: unknown[]): void;

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setVisible(true);
    } else if (stored === "granted") {
      enableAnalytics();
    }
    // "denied" → GA4 stays blocked (default from layout.tsx consent_mode)
  }, []);

  function enableAnalytics() {
    if (typeof gtag === "function") {
      gtag("consent", "update", {
        analytics_storage: "granted",
      });
    }
  }

  function accept() {
    localStorage.setItem(STORAGE_KEY, "granted");
    enableAnalytics();
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "denied");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie consent">
      <p className="cookie-banner__text">
        This site uses Google Analytics to understand how visitors engage with
        Project 108. No personal data is sold or shared.{" "}
        {/* <Link href="/privacy" className="cookie-banner__link">
          Privacy notice
        </Link> */}
      </p>
      <div className="cookie-banner__actions">
        <button
          type="button"
          className="cookie-banner__btn cookie-banner__btn--accept"
          onClick={accept}
        >
          Accept
        </button>
        <button
          type="button"
          className="cookie-banner__btn cookie-banner__btn--decline"
          onClick={decline}
        >
          Decline
        </button>
      </div>
    </div>
  );
}
