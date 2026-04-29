function Contact() {
  return (
    <>
      <section className="p108-contact-top">
        <div className="p108-wrap p108-medium">
          <span className="p108-eyebrow">Contact Us</span>
          <h2 className="p108-h2" style={{marginTop: '1rem'}}>Begin the Conversation</h2>
          <p>Whether you wish to become a patron or volunteer for the build, we warmly invite you to reach out at your earliest convenience. Preparations are already underway.</p>
          <div style={{marginTop:'2rem',display:'flex',flexWrap:'wrap',gap:'1rem'}}>
            <a className="p108-btn" href="#participate" onClick={(e)=>{e.preventDefault();window.openP108Modal&&window.openP108Modal('patron')}}>Become a Patron</a>
            <a className="p108-btn p108-btn--ghost" href="#participate" onClick={(e)=>{e.preventDefault();window.openP108Modal&&window.openP108Modal('volunteer')}}>Join the Build</a>
            <a className="p108-btn p108-btn--ghost" href="#" onClick={(e)=>e.preventDefault()}>Download the Brochure</a>
          </div>
        </div>
      </section>
      <section className="p108-contact-bottom">
        <div className="p108-wrap p108-medium p108-contact-bottom__inner">
          <div>
            <h2 className="p108-h2" style={{color:'var(--gold)',maxWidth:'24ch'}}>Gelephu Mindfulness City Authority</h2>
            <p style={{marginTop:'1.5rem'}}>This act of collective prayer and spiritual practice comes in a period that Buddhist masters have described as degenerate times. For all peoples, it is a reminder of the need for peace and spiritual protection in a world dealing with endless turmoil.</p>
            <p>We welcome all to this collective act of merit.</p>
            <div className="p108-meta">
              <div>Email: <a href="mailto:108@gmc.bt">108@gmc.bt</a></div>
              <div style={{marginTop:'.25rem'}}>Phone: <a href="tel:+97577117708">+975 77117708</a></div>
            </div>
          </div>
        </div>
        <div className="p108-contact-bottom__chorten" dangerouslySetInnerHTML={{__html: window.P108_BACK_CHORTEN_SVG || ''}} />
      </section>
    </>
  );
}
window.Contact = Contact;
