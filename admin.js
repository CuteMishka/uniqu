(function () {
  "use strict";

  const STATUS_META = {
    new: { label: "Новые", short: "Новая", color: "#c98319" },
    contacted: { label: "Связались", short: "Связались", color: "#688099" },
    consultation: { label: "Консультация", short: "Консультация", color: "#8a6c9f" },
    documents: { label: "Документы", short: "Документы", color: "#4f7f78" },
    won: { label: "Зачислены", short: "Зачислен", color: "#30745b" },
    lost: { label: "Закрыты", short: "Закрыт", color: "#8c8580" }
  };

  const state = {
    content: null,
    lang: "ru",
    leads: [],
    stats: null,
    view: "dashboard",
    layout: "board",
    selectedLeadId: null,
    drawerMode: "create",
    draggedLeadId: null,
    layoutTouched: false,
    filters: { search: "", status: "", program: "", assignee: "" },
    editorsCollapsed: false
  };

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHtml = (value = "") =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

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
    uzPhone: "Телефон Узбекистана",
    uzPhoneLink: "Телефон Узбекистана для ссылки",
    telegramUrl: "Ссылка Telegram",
    email: "Email",
    address: "Адрес",
    integrations: "Интеграции",
    youtubeVideoId: "YouTube video ID",
    youtubePlaylistId: "YouTube playlist ID",
    youtubeUrl: "Ссылка YouTube",
    youtubeVideoIds: "YouTube video IDs",
    mapQuery: "Запрос карты",
    clarityProjectId: "Microsoft Clarity Project ID",
    seo: "SEO",
    title: "Заголовок",
    description: "Описание",
    keywords: "Ключевые слова",
    nav: "Навигация",
    hero: "Первый экран",
    budget: "Бюджет Китая",
    trust: "Команда и доверие",
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
    legalName: "Юридическое название",
    bin: "БИН",
    extraAddresses: "Дополнительные адреса"
  };

  const api = async (url, options = {}) => {
    const response = await fetch(url, {
      cache: "no-store",
      credentials: "same-origin",
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {})
      }
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || `Ошибка ${response.status}`);
    return payload;
  };

  const setSyncState = (text, mode = "ready") => {
    const node = qs("[data-sync-state]");
    if (!node) return;
    node.classList.toggle("is-busy", mode === "busy");
    node.classList.toggle("is-error", mode === "error");
    const label = qs("span", node);
    if (label) label.textContent = text;
  };

  const setContentStatus = (message) => {
    const node = qs("[data-status]");
    if (node) node.textContent = message;
  };

  const toast = (title, detail = "", type = "success") => {
    const region = qs("[data-toast-region]");
    if (!region) return;
    const item = document.createElement("div");
    item.className = `toast${type === "error" ? " is-error" : ""}`;
    item.innerHTML = `<div><strong>${escapeHtml(title)}</strong>${detail ? `<span>${escapeHtml(detail)}</span>` : ""}</div>`;
    region.appendChild(item);
    window.setTimeout(() => item.remove(), 4200);
  };

  const formatDate = (value, withTime = false) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "short",
      ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {})
    }).format(date);
  };

  const formatRelative = (value) => {
    if (!value) return "—";
    const time = new Date(value).getTime();
    if (!Number.isFinite(time)) return "—";
    const diffMinutes = Math.round((time - Date.now()) / 60_000);
    const formatter = new Intl.RelativeTimeFormat("ru", { numeric: "auto" });
    if (Math.abs(diffMinutes) < 60) return formatter.format(diffMinutes, "minute");
    const diffHours = Math.round(diffMinutes / 60);
    if (Math.abs(diffHours) < 24) return formatter.format(diffHours, "hour");
    const diffDays = Math.round(diffHours / 24);
    if (Math.abs(diffDays) < 14) return formatter.format(diffDays, "day");
    return formatDate(value);
  };

  const initials = (name = "") => {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    return parts.length ? parts.slice(0, 2).map((part) => part[0].toUpperCase()).join("") : "—";
  };

  const statusMeta = (status) => STATUS_META[status] || STATUS_META.new;
  const leadById = (id) => state.leads.find((lead) => lead.id === id);

  const navigate = (view) => {
    if (!qs(`[data-view="${view}"]`)) return;
    state.view = view;
    qsa("[data-view]").forEach((section) => {
      const active = section.dataset.view === view;
      section.hidden = !active;
      section.classList.toggle("is-active", active);
    });
    qsa("[data-view-target]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.viewTarget === view);
    });
    if (view === "content" && state.content && !qs("[data-settings-editor]")?.hasChildNodes()) {
      renderEditors();
    }
    history.replaceState(null, "", `#${view}`);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  const setGreeting = () => {
    const hour = new Date().getHours();
    const text = hour < 12 ? "Доброе утро" : hour < 18 ? "Добрый день" : "Добрый вечер";
    const node = qs("[data-greeting]");
    if (node) node.textContent = text;
  };

  const renderMetrics = () => {
    const stats = state.stats || {};
    qsa("[data-metric]").forEach((node) => {
      node.textContent = stats[node.dataset.metric] ?? 0;
    });

    const badge = qs("[data-new-badge]");
    const newCount = stats.statusCounts?.new || 0;
    if (badge) {
      badge.textContent = newCount > 99 ? "99+" : String(newCount);
      badge.hidden = newCount === 0;
    }

    const trend = qs("[data-total-trend]");
    if (trend) {
      if (!stats.currentWeek) {
        trend.textContent = "Новых за неделю пока нет";
      } else if (!stats.previousWeek) {
        trend.textContent = `${stats.currentWeek} за последние 7 дней`;
      } else {
        const change = Math.round(((stats.currentWeek - stats.previousWeek) / stats.previousWeek) * 100);
        trend.textContent = `${change >= 0 ? "+" : ""}${change}% к прошлой неделе`;
      }
    }
  };

  const renderWeeklyChart = () => {
    const container = qs("[data-weekly-chart]");
    if (!container) return;
    const weekly = state.stats?.weekly || [];
    const max = Math.max(1, ...weekly.map((day) => day.count));
    container.innerHTML = weekly
      .map((day) => {
        const date = new Date(`${day.date}T12:00:00`);
        const label = new Intl.DateTimeFormat("ru-RU", { weekday: "short" }).format(date).replace(".", "");
        const height = day.count ? Math.max(8, Math.round((day.count / max) * 86)) : 2;
        return `
          <div class="chart-day">
            <div class="chart-bar-wrap">
              <div class="chart-bar" style="height:${height}%" title="${day.count} заявок"><strong>${day.count}</strong></div>
            </div>
            <span>${escapeHtml(label)}</span>
          </div>`;
      })
      .join("");
  };

  const renderFunnel = () => {
    const container = qs("[data-funnel-list]");
    if (!container) return;
    const counts = state.stats?.statusCounts || {};
    const total = Math.max(1, state.stats?.total || 0);
    const statuses = ["new", "contacted", "consultation", "documents", "won"];
    container.innerHTML = statuses
      .map((status) => {
        const meta = statusMeta(status);
        const count = counts[status] || 0;
        const width = Math.max(count ? 5 : 0, Math.round((count / total) * 100));
        return `
          <div class="funnel-row">
            <span>${escapeHtml(meta.label)}</span>
            <div class="funnel-track"><i style="width:${width}%;background:${meta.color}"></i></div>
            <strong>${count}</strong>
          </div>`;
      })
      .join("");
  };

  const readableActivity = (text = "") => {
    let result = String(text);
    Object.entries(STATUS_META).forEach(([key, meta]) => {
      result = result.replace(new RegExp(`\\b${key}\\b`, "g"), meta.short.toLowerCase());
    });
    return result;
  };

  const renderRecentActivity = () => {
    const container = qs("[data-recent-activity]");
    if (!container) return;
    const activities = state.stats?.recentActivity || [];

    if (!activities.length) {
      container.innerHTML = `
        <div class="activity-item activity-item--empty">
          <time>Система готова</time>
          <strong>История появится здесь</strong>
          <p>Изменяйте статусы и добавляйте заметки в карточках клиентов.</p>
        </div>`;
      return;
    }

    container.innerHTML = activities
      .map(
        (activity) => `
          <button class="activity-item" type="button" data-open-lead="${escapeHtml(activity.leadId)}">
            <time>${escapeHtml(formatRelative(activity.createdAt))}</time>
            <strong>${escapeHtml(activity.leadName)}</strong>
            <p>${escapeHtml(readableActivity(activity.text))}</p>
          </button>`
      )
      .join("");
  };

  const getFilteredLeads = () => {
    const search = state.filters.search.trim().toLocaleLowerCase("ru");
    return state.leads.filter((lead) => {
      if (state.filters.status && lead.status !== state.filters.status) return false;
      if (state.filters.program && lead.program !== state.filters.program) return false;
      if (state.filters.assignee && lead.assignee !== state.filters.assignee) return false;
      if (!search) return true;
      const haystack = [
        lead.name,
        lead.phone,
        lead.email,
        lead.program,
        lead.interest,
        lead.grade,
        lead.assignee,
        ...(lead.tags || [])
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("ru");
      return haystack.includes(search);
    });
  };

  const renderFilterOptions = () => {
    const fill = (selector, values, defaultLabel) => {
      const select = qs(selector);
      if (!select) return;
      const current = select.value;
      select.innerHTML = `<option value="">${escapeHtml(defaultLabel)}</option>${values
        .map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
        .join("")}`;
      select.value = values.includes(current) ? current : "";
    };

    const unique = (key) => [...new Set(state.leads.map((lead) => lead[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ru"));
    fill("[data-filter-program]", unique("program"), "Все программы");
    fill("[data-filter-assignee]", unique("assignee"), "Все менеджеры");
  };

  const leadInterest = (lead) => [lead.program, lead.interest].filter(Boolean).join(" · ") || "Интерес не указан";

  const renderLeadCard = (lead) => {
    const manager = lead.assignee || "";
    const tags = (lead.tags || []).slice(0, 2);
    return `
      <article class="lead-card" draggable="true" data-lead-id="${escapeHtml(lead.id)}" tabindex="0">
        <div class="lead-card__top">
          <strong>${escapeHtml(lead.name || "Без имени")}</strong>
          <span class="priority-mark priority-mark--${escapeHtml(lead.priority || "normal")}" title="Приоритет: ${escapeHtml(lead.priority || "обычный")}"></span>
        </div>
        <a class="lead-card__phone" href="tel:${escapeHtml(lead.phone || "")}">${escapeHtml(lead.phone || "Телефон не указан")}</a>
        <p class="lead-card__interest">${escapeHtml(leadInterest(lead))}</p>
        ${
          lead.isRepeat || tags.length
            ? `<div class="lead-card__tags">${lead.isRepeat ? '<span class="repeat-badge">Повторная</span>' : ""}${tags
                .map((tag) => `<span>${escapeHtml(tag)}</span>`)
                .join("")}</div>`
            : ""
        }
        <div class="lead-card__meta">
          <time>${escapeHtml(formatRelative(lead.createdAt))}</time>
          <span class="lead-card__manager${manager ? "" : " is-empty"}" title="${escapeHtml(manager || "Не назначен")}">${escapeHtml(initials(manager))}</span>
        </div>
      </article>`;
  };

  const renderBoard = (leads) => {
    const container = qs("[data-leads-board]");
    if (!container) return;
    container.innerHTML = Object.entries(STATUS_META)
      .map(([status, meta]) => {
        const statusLeads = leads.filter((lead) => lead.status === status);
        return `
          <section class="pipeline-column" data-drop-status="${status}" style="--status-color:${meta.color}">
            <header class="pipeline-column__head"><strong>${escapeHtml(meta.label)}</strong><span>${statusLeads.length}</span></header>
            <div class="pipeline-cards">
              ${statusLeads.map(renderLeadCard).join("")}
            </div>
          </section>`;
      })
      .join("");
  };

  const renderTable = (leads) => {
    const body = qs("[data-leads-table]");
    if (!body) return;
    body.innerHTML = leads
      .map((lead) => {
        const meta = statusMeta(lead.status);
        return `
          <tr data-lead-id="${escapeHtml(lead.id)}" tabindex="0">
            <td><div class="table-client"><strong>${escapeHtml(lead.name || "Без имени")}</strong><span>${escapeHtml(lead.phone || "—")}</span></div></td>
            <td>${escapeHtml(leadInterest(lead))}</td>
            <td><span class="status-badge" style="--status-color:${meta.color}">${escapeHtml(meta.short)}</span></td>
            <td class="table-muted">${escapeHtml(lead.assignee || "Не назначен")}</td>
            <td class="table-muted">${escapeHtml(formatDate(lead.createdAt, true))}</td>
            <td class="row-arrow">→</td>
          </tr>`;
      })
      .join("");
  };

  const renderLeads = () => {
    const leads = getFilteredLeads();
    renderBoard(leads);
    renderTable(leads);
    const count = qs("[data-results-count]");
    if (count) count.textContent = `${leads.length} ${pluralize(leads.length, ["заявка", "заявки", "заявок"])}`;

    const empty = qs("[data-leads-empty]");
    const board = qs("[data-leads-board]");
    const table = qs("[data-leads-table-wrap]");
    const hasLeads = leads.length > 0;
    if (empty) empty.hidden = hasLeads;
    if (board) board.hidden = !hasLeads || state.layout !== "board";
    if (table) table.hidden = !hasLeads || state.layout !== "table";
    qsa("[data-lead-layout]").forEach((button) => button.classList.toggle("is-active", button.dataset.leadLayout === state.layout));
  };

  const pluralize = (number, forms) => {
    const mod10 = number % 10;
    const mod100 = number % 100;
    if (mod10 === 1 && mod100 !== 11) return forms[0];
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
    return forms[2];
  };

  const renderCrm = () => {
    renderMetrics();
    renderWeeklyChart();
    renderFunnel();
    renderRecentActivity();
    renderFilterOptions();
    renderLeads();
  };

  const loadCrm = async () => {
    setSyncState("Загрузка", "busy");
    try {
      const [leads, stats] = await Promise.all([api("/api/leads"), api("/api/crm/stats")]);
      state.leads = Array.isArray(leads) ? leads : [];
      state.stats = stats;
      renderCrm();
      setSyncState("Данные актуальны");
    } catch (error) {
      setSyncState("Нет соединения", "error");
      toast("CRM не загрузилась", error.message, "error");
    }
  };

  const refreshStats = async () => {
    state.stats = await api("/api/crm/stats");
    renderMetrics();
    renderWeeklyChart();
    renderFunnel();
    renderRecentActivity();
  };

  const toDatetimeLocal = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 16);
    const offset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };

  const setFormValue = (form, name, value) => {
    const field = form.elements.namedItem(name);
    if (field) field.value = value ?? "";
  };

  const renderTimeline = (lead) => {
    const container = qs("[data-lead-timeline]");
    if (!container) return;
    const activity = [...(lead?.activity || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    container.innerHTML = activity.length
      ? activity
          .map(
            (item) => `
              <article class="timeline-item">
                <strong>${escapeHtml(item.actor || "Система")}</strong>
                <p>${escapeHtml(readableActivity(item.text || "Обновление заявки"))}</p>
                <time>${escapeHtml(formatDate(item.createdAt, true))}</time>
              </article>`
          )
          .join("")
      : '<article class="timeline-item"><strong>История пуста</strong><p>Добавьте первую заметку.</p></article>';
  };

  const openDrawer = (leadId = null) => {
    const drawer = qs("[data-lead-drawer]");
    const backdrop = qs("[data-drawer-backdrop]");
    const form = qs("[data-lead-editor]");
    if (!drawer || !backdrop || !form) return;

    form.reset();
    const lead = leadId ? leadById(leadId) : null;
    state.drawerMode = lead ? "edit" : "create";
    state.selectedLeadId = lead?.id || null;

    const title = qs("[data-drawer-title]");
    const kicker = qs("[data-drawer-kicker]");
    const noteSection = qs("[data-note-section]");
    const deleteButton = qs("[data-delete-lead]");
    const actions = qs("[data-contact-actions]");

    if (lead) {
      if (title) title.textContent = lead.name || "Без имени";
      if (kicker) kicker.textContent = `Заявка от ${formatDate(lead.createdAt, true)}`;
      Object.entries(lead).forEach(([key, value]) => {
        if (["activity", "tags", "nextContactAt"].includes(key)) return;
        setFormValue(form, key, value);
      });
      setFormValue(form, "tags", (lead.tags || []).join(", "));
      setFormValue(form, "nextContactAt", toDatetimeLocal(lead.nextContactAt));
      if (noteSection) noteSection.hidden = false;
      if (deleteButton) {
        deleteButton.hidden = false;
        deleteButton.textContent = "Удалить";
        delete deleteButton.dataset.confirmDelete;
      }
      if (actions) actions.hidden = false;

      const phone = String(lead.phone || "");
      const digits = phone.replace(/\D/g, "");
      const phoneLink = qs("[data-contact-phone]");
      const whatsappLink = qs("[data-contact-whatsapp]");
      if (phoneLink) phoneLink.href = `tel:${phone}`;
      if (whatsappLink) whatsappLink.href = `https://wa.me/${digits}`;
      renderTimeline(lead);
    } else {
      if (title) title.textContent = "Новая заявка";
      if (kicker) kicker.textContent = "Добавление вручную";
      setFormValue(form, "status", "new");
      setFormValue(form, "priority", "normal");
      if (noteSection) noteSection.hidden = true;
      if (deleteButton) deleteButton.hidden = true;
      if (actions) actions.hidden = true;
      renderTimeline(null);
    }

    backdrop.hidden = false;
    drawer.inert = false;
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-drawer-open");
    requestAnimationFrame(() => drawer.classList.add("is-open"));
    window.setTimeout(() => form.elements.namedItem("name")?.focus(), 260);
  };

  const closeDrawer = () => {
    const drawer = qs("[data-lead-drawer]");
    const backdrop = qs("[data-drawer-backdrop]");
    if (!drawer || !backdrop) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-drawer-open");
    window.setTimeout(() => {
      backdrop.hidden = true;
      drawer.inert = true;
    }, 330);
  };

  const formPayload = (form) => {
    const payload = Object.fromEntries(new FormData(form).entries());
    delete payload.id;
    payload.tags = String(payload.tags || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    payload.budget = Number(payload.budget || 0);
    return payload;
  };

  const submitLead = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = qs("[data-submit-lead]");
    const payload = formPayload(form);
    const editing = state.drawerMode === "edit" && state.selectedLeadId;
    if (!editing) payload.source = "manual";

    if (button) {
      button.disabled = true;
      button.textContent = "Сохраняю…";
    }
    setSyncState("Сохранение", "busy");

    try {
      const result = await api(editing ? `/api/leads/${encodeURIComponent(state.selectedLeadId)}` : "/api/leads", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(payload)
      });
      const lead = result.lead;
      if (editing) {
        state.leads = state.leads.map((item) => (item.id === lead.id ? lead : item));
      } else {
        state.leads.unshift(lead);
      }
      renderFilterOptions();
      renderLeads();
      await refreshStats();
      setSyncState("Сохранено");
      toast(editing ? "Заявка обновлена" : "Заявка добавлена", lead.name || "Данные сохранены");
      closeDrawer();
    } catch (error) {
      setSyncState("Ошибка", "error");
      toast("Не удалось сохранить", error.message, "error");
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Сохранить заявку";
      }
    }
  };

  const addNote = async () => {
    const input = qs("[data-note-input]");
    const text = input?.value.trim();
    if (!state.selectedLeadId || !text) {
      toast("Введите текст заметки", "Пустые заметки не сохраняются", "error");
      return;
    }

    try {
      const result = await api(`/api/leads/${encodeURIComponent(state.selectedLeadId)}/notes`, {
        method: "POST",
        body: JSON.stringify({ text })
      });
      state.leads = state.leads.map((lead) => (lead.id === result.lead.id ? result.lead : lead));
      if (input) input.value = "";
      renderTimeline(result.lead);
      renderLeads();
      await refreshStats();
      toast("Заметка добавлена");
    } catch (error) {
      toast("Не удалось добавить заметку", error.message, "error");
    }
  };

  const deleteLead = async (button) => {
    if (!state.selectedLeadId) return;
    if (!button.dataset.confirmDelete) {
      button.dataset.confirmDelete = "true";
      button.textContent = "Нажмите ещё раз";
      window.setTimeout(() => {
        delete button.dataset.confirmDelete;
        button.textContent = "Удалить";
      }, 3500);
      return;
    }

    try {
      await api(`/api/leads/${encodeURIComponent(state.selectedLeadId)}`, { method: "DELETE" });
      state.leads = state.leads.filter((lead) => lead.id !== state.selectedLeadId);
      renderFilterOptions();
      renderLeads();
      await refreshStats();
      closeDrawer();
      toast("Заявка удалена");
    } catch (error) {
      toast("Не удалось удалить", error.message, "error");
    }
  };

  const moveLead = async (leadId, status) => {
    const lead = leadById(leadId);
    if (!lead || lead.status === status || !STATUS_META[status]) return;
    const previous = lead.status;
    lead.status = status;
    renderLeads();
    setSyncState("Сохранение", "busy");

    try {
      const result = await api(`/api/leads/${encodeURIComponent(leadId)}`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      state.leads = state.leads.map((item) => (item.id === leadId ? result.lead : item));
      await refreshStats();
      setSyncState("Сохранено");
      toast("Этап обновлён", `${lead.name}: ${statusMeta(status).short}`);
    } catch (error) {
      lead.status = previous;
      renderLeads();
      setSyncState("Ошибка", "error");
      toast("Не удалось сменить этап", error.message, "error");
    }
  };

  const exportLeads = () => {
    const leads = getFilteredLeads();
    if (!leads.length) {
      toast("Нет данных для экспорта", "Измените фильтры", "error");
      return;
    }
    const headers = ["Имя", "Телефон", "Email", "Статус", "Программа", "Страна", "Класс", "Старт", "Ответственный", "Создан"];
    const value = (item) => `"${String(item ?? "").replace(/"/g, '""')}"`;
    const rows = leads.map((lead) =>
      [lead.name, lead.phone, lead.email, statusMeta(lead.status).short, lead.program, lead.interest, lead.grade, lead.start, lead.assignee, lead.createdAt]
        .map(value)
        .join(";")
    );
    const blob = new Blob([`\ufeff${headers.map(value).join(";")}\n${rows.join("\n")}`], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `uniqu-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast("CSV подготовлен", `${leads.length} ${pluralize(leads.length, ["заявка", "заявки", "заявок"])}`);
  };

  const labelFor = (key) => labels[key] || key;
  const setByPath = (pathParts, value) => {
    const last = pathParts[pathParts.length - 1];
    const parent = pathParts.slice(0, -1).reduce((current, key) => current[key], state.content);
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

  const renderField = (value, pathParts, key) => {
    const wrapper = document.createElement("label");
    wrapper.className = "field";
    wrapper.innerHTML = `<span>${escapeHtml(labelFor(key))}</span>`;
    const longText = typeof value === "string" && (value.length > 90 || /copy|description|answer|quote|lead|text/i.test(key));
    const input = document.createElement(longText ? "textarea" : "input");
    if (input.tagName === "INPUT") input.type = typeof value === "number" ? "number" : "text";
    input.value = value ?? "";
    input.addEventListener("input", () => {
      setByPath(pathParts, typeof value === "number" ? Number(input.value) : input.value);
      setContentStatus("Есть несохранённые изменения");
    });
    wrapper.appendChild(input);
    return wrapper;
  };

  const renderNode = (value, pathParts, key = "") => {
    if (Array.isArray(value)) {
      const box = document.createElement("div");
      box.className = "array-box";
      box.innerHTML = `
        <div class="array-head">
          <strong>${escapeHtml(labelFor(key))}</strong>
          <button type="button">Добавить</button>
        </div>`;
      qs("button", box).addEventListener("click", () => {
        value.push(cloneTemplate(value));
        renderEditors();
        setContentStatus("Есть несохранённые изменения");
      });

      value.forEach((item, index) => {
        const itemBox = document.createElement("div");
        itemBox.className = "array-item";
        itemBox.innerHTML = `
          <div class="array-item-head">
            <strong>${escapeHtml(labelFor(key))} · ${index + 1}</strong>
            <button type="button">Удалить</button>
          </div>`;
        qs("button", itemBox).addEventListener("click", () => {
          value.splice(index, 1);
          renderEditors();
          setContentStatus("Есть несохранённые изменения");
        });
        itemBox.appendChild(renderNode(item, [...pathParts, index], `${index}`));
        box.appendChild(itemBox);
      });
      return box;
    }

    if (value && typeof value === "object") {
      const group = document.createElement("fieldset");
      group.className = `group is-collapsible${state.editorsCollapsed ? " is-collapsed" : ""}`;
      const legend = document.createElement("legend");
      legend.textContent = labelFor(key);
      legend.tabIndex = 0;
      legend.setAttribute("role", "button");
      legend.setAttribute("aria-expanded", String(!state.editorsCollapsed));
      const toggle = () => {
        group.classList.toggle("is-collapsed");
        legend.setAttribute("aria-expanded", String(!group.classList.contains("is-collapsed")));
      };
      legend.addEventListener("click", toggle);
      legend.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggle();
        }
      });
      group.appendChild(legend);
      Object.entries(value).forEach(([childKey, childValue]) => {
        group.appendChild(renderNode(childValue, [...pathParts, childKey], childKey));
      });
      return group;
    }

    return renderField(value, pathParts, key);
  };

  const renderLanguageTabs = () => {
    const tabs = qs("[data-language-tabs]");
    if (!tabs || !state.content?.settings?.languages) return;
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
    if (!state.content) return;
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
    try {
      state.content = await api("/api/content");
      state.lang = state.content.settings?.defaultLanguage || "ru";
      if (state.view === "content") renderEditors();
      setContentStatus("Контент синхронизирован");
    } catch (error) {
      setContentStatus(error.message);
      toast("Контент не загрузился", error.message, "error");
    }
  };

  const saveContent = async () => {
    if (!state.content) return;
    setContentStatus("Сохраняю изменения…");
    setSyncState("Сохранение", "busy");
    try {
      await api("/api/content", { method: "POST", body: JSON.stringify(state.content) });
      setContentStatus("Изменения сохранены");
      setSyncState("Сохранено");
      toast("Контент опубликован", "Обновите сайт, чтобы увидеть изменения");
    } catch (error) {
      setContentStatus(error.message);
      setSyncState("Ошибка", "error");
      toast("Контент не сохранён", error.message, "error");
    }
  };

  const bindBoardEvents = () => {
    const board = qs("[data-leads-board]");
    if (!board) return;

    board.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;
      const card = event.target.closest("[data-lead-id]");
      if (card) openDrawer(card.dataset.leadId);
    });
    board.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      const card = event.target.closest("[data-lead-id]");
      if (card) openDrawer(card.dataset.leadId);
    });
    board.addEventListener("dragstart", (event) => {
      const card = event.target.closest("[data-lead-id]");
      if (!card) return;
      state.draggedLeadId = card.dataset.leadId;
      card.classList.add("is-dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", state.draggedLeadId);
    });
    board.addEventListener("dragend", (event) => {
      event.target.closest("[data-lead-id]")?.classList.remove("is-dragging");
      qsa(".pipeline-column.is-drag-over", board).forEach((column) => column.classList.remove("is-drag-over"));
      state.draggedLeadId = null;
    });
    board.addEventListener("dragover", (event) => {
      const column = event.target.closest("[data-drop-status]");
      if (!column) return;
      event.preventDefault();
      qsa(".pipeline-column.is-drag-over", board).forEach((item) => item !== column && item.classList.remove("is-drag-over"));
      column.classList.add("is-drag-over");
      event.dataTransfer.dropEffect = "move";
    });
    board.addEventListener("dragleave", (event) => {
      const column = event.target.closest("[data-drop-status]");
      if (column && !column.contains(event.relatedTarget)) column.classList.remove("is-drag-over");
    });
    board.addEventListener("drop", (event) => {
      const column = event.target.closest("[data-drop-status]");
      if (!column) return;
      event.preventDefault();
      column.classList.remove("is-drag-over");
      const leadId = state.draggedLeadId || event.dataTransfer.getData("text/plain");
      moveLead(leadId, column.dataset.dropStatus);
    });
  };

  const bindActions = () => {
    qsa("[data-view-target]").forEach((button) => button.addEventListener("click", () => navigate(button.dataset.viewTarget)));
    qsa("[data-create-lead]").forEach((button) => button.addEventListener("click", () => openDrawer()));
    qs("[data-close-drawer]")?.addEventListener("click", closeDrawer);
    qs("[data-drawer-backdrop]")?.addEventListener("click", closeDrawer);
    qs("[data-lead-editor]")?.addEventListener("submit", submitLead);
    qs("[data-add-note]")?.addEventListener("click", addNote);
    qs("[data-delete-lead]")?.addEventListener("click", (event) => deleteLead(event.currentTarget));
    qs("[data-copy-phone]")?.addEventListener("click", async () => {
      const lead = leadById(state.selectedLeadId);
      if (!lead?.phone) return;
      await navigator.clipboard.writeText(lead.phone).catch(() => null);
      toast("Номер скопирован", lead.phone);
    });
    qs("[data-export-leads]")?.addEventListener("click", exportLeads);

    const search = qs("[data-lead-search]");
    search?.addEventListener("input", () => {
      state.filters.search = search.value;
      renderLeads();
    });
    ["status", "program", "assignee"].forEach((key) => {
      qs(`[data-filter-${key}]`)?.addEventListener("change", (event) => {
        state.filters[key] = event.target.value;
        renderLeads();
      });
    });
    qsa("[data-lead-layout]").forEach((button) =>
      button.addEventListener("click", () => {
        state.layoutTouched = true;
        state.layout = button.dataset.leadLayout;
        renderLeads();
      })
    );

    qs("[data-leads-table]")?.addEventListener("click", (event) => {
      const row = event.target.closest("[data-lead-id]");
      if (row) openDrawer(row.dataset.leadId);
    });
    qs("[data-leads-table]")?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      const row = event.target.closest("[data-lead-id]");
      if (row) openDrawer(row.dataset.leadId);
    });
    qs("[data-recent-activity]")?.addEventListener("click", (event) => {
      const item = event.target.closest("[data-open-lead]");
      if (item) openDrawer(item.dataset.openLead);
    });

    qs("[data-save]")?.addEventListener("click", saveContent);
    qs("[data-reload]")?.addEventListener("click", loadContent);
    qs("[data-export]")?.addEventListener("click", () => {
      if (!state.content) return;
      const area = qs("[data-json-area]");
      if (area) area.value = JSON.stringify(state.content, null, 2);
      toast("JSON подготовлен", "Скопируйте данные из поля ниже");
    });
    qs("[data-import]")?.addEventListener("click", () => {
      try {
        const imported = JSON.parse(qs("[data-json-area]")?.value || "");
        if (!imported.settings || !imported.translations) throw new Error("Неверная структура JSON");
        state.content = imported;
        state.lang = imported.settings.defaultLanguage || Object.keys(imported.translations)[0];
        renderEditors();
        setContentStatus("JSON применён. Сохраните изменения, чтобы опубликовать их.");
        navigate("content");
        toast("JSON импортирован", "Проверьте контент перед сохранением");
      } catch (error) {
        toast("Не удалось импортировать", error.message, "error");
      }
    });
    qs("[data-collapse-editors]")?.addEventListener("click", (event) => {
      state.editorsCollapsed = !state.editorsCollapsed;
      qsa(".editor-panel .group").forEach((group) => group.classList.toggle("is-collapsed", state.editorsCollapsed));
      qsa(".editor-panel .group > legend").forEach((legend) => legend.setAttribute("aria-expanded", String(!state.editorsCollapsed)));
      event.currentTarget.textContent = state.editorsCollapsed ? "Развернуть разделы" : "Свернуть разделы";
    });

    bindBoardEvents();

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && document.body.classList.contains("is-drawer-open")) closeDrawer();
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        navigate("leads");
        qs("[data-lead-search]")?.focus();
      }
    });

    window.addEventListener("online", () => {
      setSyncState("В сети");
      loadCrm();
    });
    window.addEventListener("offline", () => setSyncState("Нет сети", "error"));
  };

  const init = async () => {
    setGreeting();
    bindActions();
    const mobileLayout = window.matchMedia("(max-width: 680px)");
    state.layout = mobileLayout.matches ? "table" : "board";
    mobileLayout.addEventListener("change", (event) => {
      if (state.layoutTouched) return;
      state.layout = event.matches ? "table" : "board";
      renderLeads();
    });
    const initialView = location.hash.slice(1);
    navigate(["dashboard", "leads", "content", "tools"].includes(initialView) ? initialView : "dashboard");
    await Promise.allSettled([loadCrm(), loadContent()]);
  };

  init();
})();
