"use client";

export default function StatusBar() {
  function scrollToInvitation(e: React.MouseEvent) {
    e.preventDefault();
    document
      .getElementById("scene-invitation")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <header className="status" role="banner">
      <span className="brand">Project 108 · Bhutan · 1 November 2026</span>
      <a href="#scene-invitation" className="skip" onClick={scrollToInvitation}>
        Take Part →
      </a>
    </header>
  );
}
