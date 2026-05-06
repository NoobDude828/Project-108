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
  // The role drives endpoint selection — patron → /patrons, volunteer → /volunteers.
  // (The endpoint *is* the role per the API contract; we don't send it in the body.)
  let currentRole = null;

  function openModal(role) {
    populateCountries(); // idempotent
    currentRole = role || null;
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
    resetFormError();
    resetThanks();
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

  /* -------- 108 Submission API ----------------------------------------
     Contract is documented in 108-BE.md. Endpoint per role:
       patron    → POST {basePath}/api/submit/patrons
       volunteer → POST {basePath}/api/submit/volunteers
     We POST to a same-origin Next Route Handler (app/api/submit/[role]/route.ts)
     which forwards server-side to https://gmc.bt/api/{patrons|volunteers}.
     This sidesteps CORS preflight failures that were silently blocking the
     direct browser-to-upstream call.
     Body shape differs by nationality (bhutanese vs non-bhutanese).
     Server enriches Bhutanese submissions with name/dob/gender via DOI.
  --------------------------------------------------------------------- */
  // Detect Next basePath at runtime from the current URL.
  // Prod (gmc.bt/108/...): "/108". Dev (localhost:3000/...): "".
  // Reading window.location avoids hardcoding the prefix in two places.
  const BASE_PATH = window.location.pathname.startsWith("/108") ? "/108" : "";
  const API_BASE = BASE_PATH + "/api/submit";

  const trim = (v) => (typeof v === "string" ? v.trim() : v);

  function buildPayload(fd) {
    const nationality = fd.get("nationality");
    if (nationality === "bhutanese") {
      return {
        nationality: "bhutanese",
        cid: trim(fd.get("cid")),
        countryCode: "+975",
        phone: trim(fd.get("phone")),
      };
    }
    const payload = {
      nationality: "non-bhutanese",
      name: trim(fd.get("name")),
      email: trim(fd.get("email")),
      countryCode: trim(fd.get("country_code")),
      phone: trim(fd.get("phone")),
      country: trim(fd.get("country")),
    };
    const message = trim(fd.get("message"));
    if (message) payload.message = message;
    return payload;
  }

  async function postSubmission(role, payload) {
    const path = role === "patron" ? "/patrons" : "/volunteers";
    const res = await fetch(API_BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    let body = null;
    try {
      body = await res.json();
    } catch (_) {
      /* non-JSON or empty — leave body null */
    }
    return { status: res.status, body };
  }

  async function postWithRetry(role, payload) {
    const first = await postSubmission(role, payload);
    if (first.status !== 500) return first;
    // Spec: retry 500 once after 1s before giving up.
    await new Promise((r) => setTimeout(r, 1000));
    return postSubmission(role, payload);
  }

  /* -------- Error / thanks UI helpers -------- */
  const errorEl = modal.querySelector(".form-modal__error");
  function showFormError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }
  function resetFormError() {
    if (!errorEl) return;
    errorEl.textContent = "";
    errorEl.hidden = true;
  }

  const thanksLblEl = thanksBox.querySelector(".lbl");
  const thanksTitleEl = thanksBox.querySelector("h4");
  const thanksDescEl = thanksBox.querySelector("p:not(.lbl)");

  // Brand voice: measured third-person, sentence-case body, no exclamation, British spelling.
  // Success copy varies by role; duplicate copy varies by role × matched identifier
  // (the API dedupes by CID for Bhutanese, by email for non-Bhutanese).
  const SUCCESS_COPY = {
    patron: {
      lbl: "Thank you",
      title: "Your offering is received.",
      desc: "Project 108 welcomes you to this collective act of merit. Our team will be in touch shortly to begin the conversation.",
    },
    volunteer: {
      lbl: "Thank you",
      title: "Your registration is received.",
      desc: "Project 108 welcomes you to this collective act of merit. Our team will be in touch shortly with the next steps for 1 November 2026.",
    },
  };
  const DUPLICATE_COPY = {
    patron: {
      cid: {
        lbl: "Already received",
        title: "Your offering is already with us.",
        desc: "An offering for Project 108 has been registered against this Citizenship Identity Card. Our team will be in touch with the next steps.",
      },
      email: {
        lbl: "Already received",
        title: "Your offering is already with us.",
        desc: "An offering for Project 108 has been registered from this email address. Our team will be in touch with the next steps.",
      },
    },
    volunteer: {
      cid: {
        lbl: "Already received",
        title: "Your registration is already with us.",
        desc: "A volunteer registration has been received against this Citizenship Identity Card. Our team will be in touch with the next steps.",
      },
      email: {
        lbl: "Already received",
        title: "Your registration is already with us.",
        desc: "A volunteer registration has been received from this email address. Our team will be in touch with the next steps.",
      },
    },
  };
  function showThanks(variant, opts) {
    // variant: "success" | "duplicate".
    // opts: { role: "patron" | "volunteer", idType?: "cid" | "email" (duplicate only) }
    const role = opts && opts.role === "volunteer" ? "volunteer" : "patron";
    let copy;
    if (variant === "duplicate") {
      const idType = opts && opts.idType === "email" ? "email" : "cid";
      copy = DUPLICATE_COPY[role][idType];
      thanksBox.classList.add("is-duplicate");
    } else {
      copy = SUCCESS_COPY[role];
      thanksBox.classList.remove("is-duplicate");
    }
    if (thanksLblEl) thanksLblEl.textContent = copy.lbl;
    if (thanksTitleEl) thanksTitleEl.textContent = copy.title;
    if (thanksDescEl) thanksDescEl.textContent = copy.desc;
    form.hidden = true;
    thanksBox.hidden = false;
  }
  function resetThanks() {
    // Just hide the thanks box and clear the duplicate-variant accent.
    // Copy is rewritten on every showThanks() call, so no text reset needed here.
    thanksBox.classList.remove("is-duplicate");
    thanksBox.hidden = true;
    form.hidden = false;
  }

  function firstFieldError(details) {
    const fe = details && details.fieldErrors;
    if (!fe || typeof fe !== "object") return null;
    for (const key of Object.keys(fe)) {
      const arr = fe[key];
      if (Array.isArray(arr) && arr.length) return arr[0];
    }
    return null;
  }

  /* -------- Submit handler -------- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    resetFormError();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    const fd = new FormData(form);
    const payload = buildPayload(fd);

    // Defence-in-depth: API re-validates these but a client check avoids a round-trip.
    if (payload.nationality === "bhutanese" && !/^\d{11}$/.test(payload.cid || "")) {
      showFormError("CID must be exactly 11 digits.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit";
      return;
    }

    const role = currentRole === "volunteer" ? "volunteer" : "patron";

    let result;
    try {
      result = await postWithRetry(role, payload);
    } catch (err) {
      console.warn("Submission network error", err);
      showFormError(
        "Couldn't reach the server. Please check your connection and try again.",
      );
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit";
      return;
    }

    if (result.status === 201) {
      showThanks("success", { role });
      setTimeout(() => form.reset(), 400);
    } else if (result.status === 409) {
      showThanks("duplicate", {
        role,
        idType: payload.nationality === "bhutanese" ? "cid" : "email",
      });
      setTimeout(() => form.reset(), 400);
    } else if (result.status === 400) {
      const msg =
        firstFieldError(result.body && result.body.details) ||
        (result.body && result.body.error) ||
        "Please check the form and try again.";
      showFormError(msg);
    } else {
      showFormError(
        "Something went wrong. Please try again in a moment.",
      );
    }

    submitBtn.disabled = false;
    submitBtn.textContent = "Submit";
  });

  // Pre-populate countries on first load (so screenshots/print show real options)
  populateCountries();
})();
