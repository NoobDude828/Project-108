export default function SceneTitle() {
  return (
    <section className="scene scene-title" id="scene-title" data-scene="title">
      <div className="stage">
        <div className="stage__inner">
          <div className="title-mist" aria-hidden="true"></div>
          <p className="title-eyebrow">Project</p>
          <h1 className="title-numeral" aria-label="One hundred and eight">
            108
          </h1>
          <p className="title-caption">
            108 Jangchub Chortens, each fifteen metres tall,
            <br />
            completed together in a single day.
          </p>
          <div className="title-meta">
            <span>Gelephu Mindfulness City</span>
            <span>Bhutan</span>
            <span>1 November 2026</span>
          </div>
        </div>
      </div>
    </section>
  );
}
