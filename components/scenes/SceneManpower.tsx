import React from "react";

export default function SceneManpower() {
  return (
    <section className="scene scene-manpower" id="scene-manpower">
      <div className="stage">
        <div className="stage__inner">
          <div className="manpower-block">
            <div className="manpower-head">
              <p className="kicker">
                A workforce to rival history&apos;s greatest builds
              </p>
              <h2>
                Comparable to history&apos;s <em>great works</em>.<br />
                Different in <em>kind</em>.
              </h2>
            </div>
            <div
              className="manpower-row"
              style={{ "--w": "0.50" } as React.CSSProperties}
            >
              <span className="lbl">Great Pyramid of Giza</span>
              <span className="bar">
                <span className="bar__fill"></span>
              </span>
              <span className="num">
                <strong>~20,000</strong>concurrent workers
              </span>
              <span className="dur">
                <strong>~20 years</strong>seasonal civic duty
              </span>
            </div>
            <div
              className="manpower-row"
              style={{ "--w": "0.50" } as React.CSSProperties}
            >
              <span className="lbl">Taj Mahal</span>
              <span className="bar">
                <span className="bar__fill"></span>
              </span>
              <span className="num">
                <strong>~20,000</strong>concurrent artisans
              </span>
              <span className="dur">
                <strong>~22 years</strong>imperial commission
              </span>
            </div>
            <div
              className="manpower-row"
              style={{ "--w": "0.75" } as React.CSSProperties}
            >
              <span className="lbl">Great Wall of China</span>
              <span className="bar">
                <span className="bar__fill"></span>
              </span>
              <span className="num">
                <strong>~30,000</strong>peak concurrent
              </span>
              <span className="dur">
                <strong>Centuries</strong>state-directed labour
              </span>
            </div>
            <div
              className="manpower-row is-108"
              style={{ "--w": "1" } as React.CSSProperties}
            >
              <span className="lbl">Project 108</span>
              <span className="bar">
                <span className="bar__fill"></span>
              </span>
              <span className="num">
                <strong>40,000</strong>volunteers
              </span>
              <span className="dur">
                <strong>1 day</strong>voluntary
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
