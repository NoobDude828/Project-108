"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// Country list duplicated from public/scroll/form.js — kept small and inline
// so this component stays self-contained and doesn't require the legacy IIFE.
const COUNTRIES: Array<[string, string, string]> = [
  ["Afghanistan", "AF", "+93"],
  ["Albania", "AL", "+355"],
  ["Algeria", "DZ", "+213"],
  ["Andorra", "AD", "+376"],
  ["Angola", "AO", "+244"],
  ["Argentina", "AR", "+54"],
  ["Armenia", "AM", "+374"],
  ["Australia", "AU", "+61"],
  ["Austria", "AT", "+43"],
  ["Azerbaijan", "AZ", "+994"],
  ["Bahrain", "BH", "+973"],
  ["Bangladesh", "BD", "+880"],
  ["Belarus", "BY", "+375"],
  ["Belgium", "BE", "+32"],
  ["Bhutan", "BT", "+975"],
  ["Bolivia", "BO", "+591"],
  ["Bosnia and Herzegovina", "BA", "+387"],
  ["Botswana", "BW", "+267"],
  ["Brazil", "BR", "+55"],
  ["Brunei", "BN", "+673"],
  ["Bulgaria", "BG", "+359"],
  ["Cambodia", "KH", "+855"],
  ["Cameroon", "CM", "+237"],
  ["Canada", "CA", "+1"],
  ["Chile", "CL", "+56"],
  ["China", "CN", "+86"],
  ["Colombia", "CO", "+57"],
  ["Costa Rica", "CR", "+506"],
  ["Croatia", "HR", "+385"],
  ["Cuba", "CU", "+53"],
  ["Cyprus", "CY", "+357"],
  ["Czechia", "CZ", "+420"],
  ["Denmark", "DK", "+45"],
  ["Dominican Republic", "DO", "+1"],
  ["Ecuador", "EC", "+593"],
  ["Egypt", "EG", "+20"],
  ["El Salvador", "SV", "+503"],
  ["Estonia", "EE", "+372"],
  ["Ethiopia", "ET", "+251"],
  ["Finland", "FI", "+358"],
  ["France", "FR", "+33"],
  ["Georgia", "GE", "+995"],
  ["Germany", "DE", "+49"],
  ["Ghana", "GH", "+233"],
  ["Greece", "GR", "+30"],
  ["Guatemala", "GT", "+502"],
  ["Honduras", "HN", "+504"],
  ["Hong Kong", "HK", "+852"],
  ["Hungary", "HU", "+36"],
  ["Iceland", "IS", "+354"],
  ["India", "IN", "+91"],
  ["Indonesia", "ID", "+62"],
  ["Iran", "IR", "+98"],
  ["Iraq", "IQ", "+964"],
  ["Ireland", "IE", "+353"],
  ["Israel", "IL", "+972"],
  ["Italy", "IT", "+39"],
  ["Jamaica", "JM", "+1"],
  ["Japan", "JP", "+81"],
  ["Jordan", "JO", "+962"],
  ["Kazakhstan", "KZ", "+7"],
  ["Kenya", "KE", "+254"],
  ["Kuwait", "KW", "+965"],
  ["Kyrgyzstan", "KG", "+996"],
  ["Laos", "LA", "+856"],
  ["Latvia", "LV", "+371"],
  ["Lebanon", "LB", "+961"],
  ["Libya", "LY", "+218"],
  ["Lithuania", "LT", "+370"],
  ["Luxembourg", "LU", "+352"],
  ["Macao", "MO", "+853"],
  ["Madagascar", "MG", "+261"],
  ["Malaysia", "MY", "+60"],
  ["Maldives", "MV", "+960"],
  ["Malta", "MT", "+356"],
  ["Mauritius", "MU", "+230"],
  ["Mexico", "MX", "+52"],
  ["Moldova", "MD", "+373"],
  ["Monaco", "MC", "+377"],
  ["Mongolia", "MN", "+976"],
  ["Montenegro", "ME", "+382"],
  ["Morocco", "MA", "+212"],
  ["Mozambique", "MZ", "+258"],
  ["Myanmar", "MM", "+95"],
  ["Namibia", "NA", "+264"],
  ["Nepal", "NP", "+977"],
  ["Netherlands", "NL", "+31"],
  ["New Zealand", "NZ", "+64"],
  ["Nicaragua", "NI", "+505"],
  ["Nigeria", "NG", "+234"],
  ["North Macedonia", "MK", "+389"],
  ["Norway", "NO", "+47"],
  ["Oman", "OM", "+968"],
  ["Pakistan", "PK", "+92"],
  ["Panama", "PA", "+507"],
  ["Paraguay", "PY", "+595"],
  ["Peru", "PE", "+51"],
  ["Philippines", "PH", "+63"],
  ["Poland", "PL", "+48"],
  ["Portugal", "PT", "+351"],
  ["Qatar", "QA", "+974"],
  ["Romania", "RO", "+40"],
  ["Russia", "RU", "+7"],
  ["Rwanda", "RW", "+250"],
  ["Saudi Arabia", "SA", "+966"],
  ["Senegal", "SN", "+221"],
  ["Serbia", "RS", "+381"],
  ["Singapore", "SG", "+65"],
  ["Slovakia", "SK", "+421"],
  ["Slovenia", "SI", "+386"],
  ["South Africa", "ZA", "+27"],
  ["South Korea", "KR", "+82"],
  ["Spain", "ES", "+34"],
  ["Sri Lanka", "LK", "+94"],
  ["Sweden", "SE", "+46"],
  ["Switzerland", "CH", "+41"],
  ["Taiwan", "TW", "+886"],
  ["Tajikistan", "TJ", "+992"],
  ["Tanzania", "TZ", "+255"],
  ["Thailand", "TH", "+66"],
  ["Tunisia", "TN", "+216"],
  ["Turkey", "TR", "+90"],
  ["Turkmenistan", "TM", "+993"],
  ["Uganda", "UG", "+256"],
  ["Ukraine", "UA", "+380"],
  ["United Arab Emirates", "AE", "+971"],
  ["United Kingdom", "GB", "+44"],
  ["United States", "US", "+1"],
  ["Uruguay", "UY", "+598"],
  ["Uzbekistan", "UZ", "+998"],
  ["Venezuela", "VE", "+58"],
  ["Vietnam", "VN", "+84"],
  ["Yemen", "YE", "+967"],
  ["Zambia", "ZM", "+260"],
  ["Zimbabwe", "ZW", "+263"],
];

