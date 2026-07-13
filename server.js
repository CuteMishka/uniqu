const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const rootDir = __dirname;
const dataDir = path.join(rootDir, "data");
const contentPath = path.join(dataDir, "site-content.json");
const leadsPath = path.join(dataDir, "leads.json");
const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || "127.0.0.1";
const adminUser = process.env.ADMIN_USER || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || "";

const STATUSES = ["new", "contacted", "consultation", "documents", "won", "lost"];
const PRIORITIES = ["low", "normal", "high"];
const LEAD_FIELDS = [
  "name",
  "phone",
  "email",
  "grade",
  "program",
  "start",
  "interest",
  "country",
  "language",
  "page",
  "source",
  "status",
  "priority",
  "assignee",
  "budget",
  "nextContactAt",
  "lostReason"
];

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

const send = (res, status, body, type = "application/json; charset=utf-8", headers = {}) => {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...headers
  });
  res.end(body);
};

const sendJson = (res, status, payload, headers) => {
  send(res, status, JSON.stringify(payload, null, 2), "application/json; charset=utf-8", headers);
};

const readJsonFile = (filePath, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    return fallback;
  }
};

const writeJsonFile = (filePath, payload) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.renameSync(tempPath, filePath);
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });

const parseBody = async (req) => {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body) return JSON.parse(req.body);
  const raw = await readBody(req);
  if (!raw) return {};
  return JSON.parse(raw);
};

