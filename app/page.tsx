"use client";

import Script from "next/script";
import Link from "next/link";
import "./scroll.css";

export default function ScrollPage() {
  return (
    <>
      {/* Top status bar */}
      <header className="status" role="banner">
        <span className="brand">Project 108 · Bhutan · 1 November 2026</span>
        <button type="button" className="skip" data-open-form="patron">
          Take Part →
        </button>
      </header>

      {/* Bottom progress rail */}
      <div className="rail" aria-hidden="true">
        <div className="rail__fill"></div>
      </div>

      {/* SCENE 01 — TITLE */}
      <section
        className="scene scene-title"
        id="scene-title"
        data-scene="title"
      >
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

      {/* SCENE 02 — WHAT IS A CHORTEN? */}
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

      {/* SCENE 03 — CHORTEN ASSEMBLY */}
      <section className="scene scene-assembly" id="scene-assembly">
        <div className="stage">
          <div className="stage__inner">
            <div className="assembly-stage">
              <div className="assembly-img-stack" aria-hidden="true">
                <img
                  className="assy-part"
                  data-part="1"
                  src="/assets/1.png"
                  alt=""
                />
                <img
                  className="assy-part"
                  data-part="2"
                  src="/assets/2.png"
                  alt=""
                />
                <img
                  className="assy-part"
                  data-part="3"
                  src="/assets/3.png"
                  alt=""
                />
                <img
                  className="assy-part"
                  data-part="4"
                  src="/assets/4.png"
                  alt=""
                />
                <img
                  className="assy-part"
                  data-part="5"
                  src="/assets/5.png"
                  alt=""
                />
                <img
                  className="assy-part"
                  data-part="6"
                  src="/assets/6.png"
                  alt=""
                />
                <img
                  className="assy-part"
                  data-part="7"
                  src="/assets/7.png"
                  alt=""
                />
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
                    Holds the image of a Buddha — the presence of the
                    enlightened mind.
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

      {/* SCENE 04 — HOW TALL IS 15 METRES? */}
      <section className="scene scene-scale" id="scene-scale">
        <div className="stage">
          <div className="stage__inner">
            <div className="scale-scrolly">
              <div className="scale-copy">
                <p className="kicker">A comparative scale</p>
                <p className="num">
                  <span className="big">15</span>
                  <span className="unit">m</span>
                </p>
                <h2>
                  How tall is <em>fifteen metres</em>?
                </h2>
                <p className="sub">
                  Eight times a person. Half-again a three-storey building.{" "}
                  <em>One</em> Jangchub Chorten.
                </p>
              </div>
              <div className="scale-art" aria-hidden="true">
                <div className="scale-ground"></div>
                <div className="scale-yaxis" aria-hidden="true"></div>
                <div className="scale-fig fig-person" data-fig="1">
                  <img src="/assets/person.png" alt="" />
                  <span className="lbl">
                    <strong>1.75 m</strong>Person
                  </span>
                </div>
                <div className="scale-fig fig-building" data-fig="2">
                  <img src="/assets/building2.png" alt="" />
                  <span className="lbl">
                    <strong>~10 m</strong>Three storeys
                  </span>
                </div>
                <div className="scale-fig fig-chorten" data-fig="3">
                  <img src="/assets/chorten2.png" alt="" />
                  <span className="lbl">
                    <strong>15 m</strong>One Jangchub Chorten
                  </span>
                </div>
                <div className="scale-ticks" aria-hidden="true">
                  <span className="tick" style={{ bottom: "11.7%" }}>
                    <em>1.75 m</em>
                  </span>
                  <span className="tick" style={{ bottom: "67.5%" }}>
                    <em>10 m</em>
                  </span>
                  <span className="tick" style={{ bottom: "88%" }}>
                    <em>15 m</em>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SCENE 05 — WHY 108? */}
      <section className="scene scene-why" id="scene-why">
        <div className="stage">
          <div className="stage__inner">
            <div className="why-kicker">
              <p className="kicker">A number of completeness</p>
            </div>
            <div className="why-stage">
              <div className="why-anchor" aria-label="One hundred and eight">
                108
              </div>
              <div className="why-chapters">
                <article className="why-chapter" data-chap="A">
                  <div className="vis" aria-hidden="true">
                    <svg
                      viewBox="0 0 520 280"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g fill="rgba(255,255,255,0.5)">
                        <circle cx="40" cy="40" r=".8" />
                        <circle cx="120" cy="80" r=".6" />
                        <circle cx="180" cy="30" r=".6" />
                        <circle cx="280" cy="70" r=".7" />
                        <circle cx="380" cy="40" r=".5" />
                        <circle cx="450" cy="110" r=".6" />
                        <circle cx="80" cy="220" r=".5" />
                        <circle cx="500" cy="240" r=".5" />
                      </g>
                      <circle
                        cx="60"
                        cy="140"
                        r="42"
                        fill="#E2C788"
                        opacity=".9"
                      />
                      <circle
                        cx="60"
                        cy="140"
                        r="60"
                        fill="none"
                        stroke="#E2C788"
                        strokeWidth="1"
                        opacity=".25"
                      />
                      <circle cx="270" cy="140" r="14" fill="#C8A663" />
                      <circle
                        cx="380"
                        cy="140"
                        r="6"
                        fill="rgba(242,233,216,.85)"
                      />
                      <line
                        x1="100"
                        y1="140"
                        x2="258"
                        y2="140"
                        stroke="#C8A663"
                        strokeWidth="1"
                        strokeDasharray="3 4"
                        opacity=".7"
                      />
                      <line
                        x1="284"
                        y1="140"
                        x2="372"
                        y2="140"
                        stroke="#C8A663"
                        strokeWidth="1"
                        strokeDasharray="3 4"
                        opacity=".7"
                      />
                      <text
                        x="180"
                        y="130"
                        textAnchor="middle"
                        fill="#C8A663"
                        fontFamily="Inter Tight, sans-serif"
                        fontSize="9"
                        letterSpacing="2"
                      >
                        ≈ 108 SOLAR DIAMETERS
                      </text>
                      <text
                        x="328"
                        y="130"
                        textAnchor="middle"
                        fill="#C8A663"
                        fontFamily="Inter Tight, sans-serif"
                        fontSize="9"
                        letterSpacing="2"
                      >
                        ≈ 108 LUNAR Ø
                      </text>
                    </svg>
                  </div>
                  <p className="ttl">
                    In <em>astronomy</em>.
                  </p>
                  <p className="lines">
                    Earth to Sun: about <em>108 solar diameters</em>. Earth to
                    Moon: about <em>108 lunar diameters</em>. Measurable,
                    scientific facts — not metaphors.
                  </p>
                </article>
                <article className="why-chapter" data-chap="B">
                  <div className="vis" aria-hidden="true">
                    <svg
                      viewBox="0 0 520 280"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="260"
                        cy="140"
                        r="92"
                        fill="none"
                        stroke="rgba(200,166,99,.25)"
                        strokeWidth="1"
                      />
                      <circle
                        cx="260"
                        cy="140"
                        r="60"
                        fill="none"
                        stroke="rgba(200,166,99,.4)"
                        strokeWidth=".7"
                      />
                      <circle
                        cx="260"
                        cy="140"
                        r="118"
                        fill="none"
                        stroke="rgba(200,166,99,.18)"
                        strokeWidth=".5"
                      />
                      <circle cx="260" cy="140" r="3.5" fill="#E2C788" />
                      <g fill="#C8A663">
                        <circle cx="352" cy="140" r="3" />
                        <circle cx="349.6" cy="156.1" r="3" />
                        <circle cx="342.6" cy="171" r="3" />
                        <circle cx="331.4" cy="183.2" r="3" />
                        <circle cx="316.7" cy="191.8" r="3" />
                        <circle cx="299.5" cy="195.8" r="3" />
                        <circle cx="281.3" cy="194.9" r="3" />
                        <circle cx="263.9" cy="189.2" r="3" />
                        <circle cx="248.9" cy="179.1" r="3" />
                        <circle cx="237.7" cy="165.5" r="3" />
                        <circle cx="231.2" cy="149.6" r="3" />
                        <circle cx="230.1" cy="132.7" r="3" />
                        <circle cx="234.2" cy="116.2" r="3" />
                        <circle cx="243.3" cy="101.6" r="3" />
                        <circle cx="256.4" cy="89.9" r="3" />
                        <circle cx="272.4" cy="82.2" r="3" />
                        <circle cx="289.9" cy="79.1" r="3" />
                        <circle cx="307.4" cy="80.9" r="3" />
                        <circle cx="323.4" cy="87.3" r="3" />
                        <circle cx="336.7" cy="98" r="3" />
                        <circle cx="346.1" cy="111.7" r="3" />
                        <circle cx="350.9" cy="127.1" r="3" />
                      </g>
                    </svg>
                  </div>
                  <p className="ttl">
                    In <em>Buddhism</em>.
                  </p>
                  <p className="lines">
                    <span>
                      108 volumes of the Kangyur — the complete teachings of the
                      Buddha.
                    </span>
                    <span>108 beads on a prayer mala.</span>
                    <span>108 strikes of the temple bell.</span>
                    <span>108 circumambulations of the sacred.</span>
                    <span>108 afflictive emotions to release.</span>
                  </p>
                </article>
                <article className="why-chapter" data-chap="C">
                  <div className="vis" aria-hidden="true">
                    <svg
                      viewBox="0 0 520 280"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <image
                        href="/assets/om.png"
                        x="175"
                        y="65"
                        width="155"
                        height="140"
                        preserveAspectRatio="xMidYMid meet"
                      />
                      <image
                        href="/assets/polygon.png"
                        x="85"
                        y="13"
                        width="360"
                        height="264"
                        preserveAspectRatio="xMidYMid meet"
                      />
                      <g
                        fill="#E2C788"
                        fontFamily="Cormorant Garamond, serif"
                        fontStyle="italic"
                        fontSize="11"
                        opacity=".75"
                        textAnchor="middle"
                      >
                        <text x="80" y="60">
                          nama
                        </text>
                        <text x="440" y="60">
                          nama
                        </text>
                        <text x="60" y="220">
                          nama
                        </text>
                        <text x="460" y="220">
                          nama
                        </text>
                        <text x="260" y="40">
                          nama
                        </text>
                        <text x="260" y="260">
                          nama
                        </text>
                      </g>
                    </svg>
                  </div>
                  <p className="ttl">
                    In <em>Hindu tradition</em>.
                  </p>
                  <p className="lines">
                    <span>
                      108 Upanishads — the sacred philosophical texts.
                    </span>
                    <span>108 names of many Hindu deities.</span>
                    <span>108 cycles of the sun salutation in yoga.</span>
                  </p>
                </article>
                <article className="why-chapter" data-chap="D">
                  <div className="vis" aria-hidden="true">
                    <svg
                      viewBox="0 0 520 200"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g transform="translate(70 100)">
                        <circle cx="0" cy="0" r="6" fill="#E2C788" />
                        <text
                          x="0"
                          y="34"
                          textAnchor="middle"
                          fill="#C8A663"
                          fontFamily="Cormorant Garamond, serif"
                          fontStyle="italic"
                          fontSize="13"
                        >
                          1¹ = 1
                        </text>
                      </g>
                      <text
                        x="135"
                        y="106"
                        textAnchor="middle"
                        fill="rgba(200,166,99,.5)"
                        fontFamily="Cormorant Garamond, serif"
                        fontSize="22"
                      >
                        ×
                      </text>
                      <g transform="translate(180 100)">
                        <g fill="#C8A663">
                          <circle cx="-7" cy="-7" r="4" />
                          <circle cx="7" cy="-7" r="4" />
                          <circle cx="-7" cy="7" r="4" />
                          <circle cx="7" cy="7" r="4" />
                        </g>
                        <text
                          x="0"
                          y="34"
                          textAnchor="middle"
                          fill="#C8A663"
                          fontFamily="Cormorant Garamond, serif"
                          fontStyle="italic"
                          fontSize="13"
                        >
                          2² = 4
                        </text>
                      </g>
                      <text
                        x="245"
                        y="106"
                        textAnchor="middle"
                        fill="rgba(200,166,99,.5)"
                        fontFamily="Cormorant Garamond, serif"
                        fontSize="22"
                      >
                        ×
                      </text>
                      <g transform="translate(310 100)">
                        <g fill="#C8A663" opacity=".55">
                          <circle cx="-12" cy="-18" r="3" />
                          <circle cx="0" cy="-18" r="3" />
                          <circle cx="12" cy="-18" r="3" />
                          <circle cx="-12" cy="-6" r="3" />
                          <circle cx="0" cy="-6" r="3" />
                          <circle cx="12" cy="-6" r="3" />
                          <circle cx="-12" cy="6" r="3" />
                          <circle cx="0" cy="6" r="3" />
                          <circle cx="12" cy="6" r="3" />
                        </g>
                        <g
                          fill="#C8A663"
                          opacity=".8"
                          transform="translate(4 4)"
                        >
                          <circle cx="-12" cy="-18" r="3" />
                          <circle cx="0" cy="-18" r="3" />
                          <circle cx="12" cy="-18" r="3" />
                          <circle cx="-12" cy="-6" r="3" />
                          <circle cx="0" cy="-6" r="3" />
                          <circle cx="12" cy="-6" r="3" />
                          <circle cx="-12" cy="6" r="3" />
                          <circle cx="0" cy="6" r="3" />
                          <circle cx="12" cy="6" r="3" />
                        </g>
                        <g fill="#E2C788" transform="translate(8 8)">
                          <circle cx="-12" cy="-18" r="3" />
                          <circle cx="0" cy="-18" r="3" />
                          <circle cx="12" cy="-18" r="3" />
                          <circle cx="-12" cy="-6" r="3" />
                          <circle cx="0" cy="-6" r="3" />
                          <circle cx="12" cy="-6" r="3" />
                          <circle cx="-12" cy="6" r="3" />
                          <circle cx="0" cy="6" r="3" />
                          <circle cx="12" cy="6" r="3" />
                        </g>
                        <text
                          x="0"
                          y="44"
                          textAnchor="middle"
                          fill="#C8A663"
                          fontFamily="Cormorant Garamond, serif"
                          fontStyle="italic"
                          fontSize="13"
                        >
                          3³ = 27
                        </text>
                      </g>
                      <text
                        x="395"
                        y="106"
                        textAnchor="middle"
                        fill="rgba(200,166,99,.5)"
                        fontFamily="Cormorant Garamond, serif"
                        fontSize="22"
                      >
                        =
                      </text>
                      <text
                        x="455"
                        y="112"
                        textAnchor="middle"
                        fill="#E2C788"
                        fontFamily="Cormorant Garamond, serif"
                        fontStyle="italic"
                        fontSize="42"
                      >
                        108
                      </text>
                    </svg>
                  </div>
                  <p className="ttl">
                    In <em>mathematics</em>.
                  </p>
                  <p className="math-eq">
                    1<sup>1</sup> <span className="eq">×</span> 2<sup>2</sup>{" "}
                    <span className="eq">×</span> 3<sup>3</sup>{" "}
                    <span className="eq">=</span>{" "}
                    <span className="res">108</span>
                  </p>
                  <p className="lines">
                    A number of structural completeness — the hyperfactorial of
                    three.
                  </p>
                </article>
                <article className="why-chapter" data-chap="E">
                  <div className="vis" aria-hidden="true">
                    <div className="dots-field"></div>
                  </div>
                  <p className="ttl">
                    In <em>Project 108</em>, the number becomes{" "}
                    <em>physical</em>.
                  </p>
                  <p className="lines">
                    108 chortens. 108 metres apart. <em>One</em> sacred
                    procession.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SCENE 06 — ONE BECOMES 108 */}
      <section className="scene scene-multiply" id="scene-multiply">
        <div className="stage">
          <div className="stage__inner">
            <div className="multiply-stage">
              <div className="chorten-grid" aria-hidden="true"></div>
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
      </section>

      {/* SCENE 07 — 108 METRES APART */}
      <section className="scene scene-spacing" id="scene-spacing">
        <div className="stage">
          <div className="stage__inner">
            <div className="spacing-stage">
              <div className="spacing-copy">
                <p className="kicker">The formation</p>
                <h2>
                  <em>108</em> chortens.
                  <br />
                  <em>108</em> metres apart.
                </h2>
                <p className="spacing-sub">
                  Centre to centre, in a single file along the Mau Chhu — the
                  river that runs through Gelephu. Not a cluster of monuments. A{" "}
                  <em>procession</em>.
                </p>
              </div>
              <div className="spacing-track" aria-hidden="true">
                <div className="spacing-row"></div>
                <div className="spacing-measure">
                  <span className="lbl">
                    108<em> m</em>
                  </span>
                  <span className="line" aria-hidden="true"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SCENE 08 — A LINE ALONG THE MAU CHHU */}
      <section className="scene scene-river" id="scene-river">
        <div className="stage">
          <div className="stage__inner">
            <div className="river-stage">
              <div className="river-photo" aria-hidden="true"></div>
              <div className="river-tint" aria-hidden="true"></div>
              <svg
                className="river-svg"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              ></svg>
              <div className="river-copy">
                <p className="kicker">A line of prayer</p>
                <h2>
                  Across the <em>Mau Chhu</em>.
                </h2>
                <p>
                  The procession bends with the land, marking a real river
                  corridor end to end — a line of prayer across Bhutan&apos;s
                  southern foothills.
                </p>
              </div>
              <div className="river-meta">
                <div>
                  <strong>108</strong> sites · single file
                </div>
                <div>
                  <strong>~12 km</strong> corridor
                </div>
                <div>Gelephu · Bhutan</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SCENE 09 — STACKED HEIGHT */}
      <section className="scene scene-stack" id="scene-stack">
        <div className="stage">
          <div className="stage__inner">
            <div className="stack-stage">
              <div className="stack-sky" aria-hidden="true"></div>
              <div className="stack-stars" aria-hidden="true"></div>
              <div className="stack-intro">
                <p className="kicker">If stacked vertically</p>
                <h2>
                  The procession would <em>rise into the sky</em>.
                </h2>
                <p className="stack-sub">
                  108 chortens at fifteen metres each — 1.62 km of sacred
                  presence.
                </p>
              </div>
              <div className="stack-column" aria-hidden="true"></div>
              <div className="stack-ref" data-unit="9">
                <span className="tick"></span>
                <span className="ref-icon" aria-hidden="true">
                  <img
                    src="/assets/pyramid.png"
                    alt=""
                    width="160"
                    height="220"
                    style={{ objectFit: "contain" }}
                  />
                </span>
                <span className="info">
                  <strong>Great Pyramid · 139 m</strong>9 chortens stacked
                </span>
              </div>
              <div className="stack-ref" data-unit="22">
                <span className="tick"></span>
                <span className="ref-icon" aria-hidden="true">
                  <img
                    src="/assets/eiffel-tower.png"
                    alt=""
                    width="160"
                    height="360"
                    style={{ objectFit: "contain", marginLeft: "100px" }}
                  />
                </span>
                <span className="info">
                  <strong>Eiffel Tower · 330 m</strong>22 chortens · the
                  procession passes Paris
                </span>
              </div>
              <div className="stack-ref" data-unit="55">
                <span className="tick"></span>
                <span className="ref-icon" aria-hidden="true">
                  <img
                    src="/assets/building.png"
                    alt=""
                    width="160"
                    height="360"
                    style={{ objectFit: "contain" }}
                  />
                </span>
                <span className="info">
                  <strong>Burj Khalifa · 828 m</strong>55 chortens · nearly
                  twice exceeded
                </span>
              </div>
              <div className="stack-ref" data-unit="108">
                <span className="tick"></span>
                <span className="ref-icon" aria-hidden="true">
                  <img
                    src="/assets/chorten.png"
                    alt=""
                    // width="90"
                    // height="130"
                    style={{ objectFit: "contain", marginBottom: "2.8rem" }}
                  />
                </span>
                <span className="info">
                  <strong>Project 108 · 1.62 km</strong>108 chortens · complete
                </span>
              </div>
              <div className="stack-final">
                <p className="num">1.62 km</p>
                <p className="lbl">Combined height</p>
                <p className="desc">
                  Nearly twice the Burj Khalifa. Roughly five Eiffel Towers.
                  More than eleven Great Pyramids — in fifteen-metre offerings.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="stack-counter" aria-hidden="true">
          <p className="h">0 m</p>
          <p className="l">Stacked height</p>
        </div>
      </section>

      {/* SCENE 10 — TIME OF CONSTRUCTION */}
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

      {/* SCENE 11 — MANPOWER COMPARISON */}
      <section className="scene scene-manpower" id="scene-manpower">
        <div className="stage">
          <div className="stage__inner">
            <div className="manpower-block">
              <div className="manpower-head">
                <p className="kicker">
                  A workforce to rival history&apos;s greatest builds
                </p>
                <h2>
                  Comparable to history&apos;s <em>great works</em>.<br />
                  Different in <em>kind</em>.
                </h2>
              </div>
              <div
                className="manpower-row"
                style={{ "--w": "0.50" } as React.CSSProperties}
              >
                <span className="lbl">Great Pyramid of Giza</span>
                <span className="bar">
                  <span className="bar__fill"></span>
                </span>
                <span className="num">
                  <strong>~20,000</strong>concurrent workers
                </span>
                <span className="dur">
                  <strong>~20 years</strong>seasonal civic duty
                </span>
              </div>
              <div
                className="manpower-row"
                style={{ "--w": "0.50" } as React.CSSProperties}
              >
                <span className="lbl">Taj Mahal</span>
                <span className="bar">
                  <span className="bar__fill"></span>
                </span>
                <span className="num">
                  <strong>~20,000</strong>concurrent artisans
                </span>
                <span className="dur">
                  <strong>~22 years</strong>imperial commission
                </span>
              </div>
              <div
                className="manpower-row"
                style={{ "--w": "0.75" } as React.CSSProperties}
              >
                <span className="lbl">Great Wall of China</span>
                <span className="bar">
                  <span className="bar__fill"></span>
                </span>
                <span className="num">
                  <strong>~30,000</strong>peak concurrent
                </span>
                <span className="dur">
                  <strong>Centuries</strong>state-directed labour
                </span>
              </div>
              <div
                className="manpower-row is-108"
                style={{ "--w": "1" } as React.CSSProperties}
              >
                <span className="lbl">Project 108</span>
                <span className="bar">
                  <span className="bar__fill"></span>
                </span>
                <span className="num">
                  <strong>40,000</strong>volunteers
                </span>
                <span className="dur">
                  <strong>1 day</strong>voluntary
                </span>
              </div>
              {/* <p className="manpower-foot">
                Every person on this list was there for a wage, a duty, or an
                order.
                <br />
                On 1 November 2026, every person is there for a{" "}
                <em>greater calling</em>.
              </p> */}
            </div>
          </div>
        </div>
      </section>

      {/* SCENE 12 — 40,000 VOLUNTEERS */}
      <section className="scene scene-volunteers" id="scene-volunteers">
        <div className="stage">
          <div className="stage__inner">
            <div className="vol-stage">
              <svg
                className="vol-svg"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              ></svg>
              <div className="vol-copy">
                <p className="kicker">Zhābto · voluntary communal work</p>
                <h2>
                  108 sites <em>activate</em>.<br />
                  Forty thousand hands <em>arrive</em>.
                </h2>
                <p>
                  The Bhutanese tradition of <em>zhābto</em> — work offered
                  freely as spiritual practice — has drawn schoolchildren and
                  retirees, monks emerging from retreat, farmers, doctors, and a
                  planeload of diaspora from Australia. The corridor becomes a
                  single coordinated body.
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

      {/* SCENE 13 — THE COMPLETION */}
      <section className="scene scene-completion" id="scene-completion">
        <div className="stage">
          <div className="stage__inner">
            <div className="compl-stage">
              <div className="compl-bg" aria-hidden="true"></div>
              <svg
                className="compl-mountains"
                viewBox="0 0 1600 400"
                preserveAspectRatio="xMidYMax slice"
                aria-hidden="true"
              >
                <path
                  d="M0 320 L120 240 L240 280 L360 200 L480 250 L600 180 L760 230 L900 170 L1080 220 L1240 190 L1380 240 L1500 200 L1600 230 L1600 400 L0 400 Z"
                  fill="rgba(74,26,46,0.55)"
                />
                <path
                  d="M0 350 L160 290 L320 330 L480 260 L640 320 L800 270 L960 320 L1140 280 L1320 320 L1480 290 L1600 320 L1600 400 L0 400 Z"
                  fill="rgba(26,7,16,0.7)"
                />
              </svg>
              <div className="compl-light" aria-hidden="true"></div>
              <div className="compl-river" aria-hidden="true"></div>
              <div className="compl-track" aria-hidden="true"></div>
              {/* <div className="compl-ground" aria-hidden="true"></div> */}
              <div className="compl-copy">
                <h2>
                  108 chortens. <em>One day</em>.<br />
                  One offering.
                </h2>
                <p className="meta">
                  1 November 2026 · Gelephu Mindfulness City · Bhutan
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SCENE 14 — INVITATION */}
      <section className="scene scene-invitation" id="scene-invitation">
        <div className="stage">
          <div className="stage__inner">
            <div className="inv-block">
              <p className="small-num">15 / 15 · An invitation</p>
              <h2>
                Two ways to <em>take part</em>.
              </h2>
              <p className="inv-lede">
                Project 108 is shaped by two forces: those who <em>offer</em>{" "}
                the chortens, and those who <em>build</em> them. Both are acts
                of merit. Both are needed.
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
                    November 2026, when all 108 external structures will be
                    raised together, at least 40,000 volunteers will be needed.
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
                    Register to volunteer
                  </button>
                </div>
              </div>
              {/* <div className="inv-meta-grid">
                <div>
                  <span className="k">Structure</span>
                  <span className="v">Jangchub Chorten · 15 m</span>
                </div>
                <div>
                  <span className="k">Formation</span>
                  <span className="v">Single file · 108 m apart</span>
                </div>
                <div>
                  <span className="k">Date</span>
                  <span className="v">1 November 2026</span>
                </div>
                <div>
                  <span className="k">Location</span>
                  <span className="v">Gelephu · Bhutan</span>
                </div>
              </div> */}
              <p className="inv-meta">
                Gelephu Mindfulness City Authority ·{" "}
                <a href="mailto:108@gmc.bt">108@gmc.bt</a> · +975 77117708
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SCENE 15 — HIS MAJESTY'S QUOTE */}
      <section className="scene scene-gesture" id="scene-gesture">
        <div className="stage">
          <div className="stage__inner">
            <div className="gesture-block">
              <p className="kicker">A Royal initiative</p>
              <blockquote className="gesture-quote">
                <p>
                  We must do it to <em>prove to ourselves</em> that, as we face
                  the challenges ahead, there is <em>no limit</em> to what we
                  can achieve when we <em>stand together</em>.
                </p>
              </blockquote>
              <p className="gesture-attr">
                <span className="who">
                  His Majesty Jigme Khesar Namgyel Wangchuck
                </span>
                <span className="role">King of Bhutan · 21 February 2026</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer 
      <footer className="colophon">
        <div className="colo-grid">
          <div className="colo-mark">
            <p className="crest">108</p>
            <p className="crest-sub">Project 108 · Bhutan</p>
          </div>
          <div className="colo-col">
            <p className="k">A Royal initiative of</p>
            <p className="v">His Majesty the King of Bhutan</p>
            <p className="v">Announced 21 February 2026</p>
          </div>
          <div className="colo-col">
            <p className="k">Stewarded by</p>
            <p className="v">Gelephu Mindfulness City Authority</p>
            <p className="v">In partnership with eminent Buddhist masters</p>
          </div>
          <div className="colo-col">
            <p className="k">Begin the conversation</p>
            <p className="v">
              <a href="mailto:108@gmc.bt">108@gmc.bt</a>
            </p>
            <p className="v">+975 77117708</p>
          </div>
        </div>
        <div className="colo-base">
          <p className="row">A cinematic scrollytelling experience</p>
          <p className="row">Project 108 · Gelephu Mindfulness City · Bhutan</p>
        </div>
      </footer> */}

      {/* Floating back-to-top button */}
      <button
        type="button"
        id="float-top-btn"
        className="float-top-btn"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        ↑
      </button>

      {/* Sign-up form modal */}
      <div
        className="form-modal"
        id="form-modal"
        aria-hidden="true"
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-title"
      >
        <div className="form-modal__backdrop" data-close-form="true"></div>
        <div className="form-modal__sheet">
          <span
            className="form-modal__close"
            role="button"
            aria-label="Close"
            tabIndex={0}
            data-close-form="true"
          >
            ×
          </span>
          <p className="form-modal__lbl">Project 108 · Bhutan</p>
          <h3 className="form-modal__ttl" id="form-title">
            Take <em>part</em>.
          </h3>
          <p className="form-modal__lede">
            Leave your details and we will be in touch with the next steps.
          </p>
          <form className="form-modal__form" id="signup-form" noValidate>
            <fieldset className="form-row form-row--choice">
              <legend className="visually-hidden">I would like to</legend>
              <label className="choice">
                <input type="radio" name="role" value="patron" required />
                <span className="choice__box">
                  <span className="choice__ttl">Patron</span>
                  <span className="choice__sub">Offer a chorten</span>
                </span>
              </label>
              <label className="choice">
                <input type="radio" name="role" value="volunteer" required />
                <span className="choice__box">
                  <span className="choice__ttl">Volunteer</span>
                  <span className="choice__sub">Join the build day</span>
                </span>
              </label>
            </fieldset>
            <div className="form-row form-row--double">
              <label className="field">
                <span className="field__lbl">Full name</span>
                <input type="text" name="name" autoComplete="name" required />
              </label>
              <label className="field">
                <span className="field__lbl">Email</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                />
              </label>
            </div>
            <div className="form-row form-row--phone">
              <label className="field field--cc">
                <span className="field__lbl">Country code</span>
                <select name="country_code" required></select>
              </label>
              <label className="field">
                <span className="field__lbl">Phone number</span>
                <input
                  type="tel"
                  name="phone"
                  autoComplete="tel-national"
                  inputMode="numeric"
                  required
                />
              </label>
            </div>
            <label className="field">
              <span className="field__lbl">Country of residence</span>
              <select name="country" required></select>
            </label>
            <label className="field">
              <span className="field__lbl">
                Message <span className="field__opt">(optional)</span>
              </span>
              <textarea
                name="message"
                rows={4}
                placeholder="Tell us anything that will help us welcome you."
              ></textarea>
            </label>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn--ghost"
                data-close-form="true"
              >
                Cancel
              </button>
              <button type="submit" className="btn">
                Submit
              </button>
            </div>
            <p className="form-modal__small">
              By submitting, you consent to be contacted by the Gelephu
              Mindfulness City Authority.
            </p>
          </form>
          <div className="form-modal__thanks" hidden>
            <p className="lbl">Thank you</p>
            <h4>Your message is on its way.</h4>
            <p>We will write to you shortly with next steps.</p>
            <button type="button" className="btn" data-close-form="true">
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Load scroll JS after page is interactive */}
      <Script src="/scroll/scrollytelling.js" strategy="afterInteractive" />
      <Script src="/scroll/form.js" strategy="afterInteractive" />
    </>
  );
}
