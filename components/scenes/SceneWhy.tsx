export default function SceneWhy() {
  return (
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
              {/* Chapter A — Astronomy */}
              <article className="why-chapter" data-chap="A">
                <div className="vis" aria-hidden="true">
                  <svg viewBox="0 0 520 280" xmlns="http://www.w3.org/2000/svg">
                    {/* Stars — varied sizes and brightness */}
                    <g fill="white">
                      <circle cx="22" cy="18" r="1.2" opacity=".9" />
                      <circle cx="90" cy="12" r=".7" opacity=".6" />
                      <circle cx="155" cy="22" r=".5" opacity=".5" />
                      <circle cx="210" cy="8" r=".9" opacity=".8" />
                      <circle cx="310" cy="18" r=".6" opacity=".6" />
                      <circle cx="365" cy="30" r="1.0" opacity=".7" />
                      <circle cx="430" cy="14" r=".5" opacity=".5" />
                      <circle cx="498" cy="38" r=".8" opacity=".7" />
                      <circle cx="478" cy="72" r=".5" opacity=".4" />
                      <circle cx="340" cy="56" r=".6" opacity=".5" />
                      <circle cx="240" cy="48" r=".4" opacity=".4" />
                      <circle cx="130" cy="58" r=".7" opacity=".6" />
                      <circle cx="55" cy="70" r=".5" opacity=".5" />
                      <circle cx="18" cy="200" r=".8" opacity=".6" />
                      <circle cx="68" cy="245" r=".5" opacity=".4" />
                      <circle cx="160" cy="260" r=".6" opacity=".5" />
                      <circle cx="310" cy="252" r=".7" opacity=".6" />
                      <circle cx="420" cy="240" r=".5" opacity=".4" />
                      <circle cx="505" cy="220" r=".9" opacity=".7" />
                      <circle cx="490" cy="260" r=".4" opacity=".4" />
                    </g>

                    {/* Orbital rings — very faint ellipses around Sun */}
                    <ellipse
                      cx="60"
                      cy="140"
                      rx="80"
                      ry="22"
                      fill="none"
                      stroke="#C8A663"
                      strokeWidth=".4"
                      opacity=".18"
                    />
                    <ellipse
                      cx="60"
                      cy="140"
                      rx="130"
                      ry="35"
                      fill="none"
                      stroke="#C8A663"
                      strokeWidth=".4"
                      opacity=".14"
                    />
                    <ellipse
                      cx="60"
                      cy="140"
                      rx="210"
                      ry="55"
                      fill="none"
                      stroke="#C8A663"
                      strokeWidth=".4"
                      opacity=".12"
                    />
                    <ellipse
                      cx="60"
                      cy="140"
                      rx="340"
                      ry="80"
                      fill="none"
                      stroke="#C8A663"
                      strokeWidth=".4"
                      opacity=".10"
                    />
                    <ellipse
                      cx="60"
                      cy="140"
                      rx="440"
                      ry="100"
                      fill="none"
                      stroke="#C8A663"
                      strokeWidth=".4"
                      opacity=".08"
                    />

                    {/* Sun — glow layers + body */}
                    <circle
                      cx="60"
                      cy="140"
                      r="72"
                      fill="#E2C788"
                      opacity=".04"
                    />
                    <circle
                      cx="60"
                      cy="140"
                      r="58"
                      fill="#E2C788"
                      opacity=".10"
                    />
                    <circle
                      cx="60"
                      cy="140"
                      r="48"
                      fill="#E2C788"
                      opacity=".9"
                    />

                    {/* Mercury — small, inner orbit */}
                    <circle
                      cx="138"
                      cy="118"
                      r="4"
                      fill="#B8A070"
                      opacity=".85"
                    />

                    {/* Venus — medium, second orbit */}
                    <circle
                      cx="188"
                      cy="165"
                      r="7"
                      fill="#D4B870"
                      opacity=".8"
                    />

                    {/* Earth */}
                    <circle cx="270" cy="140" r="14" fill="#C8A663" />
                    {/* Earth highlight */}
                    <circle
                      cx="265"
                      cy="135"
                      r="5"
                      fill="#E2C788"
                      opacity=".25"
                    />

                    {/* Moon */}
                    <circle
                      cx="380"
                      cy="140"
                      r="6"
                      fill="rgba(242,233,216,.85)"
                    />

                    {/* Mars — outer, slightly above baseline */}
                    <circle
                      cx="462"
                      cy="112"
                      r="8"
                      fill="#B87050"
                      opacity=".8"
                    />

                    {/* 108 measurement lines */}
                    <line
                      x1="106"
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
                      x2="374"
                      y2="140"
                      stroke="#C8A663"
                      strokeWidth="1"
                      strokeDasharray="3 4"
                      opacity=".7"
                    />

                    {/* Labels */}
                    <text
                      x="182"
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
                      x="329"
                      y="130"
                      textAnchor="middle"
                      fill="#C8A663"
                      fontFamily="Inter Tight, sans-serif"
                      fontSize="9"
                      letterSpacing="2"
                    >
                      ≈ 108 LUNAR Ø
                    </text>

                    {/* Planet labels */}
                    <text
                      x="138"
                      y="110"
                      textAnchor="middle"
                      fill="#C8A663"
                      fontFamily="Inter Tight, sans-serif"
                      fontSize="7"
                      opacity=".55"
                    >
                      Mercury
                    </text>
                    <text
                      x="188"
                      y="180"
                      textAnchor="middle"
                      fill="#C8A663"
                      fontFamily="Inter Tight, sans-serif"
                      fontSize="7"
                      opacity=".55"
                    >
                      Venus
                    </text>
                    <text
                      x="270"
                      y="162"
                      textAnchor="middle"
                      fill="#C8A663"
                      fontFamily="Inter Tight, sans-serif"
                      fontSize="7"
                      opacity=".6"
                    >
                      Earth
                    </text>
                    <text
                      x="462"
                      y="126"
                      textAnchor="middle"
                      fill="#C8A663"
                      fontFamily="Inter Tight, sans-serif"
                      fontSize="7"
                      opacity=".55"
                    >
                      Mars
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

              {/* Chapter B — Buddhism */}
              <article className="why-chapter" data-chap="B">
                <div className="vis" aria-hidden="true">
                  <svg viewBox="0 0 520 280" xmlns="http://www.w3.org/2000/svg">
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

              {/* Chapter C — Hindu tradition */}
              <article className="why-chapter" data-chap="C">
                <div className="vis" aria-hidden="true">
                  <svg viewBox="0 0 520 280" xmlns="http://www.w3.org/2000/svg">
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
                  <span>108 Upanishads — the sacred philosophical texts.</span>
                  <span>108 names of many Hindu deities.</span>
                  <span>108 cycles of the sun salutation in yoga.</span>
                </p>
              </article>

              {/* Chapter D — Mathematics */}
              <article className="why-chapter" data-chap="D">
                <div className="vis" aria-hidden="true">
                  <svg viewBox="0 0 520 200" xmlns="http://www.w3.org/2000/svg">
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
                      <g fill="#C8A663" opacity=".8" transform="translate(4 4)">
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
                  <span className="eq">=</span> <span className="res">108</span>
                </p>
                <p className="lines">
                  A number of structural completeness — the hyperfactorial of
                  three.
                </p>
              </article>

              {/* Chapter E — Project 108 */}
              <article className="why-chapter" data-chap="E">
                <div className="vis" aria-hidden="true">
                  <div className="dots-field"></div>
                </div>
                <p className="ttl">
                  In <em>Project 108</em>, the number becomes <em>physical</em>.
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
  );
}
