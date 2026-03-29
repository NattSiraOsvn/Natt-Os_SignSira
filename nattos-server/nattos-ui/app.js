// app.js — NATT-OS · Nauion Bootstrap
// Mạch HeyNa = SSE chính, Whao fallback = poll mỗi 3s
import { store }              from './core/store.js';
import { fetchAudit, fetchIntelligence } from './core/adapter.js';
import { toNauion, patternMemory, NAUION } from './nauion-engine.js';

const MAX_TS = 60, MAX_DC = 14;
let totalTs = 0, totalDc = 0;

// ── NAUION STATUS BAR ────────────────────────────────────
const CHAIN_MAX = 7;
let chainLen = 0;

function pushChain(sig, color) {
  const bar = document.getElementById('nb-chain');
  if (!bar) return;
  if (chainLen >= CHAIN_MAX) {
    const f = bar.querySelector('.nb-sig'), a = bar.querySelector('.nb-arrow');
    if (f) f.remove(); if (a) a.remove(); chainLen--;
  }
  if (bar.children.length > 0) {
    const a = document.createElement('span');
    a.className = 'nb-arrow'; a.textContent = '→'; bar.appendChild(a);
  }
  const s = document.createElement('span');
  s.className = `nb-sig ${color}`; s.textContent = sig; bar.appendChild(s);
  chainLen++;
  patternMemory.push(sig);
}

function updateState() {
  const st = patternMemory.currentState();
  const nb = document.getElementById('nb-state');
  const hd = document.getElementById('hdr-nauion');
  const sb = document.getElementById('hdr-sub');
  const ic = document.getElementById('hdr-icon');
  if (st === NAUION.lech) {
    if (nb) { nb.textContent='lệch'; nb.className='nb-state crit'; }
    if (hd) { hd.textContent='lệch'; hd.style.cssText='background:rgba(255,112,112,.12);border-color:rgba(255,112,112,.4);color:#FF9090'; }
    if (sb) sb.textContent='Nahere — lệch dòng';
    if (ic) ic.className='nasira-wrap ns-lech';
  } else if (st === NAUION.nauion) {
    if (nb) { nb.textContent='nauion'; nb.className='nb-state ok'; }
    if (hd) { hd.textContent='nauion'; hd.style.cssText=''; hd.className='hbadge badge-ok'; }
    if (sb) sb.textContent='Nahere — nauion';
    if (ic) ic.className='nasira-wrap ns-nauion';
  } else {
    if (nb) { nb.textContent='Nahere'; nb.className='nb-state ok'; }
    if (sb && sb.textContent==='HeyNa…') sb.textContent='Nahere — lắng nghe…';
  }
}

function clsOf(signal, color) {
  const map = {
    [NAUION.whao]:   { ts:'ts-whao',   dc:'dc-whao',   nb:'whao'   },
    [NAUION.whau]:   { ts:'ts-whau',   dc:'dc-whau',   nb:'whau'   },
    [NAUION.nauion]: { ts:'ts-nauion', dc:'dc-nauion', nb:'nauion' },
    [NAUION.Nahere]: { ts:'ts-nahere', dc:'',          nb:'nahere' },
    [NAUION.gay]:    { ts:'ts-gay',    dc:'dc-gay',    nb:'nahere' },
    [NAUION.lech]:   { ts:'ts-whao-r', dc:'dc-whao-r', nb:'lech'   },
  };
  if (color==='red') return { ts:'ts-whao-r', dc:'dc-whao-r', nb:'whao-r' };
  if (color==='yel') return { ts:'ts-whao-y', dc:'dc-whao-y', nb:'whao-y' };
  return map[signal] || { ts:'ts-whao', dc:'dc-whao', nb:'whao' };
}

function bf(el, cls) {
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), 800);
}

// ── TÍN HIỆU ─────────────────────────────────────────────
function renderTS(evs) {
  const el=document.getElementById('audit-list'), cnt=document.getElementById('ts-cnt');
  if (!el||!evs.length) return;
  const em=el.querySelector('.empty-state'); if(em) em.remove();
  evs.slice(-8).forEach(e=>{
    const {signal,color,viet}=toNauion(e.event), c=clsOf(signal,color); totalTs++;
    const d=document.createElement('div'); d.className=`ts-item ${c.ts}`;
    const ts=e.timestamp?new Date(e.timestamp).toLocaleTimeString('vi',{hour12:false}):'';
    d.innerHTML=`<div><span class="ts-sig">${signal}</span><span class="ts-viet">${viet}</span><span style="float:right;font-size:6.5px;color:var(--tx3)">${ts}</span></div><div class="ts-raw">${e.event}</div>`;
    el.insertBefore(d,el.firstChild);
    bf(d, color==='red'?'bf-red':color==='yel'?'bf-yel':signal===NAUION.nauion?'bf-nauion':'bf-whao');
    pushChain(signal, c.nb);
  });
  while(el.children.length>MAX_TS) el.removeChild(el.lastChild);
  if(cnt) cnt.textContent=totalTs;
}

// ── DÒNG CHẢY ────────────────────────────────────────────
function renderDC(evs) {
  const el=document.getElementById('flow-view'), cnt=document.getElementById('dc-cnt');
  if (!el||!evs.length) return;
  const em=el.querySelector('.empty-state'); if(em) em.remove();
  bf(el,'bf-ripple');
  evs.slice(-6).forEach(e=>{
    const {signal,color,viet}=toNauion(e.event), c=clsOf(signal,color); totalDc++;
    const d=document.createElement('div'); d.className=`dc-node ${c.dc}`;
    d.innerHTML=`<div><span class="dn-sig">${signal}</span> <span style="font-size:8px;opacity:.7">${viet}</span></div><div class="dn-event">${e.event}</div>`+(e.causedBy?`<div class="dn-chain">← ${e.causedBy}</div>`:'');
    el.insertBefore(d,el.firstChild);
  });
  while(el.children.length>MAX_DC) el.removeChild(el.lastChild);
  if(cnt) cnt.textContent=totalDc;
}

