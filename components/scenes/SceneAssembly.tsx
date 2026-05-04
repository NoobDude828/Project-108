export default function SceneAssembly() {
  return (
    <section className="scene scene-assembly" id="scene-assembly">
      <div className="stage">
        <div className="stage__inner">
          <div className="assembly-stage">
            <div className="assembly-img-stack" aria-hidden="true">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <img
                  key={n}
                  className="assy-part"
                  data-part={String(n)}
                  src={`/assets/${n}.png`}
                  alt=""
                />
              ))}
            </div>
          </div>
          <div className="assembly-labels">
            <p className="kicker">The architectural elevation</p>
            <h2>
              Seven elements. Each <em>holds meaning</em>.
            </h2>
            <p className="assy-sub">
              Read top to bottom — from earth to enlightenment.
            </p>
            <ol className="assy-list">
              <li className="assy-item" data-part="7">
                <p className="ttl">
                  <em>Nyim-da</em>
                  <span className="trans">Moon, Sun &amp; Flame</span>
                </p>
                <p className="desc">Compassion, wisdom, and their union.</p>
              </li>
              <li className="assy-item" data-part="6">
                <p className="ttl">
                  <em>Dhug</em>
                  <span className="trans">The Parasol</span>
                </p>
                <p className="desc">
                  Spiritual protection from all negative influences.
                </p>
              </li>
              <li className="assy-item" data-part="5">
                <p className="ttl">
                  <em>Khorlo</em>
                  <span className="trans">Thirteen Rings</span>
                </p>
                <p className="desc">
                  The thirteen stages a practitioner passes through to reach
                  Buddhahood.
                </p>
              </li>
              <li className="assy-item" data-part="4">
                <p className="ttl">
                  <em>Lhakhang</em>
                  <span className="trans">The Niche</span>
                </p>
                <p className="desc">
                  Holds the image of a Buddha — the presence of the enlightened
                  mind.
                </p>
              </li>
              <li className="assy-item" data-part="3">
                <p className="ttl">
                  <em>Bum-pa</em>
                  <span className="trans">The Dome</span>
                </p>
                <p className="desc">
                  Vessel for sacred relics. Symbolises the pure body of the
                  Buddha.
                </p>
              </li>
              <li className="assy-item" data-part="2">
                <p className="ttl">
                  <em>Bangrim</em>
                  <span className="trans">Stepped Base</span>
                </p>
                <p className="desc">
                  The Four Noble Truths — the progressive path to liberation.
                </p>
              </li>
              <li className="assy-item" data-part="1">
                <p className="ttl">
                  <em>Thri</em>
                  <span className="trans">The Pedestal</span>
                </p>
                <p className="desc">
                  The Earth element. Solid foundation for all existence.
                </p>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
