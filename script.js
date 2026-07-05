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

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const element = entry.target;
      const target = Number(element.dataset.counter);
      const duration = 1300;
      const start = performance.now();

      const tick = (time) => {
        const progress = Math.min((time - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);
        element.textContent = target >= 1000 ? value.toLocaleString("ru-RU") : value;

        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);
      counterObserver.unobserve(element);
    });
  },
  { threshold: 0.6 }
);

document.querySelectorAll("[data-counter]").forEach((element) => counterObserver.observe(element));

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
  const level = levelSelect.value;
  const country = countrySelect.value;
  budgetResult.textContent = budgets[level][country];
};

levelSelect.addEventListener("change", updateBudget);
countrySelect.addEventListener("change", updateBudget);
updateBudget();

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

document.querySelectorAll(".lang-switcher button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".lang-switcher button").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
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
    { selector: "button, .primary-button, .carousel-button, .icon-button", state: "is-button" },
    {
      selector:
        ".country, .program-card, .review, .university-card, .service-item, .fact, .step, .calculator__panel, .result-box",
      state: "is-media",
    },
    { selector: "a, [role='button']", state: "is-link" },
  ];

  cursorTargets.forEach(({ selector, state }) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.addEventListener("pointerenter", () => lavaCursor.classList.add(state));
      element.addEventListener("pointerleave", () => lavaCursor.classList.remove(state));
    });
  });

  document.querySelectorAll("input, select, textarea").forEach((element) => {
    element.addEventListener("pointerenter", () => lavaCursor.classList.add("is-hidden"));
    element.addEventListener("pointerleave", () => lavaCursor.classList.remove("is-hidden"));
  });
}

const tiltCards = document.querySelectorAll(
  ".program-card, .university-card, .country, .review, .service-item, .calculator__panel"
);

tiltCards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const tiltX = (x - 0.5) * 7;
    const tiltY = (0.5 - y) * 7;

    card.style.setProperty("--tilt-x", `${tiltX}deg`);
    card.style.setProperty("--tilt-y", `${tiltY}deg`);
    card.style.setProperty("--spot-x", `${x * 100}%`);
    card.style.setProperty("--spot-y", `${y * 100}%`);
  });

  card.addEventListener("pointerleave", () => {
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
    card.style.setProperty("--spot-x", "50%");
    card.style.setProperty("--spot-y", "50%");
  });
});

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
