export default function SceneTime() {
  return (
    <section className="scene scene-time" id="scene-time">
      <div className="stage">
        <div className="stage__inner">
          <div className="time-block">
            <div className="time-head">
              <p className="kicker">Why a single day</p>
              <h2>
                Foundations <em>prepared</em> over time.
                <br />
                Structures <em>completed</em> together.
              </h2>
            </div>
            <div className="time-line">
              <div className="time-axis" aria-hidden="true"></div>
              <div className="time-fill" aria-hidden="true"></div>
              <div
                className="time-marker"
                data-at="0.05"
                style={{ left: "5%" }}
              >
                <span className="dot"></span>
                <span className="lbl">
                  <strong>21 Feb 2026</strong>His Majesty&apos;s announcement
                </span>
              </div>
              <div
                className="time-marker"
                data-at="0.22"
                style={{ left: "22%" }}
              >
                <span className="dot"></span>
                <span className="lbl">
                  <strong>Land</strong>Cleared by volunteer hands
                </span>
              </div>
              <div
                className="time-marker"
                data-at="0.40"
                style={{ left: "40%" }}
              >
                <span className="dot"></span>
                <span className="lbl">
                  <strong>Foundations</strong>Earthworks at 108 sites
                </span>
              </div>
              <div
                className="time-marker"
                data-at="0.58"
                style={{ left: "58%" }}
              >
                <span className="dot"></span>
                <span className="lbl">
                  <strong>Materials</strong>Stone, timber, gilding
                </span>
              </div>
              <div
                className="time-marker"
                data-at="0.74"
                style={{ left: "74%" }}
              >
                <span className="dot"></span>
                <span className="lbl">
                  <strong>Training</strong>Volunteer cohorts
                </span>
              </div>
              <div
                className="time-marker final"
                data-at="0.94"
                style={{ left: "94%" }}
              >
                <span className="dot"></span>
                <span className="lbl">
                  <strong>1 Nov 2026</strong>Completion in a single day
                </span>
              </div>
            </div>
            <p className="time-foot">
              In Vajrayana Buddhism, <em>aligned intention and action</em> can
              transform a single moment. The act itself is the offering.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
