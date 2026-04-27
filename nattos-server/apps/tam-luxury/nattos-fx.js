/**
 * natt-os FX Engine v1.0
 * Canvas stars + nebula + scanline + ticker
 * Tách từ NaUion v9 — dùng chung cho 16 apps
 *
 * Gọi sau DOM load: NattosFX.init(options)
 * options: { ticker: true/false, scan: true/false, grid: true/false }
 */

const NattosFX = (() => {
'use strict';

// ── DOM INJECTION ─────────────────────────────────────────────────────────
function injectLayers() {
  if (document.getElementById('nfx-canvas')) return; // already init

  // Canvas
  const cv = document.createElement('canvas');
  cv.id = 'nfx-canvas'; cv.id = 'cv'; // support both IDs
  cv.id = 'nfx-canvas';
  document.body.insertBefore(cv, document.body.firstChild);

  // Nebula overlay
  const neb = document.createElement('div');
  neb.className = 'nfx-nebula';
  document.body.insertBefore(neb, document.body.children[1]);

  // Grid
  const grid = document.createElement('div');
  grid.className = 'nfx-grid';
  document.body.insertBefore(grid, document.body.children[2]);

  // Scanline
  const scan = document.createElement('div');
  scan.className = 'nfx-scan';
  document.body.insertBefore(scan, document.body.children[3]);
}

// ── CANVAS STAR FIELD ─────────────────────────────────────────────────────
function initCanvas() {
  const cv = document.getElementById('nfx-canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let W, H, mouse = {x:0, y:0};
  const resize = () => { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

  // Stars — 3 layers: tiny / medium / large
  const stars = [];
  [[220, .15, .55, .01], [80, .4, 1.1, .025], [28, .8, 1.9, .06]].forEach(([n,rn,rx,sp], li) => {
    for (let i = 0; i < n; i++) stars.push({
      x: Math.random()*W, y: Math.random()*H,
      r: rn + Math.random()*(rx-rn),
      o: .1 + Math.random()*.6,
      p: Math.random()*Math.PI*2,
      ps: .002 + Math.random()*.015,
      sp, li
    });
  });

  // Gold dust particles
  const dust = [];
  for (let i = 0; i < 18; i++) dust.push({
    x: Math.random()*W, y: Math.random()*H,
    vx: (Math.random()-.5)*.12,
    vy: (Math.random()-.5)*.08,
    r: .5 + Math.random()*1.2,
    o: .04 + Math.random()*.12,
    life: Math.random()*360,
  });

  function draw() {
    ctx.clearRect(0,0,W,H);

    // Radial glow center
    const grd = ctx.createRadialGradient(W*.5, H*.5, 0, W*.5, H*.5, W*.7);
    grd.addColorStop(0, 'rgba(10,6,30,.0)');
    grd.addColorStop(1, 'rgba(2,2,8,.35)');
    ctx.fillStyle = grd; ctx.fillRect(0,0,W,H);

    // Stars
    stars.forEach(s => {
      s.p += s.ps;
      const twinkle = .5 + .5*Math.sin(s.p);
      // Subtle mouse parallax on large stars
      const dx = s.li===2 ? (mouse.x/W-.5)*8 : 0;
      const dy = s.li===2 ? (mouse.y/H-.5)*4 : 0;
      ctx.beginPath();
      ctx.arc(s.x+dx, s.y+dy, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(245,226,192,${(s.o * (.5+.5*twinkle)).toFixed(3)})`;
      ctx.fill();
      // Halo on large stars
      if (s.li===2 && twinkle > .7) {
        ctx.beginPath();
        ctx.arc(s.x+dx, s.y+dy, s.r*3, 0, Math.PI*2);
        ctx.fillStyle = `rgba(237,184,138,${(s.o*.06*twinkle).toFixed(3)})`;
        ctx.fill();
      }
    });

    // Gold dust
    dust.forEach(d => {
      d.life++;
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0) d.x = W; if (d.x > W) d.x = 0;
      if (d.y < 0) d.y = H; if (d.y > H) d.y = 0;
      const pulse = .5 + .5*Math.sin(d.life*.03);
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(200,146,42,${(d.o*pulse).toFixed(3)})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  draw();
}

// ── TICKER ────────────────────────────────────────────────────────────────
function initTicker() {
  if (document.getElementById('nfx-ticker')) return;

  const items = [
    { label:'VÀNG SJC 999.9', val:'8,250,000₫/chỉ', up:true },
    { label:'VÀNG 18K TL', val:'3,780,000₫/chỉ', up:true },
    { label:'USD/VND', val:'25,415', up:false },
    { label:'KIM CƯƠNG GIA 5LY', val:'8,500,000₫/viên', up:true },
    { label:'HH SX THÁNG 3', val:'3.8%', up:false },
    { label:'ĐƠN ĐANG SX', val:'142 đơn', up:true },
    { label:'NV CÓ MẶT', val:'119/130', up:true },
    { label:'DOANH THU HÔM NAY', val:'—', up:false },
  ];

  const wrap = document.createElement('div');
  wrap.id = 'nfx-ticker';
  wrap.className = 'nfx-ticker-wrap';

  // Double items for seamless loop
  const inner = document.createElement('div');
  inner.className = 'nfx-ticker-inner';
  const allItems = [...items, ...items];
  inner.innerHTML = allItems.map(it =>
    `<div class="nfx-ticker-item">
      <span class="nfx-label">${it.label}</span>
      <span class="val nfx-value">${it.val}</span>
      <span class="${it.up?'up':'dn'}">${it.up?'▲':'▼'}</span>
    </div>`
  ).join('');

  wrap.appendChild(inner);
  document.body.appendChild(wrap);

  // Add bottom padding so content clears ticker
  document.body.style.paddingBottom = '28px';
}

// ── WATERMARK ─────────────────────────────────────────────────────────────
function initWatermark(name, code) {
  if (!name) return;
  const wm = document.createElement('div');
  wm.className = 'nfx-watermark';
  const ts = new Date().toLocaleString('vi-VN');
  for (let i = 0; i < 40; i++) {
    const s = document.createElement('span');
    s.textContent = `${name} · ${code} · TÂM LUXURY · ${ts}`;
    wm.appendChild(s);
  }
  document.body.appendChild(wm);
}

// ── PAGE ENTER ANIMATION ──────────────────────────────────────────────────
function animatePageEnter() {
  const main = document.querySelector('main, .main, .content, #app, .app');
  if (main) {
    main.style.opacity = '0';
    main.style.transform = 'translateY(10px)';
    requestAnimationFrame(() => {
      main.style.transition = 'opacity .45s cubic-bezier(.23,1,.32,1), transform .45s cubic-bezier(.23,1,.32,1)';
      main.style.opacity = '1';
      main.style.transform = 'none';
    });
  }
}

// ── UPGRADE EXISTING ELEMENTS ─────────────────────────────────────────────
function upgradeElements() {
  // Topbar
  const topbar = document.querySelector('.topbar, header.header, .hdr');
  if (topbar) topbar.classList.add('nfx-topbar');

  // Cards → hover lift
  document.querySelectorAll('.sc, .wh-card, .prod-card, .app-card').forEach(el => {
    el.classList.add('nfx-hover-lift', 'nfx-hover-glow');
  });

  // Tables — skip auto upgrade
  // document.querySelectorAll('.tbl, table').forEach(el => el.classList.add('nfx-table'));

  // Inputs — skip để tránh conflict với app CSS hiện có
  // document.querySelectorAll('input, select, textarea').forEach(el => el.classList.add('nfx-input'));
}

// ── MAIN INIT ─────────────────────────────────────────────────────────────
function init(options = {}) {
  const opts = {
    canvas:    true,
    ticker:    true,
    watermark: null, // { name, code }
    pageAnim:  true,
    upgrade:   true,
    ...options
  };

  // Inject background layers
  injectLayers();

  if (opts.canvas)   initCanvas();
  if (opts.ticker)   initTicker();
  if (opts.watermark) initWatermark(opts.watermark.name, opts.watermark.code);
  if (opts.pageAnim) setTimeout(animatePageEnter, 50);
  if (opts.upgrade)  setTimeout(upgradeElements, 100);
}

// ── AUTO-DETECT LOGIN → INIT WATERMARK ───────────────────────────────────
function hookLogin() {
  const origLogin = window.doLogin;
  if (typeof origLogin === 'function') {
    window.doLogin = function(...args) {
      const result = origLogin.apply(this, args);
      setTimeout(() => {
        const name = window.user?.name || document.getElementById('tu')?.textContent;
        const code = window.user?.code || '';
        if (name && name !== '—') {
          // Remove old watermark
          document.querySelector('.nfx-watermark')?.remove();
          initWatermark(name, code);
        }
      }, 600);
      return result;
    };
  }
}

// Boot sau DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    init();
    hookLogin();
  });
} else {
  init();
  hookLogin();
}

return { init, initCanvas, initTicker, initWatermark, upgradeElements };

})();

if (typeof module !== 'undefined') module.exports = NattosFX;
if (typeof window !== 'undefined') window.NattosFX = NattosFX;
