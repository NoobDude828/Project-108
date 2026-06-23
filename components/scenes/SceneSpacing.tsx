export default function SceneSpacing() {
  return (
    <section className="scene scene-spacing" id="scene-spacing">
      <div className="stage">
        <div className="stage__inner">
          <div className="spacing-stage">
            <div className="spacing-copy">
              <p className="kicker">The formation</p>
              <h2>
                <em><span className="sc-num">108</span></em> chortens.
                <br />
                <em><span className="sc-num">108</span></em> metres apart.
              </h2>
              <p className="spacing-sub">
                Centre to centre, in a single file along the Mau Chhu — the
                river that runs through Gelephu. Not a cluster of monuments. A{" "}
                <em>procession</em>.
              </p>
            </div>
            <div className="spacing-track" aria-hidden="true">
              <div className="spacing-row"></div>
              <div className="spacing-measure">
                <span className="lbl">
                  108<em> m</em>
                </span>
                <span className="line" aria-hidden="true"></span>
              </div>
              <div className="spacing-total">
                <span className="lbl">
                  ~11.7<em> km</em>
                </span>
                <span className="line" aria-hidden="true"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
