const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const APP_ROOT = __dirname;

// ── Mạch HeyNa SSE — module scope state ────────────────────
const _machClients = new Set();

function broadcastMach(event, payload) {
  if (_machClients.size === 0) return;
  const data = "data: " + JSON.stringify({ event: event, payload: payload, ts: Date.now() }) + "\n\n";
  for (const client of _machClients) {
    try { client.write(data); } catch (e) { _machClients.delete(client); }
  }
}

const EXCLUDES = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  ".nuxt",
  "coverage",
  ".cache",
  ".turbo",
  "__pycache__",
  ".venv",
  "venv"
]);

function exists(p) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

function isExcluded(relativePath) {
  return relativePath.split(path.sep).some(part => EXCLUDES.has(part));
}

function walkFiles(dir, out = []) {
  let items = [];
  try {
    items = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }

  for (const item of items) {
    const full = path.join(dir, item.name);
    const rel = path.relative(APP_ROOT, full);

    if (isExcluded(rel)) continue;

    if (item.isDirectory()) {
      walkFiles(full, out);
    } else {
      out.push(full);
    }
  }

  return out;
}

function getHtmlFiles() {
  return walkFiles(APP_ROOT)
    .filter(file => file.toLowerCase().endsWith(".html"))
    .sort((a, b) => path.relative(APP_ROOT, a).localeCompare(path.relative(APP_ROOT, b)));
}

function getMime(file) {
  const ext = path.extname(file).toLowerCase();
  const map = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".map": "application/json; charset=utf-8"
  };

  return map[ext] || "application/octet-stream";
}

function safeResolve(urlPath) {
  let decoded = "";
  try {
    decoded = decodeURIComponent(urlPath.split("?")[0]);
  } catch {
    decoded = urlPath.split("?")[0];
  }

  decoded = decoded.replace(/^\/+/, "");

  if (!decoded) return null;

  const full = path.resolve(APP_ROOT, decoded);
  const root = path.resolve(APP_ROOT);

  if (!full.startsWith(root)) return null;

  return full;
}

function htmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function indexPage() {
  const htmlFiles = getHtmlFiles();
  const groups = {};

  for (const file of htmlFiles) {
    const rel = path.relative(APP_ROOT, file).replaceAll(path.sep, "/");
    const dir = path.dirname(rel);
    const group = dir === "." ? "root" : dir;

    if (!groups[group]) groups[group] = [];
    groups[group].push(rel);
  }

  const sections = Object.entries(groups).map(([group, files]) => {
    const links = files.map(rel => {
      return `
        <a class="card" href="/${encodeURI(rel)}" target="_blank">
          <b>${htmlEscape(path.basename(rel))}</b>
          <code>${htmlEscape(rel)}</code>
        </a>
      `;
    }).join("");

    return `
      <section class="group">
        <h2>${htmlEscape(group)} <span>${files.length}</span></h2>
        <div class="grid">${links}</div>
      </section>
    `;
  }).join("");

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Tâm Luxury App — Local Deploy</title>
  <style>
    :root {
      --bg: #020617;
      --panel: #0f172a;
      --line: #1e293b;
      --txt: #e2e8f0;
      --muted: #94a3b8;
      --cyan: #67e8f9;
      --purple: #c084fc;
      --gold: #fbbf24;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      background:
        radial-gradient(circle at 15% 10%, rgba(192,132,252,.12), transparent 32%),
        radial-gradient(circle at 85% 25%, rgba(103,232,249,.10), transparent 30%),
        var(--bg);
      color: var(--txt);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    header {
      position: sticky;
      top: 0;
      z-index: 10;
      background: rgba(2,6,23,.86);
      backdrop-filter: blur(14px);
      border-bottom: 1px solid var(--line);
      padding: 18px 22px;
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: center;
    }

    h1 {
      margin: 0;
      font-size: 15px;
      letter-spacing: .16em;
      color: var(--purple);
      text-transform: uppercase;
    }

    .sub {
      font: 12px ui-monospace, SFMono-Regular, Menlo, monospace;
      color: var(--muted);
      margin-top: 6px;
    }

    .badge {
      border: 1px solid rgba(103,232,249,.35);
      color: var(--cyan);
      padding: 8px 10px;
      border-radius: 999px;
      font: 12px ui-monospace, SFMono-Regular, Menlo, monospace;
      background: rgba(15,23,42,.75);
      white-space: nowrap;
    }

    main {
      padding: 22px;
      max-width: 1440px;
      margin: auto;
    }

    .toolbar {
      display: flex;
      gap: 10px;
      margin-bottom: 18px;
    }

    input {
      width: min(560px, 100%);
      background: #000;
      border: 1px solid #334155;
      color: #fff;
      border-radius: 12px;
      padding: 12px 14px;
      font: 13px ui-monospace, SFMono-Regular, Menlo, monospace;
      outline: none;
    }

    input:focus {
      border-color: var(--purple);
      box-shadow: 0 0 0 3px rgba(192,132,252,.12);
    }

    .group {
      margin: 0 0 24px;
    }

    .group h2 {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .14em;
      color: var(--cyan);
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .group h2 span {
      font-size: 10px;
      color: #020617;
      background: var(--cyan);
      padding: 2px 7px;
      border-radius: 999px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 12px;
    }

    .card {
      display: block;
      text-decoration: none;
      color: var(--txt);
      background: rgba(15,23,42,.82);
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 14px;
      min-height: 84px;
      transition: .18s;
    }

    .card:hover {
      border-color: var(--purple);
      transform: translateY(-1px);
      box-shadow: 0 0 24px rgba(192,132,252,.13);
    }

    .card b {
      display: block;
      font-size: 13px;
      margin-bottom: 10px;
      color: #fff;
    }

    .card code {
      display: block;
      color: var(--muted);
      font-size: 11px;
      line-height: 1.45;
      word-break: break-all;
    }

    .empty {
      display: none;
      color: #fca5a5;
      border: 1px solid #7f1d1d;
      background: #450a0a;
      padding: 12px;
      border-radius: 12px;
    }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>TÂM LUXURY APP — LOCAL DEPLOY</h1>
      <div class="sub">Root: ${htmlEscape(APP_ROOT)} · HTML screens: ${htmlFiles.length}</div>
    </div>
    <div class="badge">nattos-server/server.js</div>
  </header>

  <main>
    <div class="toolbar">
      <input id="q" placeholder="Tìm màn hình HTML theo tên/path..." autofocus />
    </div>
    <div id="empty" class="empty">Không tìm thấy màn hình phù hợp.</div>
    <div id="content">${sections || "<p>Không có file HTML.</p>"}</div>
  </main>

  <script>
    const q = document.getElementById("q");
    const cards = [...document.querySelectorAll(".card")];
    const groups = [...document.querySelectorAll(".group")];
    const empty = document.getElementById("empty");

    q.addEventListener("input", () => {
      const s = q.value.toLowerCase().trim();
      let visible = 0;

      cards.forEach(card => {
        const ok = !s || card.textContent.toLowerCase().includes(s);
        card.style.display = ok ? "" : "none";
        if (ok) visible++;
      });

      groups.forEach(group => {
        const any = [...group.querySelectorAll(".card")].some(card => card.style.display !== "none");
        group.style.display = any ? "" : "none";
      });

      empty.style.display = visible ? "none" : "block";
    });
  </script>
</body>
</html>`;
}

function sendJson(res, data) {
  const raw = Buffer.from(JSON.stringify(data, null, 2), "utf8");

  res.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": raw.length
  });

  res.end(raw);
}

function handler(req, res) {
  const parsed = new URL(req.url, "http://localhost");

  if (parsed.pathname === "/favicon.ico") {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── Mạch HeyNa SSE endpoint — SPEC v2.4 §12-13 OPT-01R ──
  if (parsed.pathname === "/mach/heyna") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*"
    });
    res.write("data: " + JSON.stringify({ event: "Nahere", payload: { state: "alive" }, ts: Date.now() }) + "\n\n");
    _machClients.add(res);
    const _heartbeat = setInterval(function () {
      try { res.write(": heartbeat " + Date.now() + "\n\n"); } catch (e) {}
    }, 30000);
    req.on("close", function () {
      clearInterval(_heartbeat);
      _machClients.delete(res);
    });
    return;
  }

  if (parsed.pathname === "/api/health") {
    sendJson(res, {
      ok: true,
      app: "tam-luxury",
      server: "nattos-server/server.js",
      root: APP_ROOT,
      html_screens: getHtmlFiles().length,
      time: Date.now()
    });
    return;
  }

  if (parsed.pathname === "/api/screens") {
    const screens = getHtmlFiles().map(file => path.relative(APP_ROOT, file).replaceAll(path.sep, "/"));

    sendJson(res, {
      ok: true,
      root: APP_ROOT,
      count: screens.length,
      screens
    });
    return;
  }

  if (parsed.pathname === "/" || parsed.pathname === "/index") {
    const raw = Buffer.from(indexPage(), "utf8");

    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Length": raw.length,
      "Cache-Control": "no-store"
    });

    res.end(raw);
    return;
  }

  const full = safeResolve(parsed.pathname);

  if (!full || !exists(full)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found: " + parsed.pathname);
    return;
  }

  const stat = fs.statSync(full);

  if (stat.isDirectory()) {
    const indexFile = path.join(full, "index.html");

    if (exists(indexFile)) {
      res.writeHead(200, {
        "Content-Type": getMime(indexFile),
        "Cache-Control": "no-store"
      });
      fs.createReadStream(indexFile).pipe(res);
      return;
    }

    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("403 Directory listing disabled");
    return;
  }

  res.writeHead(200, {
    "Content-Type": getMime(full),
    "Cache-Control": "no-store"
  });

  fs.createReadStream(full).pipe(res);
}

function findPort(start = 3001, end = 3025) {
  return new Promise((resolve, reject) => {
    const tryPort = port => {
      if (port > end) {
        reject(new Error("No free port in range " + start + "-" + end));
        return;
      }

      const srv = http.createServer();

      srv.once("error", () => tryPort(port + 1));

      srv.once("listening", () => {
        srv.close(() => resolve(port));
      });

      srv.listen(port, "127.0.0.1");
    };

    tryPort(start);
  });
}

(async function main() {
  const htmlFiles = getHtmlFiles();

  if (!htmlFiles.length) {
    console.error("❌ Không tìm thấy file .html trong nattos-server.");
    console.error("APP_ROOT:", APP_ROOT);
    process.exit(1);
  }

  const port = await findPort();
  const server = http.createServer(handler);

  server.listen(port, "127.0.0.1", () => {
    const url = `http://127.0.0.1:${port}/`;

    console.log("");
    console.log("=".repeat(88));
    console.log("TÂM LUXURY APP — LOCAL JS DEPLOY");
    console.log("=".repeat(88));
    console.log("APP_ROOT :", APP_ROOT);
    console.log("SERVER   :", path.join(APP_ROOT, "server.js"));
    console.log("SCREENS  :", htmlFiles.length);
    console.log("URL      :", url);
    console.log("HEALTH   :", `${url}api/health`);
    console.log("SCREENS  :", `${url}api/screens`);
    console.log("");
    console.log("Giữ terminal này đang chạy để app hoạt động.");
    console.log("Dừng server: Ctrl + C");
    console.log("=".repeat(88));
    console.log("");

    const openCmd =
      process.platform === "darwin" ? "open" :
      process.platform === "win32" ? "start" :
      "xdg-open";

    try {
      exec(`${openCmd} "${url}"`);
    } catch {}
  });
})();
