import React from "react";

export default function SceneStack() {
  return (
    <>
      <section className="scene scene-stack" id="scene-stack">
        <div className="stage">
          <div className="stage__inner">
            <div className="sg-stage">
              <div className="sg-tally">
                <p className="kicker">If stacked vertically</p>
                <span className="sg-m">15 m</span>
                <span className="sg-n-row">
                  <span className="sg-n">1</span>
                  <span className="sg-denom"> chortens stacked</span>
                </span>
              </div>
              <div className="sg-row">
                <div className="sg-landmarks" aria-hidden="true">
                  <div className="sg-landmark" data-id="pyramid">
                    <div className="sg-ruler">
                      <span className="sg-ruler__line"></span>
                      <span className="sg-ruler__label">
                        <strong>~10 chortens</strong>
                        <span>138.5 m</span>
                      </span>
                    </div>
                    <img src="/assets/pyramid.png" alt="" />
                  </div>
                  <div className="sg-landmark" data-id="eiffel">
                    <div className="sg-ruler">
                      <span className="sg-ruler__line"></span>
                      <span className="sg-ruler__label">
                        <strong>22 chortens</strong>
                        <span>330 m</span>
                      </span>
                    </div>
                    <img src="/assets/eiffel-tower.png" alt="" />
                  </div>
                  <div className="sg-landmark" data-id="burj">
                    <div className="sg-ruler">
                      <span className="sg-ruler__line"></span>
                      <span className="sg-ruler__label">
                        <strong>55 chortens</strong>
                        <span>828 m</span>
                      </span>
                    </div>
                    <img src="/assets/building.png" alt="" />
                  </div>
                </div>
                <div className="sg-col-wrap" aria-hidden="true">
                  <div className="sg-col-ruler">
                    <span className="sg-col-ruler__line"></span>
                    <span className="sg-col-ruler__label">
                      <strong>108 chortens stacked</strong>
                      <span>1.62 km</span>
                    </span>
                  </div>
                  <div className="sg-col"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
