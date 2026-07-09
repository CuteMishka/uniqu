(function () {
  const state = {
    content: null,
    lang: "ru",
    budgets: null,
    gpa: null
  };

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

  const escapeHtml = (value = "") =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const text = (selector, value) => {
    const element = qs(selector);
    if (element && value !== undefined) {
      element.textContent = value;
    }
  };

  const html = (selector, value) => {
    const element = qs(selector);
    if (element && value !== undefined) {
      element.innerHTML = value;
    }
  };

  const setButton = (button, label, icon = "arrow-right") => {
    if (!button) return;
    button.innerHTML = `${escapeHtml(label)} <i data-lucide="${escapeHtml(icon)}"></i>`;
  };

  const counterAttributes = (value) => {
    const match = String(value ?? "").match(/\d[\d\s.,]*/);
    const target = match?.[0]?.replace(/\D/g, "");
    return target ? ` data-counter="${escapeHtml(target)}"` : "";
  };

  const openLeadModal = () => {
    const modal = qs("[data-modal]");
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const getTranslation = () => {
    const translations = state.content?.translations || {};
    return translations[state.lang] || translations.ru || Object.values(translations)[0] || {};
  };

  const getLangFromUrl = () => new URLSearchParams(window.location.search).get("lang");

  const setCurrentLang = (lang, options = {}) => {
    const { persist = true } = options;
    const available = state.content.settings.languages.map((item) => item.code);
    state.lang = available.includes(lang) ? lang : state.content.settings.defaultLanguage;
    if (persist) {
      localStorage.setItem("uniqu-lang", state.lang);
    }
    document.documentElement.lang = state.lang === "kz" ? "kk" : state.lang;
  };

  const getCurrentLanguage = () => {
    const languages = state.content?.settings?.languages || [];
    return languages.find((language) => language.code === state.lang) || languages[0] || { code: "ru", label: "RU", name: "Русский" };
  };

  const closeLanguageMenus = () => {
    qsa(".lang-switcher.is-open").forEach((switcher) => {
      switcher.classList.remove("is-open");
      qs(".lang-current", switcher)?.setAttribute("aria-expanded", "false");
    });
  };

  const selectLanguage = (lang) => {
    setCurrentLang(lang);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", state.lang);
    history.replaceState(null, "", url);
    renderSite();
    closeLanguageMenus();

    const mobileMenu = qs("[data-menu]");
    if (mobileMenu?.classList.contains("is-open")) {
      mobileMenu.classList.remove("is-open");
      document.body.style.overflow = "";
    }
  };

  const bindLanguageGlobalEvents = () => {
    if (document.documentElement.dataset.langMenuBound === "true") return;
    document.documentElement.dataset.langMenuBound = "true";

    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Element) || event.target.closest(".lang-switcher")) return;
      closeLanguageMenus();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeLanguageMenus();
    });
  };

  const fetchContent = async () => {
    const apiResponse = await fetch("/api/content", { cache: "no-store" }).catch(() => null);
    if (apiResponse?.ok) return apiResponse.json();

    const staticResponse = await fetch("data/site-content.json", { cache: "no-store" });
    return staticResponse.json();
  };

  const ensureMeta = (selector, createAttributes) => {
    let element = qs(selector);
    if (!element) {
      element = document.createElement("meta");
      Object.entries(createAttributes).forEach(([key, value]) => element.setAttribute(key, value));
      document.head.appendChild(element);
    }
    return element;
  };

  const updateSeo = (t) => {
    const { settings } = state.content;
    document.title = t.seo.title;

    ensureMeta('meta[name="description"]', { name: "description" }).setAttribute("content", t.seo.description);
    ensureMeta('meta[name="keywords"]', { name: "keywords" }).setAttribute("content", t.seo.keywords || "");
    ensureMeta('meta[property="og:title"]', { property: "og:title" }).setAttribute("content", t.seo.title);
    ensureMeta('meta[property="og:description"]', { property: "og:description" }).setAttribute("content", t.seo.description);
    ensureMeta('meta[property="og:type"]', { property: "og:type" }).setAttribute("content", "website");
    ensureMeta('meta[property="og:url"]', { property: "og:url" }).setAttribute("content", `${settings.siteUrl}?lang=${state.lang}`);
    ensureMeta('meta[name="twitter:card"]', { name: "twitter:card" }).setAttribute("content", "summary_large_image");

    let canonical = qs('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = settings.siteUrl;

    qsa('link[rel="alternate"]').forEach((item) => item.remove());
    state.content.settings.languages.forEach((language) => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = language.code === "kz" ? "kk" : language.code;
      link.href = `${settings.siteUrl}?lang=${language.code}`;
      link.dataset.generated = "true";
      document.head.appendChild(link);
    });

    const defaultLink = document.createElement("link");
    defaultLink.rel = "alternate";
    defaultLink.hreflang = "x-default";
    defaultLink.href = settings.siteUrl;
    defaultLink.dataset.generated = "true";
    document.head.appendChild(defaultLink);

    const schema = {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      name: "UNIQU",
      url: settings.siteUrl,
      description: t.seo.description,
      email: settings.contacts.email,
      telephone: settings.contacts.phones[0],
      address: {
        "@type": "PostalAddress",
        streetAddress: settings.contacts.address,
        addressLocality: "Алматы",
        addressCountry: "KZ"
      },
      sameAs: [`https://wa.me/${settings.contacts.whatsapp}`]
    };

    let script = qs("#structured-data");
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "structured-data";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);
  };

  const renderLanguages = () => {
    const languages = state.content.settings.languages || [];
    const current = getCurrentLanguage();

    qsa(".lang-switcher").forEach((switcher) => {
      switcher.innerHTML = `
        <button class="lang-current" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="Выбрать язык, сейчас ${escapeHtml(current.name)}">
          <span>${escapeHtml(current.label)}</span>
          <i data-lucide="chevron-down"></i>
        </button>
        <div class="lang-menu" role="listbox" aria-label="Выбор языка">
          ${languages
            .map((language) => {
              const isActive = language.code === state.lang;
              return `<button class="lang-option${isActive ? " is-active" : ""}" type="button" role="option" aria-selected="${isActive}" data-lang="${escapeHtml(language.code)}">
                <span>${escapeHtml(language.name)}</span>
                <small>${escapeHtml(language.label)}</small>
              </button>`;
            })
            .join("")}
        </div>`;

      const currentButton = qs(".lang-current", switcher);
      currentButton?.addEventListener("click", () => {
        const shouldOpen = !switcher.classList.contains("is-open");
        closeLanguageMenus();
        switcher.classList.toggle("is-open", shouldOpen);
        currentButton.setAttribute("aria-expanded", String(shouldOpen));
      });
    });

    qsa(".mobile-lang-switcher").forEach((switcher) => {
      switcher.innerHTML = languages
        .map(
          (language) =>
            `<button class="lang-option${language.code === state.lang ? " is-active" : ""}" type="button" data-lang="${escapeHtml(language.code)}" title="${escapeHtml(language.name)}">${escapeHtml(language.label)}</button>`
        )
        .join("");
    });

    qsa("[data-lang]").forEach((button) => {
      button.addEventListener("click", () => selectLanguage(button.dataset.lang));
    });

    bindLanguageGlobalEvents();
  };

  const renderNav = (t) => {
    const labels = {
      "#about": t.nav.about,
      "#programs": t.nav.programs,
      "#countries": t.nav.countries,
      "#services": t.nav.services,
      "#reviews": t.nav.reviews,
      "#cases": t.nav.cases,
      "#faq": t.nav.faq,
      "#contacts": t.nav.contacts
    };

    qsa(".desktop-nav a, .mobile-menu a, .footer a").forEach((link) => {
      const href = link.getAttribute("href");
      if (labels[href]) link.textContent = labels[href];
    });
  };

  const renderHero = (t) => {
    text(".hero .eyebrow", t.hero.eyebrow);
    html(
      ".hero h1",
      `${escapeHtml(t.hero.titleBefore)} <em>${escapeHtml(t.hero.titleAccent)}</em> ${escapeHtml(t.hero.titleAfter)}`
    );
    text(".hero__lead", t.hero.lead);
    setButton(qs(".hero [data-open-modal]"), t.hero.cta);

    const media = qs(".hero__media");
    if (media) {
      media.style.background =
        "radial-gradient(circle at 78% 28%, rgba(223, 141, 0, 0.18), transparent 36%), radial-gradient(circle at 12% 74%, rgba(233, 194, 125, 0.1), transparent 32%), linear-gradient(135deg, #070912, #101827 58%, #15100c)";
    }
  };

  const renderPrograms = (t) => {
    const strip = qs(".program-strip");
    if (!strip) return;
    strip.innerHTML = t.programs
      .map(
        (item) => `
          <article class="program-card reveal">
            <i data-lucide="${escapeHtml(item.icon)}"></i>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.text)}</p>
          </article>
        `
      )
      .join("");
  };

  const renderAbout = (t) => {
    const about = t.about;
    if (!about) return;

    text(".about .eyebrow", about.eyebrow);
    text(".about h2", about.title);

    const copy = qs(".about-copy");
    if (copy) {
      copy.innerHTML = about.copy.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
    }

    const photos = qs(".about-photos");
    if (photos) {
      photos.innerHTML = about.images
        .map(
          (image) => `
            <figure class="about-photo reveal">
              <img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" loading="lazy" />
            </figure>
          `
        )
        .join("");
    }

    const why = t.why;
    if (!why) return;
    text(".why-section h2", why.title);

    const whyGrid = qs(".why-grid");
    if (whyGrid) {
      whyGrid.innerHTML = why.items
        .map(
          (item) => `
            <article class="why-card reveal">
              <strong${counterAttributes(item.value)}>${escapeHtml(item.value)}</strong>
              <span>${escapeHtml(item.label)}</span>
            </article>
          `
        )
        .join("");
    }

    const whyList = qs(".why-list");
    if (whyList) {
      whyList.innerHTML = why.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("");
    }
  };

  const renderUniversities = (t) => {
    text(".universities .eyebrow", t.universities.eyebrow);
    text(".universities h2", t.universities.title);
    const track = qs("[data-university-track]");
    if (!track) return;
    track.innerHTML = t.universities.items
      .map(
        (item) => `
          <article class="university-card">
            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy" />
            <div>
              <span>${escapeHtml(item.country)}</span>
              <h3>${escapeHtml(item.name)}</h3>
              <p>${escapeHtml(item.text)}</p>
            </div>
          </article>
        `
      )
      .join("");
  };

  const renderServices = (t) => {
    text(".services .eyebrow", t.services.eyebrow);
    html(".services h2", escapeHtml(t.services.title).replace("индивидуально", "<em>индивидуально</em>"));
    text(".services .section-copy", t.services.copy);
    const grid = qs(".service-grid");
    if (!grid) return;
    grid.innerHTML = t.services.items
      .map(
        (item) => `
          <article class="service-item reveal">
            <span><i data-lucide="${escapeHtml(item.icon)}"></i></span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.text)}</p>
          </article>
        `
      )
      .join("");
  };

  const renderMoveFear = (t) => {
    const section = t.moveFear;
    if (!section) return;

    text(".move-fear .eyebrow", section.eyebrow);
    text(".move-fear h2", section.title);
    text(".move-fear .section-copy", section.copy);
    text(".move-fear__summary > span", section.summaryLabel);
    text(".move-fear__summary > strong", section.summaryTitle);
    text(".move-fear__summary > p", section.summaryCopy);

    const timeline = qs(".move-fear__timeline");
    if (timeline) {
      timeline.innerHTML = section.timeline
        .map(
          (item) => `
            <div>
              <span>${escapeHtml(item.number)}</span>
              <strong>${escapeHtml(item.title)}</strong>
              <p>${escapeHtml(item.text)}</p>
            </div>
          `
        )
        .join("");
    }

    const grid = qs(".move-fear__grid");
    if (grid) {
      grid.innerHTML = section.items
        .map(
          (item) => `
            <article class="move-card reveal">
              <i data-lucide="${escapeHtml(item.icon)}"></i>
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.text)}</p>
            </article>
          `
        )
        .join("");
    }
  };

  const renderFacts = (t) => {
    text(".facts .eyebrow", t.facts.eyebrow);
    html(".facts h2", escapeHtml(t.facts.title).replace("реальный грант", "<em>реальный грант</em>"));
    text(".facts .section-copy", t.facts.copy);
    const grid = qs(".fact-grid");
    if (!grid) return;
    grid.innerHTML = t.facts.items
      .map(
        (item) => `
          <div class="fact reveal">
            <strong${counterAttributes(item.value)}>${Number(item.value).toLocaleString("ru-RU")}${escapeHtml(item.suffix || "")}</strong>
            <span>${escapeHtml(item.label)}</span>
          </div>
        `
      )
      .join("");
  };

  const renderCountries = (t) => {
    text(".countries .eyebrow", t.countries.eyebrow);
    html(".countries h2", escapeHtml(t.countries.title).replace(/страну|елді|country|davlatni/i, (match) => `<em>${match}</em>`));
    const grid = qs(".country-grid");
    if (!grid) return;
    const countrySlugs = ["china", "italy", "turkey"];
    grid.innerHTML = t.countries.items
      .map((item, index) => {
        const slug = item.slug || countrySlugs[index] || "";
        const href = slug ? `/${slug}` : "#contacts";
        return `
          <a class="country reveal" href="${escapeHtml(href)}" aria-label="${escapeHtml(item.name)}" style="--country-image: url('${escapeHtml(item.image)}')">
            <div>
              <p>${escapeHtml(item.meta)}</p>
              <h3>${escapeHtml(item.name)}</h3>
            </div>
            <ul>${item.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>
            <span>${escapeHtml(item.result)}</span>
            <strong class="country__more">${escapeHtml(t.countries.moreLabel || "Узнать больше")}</strong>
          </a>
        `;
      })
      .join("");
  };

  const renderCountryDetails = (t) => {
    const section = t.countryDetails;
    if (!section) return;

    text(".country-details .eyebrow", section.eyebrow);
    text(".country-details h2", section.title);

    const tabs = qs(".country-detail-tabs");
    if (!tabs) return;

    const keys = ["china", "italy", "turkey"];
    const images = [
      "https://images.unsplash.com/photo-1548919973-5cef591cdbc9?auto=format&fit=crop&w=1100&q=85",
      "https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=1100&q=85",
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1100&q=85"
    ];

    const nav = section.items
      .map((item, index) => {
        const key = keys[index] || `country-${index + 1}`;
        return `
          <button class="country-detail-tab ${index === 0 ? "is-active" : ""}" id="country-tab-${escapeHtml(key)}" type="button" role="tab" aria-selected="${index === 0 ? "true" : "false"}" aria-controls="country-panel-${escapeHtml(key)}" data-country-tab="${escapeHtml(key)}">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <strong>${escapeHtml(item.name)}</strong>
            <small>${escapeHtml(item.benefits?.[0] || item.programs?.[0] || "")}</small>
          </button>
        `;
      })
      .join("");

    const panels = section.items
      .map((item, index) => {
        const key = keys[index] || `country-${index + 1}`;
        return `
          <article class="country-detail-panel ${index === 0 ? "is-active" : ""}" id="country-panel-${escapeHtml(key)}" role="tabpanel" aria-labelledby="country-tab-${escapeHtml(key)}" data-country-panel="${escapeHtml(key)}" style="--country-detail-image: url('${escapeHtml(images[index] || images[0])}')">
            <div class="country-detail-visual" aria-hidden="true">
              <span>${String(index + 1).padStart(2, "0")}</span>
              <strong>${escapeHtml(item.name)}</strong>
            </div>
            <div class="country-detail-content">
              <h3>${escapeHtml(item.name)}</h3>
              <p>${escapeHtml(item.copy)}</p>
              <div class="country-detail__columns">
                <div>
                  <strong>Программы</strong>
                  <ul>${item.programs.map((program) => `<li>${escapeHtml(program)}</li>`).join("")}</ul>
                </div>
                <div>
                  <strong>Преимущества</strong>
                  <ul>${item.benefits.map((benefit) => `<li>${escapeHtml(benefit)}</li>`).join("")}</ul>
                </div>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    tabs.innerHTML = `
      <div class="country-detail-nav" role="tablist" aria-label="${escapeHtml(section.title)}">${nav}</div>
      <div class="country-detail-stage">${panels}</div>
    `;
    window.initCountryTabs?.(tabs);
  };

  const renderConsult = (t) => {
    text(".consult-band .eyebrow", t.consult.eyebrow);
    text(".consult-band h2", t.consult.title);
    const paragraph = qs(".consult-band__text p:last-child");
    if (paragraph) paragraph.textContent = t.consult.copy;
    setButton(qs(".consult-band [data-open-modal]"), t.consult.cta);
  };

  const renderCalculator = (t) => {
    text(".calculator .eyebrow", t.calculator.eyebrow);
    text(".calculator h2", t.calculator.title);
    const intro = qs(".calculator__intro p:last-child");
    if (intro) intro.textContent = t.calculator.copy;

    const labels = qsa(".calculator__panel label");
    if (labels[0]) labels[0].childNodes[0].textContent = `${t.calculator.levelLabel} `;
    if (labels[1]) labels[1].childNodes[0].textContent = `${t.calculator.countryLabel} `;

    const levelSelect = qs("#levelSelect");
    const countrySelect = qs("#countrySelect");
    if (levelSelect) {
      Object.entries(t.calculator.levels).forEach(([value, label]) => {
        const option = qs(`option[value="${value}"]`, levelSelect);
        if (option) option.textContent = label;
      });
    }
    if (countrySelect) {
      Object.entries(t.calculator.countries).forEach(([value, label]) => {
        const option = qs(`option[value="${value}"]`, countrySelect);
        if (option) option.textContent = label;
      });
    }

    text(".result-box span", t.calculator.resultLabel);
    text(".result-box p", t.calculator.resultNote);
    setButton(qs(".calculator [data-open-modal]"), t.calculator.cta);
    state.budgets = t.calculator.budgets;
    updateBudget();
  };

  const updateBudget = () => {
    const levelSelect = qs("#levelSelect");
    const countrySelect = qs("#countrySelect");
    const result = qs("#budgetResult");
    if (!levelSelect || !countrySelect || !result || !state.budgets) return;
    result.textContent = state.budgets[levelSelect.value]?.[countrySelect.value] || "";
  };

  const getGpaLabels = () => state.gpa || getTranslation().gpa || {};

  const updateGpaLabels = () => {
    const labels = getGpaLabels();
    qsa("[data-gpa-subject-label]").forEach((item) => {
      item.textContent = labels.subjectLabel || "Subject";
    });
    qsa("[data-gpa-grade-label]").forEach((item) => {
      item.textContent = labels.gradeLabel || "Grade";
    });
    qsa("[data-gpa-credit-label]").forEach((item) => {
      item.textContent = labels.creditLabel || "Credit";
    });
    qsa("[data-gpa-remove]").forEach((button) => {
      button.setAttribute("aria-label", labels.removeLabel || "Remove subject");
    });
  };

  const createGpaRow = () => {
    const labels = getGpaLabels();
    const row = document.createElement("div");
    row.className = "gpa-row is-added";
    row.dataset.gpaRow = "true";
    row.innerHTML = `
      <label>
        <span data-gpa-subject-label>${escapeHtml(labels.subjectLabel || "Subject")}</span>
        <input type="text" placeholder="${escapeHtml(labels.subjectPlaceholder || "Subject")}" />
      </label>
      <label>
        <span data-gpa-grade-label>${escapeHtml(labels.gradeLabel || "Grade")}</span>
        <input data-gpa-grade type="number" min="0" max="100" step="0.1" placeholder="90" />
      </label>
      <label>
        <span data-gpa-credit-label>${escapeHtml(labels.creditLabel || "Credit")}</span>
        <input data-gpa-credit type="number" min="0.1" max="20" step="0.5" value="1" />
      </label>
      <button class="gpa-row__remove" type="button" data-gpa-remove aria-label="${escapeHtml(labels.removeLabel || "Remove subject")}">×</button>
    `;
    return row;
  };

  const updateGpaCalculator = () => {
    const labels = getGpaLabels();
    const averageElement = qs("[data-gpa-average]");
    const gpaElement = qs("[data-gpa-four]");
    const noteElement = qs("[data-gpa-note]");
    const resultBox = qs(".gpa-result");
    const meter = qs("[data-gpa-meter]");
    if (!averageElement || !gpaElement || !noteElement) return;

    let weightedSum = 0;
    let creditSum = 0;

    qsa("[data-gpa-row]").forEach((row) => {
      const gradeInput = qs("[data-gpa-grade]", row);
      const gradeText = String(gradeInput?.value || "").trim();
      if (!gradeText) return;

      const grade = Number(gradeText);
      const creditValue = Number(qs("[data-gpa-credit]", row)?.value);
      const credits = Number.isFinite(creditValue) && creditValue > 0 ? creditValue : 1;

      if (!Number.isFinite(grade) || grade < 0 || grade > 100) return;

      weightedSum += grade * credits;
      creditSum += credits;
    });

    if (!creditSum) {
      averageElement.textContent = "—";
      gpaElement.textContent = `${labels.gpaPrefix || "GPA"} — / 4.0`;
      noteElement.textContent = labels.emptyNote || "";
      resultBox?.style.setProperty("--gpa-progress", "0%");
      if (meter) meter.style.transform = "scaleX(0)";
      return;
    }

    const average = weightedSum / creditSum;
    const gpa = Math.min(4, Math.max(0, average / 25));
    averageElement.textContent = average.toFixed(1);
    gpaElement.textContent = `${labels.gpaPrefix || "GPA"} ${gpa.toFixed(2)} / 4.0`;
    resultBox?.style.setProperty("--gpa-progress", `${Math.max(0, Math.min(100, average))}%`);
    if (meter) meter.style.transform = `scaleX(${Math.max(0, Math.min(100, average)) / 100})`;
    if (resultBox && !resultBox.classList.contains("is-updating")) {
      resultBox.classList.add("is-updating");
      window.setTimeout(() => resultBox.classList.remove("is-updating"), 420);
    }

    const note =
      average >= 90
        ? labels.strongNote
        : average >= 80
          ? labels.goodNote
          : average >= 70
            ? labels.okNote
            : labels.lowNote;
    noteElement.textContent = note || "";
  };

  const renderGpaCalculator = (t) => {
    const section = t.gpa;
    if (!section) return;
    state.gpa = section;

    text(".gpa-calculator .eyebrow", section.eyebrow);
    text(".gpa-calculator h2", section.title);
    text(".gpa-calculator .section-copy", section.copy);
    text(".gpa-form__head span", section.formTitle);
    text(".gpa-form__head small", section.formHint);
    text("[data-gpa-add-row]", section.addRow);
    text(".gpa-result__label", section.resultLabel);
    text(".gpa-result em", section.disclaimer);
    updateGpaLabels();
    updateGpaCalculator();
  };

  const renderReviews = (t) => {
    const section = t.reviews;
    text(".reviews .eyebrow", section.eyebrow);
    html(".reviews h2", escapeHtml(section.title).replace(/UniQ|UNIQU/g, (match) => `<em>${match}</em>`));
    text(".reviews .section-copy", section.copy || "");
    text(".student-channel__panel > span", section.panelLabel || "");
    text(".student-channel__panel > strong", section.panelTitle || "");
    text(".student-channel__panel > p", section.panelCopy || "");

    const grid = qs(".review-grid");
    if (!grid) return;
    grid.innerHTML = section.items
      .map(
        (item) => `
          <article class="review reveal">
            <div class="student-avatar">${escapeHtml(item.initials || item.name.slice(0, 2).toUpperCase())}</div>
            <p>“${escapeHtml(item.quote)}”</p>
            <strong>${escapeHtml(item.name)}</strong>
            <span>${escapeHtml(item.meta)}</span>
            ${item.proof ? `<small>${escapeHtml(item.proof)}</small>` : ""}
          </article>
        `
      )
      .join("");
  };

  const renderFaq = (t) => {
    const section = t.faq;
    if (!section) return;

    text(".faq .eyebrow", section.eyebrow);
    text(".faq h2", section.title);
    text(".faq .section-copy", section.copy || "");

    const list = qs(".faq-list");
    if (!list) return;
    list.innerHTML = section.items
      .map(
        (item, index) => `
          <article class="faq-item reveal${index === 0 ? " is-open" : ""}">
            <button class="faq-item__question" type="button" aria-expanded="${index === 0 ? "true" : "false"}">
              <span>${escapeHtml(item.question)}</span>
            </button>
            <div class="faq-item__body" role="region">
              <div class="faq-item__answer">
                <p>${escapeHtml(item.answer)}</p>
              </div>
            </div>
          </article>
        `
      )
      .join("");
  };

  const renderCases = (t) => {
    const section = t.cases;
    if (!section) return;

    text(".cases .eyebrow", section.eyebrow);
    text(".cases h2", section.title);
    text(".cases .section-copy", section.copy);

    const grid = qs(".case-grid");
    if (!grid) return;
    grid.innerHTML = section.items
      .map(
        (item) => `
          <article class="case-card reveal">
            <div class="case-card__top">
              <div>
                <strong>${escapeHtml(item.name)}</strong>
                <span>${escapeHtml(item.profile)}</span>
              </div>
              <span class="case-card__brand" aria-hidden="true">
                <img src="assets/brand/uniqu-logo-white-stacked.svg" alt="" loading="lazy" />
              </span>
            </div>
            <h3>${escapeHtml(item.university)}</h3>
            <p>${escapeHtml(item.result)}</p>
            <small>${escapeHtml(item.program)}</small>
          </article>
        `
      )
      .join("");
  };

  const renderSteps = (t) => {
    text(".steps .eyebrow", t.steps.eyebrow);
    text(".steps h2", t.steps.title);
    const grid = qs(".step-grid");
    if (!grid) return;
    grid.innerHTML = t.steps.items
      .map(
        (item) => `
          <article class="step reveal">
            <span>${escapeHtml(item.number)}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.text)}</p>
          </article>
        `
      )
      .join("");
  };

  const renderVideoAndMap = (t) => {
    text(".video-section .eyebrow", t.video.eyebrow);
    text(".video-section h2", t.video.title);
    text(".video-section .section-copy", t.video.copy);
    text(".video-section .video-card-title", t.video.cardsTitle);
    text(".student-channel .video-card-title", t.reviews.panelTitle || t.video.cardsTitle);
    const youtubeLink = qs(".youtube-fallback");
    const integrations = state.content.settings.integrations;
    const videoId = integrations.youtubeVideoId;
    const playlistId = integrations.youtubePlaylistId;
    if (youtubeLink) {
      youtubeLink.href = integrations.youtubeUrl || `https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}`;
      youtubeLink.textContent = t.video.fallback;
    }
    setupYoutube(videoId, playlistId);
    renderVideoRail(integrations.youtubeVideoIds || [], t.video.cardsTitle);

    text(".map-section .eyebrow", t.map.eyebrow);
    text(".map-section h2", t.map.title);
    text(".map-section .section-copy", t.map.copy);
    const query = state.content.settings.integrations.mapQuery || state.content.settings.contacts.address;
    const mapFrame = qs(".map-frame");
    if (mapFrame) {
      mapFrame.src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
      mapFrame.title = t.map.title;
    }
    const mapLink = qs(".map-link");
    if (mapLink) {
      mapLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
      mapLink.textContent = t.map.open;
    }
  };

  const setupYoutube = (videoId, playlistId) => {
    const target = qs("#youtube-player");
    if (!target || (!videoId && !playlistId)) return;
    const src = playlistId
      ? `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(playlistId)}&rel=0&modestbranding=1`
      : `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?rel=0&modestbranding=1`;

    target.innerHTML = `
      <iframe
        src="${src}"
        title="Видео отзывы студентов UniQ"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>
    `;
  };

  const renderVideoRail = (videoIds, title = "") => {
    const rail = qs(".video-rail");
    if (!rail) return;
    rail.innerHTML = videoIds
      .map(
        (id, index) => `
          <a class="video-card" href="https://www.youtube.com/watch?v=${encodeURIComponent(id)}" target="_blank" rel="noopener">
            <img src="https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg" alt="${escapeHtml(title)} ${index + 1}" loading="lazy" />
            <span>Видео отзыв ${index + 1}</span>
          </a>
        `
      )
      .join("");
  };

  const renderFooter = (t) => {
    const footerCopy = qs(".footer > div:first-child p");
    if (footerCopy) footerCopy.textContent = t.footer.copy;
    const headings = qsa(".footer h3");
    if (headings[0]) headings[0].textContent = t.footer.contactsTitle;
    if (headings[1]) headings[1].textContent = t.footer.navTitle;

    const contacts = state.content.settings.contacts;
    const contactColumn = qs(".footer > div:nth-child(2)");
    if (contactColumn) {
      contactColumn.innerHTML = `
        <h3>${escapeHtml(t.footer.contactsTitle)}</h3>
        ${contacts.phones
          .map((phone, index) => `<a href="tel:${escapeHtml(contacts.phoneLinks[index] || phone.replace(/\D/g, ""))}">${escapeHtml(phone)}</a>`)
          .join("")}
        <a href="mailto:${escapeHtml(contacts.email)}">${escapeHtml(contacts.email)}</a>
        <a href="https://wa.me/${escapeHtml(contacts.whatsapp)}">WhatsApp</a>
        <span>${escapeHtml(contacts.address)}</span>
        ${(contacts.extraAddresses || []).map((address) => `<span>${escapeHtml(address)}</span>`).join("")}
        <span>${escapeHtml(contacts.legalName || "")}${contacts.bin ? `, БИН ${escapeHtml(contacts.bin)}` : ""}</span>
      `;
    }

    let adminLink = qs(".admin-link");
    if (!adminLink) {
      adminLink = document.createElement("a");
      adminLink.className = "admin-link";
      adminLink.href = "admin.html";
      qs(".footer > div:last-child")?.appendChild(adminLink);
    }
    adminLink.textContent = t.footer.admin;
  };

  const renderForm = (t) => {
    text(".modal .eyebrow", t.form.eyebrow);
    text("#modal-title", t.form.title);
    const copy = qs(".modal__panel > p:not(.eyebrow)");
    if (copy) copy.textContent = t.form.copy;

    const form = qs("#leadForm");
    if (form) {
      form.innerHTML = `
        <label>${escapeHtml(t.form.name)}<input name="name" type="text" placeholder="${escapeHtml(t.form.namePlaceholder)}" required /></label>
        <label>${escapeHtml(t.form.phone)}<input name="phone" type="tel" placeholder="${escapeHtml(t.form.phonePlaceholder)}" required /></label>
        <label>${escapeHtml(t.form.grade)}<select name="grade">${t.form.grades.map((item) => `<option>${escapeHtml(item)}</option>`).join("")}</select></label>
        <label>${escapeHtml(t.form.program)}<select name="program">${(t.form.programs || []).map((item) => `<option>${escapeHtml(item)}</option>`).join("")}</select></label>
        <label>${escapeHtml(t.form.start)}<select name="start">${(t.form.starts || []).map((item) => `<option>${escapeHtml(item)}</option>`).join("")}</select></label>
        <label>${escapeHtml(t.form.interest)}<select name="interest">${t.form.interests.map((item) => `<option>${escapeHtml(item)}</option>`).join("")}</select></label>
        <button class="primary-button" type="submit">${escapeHtml(t.form.submit)} <i data-lucide="send"></i></button>
        <small>${escapeHtml(t.form.policy)}</small>
      `;
    }

    text(".success-state h3", t.form.successTitle);
    text(".success-state p", t.form.successText);
  };

  const bindLeadForm = () => {
    const form = qs("#leadForm");
    if (!form || form.dataset.cmsBound) return;
    form.dataset.cmsBound = "true";

    form.addEventListener(
      "submit",
      async (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());
        payload.language = state.lang;
        payload.page = window.location.href;

        const response = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }).catch(() => null);

        if (!response?.ok) {
          const saved = JSON.parse(localStorage.getItem("uniqu-leads") || "[]");
          saved.unshift({ ...payload, createdAt: new Date().toISOString() });
          localStorage.setItem("uniqu-leads", JSON.stringify(saved));
        }

        qs("[data-modal]")?.classList.add("is-success");
        form.reset();
      },
      true
    );
  };

  const bindCalculator = () => {
    ["#levelSelect", "#countrySelect"].forEach((selector) => {
      const element = qs(selector);
      if (element && !element.dataset.cmsBound) {
        element.dataset.cmsBound = "true";
        element.addEventListener("change", updateBudget);
      }
    });
  };

  const bindGpaCalculator = () => {
    const form = qs("[data-gpa-form]");
    const rows = qs("[data-gpa-rows]");
    if (!form || !rows || form.dataset.gpaBound) return;
    form.dataset.gpaBound = "true";

    form.addEventListener("input", updateGpaCalculator);
    form.addEventListener("click", (event) => {
      const addButton = event.target instanceof Element ? event.target.closest("[data-gpa-add-row]") : null;
      if (addButton) {
        const row = createGpaRow();
        rows.appendChild(row);
        window.setTimeout(() => row.classList.remove("is-added"), 460);
        updateGpaCalculator();
        window.initMotionSystem?.(rows);
        return;
      }

      const removeButton = event.target instanceof Element ? event.target.closest("[data-gpa-remove]") : null;
      if (!removeButton) return;

      const row = removeButton.closest("[data-gpa-row]");
      if (row && qsa("[data-gpa-row]").length > 1) {
        row.remove();
        updateGpaCalculator();
      }
    });
  };

  const bindModalTriggers = () => {
    qsa("[data-open-modal]").forEach((button) => {
      if (button.dataset.cmsModalBound) return;
      button.dataset.cmsModalBound = "true";
      button.addEventListener("click", openLeadModal);
    });
  };

  const renderSite = () => {
    const t = getTranslation();
    updateSeo(t);
    renderLanguages();
    renderNav(t);
    renderHero(t);
    renderPrograms(t);
    renderGpaCalculator(t);
    renderAbout(t);
    renderUniversities(t);
    renderServices(t);
    renderMoveFear(t);
    renderFacts(t);
    renderCountries(t);
    renderCountryDetails(t);
    renderConsult(t);
    renderCalculator(t);
    renderReviews(t);
    renderCases(t);
    renderSteps(t);
    renderVideoAndMap(t);
    renderFaq(t);
    renderFooter(t);
    renderForm(t);
    bindLeadForm();
    bindCalculator();
    bindGpaCalculator();
    bindModalTriggers();
    window.initMotionSystem?.();
    window.initCounters?.();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  };

  const init = async () => {
    state.content = await fetchContent();
    const available = state.content.settings.languages.map((item) => item.code);
    const hasExplicitLanguage = Boolean(getLangFromUrl() || localStorage.getItem("uniqu-lang"));
    const initialLanguage = window.UniqGeoLanguage
      ? await window.UniqGeoLanguage.detectDefaultLanguage({
          available,
          fallback: state.content.settings.defaultLanguage
        })
      : getLangFromUrl() || localStorage.getItem("uniqu-lang") || state.content.settings.defaultLanguage;

    setCurrentLang(initialLanguage, { persist: hasExplicitLanguage });
    renderSite();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
