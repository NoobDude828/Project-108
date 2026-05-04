export default function SceneWhat() {
  return (
    <section className="scene scene-what" id="scene-what">
      <div className="stage">
        <div className="stage__inner">
          <div className="what-kicker">
            <p className="kicker">What is being built</p>
            <p className="h">
              A physical form of <em>prayer</em>,<br />
              made permanent in stone and earth.
            </p>
          </div>
          <div className="what-stage">
            <div className="what-chorten" aria-hidden="true">
              <img src="/assets/chorten-front.png" alt="" />
            </div>
            <div className="what-truths">
              <p className="truth t1">
                A gift that <em>radiates merit</em>
                <br />
                to all who pass it by.
              </p>
              <p className="truth t2">
                A sealed structure, filled with{" "}
                <em>
                  prayers,
                  <br />
                  blessings, and sacred texts
                </em>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