const cleanText = (value, maxLength = 240) =>
  String(value ?? "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .trim()
    .slice(0, maxLength);

const id = () => `${Date.now()}-${crypto.randomBytes(5).toString("hex")}`;

const secureEqual = (left, right) => {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const hasAdminAccess = (req) => {
  if (!adminPassword) return true;
  const authorization = String(req.headers.authorization || "");
  if (!authorization.startsWith("Basic ")) return false;

  try {
    const [username, ...passwordParts] = Buffer.from(authorization.slice(6), "base64").toString("utf8").split(":");
    return secureEqual(username, adminUser) && secureEqual(passwordParts.join(":"), adminPassword);
  } catch (error) {
    return false;
  }
};

const requestNeedsAdmin = (url, method) => {
  const pathname = url.pathname;
  if (["/admin.html", "/admin.css", "/admin.js"].includes(pathname)) return true;
  if (pathname === "/api/content" && method !== "GET") return true;
  if (pathname === "/api/leads" && method === "GET") return true;
  if (pathname.startsWith("/api/leads/")) return true;
  if (pathname.startsWith("/api/crm/")) return true;
  return false;
};

const requireAdmin = (req, res, url) => {
  if (!requestNeedsAdmin(url, req.method) || hasAdminAccess(req)) return true;
  sendJson(
    res,
    401,
    { ok: false, message: "Требуется авторизация администратора" },
    { "WWW-Authenticate": 'Basic realm="UNIQU CRM", charset="UTF-8"' }
  );
  return false;
};

const normalizeCountry = (value) => {
  const country = cleanText(value, 2).toUpperCase();
  return /^[A-Z]{2}$/.test(country) ? country : null;
};

const getRequestCountry = (req) => {
  const countryHeaders = [
    "cf-ipcountry",
    "x-vercel-ip-country",
    "cloudfront-viewer-country",
    "x-appengine-country",
    "x-country-code",
    "x-country",
    "x-forwarded-country",
    "fastly-geo-country-code",
    "x-nf-country"
  ];

  for (const header of countryHeaders) {
    const country = normalizeCountry(req.headers[header]);
    if (country && country !== "XX") return country;
  }

  return null;
};

const safeStaticPath = (urlPath) => {
  let cleanPath;
  try {
    cleanPath = decodeURIComponent(urlPath.split("?")[0]);
  } catch (error) {
    return null;
  }

  const relativePath = cleanPath === "/" ? "index.html" : cleanPath.replace(/^\/+/, "");
  const fullPath = path.resolve(rootDir, relativePath);
  const relative = path.relative(rootDir, fullPath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;

  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    return path.join(fullPath, "index.html");
  }

  if (!path.extname(fullPath)) {
    const htmlPath = `${fullPath}.html`;
    if (fs.existsSync(htmlPath)) return htmlPath;

    const indexPath = path.join(fullPath, "index.html");
    if (fs.existsSync(indexPath)) return indexPath;
  }

  return fullPath;
};

const sanitizeLeadFields = (payload, allowCrmFields = false) => {
  const next = {};
  LEAD_FIELDS.forEach((field) => {
    if (!(field in payload)) return;
    if (!allowCrmFields && ["status", "priority", "assignee", "budget", "lostReason"].includes(field)) return;

    if (field === "budget") {
      const budget = Number(payload[field]);
      next[field] = Number.isFinite(budget) && budget >= 0 ? Math.round(budget) : 0;
      return;
    }

    const limits = { page: 1000, name: 100, phone: 60, email: 160, lostReason: 500 };
    next[field] = cleanText(payload[field], limits[field] || 240);
  });

  if (Array.isArray(payload.tags)) {
    next.tags = [...new Set(payload.tags.map((tag) => cleanText(tag, 40)).filter(Boolean))].slice(0, 12);
  }

  if (next.status && !STATUSES.includes(next.status)) delete next.status;
  if (next.priority && !PRIORITIES.includes(next.priority)) delete next.priority;
  return next;
};

const normalizeLead = (lead) => ({
  id: cleanText(lead.id, 100) || id(),
  createdAt: lead.createdAt || new Date().toISOString(),
  updatedAt: lead.updatedAt || lead.createdAt || new Date().toISOString(),
  source: cleanText(lead.source, 80) || "site",
  status: STATUSES.includes(lead.status) ? lead.status : "new",
  priority: PRIORITIES.includes(lead.priority) ? lead.priority : "normal",
  assignee: cleanText(lead.assignee, 100),
  tags: Array.isArray(lead.tags) ? lead.tags.map((tag) => cleanText(tag, 40)).filter(Boolean).slice(0, 12) : [],
  activity: Array.isArray(lead.activity) ? lead.activity.slice(-100) : [],
  ...lead
});

const readLeads = () => {
  const leads = readJsonFile(leadsPath, []);
  return Array.isArray(leads) ? leads.map(normalizeLead) : [];
};

const addActivity = (lead, activity) => {
  const list = Array.isArray(lead.activity) ? lead.activity : [];
  lead.activity = [
    ...list,
    {
      id: id(),
      createdAt: new Date().toISOString(),
      actor: cleanText(activity.actor, 80) || "Администратор",
      type: cleanText(activity.type, 40) || "update",
      text: cleanText(activity.text, 1000)
    }
  ].slice(-100);
};

const buildStats = (leads) => {
  const now = Date.now();
  const day = 86_400_000;
  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);
  const statusCounts = Object.fromEntries(STATUSES.map((status) => [status, 0]));
  const sourceCounts = {};

  leads.forEach((lead) => {
    statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
    const source = lead.source || "site";
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
  });

  const weekly = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startToday.getTime() - (6 - index) * day);
    const next = new Date(date.getTime() + day);
    return {
      date: date.toISOString().slice(0, 10),
      count: leads.filter((lead) => {
        const createdAt = new Date(lead.createdAt).getTime();
        return createdAt >= date.getTime() && createdAt < next.getTime();
      }).length
    };
  });

  const recentActivity = leads
    .flatMap((lead) =>
      (lead.activity || []).map((activity) => ({
        ...activity,
        leadId: lead.id,
        leadName: lead.name || "Без имени"
      }))
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  const previousWeek = leads.filter((lead) => {
    const createdAt = new Date(lead.createdAt).getTime();
    return createdAt >= now - 14 * day && createdAt < now - 7 * day;
  }).length;
  const currentWeek = leads.filter((lead) => new Date(lead.createdAt).getTime() >= now - 7 * day).length;

  return {
    total: leads.length,
    today: leads.filter((lead) => new Date(lead.createdAt).getTime() >= startToday.getTime()).length,
    active: (statusCounts.contacted || 0) + (statusCounts.consultation || 0) + (statusCounts.documents || 0),
    won: statusCounts.won || 0,
    conversion: leads.length ? Math.round(((statusCounts.won || 0) / leads.length) * 1000) / 10 : 0,
    currentWeek,
    previousWeek,
    statusCounts,
    sourceCounts,
    weekly,
    recentActivity
  };
};

