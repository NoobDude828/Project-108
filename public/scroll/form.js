/* ============================================================
   Project 108 — Sign-up form modal
   Handles open/close, country populate, role pre-select, submit.
   ============================================================ */
(function () {
  "use strict";

  const modal = document.getElementById("form-modal");
  if (!modal) return;
  const sheet = modal.querySelector(".form-modal__sheet");
  const form = modal.querySelector("#signup-form");
  const thanksBox = modal.querySelector(".form-modal__thanks");
  const titleEl = modal.querySelector("#form-title");
  const ledeEl = modal.querySelector(".form-modal__lede");

  /* -------- Country list (name, ISO-2, dial code) -------- */
  const COUNTRIES = [
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

  /* -------- Populate country selects (lazy — only when present in DOM) -------- */
  function populateCountries() {
    const ccSelect = form.querySelector('select[name="country_code"]');
    const countrySel = form.querySelector('select[name="country"]');

    if (ccSelect && !ccSelect.options.length) {
      const ccOpts = ['<option value="" disabled selected>Select…</option>'];
      const seen = new Set();
      COUNTRIES.forEach(([n, iso, d]) => {
        const k = d + "|" + iso;
        if (seen.has(k)) return;
        seen.add(k);
        ccOpts.push(`<option value="${d}">${d} &nbsp;${n}</option>`);
      });
      ccSelect.innerHTML = ccOpts.join("");
    }

    if (countrySel && !countrySel.options.length) {
      const cOpts = ['<option value="" disabled selected>Select…</option>'];
      COUNTRIES.forEach(([n, iso]) => {
        cOpts.push(`<option value="${iso}">${n}</option>`);
      });
      countrySel.innerHTML = cOpts.join("");
    }
  }

  // Expose so React can call it after non-bhutanese fields mount
  window.__p108PopulateCountries = populateCountries;

  /* -------- Open / close -------- */
  let lastFocused = null;

  function openModal(role) {
    populateCountries(); // idempotent
    if (role) {
      const radio = form.querySelector(`input[name="role"][value="${role}"]`);
      if (radio) radio.checked = true;
    }
    if (role === "patron") {
      titleEl.innerHTML = "Offer a <em>chorten</em>.";
      ledeEl.innerHTML =
        "One chorten. One offering. From <em>USD 200,000</em> — flexible by conversation.";
    } else if (role === "volunteer") {
      titleEl.innerHTML = "Register to <em>volunteer</em>.";
      ledeEl.textContent =
        "Leave your details — we will share next steps for the build day on 1 November 2026.";
    } else {
      titleEl.innerHTML = "Take <em>part</em>.";
      ledeEl.textContent =
        "Leave your details and we will be in touch with the next steps.";
    }
    form.hidden = false;
    thanksBox.hidden = true;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lastFocused = document.activeElement;
    // focus first focusable
    setTimeout(() => {
      const first = form.querySelector("input,select,textarea,button");
      first && first.focus();
    }, 60);
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  /* -------- Wire up triggers -------- */
  document.querySelectorAll("[data-open-form]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const role = btn.getAttribute("data-open-form");
      openModal(role);
    });
  });
  document.querySelectorAll("[data-close-form]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal();
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  /* -------- Google Forms backend -------- */
  // Replace these placeholders with real IDs from your Google Form.
  // To get them: open your form → ⋮ → "Get pre-filled link" → fill all
  // fields → "Get link" → grab `entry.NNN` IDs from the URL. The form
  // endpoint is https://docs.google.com/forms/d/e/{FORM_ID}/formResponse
  const GOOGLE_FORM = {
    formId: "1FAIpQLSe_REPLACE_WITH_REAL_FORM_ID_xxxxxxxxxxxxxx",
    fields: {
      role: "entry.1000000001",
      name: "entry.1000000002",
      email: "entry.1000000003",
      country_code: "entry.1000000004",
      phone: "entry.1000000005",
      country: "entry.1000000006",
      message: "entry.1000000007",
    },
  };

  function submitToGoogleForm(data) {
    const url = `https://docs.google.com/forms/d/e/${GOOGLE_FORM.formId}/formResponse`;
    const body = new FormData();
    Object.entries(GOOGLE_FORM.fields).forEach(([key, entryId]) => {
      if (data[key] != null) body.append(entryId, data[key]);
    });
    // Google Forms doesn't send CORS headers; no-cors makes the request
    // fire-and-forget. We can't read the response, so we treat any
    // non-throw as success.
    return fetch(url, { method: "POST", mode: "no-cors", body });
  }

  /* -------- Submit handler -------- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());

    try {
      await submitToGoogleForm(data);
    } catch (err) {
      // no-cors swallows most errors; log just in case
      console.warn("Form submit error", err);
    }

    // Show thanks state
    form.hidden = true;
    thanksBox.hidden = false;
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit";
    setTimeout(() => form.reset(), 400);
  });

  // Pre-populate countries on first load (so screenshots/print show real options)
  populateCountries();
})();
