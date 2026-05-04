"use client";

export default function FloatTopButton() {
  return (
    <button
      id="float-top-btn"
      type="button"
      className="float-top-btn"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      ↑
    </button>
  );
}
