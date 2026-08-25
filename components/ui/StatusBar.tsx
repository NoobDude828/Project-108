"use client";
import { useState } from "react";

const BROCHURE_HREF = "/assets/Project_108.pdf";

declare function gtag(...args: unknown[]): void;

function trackEvent(name: string, params?: Record<string, string>) {
  if (typeof gtag === "function") gtag("event", name, params ?? {});
}

export default function StatusBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  function scrollToInvitation(e: React.MouseEvent) {
    e.preventDefault();
    setMenuOpen(false);
    trackEvent("nav_take_part");
    document
      .getElementById("scene-invitation")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <header className="status" role="banner">
        <span className="brand">Project 108 · Bhutan · 1 November 2026</span>

        {/* ── Desktop: two plain buttons ── */}
        <div className="status-split" aria-label="Actions">
          <a
            href={BROCHURE_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="status-split__btn status-split__btn--glow"
            onClick={() =>
              trackEvent("pdf_download", { location: "nav_desktop" })
            }
          >
            Download Brochure
            <svg
              className="status-split__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 15V3" />
              <path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" />
              <path d="m7 10 5 5 5-5" />
            </svg>
          </a>
          <a
            href="#scene-invitation"
            className="status-split__btn status-split__btn--primary"
            onClick={scrollToInvitation}
          >
            Take Part
            <span className="status-split__arrow" aria-hidden="true">
              →
            </span>
          </a>
        </div>

        {/* ── Mobile: hamburger toggle ── */}
        <button
          className={`status-burger${menuOpen ? " is-open" : ""}`}
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {/* ── Mobile: side drawer ── */}
      <div
        className={`status-drawer${menuOpen ? " is-open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <div
          className="status-drawer__backdrop"
          onClick={() => setMenuOpen(false)}
        />
        <nav className="status-drawer__panel" role="menu">
          <button
            className="status-drawer__close"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            ×
          </button>
          <a
            href={BROCHURE_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="status-drawer__btn"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false);
              trackEvent("pdf_download", { location: "nav_mobile" });
            }}
          >
            Download Brochure
            <svg
              className="status-drawer__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 15V3" />
              <path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" />
              <path d="m7 10 5 5 5-5" />
            </svg>
          </a>
          <a
            href="#scene-invitation"
            className="status-drawer__btn status-drawer__btn--primary"
            role="menuitem"
            onClick={scrollToInvitation}
          >
            Take Part
            <span className="status-drawer__arrow" aria-hidden="true">
              →
            </span>
          </a>
        </nav>
      </div>
    </>
  );
}