const submissionBuckets = new Map();
const allowSubmission = (req) => {
  if (!adminPassword || hasAdminAccess(req)) return true;
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  const key = forwarded || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const recent = (submissionBuckets.get(key) || []).filter((time) => now - time < 10 * 60_000);
  if (recent.length >= 10) return false;
  recent.push(now);
  submissionBuckets.set(key, recent);
  return true;
};

const findLeadMatch = (pathname) => {
  const match = pathname.match(/^\/api\/leads\/([^/]+)(?:\/(notes))?$/);
  if (!match) return null;
  return { id: decodeURIComponent(match[1]), action: match[2] || "" };
};

const handleApi = async (req, res, url) => {
  if (url.pathname === "/api/health") {
    sendJson(res, 200, { ok: true, crm: true, authEnabled: Boolean(adminPassword) });
    return true;
  }

  if (url.pathname === "/api/geo-language" && req.method === "GET") {
    const queryCountry = normalizeCountry(url.searchParams.get("country"));
    const country = queryCountry || getRequestCountry(req);
    sendJson(res, 200, {
      ok: true,
      country,
      lang: country === "UZ" ? "uz" : "ru",
      source: queryCountry ? "query" : country ? "header" : "default"
    });
    return true;
  }

  if (url.pathname === "/api/content" && req.method === "GET") {
    const content = readJsonFile(contentPath, {});
    const contacts = content.settings?.contacts;
    const integrations = content.settings?.integrations;
    if (contacts) {
      if (process.env.UZ_PHONE) contacts.uzPhone = process.env.UZ_PHONE;
      if (process.env.UZ_PHONE_LINK) contacts.uzPhoneLink = process.env.UZ_PHONE_LINK;
      if (process.env.TELEGRAM_URL) contacts.telegramUrl = process.env.TELEGRAM_URL;
    }
    if (integrations && process.env.CLARITY_PROJECT_ID) {
      integrations.clarityProjectId = process.env.CLARITY_PROJECT_ID;
    }
    sendJson(res, 200, content);
    return true;
  }

  if (url.pathname === "/api/content" && req.method === "POST") {
    try {
      const payload = await parseBody(req);
      if (!payload || typeof payload !== "object" || !payload.settings || !payload.translations) {
        sendJson(res, 400, { ok: false, message: "Неверная структура контента" });
        return true;
      }
      writeJsonFile(contentPath, payload);
      sendJson(res, 200, { ok: true, savedAt: new Date().toISOString() });
    } catch (error) {
      sendJson(res, 400, { ok: false, message: error.message });
    }
    return true;
  }

  if (url.pathname === "/api/leads" && req.method === "GET") {
    const leads = readLeads();
    sendJson(res, 200, leads);
    return true;
  }

  if (url.pathname === "/api/leads" && req.method === "POST") {
    try {
      if (!allowSubmission(req)) {
        sendJson(res, 429, { ok: false, message: "Слишком много заявок. Повторите позже." });
        return true;
      }

      const payload = await parseBody(req);
      const manualEntry = hasAdminAccess(req) && cleanText(payload.source, 40) === "manual";
      const fields = sanitizeLeadFields(payload, manualEntry);
      const missing = ["name", "phone"].filter((field) => !fields[field]);
      const phoneDigits = cleanText(fields.phone, 60).replace(/\D/g, "");

      if (missing.length || phoneDigits.length < 7) {
        sendJson(res, 400, { ok: false, message: "Укажите имя и корректный телефон" });
        return true;
      }

      const leads = readLeads();
      const isRepeat = leads.some((lead) => cleanText(lead.phone, 60).replace(/\D/g, "") === phoneDigits);
      const now = new Date().toISOString();
      const lead = normalizeLead({
        ...fields,
        id: id(),
        createdAt: now,
        updatedAt: now,
        source: manualEntry ? "manual" : "site",
        status: manualEntry && STATUSES.includes(fields.status) ? fields.status : "new",
        priority: manualEntry && PRIORITIES.includes(fields.priority) ? fields.priority : "normal",
        isRepeat,
        activity: []
      });
      addActivity(lead, {
        actor: manualEntry ? "Администратор" : "Сайт",
        type: "created",
        text: manualEntry ? "Лид добавлен вручную" : "Получена новая заявка с лендинга"
      });

      leads.unshift(lead);
      writeJsonFile(leadsPath, leads);
      sendJson(res, 201, { ok: true, lead });
    } catch (error) {
      sendJson(res, 400, { ok: false, message: error.message });
    }
    return true;
  }

  if (url.pathname === "/api/crm/stats" && req.method === "GET") {
    sendJson(res, 200, buildStats(readLeads()));
    return true;
  }

  const leadMatch = findLeadMatch(url.pathname);
  if (leadMatch) {
    const leads = readLeads();
    const index = leads.findIndex((lead) => lead.id === leadMatch.id);
    if (index === -1) {
      sendJson(res, 404, { ok: false, message: "Лид не найден" });
      return true;
    }

    if (req.method === "GET" && !leadMatch.action) {
      sendJson(res, 200, leads[index]);
      return true;
    }

    if (req.method === "PATCH" && !leadMatch.action) {
      try {
        const payload = await parseBody(req);
        const before = leads[index];
        const updates = sanitizeLeadFields(payload, true);
        const changedFields = Object.keys(updates).filter(
          (key) => JSON.stringify(updates[key]) !== JSON.stringify(before[key])
        );

        if (!changedFields.length) {
          sendJson(res, 200, { ok: true, lead: before });
          return true;
        }

        const updated = normalizeLead({ ...before, ...updates, updatedAt: new Date().toISOString() });
        if (updates.status && updates.status !== before.status) {
          addActivity(updated, {
            type: "status",
            text: `Статус изменён: ${before.status} → ${updates.status}`
          });
        } else {
          addActivity(updated, {
            type: "update",
            text: `Обновлены поля: ${changedFields.join(", ")}`
          });
        }

        leads[index] = updated;
        writeJsonFile(leadsPath, leads);
        sendJson(res, 200, { ok: true, lead: updated });
      } catch (error) {
        sendJson(res, 400, { ok: false, message: error.message });
      }
      return true;
    }

    if (req.method === "POST" && leadMatch.action === "notes") {
      try {
        const payload = await parseBody(req);
        const note = cleanText(payload.text, 1000);
        if (!note) {
          sendJson(res, 400, { ok: false, message: "Введите текст заметки" });
          return true;
        }
        addActivity(leads[index], { type: "note", text: note, actor: payload.actor });
        leads[index].updatedAt = new Date().toISOString();
        writeJsonFile(leadsPath, leads);
        sendJson(res, 201, { ok: true, lead: leads[index] });
      } catch (error) {
        sendJson(res, 400, { ok: false, message: error.message });
      }
      return true;
    }

    if (req.method === "DELETE" && !leadMatch.action) {
      const [removed] = leads.splice(index, 1);
      writeJsonFile(leadsPath, leads);
      sendJson(res, 200, { ok: true, deletedId: removed.id });
      return true;
    }
  }

  return false;
};

const requestHandler = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    if (!requireAdmin(req, res, url)) return;

    if (await handleApi(req, res, url)) return;

    if (url.pathname.startsWith("/api/")) {
      sendJson(res, 404, { ok: false, message: "API endpoint not found" });
      return;
    }

    const fullPath = safeStaticPath(url.pathname);
    if (!fullPath) {
      sendJson(res, 403, { ok: false, message: "Forbidden" });
      return;
    }

    fs.readFile(fullPath, (error, data) => {
      if (error) {
        sendJson(res, 404, { ok: false, message: "File not found" });
        return;
      }
      const type = mimeTypes[path.extname(fullPath).toLowerCase()] || "application/octet-stream";
      send(res, 200, data, type);
    });
  } catch (error) {
    sendJson(res, 500, { ok: false, message: "Internal server error" });
  }
};

if (require.main === module) {
  http.createServer(requestHandler).listen(port, host, () => {
    console.log(`UNIQU CRM is running at http://${host}:${port}/`);
    console.log(`Admin panel: http://${host}:${port}/admin.html`);
    if (!adminPassword) {
      console.log("Admin authentication is disabled. Set ADMIN_PASSWORD before production use.");
    }
  });
}

module.exports = requestHandler;
