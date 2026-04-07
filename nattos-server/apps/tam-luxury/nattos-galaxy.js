/**
 * nattos-galaxy.js — NaUion v10 Galaxy Runtime
 * Inject vào tất cả app Tâm Luxury
 * Auto-init: galaxy canvas + nebula + SSE Z state
 */
(function(){
'use strict';

// ── Inject galaxy DOM elements ──
function injectGalaxy() {
  if(document.getElementById('gx')) return; // đã có

  const nebula = document.createElement('div');
  nebula.className = 'nebula';

  const canvas = document.createElement('canvas');
  canvas.id = 'gx';

  const grid = document.createElement('div');
  grid.className = 'l0-grid';

  const scan = document.createElement('div');
  scan.className = 'l0-scan';

  // Insert trước tất cả content
  const body = document.body;
  body.insertBefore(scan, body.firstChild);
  body.insertBefore(grid, body.firstChild);
  body.insertBefore(canvas, body.firstChild);
  body.insertBefore(nebula, body.firstChild);
}

// ── Galaxy canvas: stars + comets + shooting stars ──
function startGalaxy() {
  const cv = document.getElementById('gx');
  if(!cv) return;
  const gx = cv.getContext('2d');
  let W, H, stars = [], comets = [], shooters = [];
  const MEM = navigator.deviceMemory || 4;
  const DENSITY = MEM < 4 ? 3200 : MEM < 8 ? 2400 : 1800;

  function resize() {
    W = cv.width = innerWidth;
    H = cv.height = innerHeight;
    const n = Math.floor(W * H / DENSITY);
    stars = Array.from({length:n}, () => ({
      x: Math.random()*W, y: Math.random()*H,
      r: Math.random()*1.5+.1,
      a: Math.random()*.75+.1,
      hue: Math.random()<.15 ? (Math.random()<.5?42:30) : 0,
      sat: Math.random()<.15 ? 75 : 0,
      ph: Math.random()*Math.PI*2,
      sp: .3+Math.random()*.8
    }));
  }

  function spawnComet() {
    const s = Math.random()<.5;
    comets.push({
      x:s?-80:W+80, y:Math.random()*H*.7,
      vx:s?1.2:-1.2, vy:.3+Math.random()*.4,
      len:100+Math.random()*160, life:1, hue:42
    });
  }

  function spawnShooter() {
    shooters.push({
      x:Math.random()*W*.8, y:Math.random()*H*.4,
      vx:9+Math.random()*12, vy:4+Math.random()*7,
      len:60+Math.random()*100, life:1
    });
  }

  function draw(ts) {
    gx.clearRect(0,0,W,H);
    const t = ts*.001;

    // Stars
    for(const s of stars) {
      const a = s.a*(.55+.45*Math.sin(t*s.sp+s.ph));
      gx.beginPath(); gx.arc(s.x,s.y,s.r,0,Math.PI*2);
      gx.fillStyle = s.sat
        ? `hsla(${s.hue},${s.sat}%,85%,${a.toFixed(2)})`
        : `rgba(255,255,255,${a.toFixed(2)})`;
      gx.fill();
    }

    // Comets
    for(let i=comets.length-1;i>=0;i--) {
      const c=comets[i]; c.x+=c.vx; c.y+=c.vy; c.life-=.003;
      if(c.life<=0||c.x<-200||c.x>W+200){comets.splice(i,1);continue}
      const dx=c.vx*(c.len/Math.abs(c.vx)), dy=c.vy*(c.len/Math.abs(c.vx));
      const gr=gx.createLinearGradient(c.x,c.y,c.x-dx,c.y-dy);
      gr.addColorStop(0,`hsla(${c.hue},80%,80%,${c.life.toFixed(2)})`);
      gr.addColorStop(1,'transparent');
      gx.beginPath(); gx.moveTo(c.x,c.y); gx.lineTo(c.x-dx,c.y-dy);
      gx.strokeStyle=gr; gx.lineWidth=1.5*c.life; gx.stroke();
      // Nucleus
      const rg=gx.createRadialGradient(c.x,c.y,0,c.x,c.y,3);
      rg.addColorStop(0,`hsla(${c.hue},80%,95%,${c.life.toFixed(2)})`);
      rg.addColorStop(1,'transparent');
      gx.beginPath(); gx.arc(c.x,c.y,3,0,Math.PI*2);
      gx.fillStyle=rg; gx.fill();
    }

    // Shooting stars
    for(let i=shooters.length-1;i>=0;i--) {
      const s=shooters[i]; s.x+=s.vx; s.y+=s.vy; s.life-=.045;
      if(s.life<=0){shooters.splice(i,1);continue}
      const ang=Math.atan2(s.vy,s.vx);
      const gr=gx.createLinearGradient(s.x,s.y,
        s.x-Math.cos(ang)*s.len, s.y-Math.sin(ang)*s.len);
      gr.addColorStop(0,`rgba(255,230,180,${s.life.toFixed(2)})`);
      gr.addColorStop(.3,`rgba(255,210,140,${(s.life*.4).toFixed(2)})`);
      gr.addColorStop(1,'transparent');
      gx.beginPath(); gx.moveTo(s.x,s.y);
      gx.lineTo(s.x-Math.cos(ang)*s.len,s.y-Math.sin(ang)*s.len);
      gx.strokeStyle=gr; gx.lineWidth=1.2*s.life; gx.stroke();
    }

    requestAnimationFrame(draw);
  }

  setInterval(spawnComet, 4500+Math.random()*5000);
  setInterval(spawnShooter, 1600+Math.random()*2000);
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
}

// ── Mạch HeyNa SSE — Z state indicator ──
function connectSSE() {
  const S = 'http://localhost:3001';
  const es = new EventSource(`${S}/mach/heyna`);
  es.onmessage = e => {
    try {
      const d = JSON.parse(e.data);
      if(d.event === 'nauion.state' && d.payload?.impedanceZ !== undefined) {
        const Z = d.payload.impedanceZ;
        // Update ticker nếu có
        const ticker = document.getElementById('ticker');
        if(ticker) {
          const zEl = ticker.querySelector('.z-badge');
          if(zEl) zEl.textContent = `Z ${Z.toFixed(2)}`;
        }
        // Update body bg tint theo Z (subtle)
        const intensity = Math.min(1, (Z-0.5)/4);
        document.documentElement.style.setProperty('--z-tint', `rgba(200,146,42,${(intensity*.04).toFixed(3)})`);
      }
      if(d.event === 'gia-vang.updated' && d.payload) {
        const g = d.payload;
        const fmt = v => v ? (v/1e6).toFixed(2)+'M' : '—';
        // Update any gold display elements
        document.querySelectorAll('.gold-9999').forEach(el => {
          el.textContent = `9999: ${fmt(g.gold9999)}`;
        });
        document.querySelectorAll('.gold-18k').forEach(el => {
          el.textContent = `18K: ${fmt(g.gold18k)}`;
        });
      }
    } catch{}
  };
  es.onerror = () => {es.close(); setTimeout(connectSSE, 5000)};
}

// ── Mouse tracking cho liquid glass ──
function trackMouse() {
  document.addEventListener('mousemove', e => {
    document.documentElement.style.setProperty('--mx', (e.clientX/innerWidth*100)+'%');
    document.documentElement.style.setProperty('--my', (e.clientY/innerHeight*100)+'%');
  });
}

// ── BOOT ──
if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

function boot() {
  injectGalaxy();
  startGalaxy();
  trackMouse();
  connectSSE();
  console.log('[NaUion v10] Galaxy layer active on', document.title);
}

})();
