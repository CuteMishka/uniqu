(function () {
  const state = {
    content: null,
    lang: "ru"
  };

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
  const status = qs("[data-status]");

  const labels = {
    settings: "Настройки",
    siteUrl: "Адрес сайта",
    defaultLanguage: "Язык по умолчанию",
    languages: "Языки",
    code: "Код",
    label: "Кнопка",
    name: "Название",
    contacts: "Контакты",
    phones: "Телефоны",
    phoneLinks: "Телефоны для ссылок",
    whatsapp: "WhatsApp",
    email: "Email",
    address: "Адрес",
    integrations: "Интеграции",
    youtubeVideoId: "YouTube video ID",
    mapQuery: "Запрос карты",
    seo: "SEO",
    title: "Заголовок",
    description: "Описание",
    keywords: "Ключевые слова",
    nav: "Навигация",
    hero: "Первый экран",
    about: "О компании",
    why: "Почему выбирают",
    programs: "Программы",
    universities: "Университеты",
    services: "Услуги",
    moveFear: "Переезд без страха",
    facts: "Преимущества / цифры",
    countries: "Страны",
    countryDetails: "Страны подробно",
    consult: "Консультация",
    calculator: "Калькулятор",
    reviews: "Отзывы",
    cases: "Кейсы",
    steps: "Этапы",
    video: "Видео",
    faq: "FAQ",
    map: "Карта",
    footer: "Подвал",
    form: "Форма",
    items: "Элементы",
    icon: "Иконка",
    text: "Текст",
    image: "Изображение",
    country: "Страна",
    copy: "Описание",
    cta: "Кнопка",
    value: "Значение",
    suffix: "Суффикс",
    points: "Пункты",
    quote: "Отзыв",
    meta: "Подпись",
    initials: "Инициалы",
    proof: "Момент доверия",
    panelLabel: "Метка панели",
    panelTitle: "Заголовок панели",
    panelCopy: "Текст панели",
    summaryLabel: "Метка сводки",
    summaryTitle: "Заголовок сводки",
    summaryCopy: "Текст сводки",
    timeline: "Маршрут",
    number: "Номер",
    result: "Результат",
    profile: "Профиль",
    university: "Университет",
    program: "Программа",
    benefits: "Преимущества",
    starts: "Сроки старта",
    cardsTitle: "Заголовок карточек",
    question: "Вопрос",
    answer: "Ответ",
    legalName: "Юр. название",
    bin: "БИН",
    extraAddresses: "Дополнительные адреса",
    youtubePlaylistId: "YouTube playlist ID",
    youtubeUrl: "Ссылка YouTube",
    youtubeVideoIds: "YouTube video IDs"
  };

  const setStatus = (message) => {
    if (status) status.textContent = message;
  };

  const escapeHtml = (value = "") =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const labelFor = (key) => labels[key] || key;

  const getByPath = (path) => path.reduce((current, key) => current?.[key], state.content);

  const setByPath = (path, value) => {
    const last = path[path.length - 1];
    const parent = path.slice(0, -1).reduce((current, key) => current[key], state.content);
    parent[last] = value;
  };

  const cloneTemplate = (array) => {
    if (!array.length) return "";
    const first = array[0];
    if (Array.isArray(first)) return [];
    if (first && typeof first === "object") return JSON.parse(JSON.stringify(first));
    if (typeof first === "number") return 0;
    return "";
  };

  const renderField = (value, path, key) => {
    const wrapper = document.createElement("label");
    wrapper.className = "field";
    wrapper.innerHTML = `<span>${escapeHtml(labelFor(key))}</span>`;

    const input = document.createElement(typeof value === "string" && value.length > 90 ? "textarea" : "input");
    if (input.tagName === "INPUT") input.type = typeof value === "number" ? "number" : "text";
    input.value = value ?? "";
    input.addEventListener("input", () => {
      const nextValue = typeof value === "number" ? Number(input.value) : input.value;
      setByPath(path, nextValue);
    });

    wrapper.appendChild(input);
    return wrapper;
  };

  const renderNode = (value, path, key = "") => {
    if (Array.isArray(value)) {
      const box = document.createElement("div");
      box.className = "array-box";
      box.innerHTML = `
        <div class="array-head">
          <strong>${escapeHtml(labelFor(key))}</strong>
          <button type="button">Добавить</button>
        </div>
      `;

      qs("button", box).addEventListener("click", () => {
        value.push(cloneTemplate(value));
        renderEditors();
      });

      value.forEach((item, index) => {
        const itemBox = document.createElement("div");
        itemBox.className = "array-item";
        itemBox.innerHTML = `
          <div class="array-item-head">
            <strong>${escapeHtml(labelFor(key))} #${index + 1}</strong>
            <button type="button">Удалить</button>
          </div>
        `;
        qs("button", itemBox).addEventListener("click", () => {
          value.splice(index, 1);
          renderEditors();
        });
        itemBox.appendChild(renderNode(item, [...path, index], `${index}`));
        box.appendChild(itemBox);
      });

      return box;
    }

    if (value && typeof value === "object") {
      const group = document.createElement("fieldset");
      group.className = "group";
      group.innerHTML = `<legend>${escapeHtml(labelFor(key))}</legend>`;
      Object.entries(value).forEach(([childKey, childValue]) => {
        group.appendChild(renderNode(childValue, [...path, childKey], childKey));
      });
      return group;
    }

    return renderField(value, path, key);
  };

  const renderLanguageTabs = () => {
    const tabs = qs("[data-language-tabs]");
    if (!tabs) return;
    tabs.innerHTML = "";

    state.content.settings.languages.forEach((language) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = language.code === state.lang ? "is-active" : "";
      button.textContent = `${language.label} · ${language.name}`;
      button.addEventListener("click", () => {
      state.lang = language.code;
      if (!state.content.translations[state.lang]) {
        state.content.translations[state.lang] = JSON.parse(JSON.stringify(state.content.translations.ru || {}));
      }
      renderEditors();
      });
      tabs.appendChild(button);
    });
  };

  const renderEditors = () => {
    renderLanguageTabs();
    const settingsEditor = qs("[data-settings-editor]");
    const translationEditor = qs("[data-translation-editor]");
    if (!settingsEditor || !translationEditor) return;

    settingsEditor.innerHTML = "";
    translationEditor.innerHTML = "";
    settingsEditor.appendChild(renderNode(state.content.settings, ["settings"], "settings"));
    translationEditor.appendChild(renderNode(state.content.translations[state.lang], ["translations", state.lang], state.lang));
  };

  const loadContent = async () => {
    const response = await fetch("/api/content", { cache: "no-store" });
    if (!response.ok) throw new Error("Не удалось загрузить контент. Откройте сайт через локальный Node-сервер.");
    state.content = await response.json();
    state.lang = state.content.settings.defaultLanguage || "ru";
    renderEditors();
    setStatus("Контент загружен");
  };

  const saveContent = async () => {
    setStatus("Сохраняю...");
    const response = await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state.content)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Не удалось сохранить");
    }

    setStatus("Сохранено. Обновите сайт, чтобы увидеть изменения.");
  };

  const loadLeads = async () => {
    const container = qs("[data-leads]");
    if (!container) return;

    const response = await fetch("/api/leads", { cache: "no-store" }).catch(() => null);
    if (!response?.ok) {
      container.textContent = "Заявки доступны только при запуске через локальный сервер.";
      return;
    }

    const leads = await response.json();
    if (!leads.length) {
      container.textContent = "Заявок пока нет.";
      return;
    }

    container.innerHTML = leads
      .map(
        (lead) => `
          <article class="lead-card">
            <strong>${escapeHtml(lead.name || "Без имени")} · ${escapeHtml(lead.phone || "")}</strong>
            <span>${escapeHtml(lead.createdAt || "")}</span>
            <span>Класс: ${escapeHtml(lead.grade || "-")} · Программа: ${escapeHtml(lead.program || "-")} · Старт: ${escapeHtml(lead.start || "-")} · Интерес: ${escapeHtml(lead.interest || "-")} · Язык: ${escapeHtml(lead.language || "-")}</span>
          </article>
        `
      )
      .join("");
  };

  const bindActions = () => {
    qs("[data-save]")?.addEventListener("click", () => saveContent().catch((error) => setStatus(error.message)));
    qs("[data-reload]")?.addEventListener("click", () => loadContent().catch((error) => setStatus(error.message)));
    qs("[data-export]")?.addEventListener("click", () => {
      qs("[data-json-area]").value = JSON.stringify(state.content, null, 2);
      setStatus("JSON подготовлен для экспорта");
    });
    qs("[data-import]")?.addEventListener("click", () => {
      try {
        const imported = JSON.parse(qs("[data-json-area]").value);
        if (!imported.settings || !imported.translations) throw new Error("Неверная структура JSON");
        state.content = imported;
        state.lang = state.content.settings.defaultLanguage || Object.keys(state.content.translations)[0];
        renderEditors();
        setStatus("JSON импортирован. Нажмите «Сохранить», чтобы записать изменения.");
      } catch (error) {
        setStatus(error.message);
      }
    });
  };

  const init = async () => {
    bindActions();
    try {
      await loadContent();
      await loadLeads();
    } catch (error) {
      setStatus(error.message);
    }
  };

  init();
})();
