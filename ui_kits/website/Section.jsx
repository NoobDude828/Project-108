function Section({ id, eyebrow, headline, children, variant = 'plain' }) {
  return (
    <section id={id} className={`p108-section p108-section--${variant}`}>
      <div className="p108-wrap p108-medium">
        {eyebrow && <span className="p108-eyebrow">{eyebrow}</span>}
        {headline && <h2 className="p108-h2" dangerouslySetInnerHTML={{__html: headline}} />}
        {children}
      </div>
    </section>
  );
}
window.Section = Section;
