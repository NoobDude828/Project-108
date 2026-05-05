import SceneMultiplyController from "./SceneMultiply.original";

export default function SceneMultiply() {
  return (
    <section className="scene scene-multiply" id="scene-multiply">
      <div className="stage">
        <div className="stage__inner">
          <div className="multiply-stage">
            <div className="multiply-grid" aria-hidden="true"></div>
          </div>
          <div className="multiply-kicker">
            <p className="kicker">From one to one hundred and eight</p>
          </div>
          <div className="multiply-copy">
            <p className="num">1</p>
            <p className="lbl">One sacred form, repeated</p>
          </div>
        </div>
      </div>
      {/* All multiply-scene behavior lives in this client controller — keeps
          /public/scroll/scrollytelling.js merge-safe for the rest of the team. */}
      <SceneMultiplyController />
    </section>
  );
}
