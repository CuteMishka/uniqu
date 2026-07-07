const body = document.body;
const header = document.querySelector("[data-header]");
const preloader = document.querySelector(".preloader");
const modal = document.querySelector("[data-modal]");
const openModalButtons = document.querySelectorAll("[data-open-modal]");
const closeModalButtons = document.querySelectorAll("[data-close-modal]");
const menu = document.querySelector("[data-menu]");
const menuToggle = document.querySelector(".menu-toggle");
const menuClose = document.querySelector(".menu-close");
const levelSelect = document.querySelector("#levelSelect");
const countrySelect = document.querySelector("#countrySelect");
const budgetResult = document.querySelector("#budgetResult");
const leadForm = document.querySelector("#leadForm");
const universityTrack = document.querySelector("[data-university-track]");
const universityPrev = document.querySelector("[data-carousel-prev]");
const universityNext = document.querySelector("[data-carousel-next]");
const motionOK = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pointerFine = window.matchMedia("(pointer: fine)").matches;
const canUsePointerMotion = motionOK && pointerFine;

body.classList.add("is-loading");

let preloaderHidden = false;

const hidePreloader = () => {
  if (preloaderHidden) return;
  preloaderHidden = true;
  preloader.classList.add("is-hidden");
  body.classList.remove("is-loading");
};

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(hidePreloader, 1350);
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

window.addEventListener("load", () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

setTimeout(hidePreloader, 2600);

const setHeaderState = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
);

const observeReveals = (root = document) => {
  const elements = root.querySelectorAll?.(".reveal") || [];
  elements.forEach((element) => {
    if (element.dataset.revealBound === "true") return;
    element.dataset.revealBound = "true";
    revealObserver.observe(element);
  });
};

window.initRevealSystem = observeReveals;
observeReveals();

const sectionMotionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("is-inview", entry.isIntersecting);
    });
  },
  { rootMargin: "-12% 0px -18% 0px", threshold: 0.18 }
);

const interactiveCardSelector = [
  ".program-card",
  ".university-card",
  ".country",
  ".review",
  ".service-item",
  ".move-card",
  ".move-fear__summary",
  ".move-fear__timeline div",
  ".case-card",
  ".country-detail-panel",
  ".country-detail-tab",
  ".why-card",
  ".about-photo",
  ".step",
  ".faq-item",
  ".student-channel__panel",
  ".youtube-player",
  ".integration-shell"
].join(", ");

const motionTargetSelector = [
  ".primary-button",
  ".ghost-link",
  ".carousel-button",
  ".icon-button",
  ".integration-link",
  ".desktop-nav a",
  ".mobile-menu a",
  ".faq-item summary",
  ".country-detail-tab"
].join(", ");

const bindInteractiveCards = (root = document) => {
  root.querySelectorAll(interactiveCardSelector).forEach((card) => {
    if (card.dataset.motionCardBound === "true") return;
    card.dataset.motionCardBound = "true";
    card.classList.add("motion-card");

    card.addEventListener(
      "pointermove",
      (event) => {
        if (!canUsePointerMotion) return;
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        card.classList.add("is-pointer");
        card.style.setProperty("--tilt-x", `${(x - 0.5) * 3.2}deg`);
        card.style.setProperty("--tilt-y", `${(0.5 - y) * 3.2}deg`);
        card.style.setProperty("--spot-x", `${x * 100}%`);
        card.style.setProperty("--spot-y", `${y * 100}%`);
      },
      { passive: true }
    );

    card.addEventListener("pointerleave", () => {
      card.classList.remove("is-pointer");
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--spot-x", "50%");
      card.style.setProperty("--spot-y", "50%");
    });
  });
};

