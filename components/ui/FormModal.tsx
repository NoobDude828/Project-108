export default function FormModal() {
  return (
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
              <input type="email" name="email" autoComplete="email" required />
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
  );
}
