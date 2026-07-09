(function () {
  const CACHE_KEY = "uniqu-geo-language";
  const CACHE_TTL = 6 * 60 * 60 * 1000;
  const UZ_TIMEZONES = new Set(["Asia/Tashkent", "Asia/Samarkand"]);

  const safeStorage = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch (error) {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {
        // Ignore storage restrictions. Language detection should still work for this session.
      }
    }
  };

  const normalizeLanguage = (language, available, fallback) =>
    available.includes(language) ? language : fallback;

  const getExplicitLanguage = (available) => {
    const requested = new URLSearchParams(window.location.search).get("lang");
    if (available.includes(requested)) {
      return requested;
    }

    const stored = safeStorage.get("uniqu-lang");
    return available.includes(stored) ? stored : null;
  };

  const readCache = (available) => {
    try {
      const cached = JSON.parse(safeStorage.get(CACHE_KEY) || "null");
      if (!cached || Date.now() > cached.expiresAt) return null;
      return normalizeLanguage(cached.language, available, null);
    } catch (error) {
      return null;
    }
  };

  const writeCache = (language, source) => {
    safeStorage.set(
      CACHE_KEY,
      JSON.stringify({
        language,
        source,
        expiresAt: Date.now() + CACHE_TTL
      })
    );
  };

  const inferFromBrowser = () => {
    const languages = [navigator.language, ...(navigator.languages || [])].filter(Boolean);
    const hasUzLocale = languages.some((language) => /^uz\b/i.test(language) || /[-_]UZ$/i.test(language));
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (hasUzLocale || UZ_TIMEZONES.has(timezone)) {
      return "uz";
    }

    return null;
  };

  const fetchGeoLanguage = async (endpoint) => {
    const response = await fetch(endpoint, {
      cache: "no-store",
      credentials: "same-origin"
    }).catch(() => null);

    if (!response?.ok) return null;
    const payload = await response.json().catch(() => null);
    if (!payload?.country && payload?.source === "default") return null;
    return payload?.lang || null;
  };

  const detectDefaultLanguage = async ({ available = ["ru", "kz", "en", "uz"], fallback = "ru", endpoint = "/api/geo-language" } = {}) => {
    const explicit = getExplicitLanguage(available);
    if (explicit) return explicit;

    const cached = readCache(available);
    if (cached) return cached;

    const geoLanguage = normalizeLanguage(await fetchGeoLanguage(endpoint), available, null);
    if (geoLanguage) {
      writeCache(geoLanguage, "geo");
      return geoLanguage;
    }

    const browserLanguage = normalizeLanguage(inferFromBrowser(), available, null);
    if (browserLanguage) {
      writeCache(browserLanguage, "browser");
      return browserLanguage;
    }

    return fallback;
  };

  window.UniqGeoLanguage = {
    detectDefaultLanguage
  };
})();
