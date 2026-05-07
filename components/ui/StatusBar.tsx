"use client";
import { useState, useEffect } from "react";

const BROCHURE_HREF = "/assets/Project_108.pdf";
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function useOnlineCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // Register this visitor
    fetch(`${BASE}/api/online`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join" }),
    })
      .then((r) => r.json())
      .then((d) => setCount(d.activeUsers));

    // Poll every 30s to stay in sync across tabs
    const id = setInterval(() => {
      fetch(`${BASE}/api/online`)
        .then((r) => r.json())
        .then((d) => setCount(d.activeUsers));
    }, 30_000);

    // Deregister on close
    const onLeave = () => {
      const blob = new Blob([JSON.stringify({ action: "leave" })], {
        type: "application/json",
      });
      navigator.sendBeacon(`${BASE}/api/online`, blob);
    };
    window.addEventListener("beforeunload", onLeave);

    return () => {
      clearInterval(id);
      window.removeEventListener("beforeunload", onLeave);
      fetch(`${BASE}/api/online`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "leave" }),
      });
    };
  }, []);

  return count;
}

export default function StatusBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const onlineCount = useOnlineCount();

  function scrollToInvitation(e: React.MouseEvent) {
    e.preventDefault();
    setMenuOpen(false);
    document
      .getElementById("scene-invitation")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      {/* ── Mobile floating live counter over first scene ── */}
      {onlineCount !== null && (
        <div
          className="status-online-float"
          aria-label={`${onlineCount} people viewing`}
        >
          <span className="status-online__dot" />
          {onlineCount} online
        </div>
      )}

      <header className="status" role="banner">
        <span className="brand">Project 108 · Bhutan · 1 November 2026</span>

        {/* ── Live visitors dot ── */}
        {onlineCount !== null && (
          <span
            className="status-online"
            aria-label={`${onlineCount} people viewing`}
          >
            <span className="status-online__dot" />
            {onlineCount} online
          </span>
        )}

        {/* ── Desktop: two plain buttons ── */}
        <div className="status-split" aria-label="Actions">
          <a
            href={BROCHURE_HREF}
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
