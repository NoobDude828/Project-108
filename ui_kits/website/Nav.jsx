function Nav() {
  return (
    <nav className="p108-nav">
      <div className="p108-nav__inner">
        <a className="p108-nav__brand" href="#top"><small>Project</small>108</a>
        <ul className="p108-nav__links">
          <li><a href="#project">The Project</a></li>
          <li><a href="#chorten">The Chorten</a></li>
          <li><a href="#scale">Scale</a></li>
          <li><a href="#single-day">Single Day</a></li>
          <li><a href="#take-part">Take Part</a></li>
          <li><a href="scroll/index.html" className="p108-nav__scroll">View as scroll ↗</a></li>
        </ul>
        <a className="p108-nav__cta" href="#participate" onClick={(e)=>{e.preventDefault();window.openP108Modal&&window.openP108Modal('patron')}}>Take Part</a>
      </div>
    </nav>
  );
}
window.Nav = Nav;