const bindMotionTargets = (root = document) => {
  root.querySelectorAll(motionTargetSelector).forEach((target) => {
    if (target.dataset.motionTargetBound === "true") return;
    target.dataset.motionTargetBound = "true";
    target.classList.add("motion-target");

    target.addEventListener(
      "pointermove",
      (event) => {
        if (!canUsePointerMotion) return;
        const rect = target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const pullX = ((x / rect.width) - 0.5) * 5;
        const pullY = ((y / rect.height) - 0.5) * 5;
        target.style.setProperty("--btn-x", `${x}px`);
        target.style.setProperty("--btn-y", `${y}px`);
        target.style.setProperty("--mag-x", `${pullX}px`);
        target.style.setProperty("--mag-y", `${pullY}px`);
      },
      { passive: true }
    );

    target.addEventListener("pointerleave", () => {
      target.style.setProperty("--btn-x", "50%");
      target.style.setProperty("--btn-y", "50%");
      target.style.setProperty("--mag-x", "0px");
      target.style.setProperty("--mag-y", "0px");
    });

    target.addEventListener("click", (event) => {
      if (!motionOK || !target.matches(".primary-button, .carousel-button, .icon-button")) return;
      const rect = target.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "button-ripple";
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      target.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    });
  });
};

const initMotionSystem = (root = document) => {
  const sections = root === document ? document.querySelectorAll("main > section") : root.querySelectorAll?.("main > section, section");
  sections?.forEach((section, index) => {
    section.classList.add("motion-section");
    section.style.setProperty("--section-index", index % 6);
    const useAura = section.matches(".section-dark, .hero, .steps, .consult-band");
    if (useAura && !section.querySelector(":scope > .section-aura")) {
      const aura = document.createElement("span");
      aura.className = "section-aura";
      aura.setAttribute("aria-hidden", "true");
      section.prepend(aura);
    }
    if (section.dataset.motionSectionBound === "true") return;
    section.dataset.motionSectionBound = "true";
    sectionMotionObserver.observe(section);

    if (useAura) {
      section.addEventListener(
        "pointermove",
        (event) => {
          if (!canUsePointerMotion) return;
          const rect = section.getBoundingClientRect();
          section.classList.add("is-hovered");
          section.style.setProperty("--mx", `${event.clientX - rect.left}px`);
          section.style.setProperty("--my", `${event.clientY - rect.top}px`);
        },
        { passive: true }
      );

      section.addEventListener("pointerleave", () => {
        section.classList.remove("is-hovered");
        section.style.setProperty("--mx", "50%");
        section.style.setProperty("--my", "50%");
      });
    }
  });

  const staggerItems = root.querySelectorAll?.(".motion-section .reveal, .program-strip .program-card") || [];
  staggerItems.forEach((item, index) => {
    item.style.setProperty("--stagger", `${Math.min(index % 8, 7) * 70}ms`);
  });

  observeReveals(root);
  bindInteractiveCards(root);
  bindMotionTargets(root);
};

window.initMotionSystem = initMotionSystem;
initMotionSystem();

const parseCounterConfig = (element) => {
  const visibleText = element.textContent.trim();
  const sourceText = element.dataset.counter || visibleText;
  const targetMatch = String(sourceText).replace(/\s+/g, "").match(/-?\d+(?:[.,]\d+)?/);
  if (!targetMatch) return null;

  const target = Number(targetMatch[0].replace(",", "."));
  if (!Number.isFinite(target)) return null;

  const labelMatch = visibleText.match(/^(.*?)(-?\d[\d\s.,]*)(.*)$/);
  const visibleNumber = labelMatch ? Number(labelMatch[2].replace(/\s+/g, "").replace(",", ".")) : NaN;
  const decimals = labelMatch?.[2]?.match(/[.,](\d+)/)?.[1]?.length || 0;

  return {
    target,
    prefix: element.dataset.counterPrefix ?? (labelMatch?.[1] || ""),
    suffix: element.dataset.counterSuffix ?? (labelMatch?.[3] || ""),
    decimals,
    useGrouping: element.dataset.counterGrouping === "true" || Boolean(labelMatch?.[2]?.includes(" ")),
    finalText: element.dataset.counterLabel || (visibleNumber === target ? visibleText : "")
  };
};

