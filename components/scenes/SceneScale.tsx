export default function SceneScale() {
  return (
    <section className="scene scene-scale" id="scene-scale">
      <div className="stage">
        <div className="stage__inner">
          <div className="scale-scrolly">
            <div className="scale-copy">
              <p className="kicker">A comparative scale</p>
              <p className="num">
                <span className="big">15</span>
                <span className="unit">m</span>
              </p>
              <h2>
                How tall is <em>fifteen metres</em>?
              </h2>
              <p className="sub">
                Eight times a person. Half-again a three-storey building.{" "}
                <em>One</em> Jangchub Chorten.
              </p>
            </div>
            <div className="scale-art" aria-hidden="true">
              <div className="scale-ground"></div>
              <div className="scale-yaxis" aria-hidden="true"></div>
              <div className="scale-fig fig-person" data-fig="1">
                <img src="/assets/people2.png" alt="" />
                <span className="lbl">
                  <strong>1.75 m</strong>Human
                </span>
              </div>
              <div className="scale-fig fig-building" data-fig="2">
                <img src="/assets/building2.png" alt="" />
                <span className="lbl">
                  <strong>~10 m</strong>Three storeys
                </span>
              </div>
              <div className="scale-fig fig-chorten" data-fig="3">
                <img src="/assets/chorten2.png" alt="" />
                <span className="lbl">
                  <strong>15 m</strong>One Jangchub Chorten
                </span>
              </div>
              <div className="scale-ticks" aria-hidden="true">
                <span className="tick" style={{ bottom: "11.7%" }}>
                  <em>1.75 m</em>
                </span>
                <span className="tick" style={{ bottom: "67.5%" }}>
                  <em>10 m</em>
                </span>
                <span className="tick" style={{ bottom: "88%" }}>
                  <em>15 m</em>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
