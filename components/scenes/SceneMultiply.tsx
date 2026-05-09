import SceneMultiplyController from "./SceneMultiply.original";

export default function SceneMultiply() {
  return (
    <section className="scene scene-multiply" id="scene-multiply">
      <div className="stage">
        <div className="stage__inner">
          <div className="multiply-stage">
            {/* Intro: Buddha shrinks → chorten assembles around it */}
            <div className="multiply-intro" aria-hidden="true">
              <div className="mi-stack">
                <div className="mi-part mi-p1">
                  <img src="/assets/1.png" alt="" draggable="false" />
                </div>
                <div className="mi-part mi-p2">
                  <img src="/assets/2.png" alt="" draggable="false" />
                </div>
                <div className="mi-part mi-p3">
                  <img src="/assets/3.png" alt="" draggable="false" />
                </div>
                <div className="mi-buddha">
                  <img src="/assets/Buddha.png" alt="" draggable="false" />
                </div>
                <div className="mi-part mi-p4">
                  <img src="/assets/4.png" alt="" draggable="false" />
                </div>
                <div className="mi-part mi-p5">
                  <img src="/assets/5.png" alt="" draggable="false" />
                </div>
                <div className="mi-part mi-p6">
                  <img src="/assets/6.png" alt="" draggable="false" />
                </div>
                <div className="mi-part mi-p7">
                  <img src="/assets/7.png" alt="" draggable="false" />
                </div>
              </div>
            </div>
            {/* Grid: one chorten → 108 */}
            <div className="multiply-grid" aria-hidden="true"></div>
          </div>
          <div className="multiply-kicker">
            <p className="kicker">From one to one hundred and eight</p>
          </div>
          <div className="multiply-copy">
            <p className="num"></p>
            <p className="lbl">One sacred form, repeated</p>
          </div>
        </div>
      </div>
      <SceneMultiplyController />
    </section>
  );
}