// ── TRẠNG THÁI ───────────────────────────────────────────
function renderTT(flows) {
  const el=document.getElementById('intelligence'), sum=document.getElementById('intel-summary'), cnt=document.getElementById('pt-cnt');
  if (!el) return;
  const em=el.querySelector('.empty-state'); if(em&&(flows.length||patternMemory.patterns.length)) em.remove();
  if(sum){
    const h=flows.filter(f=>(f.failCount||0)===0).length, f=flows.filter(f=>(f.failCount||0)>=2).length, p=patternMemory.getTop().length;
    sum.innerHTML=`<span class="isumm-chip isumm-h">${h} nauion</span>`+(f>0?`<span class="isumm-chip isumm-f">${f} lệch</span>`:'')+`<span class="isumm-chip isumm-o">${p} pattern</span>`;
  }
  el.innerHTML='';
  patternMemory.getTop().forEach(p=>{
    const maxC=Math.max(...patternMemory.patterns.map(x=>x.count),1);
    const d=document.createElement('div'); d.className=`pt-card ${p.meaning||''}`;
    d.innerHTML=`<div class="pt-flow">${p.flow}</div><div class="pt-row"><span>nghĩa</span><span class="pt-val">${p.meaning}</span></div><div class="pt-row"><span>lặp</span><span class="pt-val">${p.count}×</span></div><div class="pt-bar-wrap"><div class="pt-bar" style="width:${Math.round(p.count/maxC*100)}%;background:${/lệch|gãy/.test(p.meaning)?'#FF7070':'#C4BCFF'}"></div></div>`;
    el.appendChild(d);
  });
  if(flows.length){
    const div=document.createElement('div'); div.style.cssText='height:1px;background:rgba(255,255,255,.05);margin:7px 4px'; el.appendChild(div);
    flows.forEach(f=>{
      const fail=f.failCount||0, d=document.createElement('div');
      d.className=`pt-card ${fail>=2?'lệch':''}`;
      d.innerHTML=`<div class="pt-flow" style="color:${fail>=2?'#FF9090':'#A8DFFF'}">${f.flow||f.from||'—'}</div><div class="pt-row"><span>fails</span><span class="pt-val" style="color:${fail>=2?'#FF9090':'#7FFFCC'}">${fail}</span></div><div class="pt-row"><span>delay</span><span class="pt-val">${f.adaptiveDelay||0}ms</span></div><div class="pt-bar-wrap"><div class="pt-bar" style="width:${Math.min(fail*20,100)}%;background:${fail>=2?'#FF7070':'#7FFFCC'}"></div></div>`;
      el.appendChild(d);
    });
  }
  if(!el.children.length) el.innerHTML='<div class="empty-state">whao<br>hệ đang học pattern…</div>';
  if(cnt) cnt.textContent=patternMemory.getTop().length+' pattern';
}

// ── WHAO FALLBACK (poll 3s) ───────────────────────────────
async function whaoFallback() {
  try {
    const [audit, intel] = await Promise.all([fetchAudit(), fetchIntelligence()]);
    store.updateAudit(audit.events||[]);
    store.updateIntelligence(intel);
    const newEvs = store.getNewAuditEvents();
    if (newEvs.length) { renderTS(newEvs); renderDC(newEvs); }
    if (store.intelChanged()) renderTT(store.intelligence);
    updateState();
    const sb=document.getElementById('hdr-sub');
    if(sb&&sb.textContent==='HeyNa…') sb.textContent='Nahere — nauion';
  } catch(err) {
    console.error('[Nauion] Whao fallback lệch:', err.message);
    pushChain('lệch','lech');
  }
}

// ── MẠCH HEYNA (SSE chính) ────────────────────────────────
function machHeyNa() {
  const sb = document.getElementById('hdr-sub');
  let es;
  try {
    es = new EventSource('http://localhost:3001/mach/heyna');
  } catch(e) {
    console.warn('[Nauion] Mạch HeyNa không mở được — dùng Whao fallback');
    setInterval(whaoFallback, 3000);
    whaoFallback();
    return;
  }

  es.onopen = () => {
    if(sb) sb.textContent = 'Nahere — Mạch HeyNa sống';
    pushChain('Nahere', 'nahere');
  };

  es.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      // Khi nhận event qua Mạch HeyNa → render ngay
      if (data.event && data.event !== 'Nahere') {
        const ev = { event: data.event, payload: data.payload, timestamp: data.ts };
        renderTS([ev]);
        renderDC([ev]);
        updateState();
      }
    } catch(err) {}
  };

  es.onerror = () => {
    if(sb) sb.textContent = 'Nahere — Mạch đứt, Whao đang hồi';
    pushChain('lệch', 'lech');
    es.close();
    // Thử lại sau 5s
    setTimeout(machHeyNa, 5000);
  };

  // Whao fallback song song — đồng bộ intelligence + audit đầy đủ
  setInterval(whaoFallback, 3000);
}

// ── HEYNA — KHỞI ĐỘNG ────────────────────────────────────
whaoFallback(); // Whao ngay lập tức
machHeyNa();    // Mã khoá Mạch HeyNa
