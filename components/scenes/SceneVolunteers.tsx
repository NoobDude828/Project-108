export default function SceneVolunteers() {
  return (
    <section className="scene scene-volunteers" id="scene-volunteers">
      <div className="stage">
        <div className="stage__inner">
          <div className="vol-stage">
            <canvas className="vol-canvas" aria-hidden="true"></canvas>
            <div className="vol-copy">
              <p className="kicker">Zhābto · voluntary communal work</p>
              <h2>
                <span className="sc-num">108</span> sites <em>activate</em>.<br />
                Forty thousand hands <em>arrive</em>.
              </h2>
              <p>
                The Bhutanese tradition of <em>zhābto</em> — work offered freely
                as spiritual practice — has drawn schoolchildren and retirees,
                monks emerging from retreat, farmers, doctors, and a planeload
                of diaspora from Australia. The corridor becomes a single
                coordinated body.
              </p>
            </div>
            <div className="vol-counter">
              <p className="num">0</p>
              <p className="denom">
                <strong>108</strong> sites · across the corridor
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
