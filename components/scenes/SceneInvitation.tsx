export default function SceneInvitation() {
  return (
    <section className="scene scene-invitation" id="scene-invitation">
      <div className="stage">
        <div className="stage__inner">
          <div className="inv-block">
            <h2>
              Two ways to <em>take part</em>.
            </h2>
            <p className="inv-lede">
              Project 108 is shaped by two forces: those who <em>offer</em> the
              chortens, and those who <em>build</em> them. Both are acts of
              merit. Both are needed.
            </p>
            <div className="inv-cards">
              <div className="inv-card">
                <p className="lbl">Patronage</p>
                <p className="ttl">
                  Offer a <em>chorten</em>.
                </p>
                <p className="amt">
                  <span className="from">From</span>
                  <strong>USD 200,000</strong>
                  <span className="per">
                    per chorten · flexible by conversation
                  </span>
                </p>
                <p className="body">
                  Each Jangchub Chorten may be offered by an individual, a
                  family, a community, or an institution. Patronage covers
                  construction, sacred materials, and consecration by Buddhist
                  masters.
                </p>
                <p className="body">
                  Each chorten may be dedicated in honour of a patron, a loved
                  one, or all sentient beings. A plaque provides permanent
                  recognition.
                </p>
                <button type="button" className="btn" data-open-form="patron">
                  Begin the conversation
                </button>
              </div>
              <div className="inv-card ghost">
                <p className="lbl">Volunteer</p>
                <p className="ttl">
                  Join the <em>build day</em>.
                </p>
                <p className="amt">
                  <span className="from">A workforce of</span>
                  <strong>40,000</strong>
                  <span className="per">
                    trained volunteers · across 108 sites
                  </span>
                </p>
                <p className="body">
                  Tens of thousands are already at work along the Mau Chhu,
                  clearing land and preparing sites. For the final act on 1
                  November 2026, when all 108 external structures will be raised
                  together, at least 40,000 volunteers will be needed.
                </p>
                <p className="body">
                  No specialist skills are required. What matters is
                  willingness, discipline, and shared purpose.
                </p>
                <button
                  type="button"
                  className="btn"
                  data-open-form="volunteer"
                >
                  Register to show your interest
                </button>
              </div>
            </div>
            <p className="inv-meta">
              Gelephu Mindfulness City Authority ·{" "}
              <a href="mailto:108@gmc.bt">108@gmc.bt</a> · +975 77117708
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