const ORG_TYPES: Array<[string, string]> = [
  ["ngo", "NGO"],
  ["foundation", "Foundation / Trust"],
  ["private_company", "Private Company"],
  ["corporation", "Corporation"],
  ["startup", "Startup / SME"],
  ["school", "School"],
  ["university", "University / College"],
  ["monastery", "Monastery / Goenpa"],
  ["shedra", "Shedra"],
  ["lhakhang", "Lhakhang"],
  ["religious", "Religious Group"],
  ["sangha", "Sangha / Dharma Group"],
  ["government", "Government Agency"],
  ["diplomatic", "Embassy / Diplomatic"],
  ["hospital", "Hospital / Healthcare"],
  ["cooperative", "Cooperative"],
  ["association", "Association / Society"],
  ["youth", "Youth Group"],
  ["sports", "Sports Club"],
  ["media", "Media / Press"],
  ["other", "Other"],
];

type Status = "idle" | "submitting" | "success" | "duplicate" | "error";

const initialForm = {
  orgName: "",
  orgType: "",
  country: "BT",
  countryCode: "+975",
  contactName: "",
  contactRole: "",
  email: "",
  phone: "",
  volunteerCount: "",
  volunteerCountMale: "",
  volunteerCountFemale: "",
  message: "",
};

export default function OrgFormModal() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Listen for global open events from form.js (button clicks + URL trigger).
  useEffect(() => {
    function handleOpen() {
      setOpen(true);
      setStatus("idle");
      setErrorMsg(null);
    }
    window.addEventListener("p108:open-org-form", handleOpen);
    return () => window.removeEventListener("p108:open-org-form", handleOpen);
  }, []);

  // Lock body scroll while open + focus management.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => firstInputRef.current?.focus(), 60);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape closes.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    setOpen(false);
    // Defer reset so the closing animation doesn't flicker mid-state.
    setTimeout(() => {
      setForm(initialForm);
      setStatus("idle");
      setErrorMsg(null);
    }, 300);
  }

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const totalNum = Number(form.volunteerCount || 0);
  const maleNum = Number(form.volunteerCountMale || 0);
  const femaleNum = Number(form.volunteerCountFemale || 0);
  const genderMismatch =
    !!form.volunteerCount && maleNum + femaleNum > totalNum;
  const isThanks = status === "success" || status === "duplicate";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (genderMismatch) {
      setErrorMsg("Men + women cannot exceed the total volunteer count.");
      return;
    }
    setStatus("submitting");
    setErrorMsg(null);

    const basePath = window.location.pathname.startsWith("/108") ? "/108" : "";
    const payload: Record<string, unknown> = {
      orgName: form.orgName.trim(),
      orgType: form.orgType,
      country: form.country,
      countryCode: form.countryCode || undefined,
      name: form.contactName.trim(),
      contactRole: form.contactRole.trim() || undefined,
      email: form.email.trim(),
      phone: form.phone.trim(),
      volunteerCount: totalNum,
    };
    if (form.volunteerCountMale !== "") payload.volunteerCountMale = maleNum;
    if (form.volunteerCountFemale !== "")
      payload.volunteerCountFemale = femaleNum;
    if (form.message.trim()) payload.message = form.message.trim();

    try {
      const res = await fetch(`${basePath}/api/submit/volunteers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 201) {
        setStatus("success");
        if (typeof window !== "undefined" && typeof (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag === "function") {
          (window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
            "event",
            "form_submit_success",
            { form_role: "organization" },
          );
        }
        return;
      }
      if (res.status === 409) {
        setStatus("duplicate");
        return;
      }
      let body: { error?: string; details?: { fieldErrors?: Record<string, string[]> } } = {};
      try {
        body = await res.json();
      } catch {
        /* ignore */
      }
      const firstFieldErr = body.details?.fieldErrors
        ? Object.values(body.details.fieldErrors)
            .flat()
            .filter(Boolean)[0]
        : null;
      setStatus("error");
      setErrorMsg(
        firstFieldErr ||
          body.error ||
          "Please check the form and try again.",
      );
    } catch (err) {
      console.warn("Org form submit failed", err);
      setStatus("error");
      setErrorMsg(
        "Couldn't reach the server. Please check your connection and try again.",
      );
    }
  }

  // Country code options are derived from COUNTRIES (deduped by dial code).
  const ccOptions = useMemo(() => {
    const seen = new Set<string>();
    return COUNTRIES.filter(([, iso, d]) => {
      const k = d + "|" + iso;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, []);

  return (
    <div
      className={`form-modal${open ? " is-open" : ""}`}
      id="org-form-modal"
      aria-hidden={open ? "false" : "true"}
      role="dialog"
      aria-modal="true"
      aria-labelledby="org-form-title"
    >
      <div className="form-modal__backdrop" onClick={close}></div>
      <div className="form-modal__sheet">
        <span
          className="form-modal__close"
          role="button"
          aria-label="Close"
          tabIndex={0}
          onClick={close}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") close();
          }}
        >
          ×
        </span>
        <p className="form-modal__lbl">Project 108 · Bhutan</p>
        <h3 className="form-modal__ttl" id="org-form-title">
          Mobilise as an <em>organization</em>.
        </h3>
        <p className="form-modal__lede">
          Register your organization to take part in the build day. Schools,
          monasteries, companies, and community groups all welcome.
        </p>

        <form
          className="form-modal__form"
          onSubmit={handleSubmit}
          noValidate
          hidden={isThanks}
        >
            {/* Organization */}
            <label className="field">
              <span className="field__lbl">Organization name</span>
              <input
                ref={firstInputRef}
                type="text"
                value={form.orgName}
                onChange={(e) => update("orgName", e.target.value)}
                placeholder="Legal / registered name"
                required
              />
            </label>

            <div className="form-row form-row--double">
              <label className="field">
                <span className="field__lbl">Organization type</span>
                <select
                  value={form.orgType}
                  onChange={(e) => update("orgType", e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select…
                  </option>
                  {ORG_TYPES.map(([v, label]) => (
                    <option key={v} value={v}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="field__lbl">Country</span>
                <select
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select…
                  </option>
                  {COUNTRIES.map(([name, iso]) => (
                    <option key={iso} value={iso}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Contact */}
            <div className="form-row form-row--double">
              <label className="field">
                <span className="field__lbl">Contact person</span>
                <input
                  type="text"
                  value={form.contactName}
                  onChange={(e) => update("contactName", e.target.value)}
                  autoComplete="name"
                  required
                />
              </label>
              <label className="field">
                <span className="field__lbl">
                  Role / title{" "}
                  <span className="field__opt">(optional)</span>
                </span>
                <input
                  type="text"
                  value={form.contactRole}
                  onChange={(e) => update("contactRole", e.target.value)}
                  placeholder="e.g. Program Director"
                />
              </label>
            </div>

            <label className="field">
              <span className="field__lbl">Contact email</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                autoComplete="email"
                required
              />
            </label>

            <div className="form-row form-row--phone">
              <label className="field field--cc">
                <span className="field__lbl">Country code</span>
                <select
                  value={form.countryCode}
                  onChange={(e) => update("countryCode", e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select…
                  </option>
                  {ccOptions.map(([name, iso, d]) => (
                    <option key={iso + d} value={d}>
                      {d} &nbsp;{name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="field__lbl">Phone number</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  inputMode="numeric"
                  autoComplete="tel-national"
                  required
                />
              </label>
            </div>

            {/* Commitment */}
            <label className="field">
              <span className="field__lbl">
                How many volunteers can you mobilise?
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                value={form.volunteerCount}
                onChange={(e) =>
                  update(
                    "volunteerCount",
                    e.target.value.replace(/[^\d]/g, ""),
                  )
                }
                placeholder="Total volunteers"
                required
              />
            </label>

            <div className="form-row form-row--double">
              <label className="field">
                <span className="field__lbl">
                  Of which, men <span className="field__opt">(optional)</span>
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  value={form.volunteerCountMale}
                  onChange={(e) =>
                    update(
                      "volunteerCountMale",
                      e.target.value.replace(/[^\d]/g, ""),
                    )
                  }
                />
              </label>
              <label className="field">
                <span className="field__lbl">
                  Of which, women{" "}
                  <span className="field__opt">(optional)</span>
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  value={form.volunteerCountFemale}
                  onChange={(e) =>
                    update(
                      "volunteerCountFemale",
                      e.target.value.replace(/[^\d]/g, ""),
                    )
                  }
                />
              </label>
            </div>

            <label className="field">
              <span className="field__lbl">
                Message <span className="field__opt">(optional)</span>
              </span>
              <textarea
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                rows={3}
                placeholder="Anything we should know about your organization or readiness."
              />
            </label>

            <p
              className="form-modal__error"
              role="alert"
              aria-live="polite"
              hidden={!errorMsg && !genderMismatch}
            >
              {errorMsg ||
                "Men + women cannot exceed the total volunteer count."}
            </p>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={close}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn"
                disabled={status === "submitting"}
              >
                {status === "submitting" ? "Sending…" : "Submit"}
              </button>
            </div>
            <p className="form-modal__small">
              By submitting, you consent to be contacted by the Gelephu
              Mindfulness City Authority.
            </p>
          </form>

          <div
            className={`form-modal__thanks${
              status === "duplicate" ? " is-duplicate" : ""
            }`}
            hidden={!isThanks}
          >
            <p className="lbl">
              {status === "duplicate" ? "Already received" : "Thank you"}
            </p>
            <h4>
              {status === "duplicate"
                ? "Your organization is already with us."
                : "Your organization's registration has been received. We will get in touch."}
            </h4>
            <p>
              {status === "duplicate"
                ? "A registration for this organization has been received from this contact email. Our team will be in touch with the next steps."
                : "The Project 108 team will get back to all interested organizations with details on mobilisation, training, and confirmation."}
            </p>
            <button type="button" className="btn" onClick={close}>
              Close
            </button>
          </div>
      </div>
    </div>
  );
}
