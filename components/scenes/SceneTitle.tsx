"use client";

declare function gtag(...args: unknown[]): void;

export default function SceneTitle() {
  function scrollToInvitation(e: React.MouseEvent) {
    e.preventDefault();
    if (typeof gtag === "function") gtag("event", "title_take_part");
    document
      .getElementById("scene-invitation")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="scene scene-title" id="scene-title" data-scene="title">
      <div className="stage">
        <div className="stage__inner">
          <div className="title-mist" aria-hidden="true"></div>
          <p className="title-eyebrow">Project</p>
          <h1 className="title-numeral">
            <span aria-hidden="true">108</span>
            <span className="visually-hidden">
              Project 108 — 108 Jangchub Chortens, Gelephu Mindfulness City,
              Bhutan. 108 chortens, each fifteen metres tall, completed together
              in a single day. 1 November 2026.
            </span>
          </h1>
          <p className="title-caption">
            108 Jangchub Chortens, each fifteen metres tall,
            <br />
            completed together in a single day.
          </p>
          <a
            href="#scene-invitation"
            className="title-cta"
            onClick={scrollToInvitation}
          >
            Take Part <span className="title-cta__arrow" aria-hidden="true">→</span>
          </a>
          <div className="title-meta">
            <span>Gelephu Mindfulness City</span>
            <span>Bhutan</span>
            <span>1 November 2026</span>
          </div>
        </div>
      </div>
    </section>
  );
}
