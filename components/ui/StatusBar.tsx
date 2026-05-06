"use client";
import { useState } from "react";

export default function StatusBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  function scrollToInvitation(e: React.MouseEvent) {
    e.preventDefault();
    setMenuOpen(false);
    document
      .getElementById("scene-invitation")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <header className="status" role="banner">
        <span className="brand">Project 108 · Bhutan · 1 November 2026</span>

        {/* ── Desktop: split-button ── */}
        <div className="status-split" aria-label="Actions">
          <div className="status-split__rest">Join Now →</div>
          <div className="status-split__hover">
            <a
              href="/assets/Project_108.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="status-split__btn"
            >
              Download Brochure
            </a>
            <a
              href="#scene-invitation"
              className="status-split__btn"
              onClick={scrollToInvitation}
            >
              Take Part →
            </a>
          </div>
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
            href="/assets/Project_108.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="status-drawer__btn"
            role="menuitem"
            onClick={() => setMenuOpen(false)}
          >
            Download Brochure
          </a>
          <a
            href="#scene-invitation"
            className="status-drawer__btn"
            role="menuitem"
            onClick={scrollToInvitation}
          >
            Take Part →
          </a>
        </nav>
      </div>
    </>
  );
}
