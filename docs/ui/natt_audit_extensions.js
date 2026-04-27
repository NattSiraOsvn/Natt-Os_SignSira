(() => {
  if (window.__NATT_AUDIT_EXTENSION_HUB__) return;
  window.__NATT_AUDIT_EXTENSION_HUB__ = true;

  const style = document.createElement("style");
  style.textContent = `
    #nattExtToggle{position:fixed;right:18px;bottom:18px;z-index:99999;background:#2e1065;color:#e9d5ff;border:1px solid #a855f7;border-radius:999px;padding:10px 14px;font:700 11px JetBrains Mono,monospace;box-shadow:0 0 20px rgba(168,85,247,.45)}
    #nattExtHub{position:fixed;right:18px;bottom:64px;width:min(390px,calc(100vw - 36px));height:min(500px,calc(100vh - 96px));min-width:300px;min-height:320px;max-width:calc(100vw - 36px);max-height:calc(100vh - 96px);resize:both;z-index:99998;background:rgba(2,6,23,.97);border:1px solid rgba(168,85,247,.55);border-radius:16px;box-shadow:0 0 35px rgba(0,0,0,.65);display:none;overflow:hidden;color:#e2e8f0;font-family:Inter,sans-serif}
    #nattExtHub.open{display:flex;flex-direction:column}
    .nattExtHead{padding:12px 14px;border-bottom:1px solid #1e293b;display:flex;justify-content:space-between;align-items:center;background:#0f172a}
    .nattExtTitle{font:800 12px JetBrains Mono,monospace;color:#c084fc;letter-spacing:.08em}
    .nattExtBody{padding:12px;display:flex;flex-direction:column;gap:10px;min-height:0;flex:1}
    .nattExtGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .nattExtBtn{background:#111827;border:1px solid #334155;color:#cbd5e1;border-radius:10px;padding:8px 9px;text-align:left;font:700 10px JetBrains Mono,monospace}
    .nattExtBtn:hover{border-color:#a855f7;color:#fff;background:#1e1b4b}
    .nattExtSearch{display:flex;gap:6px}
    .nattExtSearch input{flex:1;background:#020617;border:1px solid #334155;color:#fff;border-radius:8px;padding:8px;font:11px JetBrains Mono,monospace}
    .nattExtOut{flex:1;min-height:0;background:#000;border:1px solid #1e293b;border-radius:10px;padding:10px;overflow:auto;white-space:pre-wrap;font:10px JetBrains Mono,monospace;color:#94a3b8}
    .nattExtBadge{font:700 9px JetBrains Mono,monospace;border:1px solid #334155;border-radius:999px;padding:3px 7px;color:#67e8f9}
    .nattExtCopy{font:700 9px JetBrains Mono,monospace;border:1px solid #475569;border-radius:999px;padding:4px 8px;color:#d8b4fe;background:#111827;cursor:pointer}
    .nattExtCopy:hover{border-color:#a855f7;color:#fff;background:#312e81}\n    .nattExtSizeBtn{font:700 9px JetBrains Mono,monospace;border:1px solid #334155;border-radius:999px;padding:4px 8px;color:#93c5fd;background:#0f172a;cursor:pointer}\n    .nattExtSizeBtn:hover{border-color:#38bdf8;color:#fff;background:#082f49}
  `;
  document.head.appendChild(style);

  const toggle = document.createElement("button");
  toggle.id = "nattExtToggle";
  toggle.textContent = "⚡ Runtime Hub";
  document.body.appendChild(toggle);

  const hub = document.createElement("div");
  hub.id = "nattExtHub";
  hub.innerHTML = `
    <div class="nattExtHead">
      <div>
        <div class="nattExtTitle">natt-os RUNTIME EXTENSION HUB</div>
        <div style="font:10px JetBrains Mono,monospace;color:#64748b;margin-top:3px">Live APIs attached to localhost backend</div>
      </div>
      <div style="display:flex;gap:6px;align-items:center"><button id="nattExtSmall" class="nattExtSizeBtn">SMALL</button><button id="nattExtReset" class="nattExtSizeBtn">RESET</button><button id="nattExtCopy" class="nattExtCopy">COPY OUTPUT</button><span class="nattExtBadge">LOCAL ONLY</span></div>
    </div>
    <div class="nattExtBody">
      <div class="nattExtGrid">
        <button class="nattExtBtn" data-action="health">HEALTH<br><span style="color:#64748b">runtime/server</span></button>
        <button class="nattExtBtn" data-action="git">GIT STATUS<br><span style="color:#64748b">branch/head/dirty</span></button>
        <button class="nattExtBtn" data-action="wave">WAVE SCAN<br><span style="color:#64748b">runtime maturity</span></button>
        <button class="nattExtBtn" data-action="repo">REPO SCAN<br><span style="color:#64748b">extensions/refs</span></button>
        <button class="nattExtBtn" data-action="tsc">BUILD GATE<br><span style="color:#64748b">npx tsc --noEmit</span></button>
        <button class="nattExtBtn" data-action="audit">AUDIT TAIL<br><span style="color:#64748b">audit files</span></button>
        <button class="nattExtBtn" data-action="docs">DOCS INDEX<br><span style="color:#64748b">spec/legal/market</span></button>
        <button class="nattExtBtn" data-action="emit">EVENT TEST<br><span style="color:#64748b">proxy/dry-run</span></button>
      </div>
      <div class="nattExtSearch">
        <input id="nattExtQuery" placeholder="Search repo: EventEnvelope, KhaiCell, localStorage..." />
        <button class="nattExtBtn" data-action="search" style="width:92px;text-align:center">SEARCH</button>
      </div>
      <pre id="nattExtOut" class="nattExtOut">Runtime Hub ready. Use buttons above.</pre>
    </div>
  `;
  document.body.appendChild(hub);

  toggle.onclick = () => hub.classList.toggle("open");

  const HUB_LAYOUT_KEY = "natt_audit_runtime_hub_layout_v1";

  function clampHubSize(width, height) {
    const maxW = Math.max(300, window.innerWidth - 36);
    const maxH = Math.max(320, window.innerHeight - 96);
    return {
      width: Math.min(Math.max(width, 300), maxW),
      height: Math.min(Math.max(height, 320), maxH)
    };
  }

  function applyHubLayout() {
    try {
      const saved = JSON.parse(localStorage.getItem(HUB_LAYOUT_KEY) || "{}");
      if (saved.width && saved.height) {
        const s = clampHubSize(saved.width, saved.height);
        hub.style.width = s.width + "px";
        hub.style.height = s.height + "px";
      }
    } catch (e) {}
  }

  function saveHubLayout() {
    try {
      const rect = hub.getBoundingClientRect();
      localStorage.setItem(HUB_LAYOUT_KEY, JSON.stringify({
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      }));
    } catch (e) {}
  }

  function setHubSmall() {
    const s = clampHubSize(330, 390);
    hub.style.width = s.width + "px";
    hub.style.height = s.height + "px";
    saveHubLayout();
    if (typeof window.logTerm === "function") window.logTerm("RuntimeHub: compact size applied", "pass");
  }

  function resetHubSize() {
    localStorage.removeItem(HUB_LAYOUT_KEY);
    hub.style.width = "min(390px,calc(100vw - 36px))";
    hub.style.height = "min(500px,calc(100vh - 96px))";
    if (typeof window.logTerm === "function") window.logTerm("RuntimeHub: size reset", "pass");
  }

  applyHubLayout();

  let hubResizeTimer = null;
  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(() => {
      clearTimeout(hubResizeTimer);
      hubResizeTimer = setTimeout(saveHubLayout, 250);
    });
    ro.observe(hub);
  }



  const out = hub.querySelector("#nattExtOut");
  function print(label, obj) {
    const text = typeof obj === "string" ? obj : JSON.stringify(obj, null, 2);
    out.textContent = `[${new Date().toLocaleTimeString()}] ${label}\n\n${text}`;
    if (typeof window.logTerm === "function") window.logTerm(`RuntimeHub: ${label}`, "sys");
  }

  async function get(path) {
    const r = await fetch(path, { cache: "no-store" });
    return await r.json();
  }

  async function post(path, body) {
    const r = await fetch(path, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body || {}) });
    return await r.json();
  }


  async function copyRuntimeOutput() {
    const text = out ? out.textContent : "";
    if (!text.trim()) {
      print("COPY OUTPUT", "No runtime output to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      if (typeof window.logTerm === "function") window.logTerm("RuntimeHub: copied output to clipboard", "pass");
      const old = copyBtn ? copyBtn.textContent : "";
      if (copyBtn) {
        copyBtn.textContent = "COPIED";
        setTimeout(() => { copyBtn.textContent = old || "COPY OUTPUT"; }, 900);
      }
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand("copy");
        if (typeof window.logTerm === "function") window.logTerm("RuntimeHub: copied output by fallback", "pass");
      } finally {
        document.body.removeChild(ta);
      }
    }
  }

  const copyBtn = hub.querySelector("#nattExtCopy");
  if (copyBtn) copyBtn.addEventListener("click", copyRuntimeOutput);

  const smallBtn = hub.querySelector("#nattExtSmall");
  const resetBtn = hub.querySelector("#nattExtReset");
  if (smallBtn) smallBtn.addEventListener("click", setHubSmall);
  if (resetBtn) resetBtn.addEventListener("click", resetHubSize);


  async function action(name) {
    try {
      print(name, "running...");
      if (name === "health") return print("HEALTH", await get("/api/health"));
      if (name === "git") return print("GIT STATUS", await get("/api/git"));
      if (name === "wave") return print("WAVE SCAN", await get("/api/wave"));
      if (name === "repo") return print("REPO SCAN", await get("/api/repo-scan"));
      if (name === "tsc") return print("BUILD GATE", await get("/api/build-tsc"));
      if (name === "audit") return print("AUDIT TAIL", await get("/api/audit-tail"));
      if (name === "docs") return print("DOCS INDEX", await get("/api/docs-index"));
      if (name === "emit") return print("EVENT TEST", await post("/api/emit", { type:"runtime.ui_extension_test", payload:{ source:"audit-ui", ts:Date.now() }, cell:"runtime-cell" }));
      if (name === "search") {
        const q = encodeURIComponent(hub.querySelector("#nattExtQuery").value || "");
        return print("REPO SEARCH", await get("/api/repo-search?q=" + q));
      }
    } catch (e) {
      print("error", e.message || String(e));
    }
  }

  hub.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", () => action(btn.getAttribute("data-action")));
  });

  if (typeof window.logTerm === "function") {
    window.logTerm("Runtime Extension Hub attached. Open ⚡ Runtime Hub.", "pass");
  }
})();
