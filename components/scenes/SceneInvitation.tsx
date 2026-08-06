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
                <p className="lbl">Join the build day</p>
                <p className="ttl">
                  Become a <em>Volunteer</em>.
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
                <a
                  href="https://sites.google.com/view/gmc-project108"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                >
                  Register to show your interest
                </a>
              </div>
              <div className="inv-card ghost">
                <p className="lbl">Stay connected</p>
                <p className="ttl">
                  Join us from wherever you are in the <em>World</em>.
                </p>
                <p className="subtitle">
                  Sign up to receive the live webcast link for November 1,
                  prayers and practices for the day, and ways to stay part of
                  what unfolds next.
                </p>
                <p className="body">
                  Every gathering, prayer, and milestone will be shared with
                  our global community through live broadcasts and thoughtful
                  updates, inviting you to witness each sacred moment wherever
                  you are.
                </p>
                <p className="body">
                  Whether you join from home or across the world, your
                  presence remains part of the collective offering. Together,
                  we celebrate, reflect, and dedicate merit beyond borders.
                </p>
                <a href="#" className="btn">
                  Sign up to join
                </a>
              </div>
              <div className="inv-card ghost">
                <p className="lbl">Patronage</p>
                <p className="ttl">
                  Support the <em>Project</em>.
                </p>
                <p className="subtitle">
                  Make an offering of any size toward the raising of the 108
                  chortens—every offering becomes part of the whole.
                </p>
                {/* <p className="amt">
                  <span className="from">From</span>
                  <strong>USD 200,000</strong>
                  <span className="per">
                    per chorten · flexible by conversation
                  </span>
                </p> */}
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
                <a href="/contribute" className="btn">
                  Make an offering
                </a>
              </div>
            </div>
            <p className="inv-meta">
              Gelephu Mindfulness City Authority ·{" "}
              <a href="mailto:108@gmc.bt">108@gmc.bt</a> · +975 17525480
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