const formatCounterValue = (value, config) => {
  const rounded = config.decimals > 0 ? value.toFixed(config.decimals).replace(".", ",") : Math.round(value);
  const number = config.useGrouping && config.decimals === 0 ? Number(rounded).toLocaleString("ru-RU") : String(rounded);
  return `${config.prefix}${number}${config.suffix}`;
};

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const element = entry.target;
      const config = parseCounterConfig(element);
      if (!config) return;

      if (!motionOK) {
        element.textContent = config.finalText || formatCounterValue(config.target, config);
        counterObserver.unobserve(element);
        return;
      }

      const duration = 1300;
      const start = performance.now();
      element.classList.add("is-counting");

      const tick = (time) => {
        const progress = Math.min((time - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = formatCounterValue(config.target * eased, config);

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          element.textContent = config.finalText || formatCounterValue(config.target, config);
          element.classList.remove("is-counting");
          element.classList.add("is-counted");
        }
      };

      element.textContent = formatCounterValue(0, config);
      requestAnimationFrame(tick);
      counterObserver.unobserve(element);
    });
  },
  { threshold: 0.6 }
);

const initCounters = (root = document) => {
  root.querySelectorAll?.("[data-counter]").forEach((element) => {
    if (element.dataset.counterBound === "true") return;
    const config = parseCounterConfig(element);
    if (!config) return;
    element.dataset.counterBound = "true";
    element.textContent = formatCounterValue(0, config);
    counterObserver.observe(element);
  });
};

window.initCounters = initCounters;
initCounters();

const budgets = {
  foundation: {
    china: "от 1 200 000 ₸",
    turkey: "от 1 600 000 ₸",
    italy: "от 2 100 000 ₸",
  },
  bachelor: {
    china: "от 0 ₸ при гранте",
    turkey: "от 1 900 000 ₸",
    italy: "от 900 000 ₸ при гранте",
  },
  master: {
    china: "от 1 800 000 ₸",
    turkey: "от 2 200 000 ₸",
    italy: "от 1 200 000 ₸ при гранте",
  },
};

const updateBudget = () => {
  if (!levelSelect || !countrySelect || !budgetResult) return;
  const level = levelSelect.value;
  const country = countrySelect.value;
  budgetResult.textContent = budgets[level][country];
};

if (levelSelect && countrySelect && budgetResult) {
  levelSelect.addEventListener("change", updateBudget);
  countrySelect.addEventListener("change", updateBudget);
  updateBudget();
}

const openModal = () => {
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
};

const closeModal = () => {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  setTimeout(() => modal.classList.remove("is-success"), 260);
};

openModalButtons.forEach((button) => button.addEventListener("click", openModal));
closeModalButtons.forEach((button) => button.addEventListener("click", closeModal));

document.addEventListener("click", (event) => {
  const trigger = event.target instanceof Element ? event.target.closest("[data-open-modal]") : null;
  if (trigger) {
    openModal();
  }

  const closeTrigger = event.target instanceof Element ? event.target.closest("[data-close-modal]") : null;
  if (closeTrigger) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
    closeMenu();
  }
});

leadForm.addEventListener("submit", (event) => {
  event.preventDefault();
  modal.classList.add("is-success");
  leadForm.reset();
});

const openMenu = () => {
  menu.classList.add("is-open");
};

function closeMenu() {
  menu.classList.remove("is-open");
}

menuToggle.addEventListener("click", openMenu);
menuClose.addEventListener("click", closeMenu);
menu.querySelectorAll("a, [data-open-modal]").forEach((item) => {
  item.addEventListener("click", closeMenu);
});

document.addEventListener("click", (event) => {
  const summary = event.target instanceof Element ? event.target.closest(".faq-item summary") : null;
  if (!summary) return;
  const current = summary.closest(".faq-item");
  if (!current || current.open) return;
  document.querySelectorAll(".faq-item[open]").forEach((item) => {
    if (item !== current) item.removeAttribute("open");
  });
});

