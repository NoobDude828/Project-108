import React from "react";

export default function SceneStack() {
  return (
    <section className="scene scene-stack" id="scene-stack">
      <div className="stage">
        <div className="stage__inner">
          <div className="sg-stage">
            <div className="sg-tally">
              <p className="kicker">If stacked vertically</p>
              <span className="sg-phase-h">138 m</span>
              <span className="sg-phase-label">Great Pyramid</span>
            </div>
            <div className="sg-row">
              <div className="sg-assets" aria-hidden="true">
                <div className="sg-asset" data-id="pyramid">
                  <div className="sg-ruler">
                    <span className="sg-ruler__line"></span>
                    <span className="sg-ruler__label">
                      <strong>~10 chortens</strong>
                      <span>138.5 m</span>
                    </span>
                  </div>
                  <img src="/assets/pyramid.png" alt="" />
                  <span className="sg-asset__name">
                    Great Pyramid
                    <br />
                    of Giza
                  </span>
                </div>
                <div className="sg-asset" data-id="eiffel">
                  <div className="sg-ruler">
                    <span className="sg-ruler__line"></span>
                    <span className="sg-ruler__label">
                      <strong>22 chortens</strong>
                      <span>330 m</span>
                    </span>
                  </div>
                  <img src="/assets/eiffel-tower.png" alt="" />
                  <span className="sg-asset__name">Eiffel Tower</span>
                </div>
                <div className="sg-asset" data-id="burj">
                  <div className="sg-ruler">
                    <span className="sg-ruler__line"></span>
                    <span className="sg-ruler__label">
                      <strong>~55 chortens</strong>
                      <span>828 m</span>
                    </span>
                  </div>
                  <img src="/assets/building.png" alt="" />
                  <span className="sg-asset__name">Burj Khalifa</span>
                </div>
                <div className="sg-asset" data-id="stack">
                  <div className="sg-ruler">
                    <span className="sg-ruler__line"></span>
                    <span className="sg-ruler__label">
                      <strong>108 chortens stacked</strong>
                      <span>1.62 km</span>
                    </span>
                  </div>
                  <img src="/assets/stack.png" alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
