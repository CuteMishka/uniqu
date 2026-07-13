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

  const getInteractionLabels = () => {
    const labels = {
      ru: {
        budgetTitle: "Покрытие грантом",
        budgetOptions: ["Без гранта", "50% обучения", "До 100%"],
        budgetStatuses: [
          "Показываем полную годовую вилку расходов.",
          "Подсвечена часть обучения, которую может закрыть грант 50%.",
          "Максимальный сценарий: грант может покрыть обучение, общежитие и стипендию."
        ],
        caseFilters: ["Все кейсы", "GPA 70–85", "Грант 100%"],
        copyHint: "Нажмите, чтобы скопировать",
        copied: "Скопировано"
      },
      kz: {
        budgetTitle: "Грантпен қамту",
        budgetOptions: ["Грантсыз", "Оқудың 50%", "100%-ға дейін"],
        budgetStatuses: [
          "Бір жылға арналған толық шығын диапазоны көрсетілген.",
          "50% грант жабуы мүмкін оқу ақысының бөлігі белгіленді.",
          "Максималды сценарий: грант оқу, жатақхана және стипендияны қамтуы мүмкін."
        ],
        caseFilters: ["Барлық кейстер", "GPA 70–85", "100% грант"],
        copyHint: "Көшіру үшін басыңыз",
        copied: "Көшірілді"
      },
      en: {
        budgetTitle: "Grant coverage",
        budgetOptions: ["No grant", "50% tuition", "Up to 100%"],
        budgetStatuses: [
          "The full estimated annual cost is shown.",
          "The tuition portion a 50% grant may cover is highlighted.",
          "Best-case scenario: a grant may cover tuition, housing and a stipend."
        ],
        caseFilters: ["All cases", "GPA 70–85", "100% grant"],
        copyHint: "Click to copy",
        copied: "Copied"
      },
      uz: {
        budgetTitle: "Grant qamrovi",
        budgetOptions: ["Grantsiz", "O‘qishning 50%", "100% gacha"],
        budgetStatuses: [
          "Bir yillik xarajatlarning to‘liq oralig‘i ko‘rsatilgan.",
          "50% grant qoplashi mumkin bo‘lgan o‘qish qismi ajratildi.",
          "Eng yaxshi holat: grant o‘qish, yotoqxona va stipendiyani qoplashi mumkin."
        ],
        caseFilters: ["Barcha keyslar", "GPA 70–85", "100% grant"],
        copyHint: "Nusxalash uchun bosing",
        copied: "Nusxalandi"
      }
    };

    return labels[state.lang] || labels.ru;
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
      sameAs: [`https://wa.me/${settings.contacts.whatsapp}`, settings.contacts.telegramUrl].filter(Boolean)
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

    const journey = qs(".hero-journey");
    if (journey && Array.isArray(t.hero.journey)) {
      const icons = ["school", "award", "badge-check", "plane", "home", "heart-handshake"];
      journey.innerHTML = t.hero.journey
        .map(
          (label, index) => `
            <li data-hero-step="${index}" class="${index === 0 ? "is-active" : ""}">
              <button type="button" aria-current="${index === 0 ? "step" : "false"}">
                <i data-lucide="${icons[index] || "check"}"></i>
                <span>${escapeHtml(label)}</span>
              </button>
            </li>
          `
        )
        .join("");
      journey.setAttribute("aria-label", t.hero.journeyLabel || t.hero.eyebrow);

      let status = qs(".hero-journey__status");
      if (!status) {
        status = document.createElement("div");
        status.className = "hero-journey__status";
        status.setAttribute("aria-live", "polite");
        journey.after(status);
      }
      status.innerHTML = `
        <span>01 / ${String(t.hero.journey.length).padStart(2, "0")}</span>
        <strong>${escapeHtml(t.hero.journey[0] || "")}</strong>
        <i aria-hidden="true"><b></b></i>
      `;
    }

    const proof = qs(".hero-proof");
    if (proof && Array.isArray(t.hero.proof)) {
      proof.innerHTML = t.hero.proof
        .map((item) => `<span><strong${counterAttributes(item.value)}>${escapeHtml(item.value)}</strong> ${escapeHtml(item.label)}</span>`)
        .join("");
    }

    const media = qs(".hero__media");
    if (media) {
      media.style.background =
        'linear-gradient(180deg, rgba(7, 9, 18, 0.04), rgba(7, 9, 18, 0.36)), url("assets/photos/students-airport.webp") center / cover';
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
    const archivePhotos = [
      "assets/photos/student-campus-life.webp",
      "assets/photos/students-china-dorm.webp",
      "assets/photos/students-china-cards.webp",
      "assets/photos/students-airport.webp"
    ];
    track.innerHTML = t.universities.items
      .map(
        (item, index) => `
          <article class="university-card">
            <figure>
              <img src="${archivePhotos[index % archivePhotos.length]}" alt="Архив студентов и кампусов UniQ" loading="lazy" />
              <figcaption>Архив UniQ</figcaption>
            </figure>
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
    const archivePhotos = [
      "assets/photos/student-campus-life.webp",
      "assets/photos/students-airport.webp",
      "assets/photos/students-turkey-street.webp"
    ];
    grid.innerHTML = t.countries.items
      .map((item, index) => {
        const slug = item.slug || countrySlugs[index] || "";
        const href = slug ? `/${slug}` : "#contacts";
        return `
          <a class="country reveal" href="${escapeHtml(href)}" aria-label="${escapeHtml(item.name)}" style="--country-image: url('${archivePhotos[index] || archivePhotos[0]}')">
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

  const renderBudget = (t) => {
    const section = t.budget || state.content.translations.ru?.budget;
    if (!section) return;
    const interaction = getInteractionLabels();

    text(".china-budget .eyebrow", section.eyebrow);
    html(".china-budget h2", escapeHtml(section.title).replace(/на один год|one year/i, (match) => `<em>${match}</em>`));
    text(".china-budget__head .section-copy", section.copy);

    const budgetSection = qs(".china-budget");
    let scenarios = qs(".budget-scenarios");
    if (budgetSection && !scenarios) {
      scenarios = document.createElement("div");
      scenarios.className = "budget-scenarios reveal";
      qs(".budget-anchor-grid")?.before(scenarios);
    }
    if (scenarios) {
      scenarios.innerHTML = `
        <div class="budget-scenarios__head">
          <span>${escapeHtml(interaction.budgetTitle)}</span>
          <strong class="budget-scenarios__status" aria-live="polite">${escapeHtml(interaction.budgetStatuses[0])}</strong>
        </div>
        <div class="budget-scenarios__controls" role="group" aria-label="${escapeHtml(interaction.budgetTitle)}">
          ${[0, 50, 100]
            .map(
              (value, index) => `
                <button type="button" data-budget-scenario="${value}" data-budget-status="${escapeHtml(interaction.budgetStatuses[index])}" aria-pressed="${index === 0 ? "true" : "false"}" class="${index === 0 ? "is-active" : ""}">
                  ${escapeHtml(interaction.budgetOptions[index])}
                </button>
              `
            )
            .join("")}
        </div>
        <div class="budget-scenarios__meter" aria-hidden="true"><i></i></div>
      `;
    }

    const grid = qs(".budget-anchor-grid");
    if (grid) {
      grid.innerHTML = section.items
        .map(
          (item, index) => `
            <article class="${item.total ? "budget-anchor-grid__total" : ""}" data-budget-item="${index}">
              <span>${escapeHtml(item.label)}</span>
              <strong>${escapeHtml(item.value)}</strong>
              <small>${escapeHtml(item.note)}</small>
            </article>
          `
        )
        .join("");
    }

    text(".budget-grant > div > span", section.grantLabel);
    text(".budget-grant > div > strong", section.grantValue);
    text(".budget-grant > p", section.deadline);
    setButton(qs(".budget-grant [data-open-modal]"), section.cta);
    text(".budget-source", section.source);
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
      "assets/photos/student-campus-life.webp",
      "assets/photos/students-airport.webp",
      "assets/photos/students-turkey-street.webp"
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

  const setGpaError = (message = "") => {
    const error = qs("[data-gpa-error]");
    if (!error) return;
    error.textContent = message;
    error.hidden = !message;
  };

  const setGpaEmptyState = (message = "") => {
    const labels = getGpaLabels();
    const averageElement = qs("[data-gpa-average]");
    const gpaElement = qs("[data-gpa-four]");
    const hundredElement = qs("[data-gpa-hundred]");
    const noteElement = qs("[data-gpa-note]");
    const resultBox = qs(".gpa-result");
    const meter = qs("[data-gpa-meter]");
    if (!averageElement || !gpaElement || !hundredElement || !noteElement) return;

    averageElement.textContent = "—";
    gpaElement.textContent = "—";
    hundredElement.textContent = "—";
    noteElement.textContent = message || labels.emptyNote || "";
    resultBox?.style.setProperty("--gpa-progress", "0%");
    if (meter) meter.style.transform = "scaleX(0)";
  };

  const updateGpaCalculator = () => {
    const labels = getGpaLabels();
    const averageElement = qs("[data-gpa-average]");
    const gpaElement = qs("[data-gpa-four]");
    const hundredElement = qs("[data-gpa-hundred]");
    const noteElement = qs("[data-gpa-note]");
    const resultBox = qs(".gpa-result");
    const meter = qs("[data-gpa-meter]");
    if (!averageElement || !gpaElement || !hundredElement || !noteElement) return;

    const counts = {};
    let hasInvalidCount = false;

    [3, 4, 5].forEach((grade) => {
      const input = qs(`[data-gpa-count="${grade}"]`);
      const rawValue = String(input?.value || "0").trim();
      const count = rawValue === "" ? 0 : Number(rawValue);
      const isInvalid = !Number.isFinite(count) || count < 0 || !Number.isInteger(count);
      input?.setAttribute("aria-invalid", String(isInvalid));
      hasInvalidCount ||= isInvalid;
      counts[grade] = isInvalid ? 0 : count;
    });

    if (hasInvalidCount) {
      const message = labels.invalidCount || "Enter a whole number of grades from 0.";
      setGpaError(message);
      setGpaEmptyState(message);
      return;
    }

    const total = counts[3] + counts[4] + counts[5];
    if (!total) {
      const message = labels.emptyNote || "Enter at least one grade.";
      setGpaError(message);
      setGpaEmptyState(message);
      return;
    }

    setGpaError();
    const averageFive = (3 * counts[3] + 4 * counts[4] + 5 * counts[5]) / total;
    const averageFour = (2 * counts[3] + 3 * counts[4] + 4 * counts[5]) / total;
    const averageHundred = averageFive * 20;
    averageElement.textContent = averageFive.toFixed(2);
    gpaElement.textContent = averageFour.toFixed(2);
    hundredElement.textContent = averageHundred.toFixed(1);
    resultBox?.style.setProperty("--gpa-progress", `${averageHundred}%`);
    if (meter) meter.style.transform = `scaleX(${averageHundred / 100})`;
    if (resultBox && !resultBox.classList.contains("is-updating")) {
      resultBox.classList.add("is-updating");
      window.setTimeout(() => resultBox.classList.remove("is-updating"), 420);
    }

    const note =
      averageHundred >= 90
        ? labels.strongNote
        : averageHundred >= 80
          ? labels.goodNote
          : averageHundred >= 70
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
    text('[data-gpa-count-label="3"]', section.countThreeLabel);
    text('[data-gpa-count-label="4"]', section.countFourLabel);
    text('[data-gpa-count-label="5"]', section.countFiveLabel);
    text("[data-gpa-calculate]", section.calculate);
    text("[data-gpa-reset]", section.reset);
    text(".gpa-result__label", section.resultLabel);
    text("[data-gpa-five-label]", section.fiveScaleLabel);
    text("[data-gpa-four-label]", section.fourScaleLabel);
    text("[data-gpa-hundred-label]", section.hundredScaleLabel);
    text(".gpa-result em", section.disclaimer);
    setButton(qs(".gpa-result [data-open-modal]"), section.cta || t.hero.cta);
    setGpaError();
    const hasEnteredCounts = qsa("[data-gpa-count]").some((input) => Number(input.value) > 0);
    if (hasEnteredCounts) updateGpaCalculator();
    else setGpaEmptyState(section.emptyNote);
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
          <article class="faq-item reveal">
            <button class="faq-item__question" type="button" aria-expanded="false" aria-controls="faq-answer-${index}">
              <small>${String(index + 1).padStart(2, "0")}</small>
              <span>${escapeHtml(item.question)}</span>
            </button>
            <div class="faq-item__body" id="faq-answer-${index}" role="region" aria-hidden="true">
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
    const interaction = getInteractionLabels();

    text(".cases .eyebrow", section.eyebrow);
    text(".cases h2", section.title);
    text(".cases .section-copy", section.copy);

    const grid = qs(".case-grid");
    if (!grid) return;
    let filters = qs(".case-filters");
    if (!filters) {
      filters = document.createElement("div");
      filters.className = "case-filters reveal";
      grid.before(filters);
    }
    filters.innerHTML = `
      <div role="group" aria-label="${escapeHtml(section.eyebrow)}">
        ${["all", "mid", "full"]
          .map(
            (filter, index) => `
              <button type="button" data-case-filter="${filter}" aria-pressed="${index === 0 ? "true" : "false"}" class="${index === 0 ? "is-active" : ""}">
                ${escapeHtml(interaction.caseFilters[index])}
              </button>
            `
          )
          .join("")}
      </div>
      <span class="case-filters__count" aria-live="polite"></span>
    `;
    const archivePhotos = [
      "assets/photos/students-china-dorm.webp",
      "assets/photos/students-china-cards.webp",
      "assets/photos/student-bank-card.webp",
      "assets/photos/student-campus-life.webp",
      "assets/photos/students-airport.webp"
    ];
    const archive = qs(".case-archive");
    if (archive) {
      archive.innerHTML = archivePhotos
        .map((src, index) => `<figure><img src="${src}" alt="Студенты UniQ, фото из архива" loading="lazy" /><figcaption>${index === 0 ? "Реальные фото студентов UniQ" : "Архив UniQ"}</figcaption></figure>`)
        .join("");
    }
    const items = [...section.items].sort((left, right) => {
      const leftGpa = Number(left.profile.match(/GPA\s+(\d+)/i)?.[1] || 100);
      const rightGpa = Number(right.profile.match(/GPA\s+(\d+)/i)?.[1] || 100);
      return leftGpa - rightGpa;
    });
    grid.innerHTML = items
      .map(
        (item) => {
          const gpa = Number(item.profile.match(/GPA\s+(\d+)/i)?.[1] || 100);
          const fullGrant = /100%|full|полный|бесплат|тегін|bepul/i.test(item.result);
          return `
          <article class="case-card reveal" data-case-gpa="${gpa}" data-case-full-grant="${fullGrant}">
            <div class="case-card__top">
              <div>
                <strong>${escapeHtml(item.name)}</strong>
                <span>${escapeHtml(item.profile)}</span>
              </div>
              ${gpa <= 85 ? '<span class="case-card__badge">GPA 70–85</span>' : ""}
            </div>
            <h3>${escapeHtml(item.university)}</h3>
            <p>${escapeHtml(item.result)}</p>
            <small>${escapeHtml(item.program)}</small>
          </article>
        `;
        }
      )
      .join("");
  };

  const renderTrust = (t) => {
    const section = t.trust;
    if (!section) return;
    const interaction = getInteractionLabels();

    text(".trust-section .eyebrow", section.eyebrow);
    text(".trust-section h2", section.title);
    text(".trust-section__head .section-copy", section.copy);

    const roleGrid = qs(".team-role-grid");
    if (roleGrid && Array.isArray(section.roles)) {
      roleGrid.innerHTML = section.roles
        .map(
          (item, index) => `
            <article tabindex="0" role="button" data-team-role="${index}" aria-pressed="${index === 0 ? "true" : "false"}" class="${index === 0 ? "is-active" : ""}">
              <i data-lucide="${escapeHtml(item.icon)}"></i>
              <strong>${escapeHtml(item.title)}</strong>
              <span>${escapeHtml(item.text)}</span>
            </article>
          `
        )
        .join("");
    }

    const contacts = state.content.settings.contacts;
    const offices = [contacts.address, ...(contacts.extraAddresses || [])];
    const binLabel = state.lang === "ru" || state.lang === "kz" ? "БИН" : "BIN";
    const facts = qs(".trust-facts");
    if (facts) {
      facts.innerHTML = `
        ${offices
          .map(
            (address, index) => `
              <div class="trust-fact" tabindex="0" role="button" data-copy-value="${escapeHtml(address)}" aria-label="${escapeHtml(interaction.copyHint)}: ${escapeHtml(address)}">
                <span>${escapeHtml(section.officeLabels?.[index] || section.officeLabel)}</span>
                <strong>${escapeHtml(address)}</strong>
              </div>
            `
          )
          .join("")}
        <div class="trust-fact trust-fact--legal" tabindex="0" role="button" data-copy-value="${escapeHtml(`${contacts.legalName} · ${binLabel} ${contacts.bin}`)}" aria-label="${escapeHtml(interaction.copyHint)}: ${escapeHtml(contacts.legalName)}">
          <span>${escapeHtml(section.legalLabel)}</span>
          <strong>${escapeHtml(contacts.legalName)}</strong>
          <small>${binLabel} ${escapeHtml(contacts.bin)}</small>
        </div>
      `;
      facts.dataset.copiedLabel = interaction.copied;
    }

    text(".proof-request > div:nth-child(2) > span", section.proofLabel);
    text(".proof-request h3", section.proofTitle);
    text(".proof-request p", section.proofCopy);
    setButton(qs(".proof-request [data-open-modal]"), section.proofCta, "arrow-right");
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
        ${contacts.uzPhone ? `<a href="tel:${escapeHtml(contacts.uzPhoneLink || contacts.uzPhone.replace(/\D/g, ""))}">${escapeHtml(contacts.uzPhone)}</a>` : ""}
        <a href="mailto:${escapeHtml(contacts.email)}">${escapeHtml(contacts.email)}</a>
        <a href="https://wa.me/${escapeHtml(contacts.whatsapp)}">WhatsApp</a>
        ${contacts.telegramUrl ? `<a href="${escapeHtml(contacts.telegramUrl)}" target="_blank" rel="noopener">Telegram</a>` : ""}
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
        <label>${escapeHtml(t.form.interest)}<select name="interest">${t.form.interests.map((item) => `<option>${escapeHtml(item)}</option>`).join("")}</select></label>
        <button class="primary-button" type="submit">${escapeHtml(t.form.submit)} <i data-lucide="send"></i></button>
        <small>${escapeHtml(t.form.policy)}</small>
      `;
    }

    text(".success-state h3", t.form.successTitle);
    text(".success-state p", t.form.successText);
  };

  const renderContactLayer = () => {
    const contacts = state.content.settings.contacts;
    qs(".messenger-dock")?.remove();

    const dock = document.createElement("div");
    dock.className = "messenger-dock";
    dock.setAttribute("aria-label", "Связаться с UniQ");
    dock.innerHTML = `
      <a class="messenger-dock__item messenger-dock__item--whatsapp" href="https://wa.me/${escapeHtml(contacts.whatsapp)}" target="_blank" rel="noopener" aria-label="Написать в WhatsApp">
        <i data-lucide="message-circle"></i><span>WhatsApp</span>
      </a>
      ${contacts.telegramUrl ? `<a class="messenger-dock__item messenger-dock__item--telegram" href="${escapeHtml(contacts.telegramUrl)}" target="_blank" rel="noopener" aria-label="Написать в Telegram"><i data-lucide="send"></i><span>Telegram</span></a>` : ""}
    `;
    document.body.appendChild(dock);
  };

  const installAnalytics = () => {
    const projectId = state.content.settings.integrations?.clarityProjectId?.trim();
    if (!projectId || window.clarity) return;

    window.clarity = window.clarity || function () {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${encodeURIComponent(projectId)}`;
    script.dataset.clarity = projectId;
    document.head.appendChild(script);
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

  const reorderPrioritySections = () => {
    const main = qs("main");
    if (!main) return;

    [
      ".hero",
      ".program-strip",
      ".china-budget",
      ".cases",
      ".reviews",
      ".move-fear",
      ".trust-section",
      ".countries",
      ".country-details",
      ".about",
      ".why-section",
      ".services",
      ".gpa-calculator",
      ".universities",
      ".steps",
      ".faq",
      ".map-section",
      ".consult-band"
    ]
      .map((selector) => qs(selector, main))
      .filter(Boolean)
      .forEach((section) => main.appendChild(section));
  };

  const bindGpaCalculator = () => {
    const form = qs("[data-gpa-form]");
    if (!form || form.dataset.gpaBound) return;
    form.dataset.gpaBound = "true";

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      updateGpaCalculator();
    });
    form.addEventListener("reset", () => {
      window.setTimeout(() => {
        qsa("[data-gpa-count]").forEach((input) => input.setAttribute("aria-invalid", "false"));
        setGpaError();
        setGpaEmptyState();
      });
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
    renderBudget(t);
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
    renderTrust(t);
    renderSteps(t);
    renderVideoAndMap(t);
    renderFaq(t);
    renderFooter(t);
    renderForm(t);
    renderContactLayer();
    reorderPrioritySections();
    bindLeadForm();
    bindCalculator();
    bindGpaCalculator();
    bindModalTriggers();
    window.initMotionSystem?.();
    window.initCounters?.();
    window.initLandingInteractions?.();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  };

  const init = async () => {
    state.content = await fetchContent();
    installAnalytics();
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
