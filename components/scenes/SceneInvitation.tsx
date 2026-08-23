export default function SceneInvitation() {
  return (
    <section className="scene scene-invitation" id="scene-invitation">
      <div className="stage">
        <div className="stage__inner">
          <div className="inv-block">
            <h2>
              Three ways to <em>take part</em>.
            </h2>
            <p className="inv-lede">
              Project 108 is shaped by three forces: those who <em>offer</em>{" "}
              the chortens, those who <em>build</em> them, and those who{" "}
              <em>witness</em> their rising.
            </p>
            <div className="inv-cards">
              <div className="inv-card">
                <p className="lbl">Join the build day</p>
                <p className="ttl">
                  Become a <em>Volunteer</em>.
                </p>
                <p className="amt">
                  <span className="from">An estimated</span>
                  <strong>40,000</strong>
                  <span className="per">volunteers · across 108 sites</span>
                </p>
                <p className="body">
                  Tens of thousands are already at work along the Mao Chhu,
                  clearing land and preparing sites ahead of 1 November 2026,
                  when all 108 structures will be raised together in a single
                  historic day.
                </p>
                {/* <p className="body">
                  No specialist skills are required. What matters is
                  willingness, discipline, and shared purpose.
                </p> */}

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
                  On 1 November 2026, the raising of the 108 chortens will be
                  shared with our global community by live broadcast, inviting
                  you to witness this sacred moment wherever you are. Your
                  prayers and participation remain part of this collective
                  offering. Together, we celebrate, reflect, and dedicate merit
                  beyond borders.
                </p>
                {/* <p className="body">
                  Whether you join from home or across the world, your presence
                  remains part of the collective offering. Together, we
                  celebrate, reflect, and dedicate merit beyond borders.
                </p> */}
                <button
                  type="button"
                  className="btn"
                  data-open-signup
                >
                  Sign up to join
                </button>
              </div>
              <div className="inv-card ghost">
                <p className="lbl">Offering</p>
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
                  Every offering, of any size, becomes part of the whole.
                  Offerings cover the construction of the chortens, their sacred
                  materials, and their consecration by Buddhist masters. An
                  offering may be made by an individual, a family, a community,
                  or an institution, and dedicated in honour of one's family, a
                  loved one, or all sentient beings
                </p>

                {/* <p className="body">
                  Each chorten may be dedicated in honour of a patron, a loved
                  one, or all sentient beings. A plaque provides permanent
                  recognition.
                </p> */}
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
