function Hero() {
  return (
    <header id="top" className="p108-hero">
      <div className="p108-hero__inner">
        <div>
          <div className="p108-hero__eyebrow">Project</div>
          <div className="p108-hero__numeral">108</div>
          <p className="p108-hero__caption">108 Jangchub Chortens, each 15 metres tall, completed together in a single day.</p>
        </div>
        <div className="p108-hero__chorten" dangerouslySetInnerHTML={{__html: window.P108_HERO_CHORTEN_SVG || ''}} />
      </div>
    </header>
  );
}
window.Hero = Hero;