const lavaCursor = document.querySelector(".lava-cursor");
const canUseLavaCursor =
  lavaCursor &&
  window.matchMedia("(pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let pointerX = window.innerWidth * 0.5;
let pointerY = window.innerHeight * 0.5;
let currentX = pointerX;
let currentY = pointerY;

if (canUseLavaCursor) {
  body.classList.add("has-lava-cursor");

  window.addEventListener(
    "pointermove",
    (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      lavaCursor.classList.add("is-active");
    },
    { passive: true }
  );

  document.documentElement.addEventListener("mouseleave", () => {
    lavaCursor.classList.remove("is-active", "is-button", "is-link", "is-media", "is-hidden");
  });

  const cursorTargets = [
    { selector: "button, .primary-button, .carousel-button, .icon-button, .country-detail-tab", state: "is-button" },
    {
      selector:
        ".country, .program-card, .review, .university-card, .service-item, .fact, .step, .calculator__panel, .result-box, .country-detail-panel, .move-card, .case-card, .why-card, .about-photo",
      state: "is-media",
    },
    { selector: "a, [role='button']", state: "is-link" },
  ];

  const getCursorTarget = (target, selector) => (target instanceof Element ? target.closest(selector) : null);

  document.addEventListener(
    "pointerover",
    (event) => {
      cursorTargets.forEach(({ selector, state }) => {
        if (getCursorTarget(event.target, selector)) {
          lavaCursor.classList.add(state);
        }
      });

      if (getCursorTarget(event.target, "input, select, textarea")) {
        lavaCursor.classList.add("is-hidden");
      }
    },
    { passive: true }
  );

  document.addEventListener(
    "pointerout",
    (event) => {
      cursorTargets.forEach(({ selector, state }) => {
        const current = getCursorTarget(event.target, selector);
        const next = getCursorTarget(event.relatedTarget, selector);
        if (current && current !== next) {
          lavaCursor.classList.remove(state);
        }
      });

      const currentField = getCursorTarget(event.target, "input, select, textarea");
      const nextField = getCursorTarget(event.relatedTarget, "input, select, textarea");
      if (currentField && currentField !== nextField) {
        lavaCursor.classList.remove("is-hidden");
      }
    },
    { passive: true }
  );
}

const initCountryTabs = (root = document) => {
  const tabGroups = root.matches?.("[data-country-tabs]")
    ? [root, ...root.querySelectorAll("[data-country-tabs]")]
    : [...root.querySelectorAll("[data-country-tabs]")];

  tabGroups.forEach((tabs) => {
    const updateIndicator = () => {
      const nav = tabs.querySelector(".country-detail-nav");
      const activeButton = tabs.querySelector("[data-country-tab].is-active");
      if (!nav || !activeButton) return;

      const navRect = nav.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      tabs.style.setProperty("--country-tab-x", `${buttonRect.left - navRect.left + nav.scrollLeft}px`);
      tabs.style.setProperty("--country-tab-y", `${buttonRect.top - navRect.top + nav.scrollTop}px`);
      tabs.style.setProperty("--country-tab-w", `${buttonRect.width}px`);
      tabs.style.setProperty("--country-tab-h", `${buttonRect.height}px`);
    };

    const activate = (country, shouldFocus = false) => {
      const buttons = [...tabs.querySelectorAll("[data-country-tab]")];
      const panels = [...tabs.querySelectorAll("[data-country-panel]")];
      if (!buttons.length || !panels.length) return;
      const currentCountry = tabs.querySelector("[data-country-tab].is-active")?.dataset.countryTab;
      const shouldAnimate = Boolean(currentCountry && currentCountry !== country && motionOK);

      if (shouldAnimate) {
        tabs.classList.remove("is-switching");
        void tabs.offsetWidth;
        tabs.classList.add("is-switching");
        window.clearTimeout(tabs.countrySwitchTimer);
        tabs.countrySwitchTimer = window.setTimeout(() => tabs.classList.remove("is-switching"), 680);
      }

      buttons.forEach((button) => {
        const isActive = button.dataset.countryTab === country;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-selected", String(isActive));
        button.tabIndex = isActive ? 0 : -1;
        if (isActive && shouldFocus) {
          const nav = tabs.querySelector(".country-detail-nav");
          const targetLeft = button.offsetLeft - ((nav?.clientWidth || 0) - button.offsetWidth) / 2;
          button.focus({ preventScroll: true });
          nav?.scrollTo({ left: Math.max(0, targetLeft), behavior: motionOK ? "smooth" : "auto" });
        }
      });

      panels.forEach((panel) => {
        const isActive = panel.dataset.countryPanel === country;
        panel.classList.toggle("is-active", isActive);
        panel.setAttribute("aria-hidden", String(!isActive));
      });

      requestAnimationFrame(updateIndicator);
      window.clearTimeout(tabs.countryIndicatorTimer);
      tabs.countryIndicatorTimer = window.setTimeout(updateIndicator, shouldAnimate ? 360 : 80);
    };

    tabs.activateCountry = activate;

    if (tabs.dataset.countryTabsBound !== "true") {
      tabs.dataset.countryTabsBound = "true";
      const nav = tabs.querySelector(".country-detail-nav");
      nav?.addEventListener("scroll", updateIndicator, { passive: true });
      window.addEventListener("resize", updateIndicator, { passive: true });

      tabs.addEventListener("click", (event) => {
        const button = event.target instanceof Element ? event.target.closest("[data-country-tab]") : null;
        if (!button || !tabs.contains(button)) return;
        activate(button.dataset.countryTab, true);
      });

      tabs.addEventListener("keydown", (event) => {
        const button = event.target instanceof Element ? event.target.closest("[data-country-tab]") : null;
        if (!button || !tabs.contains(button)) return;

        const buttons = [...tabs.querySelectorAll("[data-country-tab]")];
        const index = buttons.indexOf(button);
        const nextIndex =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? buttons.length - 1
              : event.key === "ArrowRight" || event.key === "ArrowDown"
                ? (index + 1 + buttons.length) % buttons.length
                : event.key === "ArrowLeft" || event.key === "ArrowUp"
                  ? (index - 1 + buttons.length) % buttons.length
                  : -1;

        if (nextIndex < 0 || index < 0) return;
        event.preventDefault();
        activate(buttons[nextIndex].dataset.countryTab, true);
      });
    }

    const buttons = [...tabs.querySelectorAll("[data-country-tab]")];
    const activeButton = buttons.find((button) => button.classList.contains("is-active")) || buttons[0];
    activate(activeButton.dataset.countryTab);
  });
};

window.initCountryTabs = initCountryTabs;
initCountryTabs();

const animateLava = () => {
  if (!canUseLavaCursor) return;
  currentX += (pointerX - currentX) * 0.12;
  currentY += (pointerY - currentY) * 0.12;
  const size = lavaCursor.offsetWidth || 8;
  lavaCursor.style.transform = `translate3d(${currentX - size / 2}px, ${currentY - size / 2}px, 0)`;

  requestAnimationFrame(animateLava);
};

if (canUseLavaCursor) {
  animateLava();
}

if (universityTrack && universityPrev && universityNext) {
  const getCardStep = () => {
    const card = universityTrack.querySelector(".university-card");
    if (!card) return 360;
    const styles = window.getComputedStyle(universityTrack);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 22;
    return card.getBoundingClientRect().width + gap;
  };

  const scrollUniversities = (direction = 1) => {
    const maxScroll = universityTrack.scrollWidth - universityTrack.clientWidth - 4;
    const nextLeft = universityTrack.scrollLeft + getCardStep() * direction;

    if (nextLeft > maxScroll) {
      universityTrack.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    if (nextLeft < 0) {
      universityTrack.scrollTo({ left: universityTrack.scrollWidth, behavior: "smooth" });
      return;
    }

    universityTrack.scrollBy({ left: getCardStep() * direction, behavior: "smooth" });
  };

  universityPrev.addEventListener("click", () => scrollUniversities(-1));
  universityNext.addEventListener("click", () => scrollUniversities(1));

  let carouselTimer = window.setInterval(scrollUniversities, 3600);
  const pauseCarousel = () => window.clearInterval(carouselTimer);
  const resumeCarousel = () => {
    carouselTimer = window.setInterval(scrollUniversities, 3600);
  };

  universityTrack.addEventListener("pointerenter", pauseCarousel);
  universityTrack.addEventListener("pointerleave", resumeCarousel);
}
