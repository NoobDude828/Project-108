function TakePart() {
  return (
    <div className="p108-takepart">
      <div className="p108-takepart__card">
        <div className="p108-takepart__label">Become a Patron</div>
        <div className="p108-takepart__amount">Starting from<br/>USD 200,000</div>
        <div className="p108-takepart__sub">Per Chorten, flexible by conversation</div>
        <div className="p108-takepart__body">
          <p>Each of the 108 Jangchub Chortens may be offered by an individual, a family, a community, or an institution. Patronage covers construction, sacred materials, and consecration by Buddhist masters.</p>
          <p>Each chorten may be dedicated in honour of a patron, a loved one, a family, a community, or all sentient beings. A plaque will provide permanent recognition.</p>
        </div>
        <a className="p108-btn" href="#participate" onClick={(e)=>{e.preventDefault();window.openP108Modal&&window.openP108Modal('patron')}}>Become a Patron</a>
      </div>

      <div className="p108-takepart__card">
        <div className="p108-takepart__label">Join the Build</div>
        <div className="p108-takepart__amount">40,000</div>
        <div className="p108-takepart__sub">Volunteers needed</div>
        <div className="p108-takepart__body">
          <p>Tens of thousands of volunteers are already at work along the Mau River, clearing land and preparing the 108 sites. For the final act on 1 November 2026, when all 108 external structures will be raised together, at least 40,000 volunteers will be needed across all sites simultaneously.</p>
          <p>Volunteers will be trained in advance. The sacred Bhutanese tradition of <em>Zhābto</em> has already drawn tens of thousands to GMC. The world is welcome to join.</p>
        </div>
        <a className="p108-btn" href="#participate" onClick={(e)=>{e.preventDefault();window.openP108Modal&&window.openP108Modal('volunteer')}}>Join the Build</a>
      </div>
    </div>
  );
}
window.TakePart = TakePart;
