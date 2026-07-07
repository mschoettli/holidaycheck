const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";
const PUBLIC_DIR = path.join(__dirname, "public");
const SESSION_COOKIE = "holidaycheck_session";
const SESSION_TTL_MS = Number(process.env.SESSION_TTL_SECONDS || 86400) * 1000;

const sessions = new Map();

function parseUsers() {
  const users = new Map();

  Object.keys(process.env)
    .filter((key) => /^HOLIDAYCHECK_USER_\d+_NAME$/.test(key))
    .sort((left, right) => {
      const leftNumber = Number(left.match(/\d+/)[0]);
      const rightNumber = Number(right.match(/\d+/)[0]);
      return leftNumber - rightNumber;
    })
    .forEach((nameKey) => {
      const userNumber = nameKey.match(/\d+/)[0];
      const passwordKey = `HOLIDAYCHECK_USER_${userNumber}_PASSWORD`;
      const username = String(process.env[nameKey] || "").trim().toLowerCase();
      const password = String(process.env[passwordKey] || "");

      if (username && password) {
        users.set(username, password);
      }
    });

  if (!users.size) {
    throw new Error(
      "No holidaycheck users configured. Set HOLIDAYCHECK_USER_1_NAME and HOLIDAYCHECK_USER_1_PASSWORD in the environment."
    );
  }

  return users;
}

const users = parseUsers();

function sendJson(res, statusCode, payload, headers = {}) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...headers
  });
  res.end(JSON.stringify(payload));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function parseCookies(req) {
  return Object.fromEntries(
    (req.headers.cookie || "")
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const separator = cookie.indexOf("=");
        return separator === -1
          ? [cookie, ""]
          : [cookie.slice(0, separator), decodeURIComponent(cookie.slice(separator + 1))];
      })
  );
}

function createSession(username) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, {
    username,
    expiresAt: Date.now() + SESSION_TTL_MS
  });
  return token;
}

function getSession(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }
  return { token, ...session };
}

function timingSafeEqualText(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function contentTypeFor(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".ico": "image/x-icon"
  }[extension] || "application/octet-stream";
}

function serveStatic(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(requestUrl.pathname);
  const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(PUBLIC_DIR, safePath === "/" ? "index.html" : safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (statError, stat) => {
    if (statError || !stat.isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": contentTypeFor(filePath),
      "Cache-Control": filePath.endsWith("index.html") ? "no-store" : "public, max-age=3600"
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

async function handleApi(req, res) {
  if (req.method === "GET" && req.url === "/health") {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === "GET" && req.url === "/api/session") {
    const session = getSession(req);
    sendJson(res, session ? 200 : 401, session ? { ok: true, username: session.username } : { ok: false });
    return;
  }

  if (req.method === "POST" && req.url === "/api/login") {
    try {
      const payload = await readJson(req);
      const username = String(payload.username || "").trim().toLowerCase();
      const password = String(payload.password || "");
      const expectedPassword = users.get(username);

      if (!expectedPassword || !timingSafeEqualText(password, expectedPassword)) {
        sendJson(res, 401, { ok: false });
        return;
      }

      const token = createSession(username);
      sendJson(res, 200, { ok: true }, {
        "Set-Cookie": `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`
      });
    } catch (error) {
      sendJson(res, 400, { ok: false });
    }
    return;
  }

  if (req.method === "POST" && req.url === "/api/logout") {
    const session = getSession(req);
    if (session) sessions.delete(session.token);
    sendJson(res, 200, { ok: true }, {
      "Set-Cookie": `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`
    });
    return;
  }

  sendJson(res, 404, { ok: false });
}

const server = http.createServer((req, res) => {
  if (req.url === "/health" || req.url.startsWith("/api/")) {
    handleApi(req, res);
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405);
    res.end("Method not allowed");
    return;
  }

  serveStatic(req, res);
});

server.listen(PORT, HOST, () => {
  console.log(`holidaycheck listening on ${HOST}:${PORT}`);
});
