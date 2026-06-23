export default function SceneCompletion() {
  return (
    <section className="scene scene-completion" id="scene-completion">
      <div className="stage">
        <div className="stage__inner">
          <div className="compl-stage">
            <div className="compl-bg" aria-hidden="true"></div>
            <svg
              className="compl-mountains"
              viewBox="0 0 1600 400"
              preserveAspectRatio="xMidYMax slice"
              aria-hidden="true"
            >
              <path
                d="M0 320 L120 240 L240 280 L360 200 L480 250 L600 180 L760 230 L900 170 L1080 220 L1240 190 L1380 240 L1500 200 L1600 230 L1600 400 L0 400 Z"
                fill="rgba(74,26,46,0.55)"
              />
              <path
                d="M0 350 L160 290 L320 330 L480 260 L640 320 L800 270 L960 320 L1140 280 L1320 320 L1480 290 L1600 320 L1600 400 L0 400 Z"
                fill="rgba(26,7,16,0.7)"
              />
            </svg>
            <div className="compl-light" aria-hidden="true"></div>
            <div className="compl-river" aria-hidden="true"></div>
            <div className="compl-track" aria-hidden="true"></div>
            <div className="compl-copy">
              <h2>
                <span className="sc-num">108</span> chortens. <em>One day</em>.<br />
                One offering.
              </h2>
              <p className="meta">
                1 November 2026 · Gelephu Mindfulness City · Bhutan
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
