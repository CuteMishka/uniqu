const http = require("http");
const fs = require("fs");
const path = require("path");

const rootDir = __dirname;
const dataDir = path.join(rootDir, "data");
const contentPath = path.join(dataDir, "site-content.json");
const leadsPath = path.join(dataDir, "leads.json");
const port = Number(process.env.PORT || 5173);

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

const send = (res, status, body, type = "application/json; charset=utf-8") => {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store"
  });
  res.end(body);
};

const sendJson = (res, status, payload) => {
  send(res, status, JSON.stringify(payload, null, 2));
};

const readJsonFile = (filePath, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    return fallback;
  }
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 5_000_000) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });

const safeStaticPath = (urlPath) => {
  const cleanPath = decodeURIComponent(urlPath.split("?")[0]);
  const relativePath = cleanPath === "/" ? "index.html" : cleanPath.replace(/^\/+/, "");
  const fullPath = path.resolve(rootDir, relativePath);

  if (!fullPath.startsWith(rootDir)) {
    return null;
  }

  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    return path.join(fullPath, "index.html");
  }

  if (!path.extname(fullPath)) {
    const htmlPath = `${fullPath}.html`;
    if (fs.existsSync(htmlPath)) {
      return htmlPath;
    }

    const indexPath = path.join(fullPath, "index.html");
    if (fs.existsSync(indexPath)) {
      return indexPath;
    }
  }

  return fullPath;
};

const handleApi = async (req, res, url) => {
  if (url.pathname === "/api/health") {
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (url.pathname === "/api/content" && req.method === "GET") {
    sendJson(res, 200, readJsonFile(contentPath, {}));
    return true;
  }

  if (url.pathname === "/api/content" && req.method === "POST") {
    try {
      const payload = JSON.parse(await readBody(req));
      if (!payload || typeof payload !== "object" || !payload.settings || !payload.translations) {
        sendJson(res, 400, { ok: false, message: "Invalid content structure" });
        return true;
      }

      fs.writeFileSync(contentPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
      sendJson(res, 200, { ok: true, savedAt: new Date().toISOString() });
    } catch (error) {
      sendJson(res, 400, { ok: false, message: error.message });
    }
    return true;
  }

  if (url.pathname === "/api/leads" && req.method === "GET") {
    sendJson(res, 200, readJsonFile(leadsPath, []));
    return true;
  }

  if (url.pathname === "/api/leads" && req.method === "POST") {
    try {
      const payload = JSON.parse(await readBody(req));
      const required = ["name", "phone"];
      const missing = required.filter((field) => !String(payload[field] || "").trim());

      if (missing.length) {
        sendJson(res, 400, { ok: false, message: `Missing fields: ${missing.join(", ")}` });
        return true;
      }

      const leads = readJsonFile(leadsPath, []);
      const lead = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        createdAt: new Date().toISOString(),
        source: "site",
        ...payload
      };

      leads.unshift(lead);
      fs.writeFileSync(leadsPath, `${JSON.stringify(leads, null, 2)}\n`, "utf8");
      sendJson(res, 200, { ok: true, lead });
    } catch (error) {
      sendJson(res, 400, { ok: false, message: error.message });
    }
    return true;
  }

  return false;
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (await handleApi(req, res, url)) {
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
});

server.listen(port, "127.0.0.1", () => {
  console.log(`UNIQU local CMS is running at http://127.0.0.1:${port}/`);
  console.log(`Admin panel: http://127.0.0.1:${port}/admin.html`);
});
