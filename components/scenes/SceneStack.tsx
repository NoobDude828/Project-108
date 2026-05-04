import React from "react";

export default function SceneStack() {
  return (
    <>
      <section className="scene scene-stack" id="scene-stack">
        <div className="stage">
          <div className="stage__inner">
            <div className="stack-stage">
              <div className="stack-sky" aria-hidden="true"></div>
              <div className="stack-stars" aria-hidden="true"></div>
              <div className="stack-intro">
                <p className="kicker">If stacked vertically</p>
                <h2>
                  The procession would <em>rise into the sky</em>.
                </h2>
                <p className="stack-sub">
                  108 chortens at fifteen metres each — 1.62 km of sacred
                  presence.
                </p>
              </div>
              <div className="stack-column" aria-hidden="true"></div>
              <div className="stack-ref" data-unit="9">
                <span className="tick"></span>
                <span className="ref-icon" aria-hidden="true">
                  <img
                    src="/assets/pyramid.png"
                    alt=""
                    width="160"
                    height="220"
                    style={{ objectFit: "contain" } as React.CSSProperties}
                  />
                </span>
                <span className="info">
                  <strong>Great Pyramid · 139 m</strong>9 chortens stacked
                </span>
              </div>
              <div className="stack-ref" data-unit="22">
                <span className="tick"></span>
                <span className="ref-icon" aria-hidden="true">
                  <img
                    src="/assets/eiffel-tower.png"
                    alt=""
                    width="160"
                    height="360"
                    style={
                      {
                        objectFit: "contain",
                        marginLeft: "100px",
                      } as React.CSSProperties
                    }
                  />
                </span>
                <span className="info">
                  <strong>Eiffel Tower · 330 m</strong>22 chortens · the
                  procession passes Paris
                </span>
              </div>
              <div className="stack-ref" data-unit="55">
                <span className="tick"></span>
                <span className="ref-icon" aria-hidden="true">
                  <img
                    src="/assets/building.png"
                    alt=""
                    width="160"
                    height="360"
                    style={{ objectFit: "contain" } as React.CSSProperties}
                  />
                </span>
                <span className="info">
                  <strong>Burj Khalifa · 828 m</strong>55 chortens · nearly
                  twice exceeded
                </span>
              </div>
              <div className="stack-ref" data-unit="108">
                <span className="tick"></span>
                <span className="ref-icon" aria-hidden="true">
                  <img
                    src="/assets/chorten.png"
                    alt=""
                    style={
                      {
                        objectFit: "contain",
                        marginBottom: "2.8rem",
                      } as React.CSSProperties
                    }
                  />
                </span>
                <span className="info">
                  <strong>Project 108 · 1.62 km</strong>108 chortens · complete
                </span>
              </div>
              <div className="stack-final">
                <p className="num">1.62 km</p>
                <p className="lbl">Combined height</p>
                <p className="desc">
                  Nearly twice the Burj Khalifa. Roughly five Eiffel Towers.
                  More than eleven Great Pyramids — in fifteen-metre offerings.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="stack-counter" aria-hidden="true">
          <p className="h">0 m</p>
          <p className="l">Stacked height</p>
        </div>
      </section>
    </>
  );
}
