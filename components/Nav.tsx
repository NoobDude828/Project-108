"use client";

function openModal(role: string) {
  (window as any).openP108Modal?.(role);
}

export default function Nav() {
  return (
    <nav className="p108-nav">
      <div className="p108-nav__inner">
        <a className="p108-nav__brand" href="#top">
          <small>Project</small>108
        </a>
        <ul className="p108-nav__links">
          <li>
            <a href="#project">The Project</a>
          </li>
          <li>
            <a href="#chorten">The Chorten</a>
          </li>
          <li>
            <a href="#scale">Scale</a>
          </li>
          <li>
            <a href="#single-day">Single Day</a>
          </li>
          <li>
            <a href="#take-part">Take Part</a>
          </li>
        </ul>
        <a className="p108-nav__scroll-link" href="/108">
          View as scroll ↗
        </a>
        <button className="p108-nav__cta" onClick={() => openModal("patron")}>
          Take Part
        </button>
      </div>
    </nav>
  );
}
