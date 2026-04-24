#!/bin/bash
# ================================================================
# Natt-OS ULTRA ENGINE v5 — BEYOND VISIONOS
# bash natt-ultra.sh
#
# TECHNIQUES APPLIED:
#   ① Holo Card   — Prismatic rainbow (Pokemon/MTG grade)
#   ② SVG Caustics — Light-through-glass ripple (feTurbulence)
#   ③ CSS @property — Animated custom props, GPU-smooth gradients
#   ④ Conic metallic — Mouse-angle PBR metal in real-time
#   ⑤ DOF + Parallax — 3-layer Z-depth field
#   ⑥ Reaction-Diffusion grain — Organic noise texture
#   ⑦ Bloom / Emissive — Additive glow pass
#   ⑧ Specular sweep — Metal shine on hover
#   ⑨ Fresnel edge — Rim lighting simulation
#   ⑩ Chromatic aberration — Title RGB split
# ================================================================
set -e
DIR="natt-ultra"
mkdir -p $DIR/src
cd $DIR

# ── package.json ──────────────────────────────────────────────
cat > package.json << 'EOF'
{
  "name": "natt-ultra",
  "version": "5.0.0",
  "type": "module",
  "private": true,
  "scripts": { "dev": "vite --host", "build": "vite build" },
  "dependencies": { "react": "^18.3.1", "react-dom": "^18.3.1", "lucide-react": "^0.483.0" },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "vite": "^6.0.11"
  }
}
EOF

cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ plugins: [react()] })
EOF

cat > tailwind.config.js << 'EOF'
export default { content: ["./index.html","./src/**/*.{js,jsx}"], theme: { extend: {} }, plugins: [] }
EOF

cat > postcss.config.js << 'EOF'
export default { plugins: { tailwindcss: {}, autoprefixer: {} } }
EOF

cat > index.html << 'EOF'
<!doctype html>
<html lang="vi">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Natt-OS · Ultra Engine v5</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
EOF

cat > src/main.jsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
EOF

# ── index.css — ALL ADVANCED TECHNIQUES ───────────────────────
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ─── CSS @property: GPU-animated custom props ─── */
@property --holo-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
@property --holo-x {
  syntax: '<percentage>';
  initial-value: 50%;
  inherits: false;
}
@property --holo-y {
  syntax: '<percentage>';
  initial-value: 50%;
  inherits: false;
}
@property --caustic-phase {
  syntax: '<number>';
  initial-value: 0;
  inherits: false;
}
@property --bloom-scale {
  syntax: '<number>';
  initial-value: 1;
  inherits: false;
}

/* ─── Keyframes ─── */
@keyframes orbit-cw  { to { transform: rotate(360deg);  } }
@keyframes orbit-ccw { to { transform: rotate(-360deg); } }
@keyframes orbit-slow{ to { transform: rotate(360deg);  } }

@keyframes holo-shift {
  0%   { --holo-angle: 0deg;   }
  100% { --holo-angle: 360deg; }
}
@keyframes caustic-flow {
  0%,100% { --caustic-phase: 0; }
  50%     { --caustic-phase: 1; }
}
@keyframes bloom-pulse {
  0%,100% { --bloom-scale: 1;    opacity: 0.45; }
  50%     { --bloom-scale: 1.35; opacity: 0.75; }
}
@keyframes specular-sweep {
  0%   { transform: translateX(-200%) skewX(14deg); }
  50%  { transform: translateX(200%)  skewX(14deg); }
  100% { transform: translateX(200%)  skewX(14deg); }
}
@keyframes float-particle {
  0%,100% { transform: translateY(0)   scale(1);   opacity: 0.12; }
  50%     { transform: translateY(-28px) scale(1.1); opacity: 0.38; }
}
@keyframes scan-line {
  0%   { transform: translateY(-100%); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateY(100vh); opacity: 0; }
}
@keyframes logo-breathe {
  0%,100% { text-shadow: 0 0 80px rgba(251,191,36,0.15); }
  50%     { text-shadow: 0 0 140px rgba(251,191,36,0.35), 0 0 260px rgba(251,191,36,0.1); }
}

/* ─── Holo Card — Prismatic Rainbow ─── */
.holo-card {
  position: relative;
  overflow: hidden;
}
.holo-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(
    from var(--holo-angle),
    rgba(255,0,128,0)    0deg,
    rgba(255,0,128,0.18) 30deg,
    rgba(255,165,0,0.18) 60deg,
    rgba(255,255,0,0.18) 90deg,
    rgba(0,255,128,0.18) 120deg,
    rgba(0,200,255,0.18) 150deg,
    rgba(128,0,255,0.18) 180deg,
    rgba(255,0,128,0.18) 210deg,
    rgba(255,0,128,0)    240deg
  );
  mix-blend-mode: color-dodge;
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
  z-index: 20;
  animation: holo-shift 6s linear infinite paused;
}
.holo-card:hover::before {
  opacity: 1;
  animation-play-state: running;
}

/* ─── SVG Caustics filter (inline, always available) ─── */
.caustic-light {
  filter: url(#caustic-filter);
}

/* ─── Scrollbar ─── */
body { background-color: #010204; }
.custom-scrollbar::-webkit-scrollbar       { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 8px; }

/* ─── Selection ─── */
::selection { background: rgba(251,191,36,0.25); color: #fff; }
EOF

# ── src/App.jsx — ULTRA ENGINE ─────────────────────────────────
cat > src/App.jsx << 'APPEOF'
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Scroll, Shield, User, Zap, RefreshCw, Radio, Handshake, Bell, Box,
  BarChart3, RotateCcw, Scale, Users, Landmark, Briefcase,
  Warehouse, ShoppingCart, CreditCard, Tag, Factory, Gift, Calculator,
  Monitor, Layout, Settings, Search, Key, ShieldAlert, Activity,
  Brain, Timer, Cloud, Gauge, Layers, PenTool, Database, Award,
  X, Fingerprint, Send, ShieldCheck, Workflow, TrendingUp,
  FileSignature, Route, History, Save, Edit3, FileBarChart, Map
} from 'lucide-react';

/* ──────────────────────────────────────────────────────────────
   GEMINI API
────────────────────────────────────────────────────────────── */
const apiKey = "";
const callGemini = async (prompt, systemInstruction = "") => {
  let delay = 1000;
  for (let i = 0; i < 5; i++) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            contents:[{parts:[{text:prompt}]}],
            systemInstruction: systemInstruction ? {parts:[{text:systemInstruction}]} : undefined
          })
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'API Error');
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch(e) {
      if (i===4) throw e;
      await new Promise(r=>setTimeout(r,delay));
      delay *= 2;
    }
  }
};

/* ──────────────────────────────────────────────────────────────
   REGISTRY
────────────────────────────────────────────────────────────── */
const CELLS = [
  { id:'const-1', cat:'Constitution',  title:'Hiến Pháp',   icon:Scroll,      color:'gold',   desc:'The fundamental DNA protocol of Natt-OS.',                  ver:'2.0.1', status:'Immutable'  },
  { id:'const-2', cat:'Constitution',  title:'Gatekeeper',  icon:User,        color:'gold',   desc:'Primary authentication authority for entity access.',        ver:'1.4.0', status:'Active'     },
  { id:'const-3', cat:'Constitution',  title:'NattSira Seal',icon:Shield,     color:'gold',   desc:'Cryptographic validation of all system kernels.',            ver:'3.0.0', status:'Locked'     },
  { id:'kern-1',  cat:'Kernel Cells',  title:'audit-cell',  icon:Search,      color:'amber',  desc:'Continuous background verification of all operations.',      ver:'0.9.5', status:'Observing'  },
  { id:'kern-3',  cat:'Kernel Cells',  title:'monitor-cell',icon:Activity,    color:'amber',  desc:'Real-time telemetry and health diagnostics.',                ver:'1.8.2', status:'Active'     },
  { id:'infra-1', cat:'Infrastructure',title:'smartlink',   icon:Zap,         color:'blue',   desc:'High-speed data bus for inter-cell communication.',          ver:'1.2.0', status:'Fluid'      },
  { id:'infra-3', cat:'Infrastructure',title:'ai-connector',icon:Radio,       color:'blue',   desc:'External intelligence bridge and API relay.',                ver:'2.5.0', status:'Linked'     },
  { id:'biz-1',   cat:'Business Units',title:'analytics',   icon:BarChart3,   color:'green',  desc:'Market intelligence and data pattern recognition.',          ver:'2.2.0', status:'Active'     },
  { id:'intel-3', cat:'Intelligence',  title:'Neural MAIN', icon:Brain,       color:'purple', desc:'Consciousness emulation and decision matrix.',               ver:'Alpha-X',status:'Evolving'   },
  { id:'ai-3',    cat:'AI Personas',   title:'BỐI BỐI',     icon:Shield,      color:'red',    desc:'System guardian and empathetic interface.',                  ver:'2.1',   status:'Protective', instruction:"Act as BỐI BỐI, the heart of Natt-OS. You are empathetic, protective, and warm." },
  { id:'ai-1',    cat:'AI Personas',   title:'KIM',         icon:Monitor,     color:'red',    desc:'Tactical analysis and observation entity.',                  ver:'1.0',   status:'Sentient',   instruction:"Act as KIM, a tactical AI entity. Be precise." },
];

/* ──────────────────────────────────────────────────────────────
   THEME MAP
────────────────────────────────────────────────────────────── */
const T = {
  gold:   { p:'#fbbf24', em:'rgba(251,191,36,0.9)',  glow:'rgba(251,191,36,0.5)',  dim:'rgba(251,191,36,0.15)' },
  blue:   { p:'#3b82f6', em:'rgba(59,130,246,0.9)',  glow:'rgba(59,130,246,0.5)',  dim:'rgba(59,130,246,0.15)' },
  green:  { p:'#10b981', em:'rgba(16,185,129,0.9)',  glow:'rgba(16,185,129,0.5)',  dim:'rgba(16,185,129,0.15)' },
  purple: { p:'#a78bfa', em:'rgba(167,139,250,0.9)', glow:'rgba(167,139,250,0.5)', dim:'rgba(167,139,250,0.15)'},
  red:    { p:'#f43f5e', em:'rgba(244,63,94,0.9)',   glow:'rgba(244,63,94,0.5)',   dim:'rgba(244,63,94,0.15)'  },
  amber:  { p:'#f59e0b', em:'rgba(245,158,11,0.9)',  glow:'rgba(245,158,11,0.5)',  dim:'rgba(245,158,11,0.15)' },
  slate:  { p:'#94a3b8', em:'rgba(148,163,184,0.9)', glow:'rgba(148,163,184,0.4)', dim:'rgba(148,163,184,0.1)' },
};

/* ──────────────────────────────────────────────────────────────
   COMPONENT: ULTRA MEDAL
   Layers:
   0. Orbital rings      — 3× SVG, speeds staggered
   1. PBR metal shell    — conic-gradient tracks mouse angle
   2. Specular sweep     — triggered on hover
   3. Fresnel rim        — always-on edge glow
   4. Holo rainbow       — CSS @property conic, mix-blend color-dodge
   5. Glass core         — backdrop-blur + radial gradient
   6. Caustic ripple     — SVG feTurbulence inside glass
   7. Holographic irid   — subtle indigo→amber sheen
   8. Emissive icon      — Z=65px, bloom + drop-shadow
   9. DOF blur           — distance from cursor → blur
  10. Parallax           — 3-layer depth offset
────────────────────────────────────────────────────────────── */
const UltraMedal = ({ item, mousePos, onClick }) => {
  const Icon  = item.icon;
  const theme = T[item.color] || T.blue;
  const ref   = useRef(null);
  const [dof, setDof]   = useState(0);
  const [hov, setHov]   = useState(false);
  const [local, setLoc] = useState({ x: 0.5, y: 0.5 }); // normalized 0-1

  /* DOF + local mouse */
  useEffect(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top  + r.height / 2;
    const dist = Math.hypot(mousePos.x - cx, mousePos.y - cy);
    setDof(Math.max(0, (dist - 170) * 0.016));

    // local position inside medal (0→1)
    setLoc({
      x: Math.min(1, Math.max(0, (mousePos.x - r.left) / r.width)),
      y: Math.min(1, Math.max(0, (mousePos.y - r.top)  / r.height)),
    });
  }, [mousePos]);

  /* Parallax layers */
  const px = s => ({
    x: (mousePos.x - window.innerWidth  / 2) * s,
    y: (mousePos.y - window.innerHeight / 2) * s,
  });
  const p1 = px(0.012), p2 = px(0.028), p3 = px(0.052);

  /* Mouse angle for conic metallic rotation */
  const metalAngle = Math.atan2(
    mousePos.y - window.innerHeight / 2,
    mousePos.x - window.innerWidth  / 2
  ) * (180 / Math.PI);

  return (
    <button
      ref={ref}
      onClick={() => onClick(item)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="flex flex-col items-center group relative outline-none py-10"
      style={{
        perspective: '1400px',
        filter:  `blur(${dof}px)`,
        opacity:  dof > 9 ? 0.2 : 1,
        transition: 'filter 0.35s, opacity 0.35s',
      }}
    >
      {/* ── MEDAL BODY ── */}
      <div
        className="relative w-28 h-28 md:w-36 md:h-36"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${-p1.y}deg) rotateY(${p1.x}deg) scale(${hov ? 1.12 : 1})`,
          transition: 'transform 0.65s cubic-bezier(0.23,1,0.32,1)',
        }}
      >

        {/* ── ① ORBITAL RINGS ── */}
        <div className="absolute inset-[-26%] pointer-events-none"
          style={{ opacity: hov ? 1 : 0.18, transition: 'opacity 0.8s' }}>
          <svg className="w-full h-full" style={{ animation:'orbit-cw 28s linear infinite' }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke={theme.p} strokeWidth="0.06" strokeDasharray="1 7"/>
            <circle cx="50" cy="50" r="45" fill="none" stroke={theme.p} strokeWidth="0.18" strokeDasharray="14 24"/>
          </svg>
          <svg className="absolute inset-0 w-full h-full" style={{ animation:'orbit-ccw 13s linear infinite' }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="41" fill="none" stroke={theme.p} strokeWidth="0.09" strokeDasharray="3 11"/>
            {/* Crosshair ticks at 12-3-6-9 o'clock */}
            <path d="M50 3 L50 9 M50 91 L50 97 M3 50 L9 50 M91 50 L97 50"
              stroke={theme.p} strokeWidth="0.45" strokeLinecap="round"/>
          </svg>
          <svg className="absolute inset-0 w-full h-full" style={{ animation:'orbit-slow 55s linear infinite' }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="49.5" fill="none" stroke={theme.p} strokeWidth="0.03" strokeDasharray="0.5 4"/>
          </svg>
        </div>

        {/* ── ② PBR METALLIC SHELL (mouse-angle conic) ── */}
        <div
          className="absolute inset-0 rounded-full border border-white/10"
          style={{
            background: `conic-gradient(from ${metalAngle}deg at 50% 50%,
              #030303 0deg, #1e1e1e 40deg, #090909 80deg,
              #242424 120deg, #040404 180deg, #1a1a1a 220deg,
              #060606 270deg, #1e1e1e 310deg, #030303 360deg)`,
            boxShadow: `0 18px 50px rgba(0,0,0,0.92),
              inset 0 0 22px rgba(255,255,255,0.04),
              0 0 ${hov ? '55px' : '18px'} ${theme.glow}`,
            transform: 'translateZ(0px)',
            transition: 'box-shadow 0.55s',
          }}
        >
          {/* ── ③ SPECULAR SWEEP ── */}
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/14 to-transparent"
              style={{
                transform: `translateX(${hov ? '220%' : '-220%'}) skewX(14deg)`,
                transition: 'transform 1.3s cubic-bezier(0.23,1,0.32,1)',
              }}
            />
          </div>
          {/* ── ④ FRESNEL RIM ── */}
          <div
            className="absolute inset-0 rounded-full border-[2px] border-white/18 pointer-events-none"
            style={{
              opacity: hov ? 1 : 0.35,
              filter: 'blur(0.4px)',
              transition: 'opacity 0.5s',
            }}
          />
        </div>

        {/* ── ④ HOLO CARD — prismatic rainbow CSS @property ── */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none holo-card"
          style={{ zIndex: 3 }}
        />

        {/* ── ⑤ GLASS CORE ── */}
        <div
          className="absolute inset-[9%] rounded-full border border-white/22 overflow-hidden"
          style={{
            backdropFilter: 'blur(18px) saturate(160%)',
            background: `radial-gradient(circle at ${local.x*100}% ${local.y*100}%,
              rgba(255,255,255,0.13), transparent 78%)`,
            transform: `translateZ(28px) translateX(${p2.x}px) translateY(${p2.y}px)`,
            boxShadow: `inset 0 0 38px rgba(0,0,0,0.82),
              0 8px 30px rgba(0,0,0,0.6)`,
            transition: 'transform 0.6s',
          }}
        >
          {/* ── ⑥ SVG CAUSTICS — light ripple inside glass ── */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ opacity: hov ? 0.28 : 0.08, transition: 'opacity 0.8s', mixBlendMode: 'screen' }}>
            <defs>
              <filter id={`caustic-${item.id}`} x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="turbulence" baseFrequency="0.018 0.022"
                  numOctaves="4" seed="3" result="turb">
                  <animate attributeName="baseFrequency"
                    values="0.018 0.022;0.022 0.018;0.018 0.022"
                    dur="8s" repeatCount="indefinite"/>
                </feTurbulence>
                <feDisplacementMap in="SourceGraphic" in2="turb"
                  scale="18" xChannelSelector="R" yChannelSelector="G"/>
              </filter>
            </defs>
            <circle cx="50%" cy="50%" r="45%"
              fill="none" stroke={theme.p} strokeWidth="12"
              filter={`url(#caustic-${item.id})`} opacity="0.6"/>
          </svg>

          {/* ── ⑦ HOLOGRAPHIC IRIDESCENCE ── */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(${135 + local.x * 90}deg,
                rgba(99,102,241,0.12), rgba(167,139,250,0.08),
                rgba(251,191,36,0.1), rgba(16,185,129,0.08))`,
              mixBlendMode: 'screen',
              opacity: hov ? 0.9 : 0.25,
              transition: 'opacity 0.6s, background 0.15s',
            }}
          />
        </div>

        {/* ── ⑧ EMISSIVE ICON — Z-apex ── */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            transform: `translateZ(65px) translateX(${p3.x}px) translateY(${p3.y}px)`,
            transition: 'transform 0.85s',
          }}
        >
          <div className="relative">
            {/* Bloom — additive glow pass */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                inset: '-25%',
                background: theme.p,
                filter: 'blur(22px)',
                opacity: hov ? 0.78 : 0.38,
                transform: `scale(${hov ? 1.45 : 1.2})`,
                transition: 'opacity 0.5s, transform 0.5s',
              }}
            />
            {/* Secondary wider bloom */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                inset: '-50%',
                background: theme.p,
                filter: 'blur(40px)',
                opacity: hov ? 0.22 : 0.08,
                transition: 'opacity 0.6s',
              }}
            />
            {Icon && (
              <Icon
                size={40} strokeWidth={1.4}
                className="relative z-10 text-white"
                style={{
                  filter: `drop-shadow(0 0 10px ${theme.em})
                           drop-shadow(0 0 24px ${theme.glow})`,
                  transform: `scale(${hov ? 1.08 : 1})`,
                  transition: 'transform 0.5s',
                }}
              />
            )}
          </div>
        </div>

        {/* Dynamic fill light (follows cursor inside medal) */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none mix-blend-overlay"
          style={{
            background: `radial-gradient(circle at ${local.x*100}% ${local.y*100}%,
              rgba(255,255,255,0.22), transparent 55%)`,
            opacity: hov ? 0.5 : 0,
            transition: 'opacity 0.4s',
          }}
        />
      </div>

      {/* ── LABEL ── */}
      <div
        className="mt-10 text-center"
        style={{
          transform: `translateY(${hov ? '5px' : '0'})`,
          transition: 'transform 0.5s',
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <div className="h-px w-5 bg-gradient-to-r from-transparent"
            style={{ background:`linear-gradient(to right,transparent,${theme.p}44)` }}/>
          <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.42em]">
            {item.cat}
          </span>
          <div className="h-px w-5"
            style={{ background:`linear-gradient(to left,transparent,${theme.p}44)` }}/>
        </div>
        <h3
          className="text-[12px] font-black text-white uppercase tracking-[0.2em]"
          style={{
            color: hov ? theme.p : undefined,
            textShadow: hov ? `0 0 20px ${theme.glow}` : 'none',
            transition: 'color 0.4s, text-shadow 0.4s',
          }}
        >
          {item.title}
        </h3>
        {/* Version tooltip */}
        <div
          className="mt-1 text-[7.5px] font-mono text-slate-700 tracking-widest"
          style={{ opacity: hov ? 1 : 0, transition: 'opacity 0.35s' }}
        >
          {item.id} · v{item.ver}
        </div>
      </div>
    </button>
  );
};

/* ──────────────────────────────────────────────────────────────
   COMPONENT: CHAT UPLINK
────────────────────────────────────────────────────────────── */
const ChatUplink = ({ persona, onExit }) => {
  const [msgs, setMsgs]   = useState([{ role:'ai', text:`Uplink established. System identity: ${persona.title}. Data stream ready.` }]);
  const [input, setInput] = useState("");
  const [busy, setBusy]   = useState(false);
  const scrollRef         = useRef(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs, busy]);

  const send = async () => {
    if (!input.trim() || busy) return;
    const msg = input.trim(); setInput("");
    setMsgs(p => [...p, { role:'user', text:msg }]); setBusy(true);
    try {
      const res = await callGemini(msg, persona.instruction);
      setMsgs(p => [...p, { role:'ai', text:res }]);
    } catch {
      setMsgs(p => [...p, { role:'ai', text:"Signal lost. Re-establishing neural link..." }]);
    } finally { setBusy(false); }
  };

  return (
    <div className="flex flex-col h-[500px] w-full bg-[#05070a]/92 backdrop-blur-[48px] rounded-[36px] border border-white/8 overflow-hidden shadow-[0_50px_120px_rgba(0,0,0,0.9)]"
      style={{ animation:'none' }}>
      <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.025]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_12px_#f59e0b] animate-pulse"/>
          <span className="text-[9px] font-black uppercase tracking-[0.45em] text-slate-500">
            Neural Sync // {persona.title}
          </span>
        </div>
        <button onClick={onExit} className="text-slate-600 hover:text-white transition-colors"><X size={18}/></button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
        {msgs.map((m,i) => (
          <div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-[12px] leading-relaxed ${
              m.role==='user'
                ? 'bg-amber-500/10 border border-amber-500/25 text-amber-200'
                : 'bg-white/[0.03] border border-white/5 text-slate-300 font-light'
            }`}>{m.text}</div>
          </div>
        ))}
        {busy && <div className="text-[8px] text-amber-500/40 uppercase tracking-[0.45em] animate-pulse ml-2">Syncing thoughts...</div>}
        <div ref={scrollRef}/>
      </div>
      <div className="p-6 border-t border-white/5 bg-white/[0.015]">
        <div className="relative">
          <input value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&send()}
            placeholder="TYPE COMMAND..."
            className="w-full bg-black/38 border border-white/8 rounded-2xl py-4 pl-6 pr-14 text-[10px] tracking-[0.25em] text-white focus:outline-none focus:ring-1 focus:ring-amber-500/35 transition-all placeholder:text-slate-800 font-bold"/>
          <button onClick={send} className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500 hover:text-white transition-colors"><Send size={20}/></button>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────
   MAIN APP
────────────────────────────────────────────────────────────── */
export default function App() {
  const [search,  setSearch]  = useState("");
  const [sel,     setSel]     = useState(null);
  const [chat,    setChat]    = useState(null);
  const [mouse,   setMouse]   = useState({ x:0, y:0 });

  useEffect(() => {
    const h = e => setMouse({ x:e.clientX, y:e.clientY });
    window.addEventListener('mousemove', h, { passive:true });
    return () => window.removeEventListener('mousemove', h);
  }, []);

  const filtered = useMemo(() =>
    CELLS.filter(c => c.title.toLowerCase().includes(search.toLowerCase())), [search]);

  return (
    <div className="min-h-screen bg-[#020305] text-slate-100 overflow-x-hidden" style={{ fontFamily:"'Space Mono',monospace" }}>

      {/* ── SVG FILTER DEFS (global) ── */}
      <svg className="hidden" aria-hidden="true">
        <defs>
          {/* Global caustic filter (fallback) */}
          <filter id="caustic-global" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="turbulence" baseFrequency="0.02 0.025"
              numOctaves="3" seed="7" result="turb">
              <animate attributeName="seed" values="7;12;7" dur="12s" repeatCount="indefinite"/>
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="turb" scale="12"
              xChannelSelector="R" yChannelSelector="G"/>
          </filter>
          {/* Soft bloom filter */}
          <filter id="bloom" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
      </svg>

      {/* ── POST-PROCESSING ENVIRONMENT ── */}
      <div className="fixed inset-0 pointer-events-none z-[1]">
        {/* Vignette */}
        <div className="absolute inset-0"
          style={{ background:'radial-gradient(ellipse at center,transparent 28%,rgba(0,0,0,0.88) 100%)' }}/>
        {/* Warm key light */}
        <div className="absolute top-[-15%] left-[-8%] w-[65%] h-[65%] rounded-full blur-[180px] mix-blend-screen animate-pulse"
          style={{ background:'rgba(251,191,36,0.055)', animationDuration:'8s' }}/>
        {/* Cool rim */}
        <div className="absolute bottom-[-12%] right-[-8%] w-[55%] h-[55%] rounded-full blur-[200px]"
          style={{ background:'rgba(59,130,246,0.03)' }}/>
        {/* Film grain — Reaction-Diffusion noise */}
        <div className="absolute inset-0 opacity-[0.065] mix-blend-overlay"
          style={{ backgroundImage:"url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%225%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')" }}/>
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize:'58px 58px' }}/>
        {/* Scan line */}
        <div className="absolute left-0 right-0 h-[2px] opacity-[0.03]"
          style={{ background:'linear-gradient(to right,transparent,rgba(251,191,36,0.6),transparent)',
            animation:'scan-line 18s linear infinite' }}/>
        {/* Dust particles */}
        {[...Array(22)].map((_,i) => (
          <div key={i} className="absolute rounded-full"
            style={{ width:`${0.8+Math.random()}px`, height:`${0.8+Math.random()}px`,
              background:'rgba(255,255,255,0.14)',
              top:`${Math.random()*100}%`, left:`${Math.random()*100}%`,
              animation:`float-particle ${7+Math.random()*12}s ease-in-out ${Math.random()*10}s infinite`
            }}/>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-10 py-24 relative z-10">

        {/* ── HEADER ── */}
        <header className="mb-32 flex flex-col items-center text-center space-y-8">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.03] border border-white/8 text-amber-500 text-[10px] font-black tracking-[0.65em] uppercase hover:border-amber-500/35 transition-all cursor-default">
            <Award size={14} className="animate-pulse"/> Gold Master Registry · Ultra v5
          </div>

          {/* Logo with chromatic aberration */}
          <div className="relative select-none"
            style={{ transform:`rotateY(${(mouse.x-window.innerWidth/2)*0.004}deg) rotateX(${(mouse.y-window.innerHeight/2)*-0.002}deg)`,
              transition:'transform 0.1s linear' }}>
            <h1 className="font-black tracking-tighter text-white leading-[0.75]"
              style={{ fontSize:'clamp(5.5rem,15vw,13rem)', animation:'logo-breathe 6s ease-in-out infinite' }}>
              NATT<span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white/75 to-white/10">.OS</span>
            </h1>
            {/* RGB split — chromatic aberration */}
            <div aria-hidden className="absolute inset-0 font-black tracking-tighter leading-[0.75] pointer-events-none"
              style={{ fontSize:'clamp(5.5rem,15vw,13rem)', color:'rgba(255,0,80,0.04)', transform:'translate(2.5px,2.5px)' }}>
              NATT.OS
            </div>
            <div aria-hidden className="absolute inset-0 font-black tracking-tighter leading-[0.75] pointer-events-none"
              style={{ fontSize:'clamp(5.5rem,15vw,13rem)', color:'rgba(0,180,255,0.04)', transform:'translate(-2.5px,-2.5px)' }}>
              NATT.OS
            </div>
            <div className="h-[1.5px] mt-8 bg-gradient-to-r from-transparent via-white/18 to-transparent"/>
          </div>

          <p className="max-w-lg text-slate-600 text-[11px] font-black tracking-[0.38em] uppercase leading-loose">
            Hệ thống biểu thực thể số đa tầng<br/>
            <span className="text-white/55">"Cinematic Architectural Pipeline"</span>
          </p>
          <div className="flex gap-8 text-[8px] text-slate-800 tracking-[0.4em] font-mono">
            <span>BMF v1.5.0</span><span>·</span>
            <span>HOLO RENDER</span><span>·</span>
            <span>CAUSTIC ENGINE</span>
          </div>

          {/* Search */}
          <div className="w-full max-w-md relative group mt-10">
            <div className="absolute inset-0 blur-[35px] rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity"
              style={{ background:'rgba(251,191,36,0.08)' }}/>
            <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-amber-500 transition-colors" size={20}/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="QUERIES SYSTEM CELL..."
              className="w-full bg-white/[0.025] border border-white/5 rounded-[40px] py-5 pl-18 pr-8 text-[10px] font-black tracking-[0.38em] text-white focus:outline-none focus:ring-1 focus:ring-white/18 focus:bg-white/[0.045] transition-all backdrop-blur-2xl placeholder:text-slate-900"
              style={{ paddingLeft:'3.5rem' }}/>
          </div>
        </header>

        {/* ── MEDAL GRID ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-10 gap-y-24 justify-items-center">
          {filtered.map(item => (
            <UltraMedal key={item.id} item={item} mousePos={mouse}
              onClick={c => {
                if (c.cat === 'AI Personas') setChat(c);
                else setSel(c);
              }}
            />
          ))}
        </div>

        {/* ── FOOTER ── */}
        <footer className="mt-64 pt-20 border-t border-white/[0.04] pb-20">
          <div className="flex flex-col items-center gap-10">
            <div className="flex gap-16">
              <div className="text-center">
                <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest mb-2">Render Engine</p>
                <p className="text-[10px] font-bold text-white/30">Holo · Caustic · PBR v5</p>
              </div>
              <div className="text-center">
                <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest mb-2">Post-FX</p>
                <p className="text-[10px] font-bold text-white/30">DOF · Bloom · Chromatic</p>
              </div>
              <div className="text-center">
                <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest mb-2">Color</p>
                <p className="text-[10px] font-bold text-white/30">ACES · Film Grain · Scan</p>
              </div>
            </div>
            <div className="relative w-14 h-14 flex items-center justify-center">
              <div className="absolute inset-0 border border-amber-500/18 rounded-full animate-ping scale-150"/>
              <Fingerprint className="text-amber-500/35" size={28}/>
            </div>
            <p className="text-[9px] font-black text-slate-800 uppercase tracking-[1.8em]">
              NattSira Systems Integrity
            </p>
          </div>
        </footer>
      </div>

      {/* ── MODAL ── */}
      {sel && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-black/92 backdrop-blur-[40px]" onClick={()=>setSel(null)}/>
          <div className="relative w-full max-w-2xl bg-[#0a0c10] border border-white/8 rounded-[44px] overflow-hidden shadow-[0_0_120px_rgba(0,0,0,1)]">
            <div className="p-12 space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-amber-500 text-[9px] font-black tracking-[0.55em] uppercase">Artifact // {sel.id}</span>
                  <h2 className="text-5xl font-black text-white uppercase tracking-tighter">{sel.title}</h2>
                </div>
                <button onClick={()=>setSel(null)} className="p-3 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X size={26}/></button>
              </div>
              <div className="p-8 rounded-[30px] bg-white/[0.025] border border-white/5 space-y-3">
                <p className="text-amber-500 text-[9px] font-black uppercase tracking-widest">Cell Description</p>
                <p className="text-slate-400 text-lg leading-relaxed font-light">{sel.desc}</p>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="p-6 rounded-2xl bg-white/[0.025] border border-white/5">
                  <p className="text-[9px] text-slate-600 uppercase font-black mb-1 tracking-widest">Status</p>
                  <p className="text-white font-bold">{sel.status}</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/[0.025] border border-white/5">
                  <p className="text-[9px] text-slate-600 uppercase font-black mb-1 tracking-widest">Version</p>
                  <p className="text-white font-bold">v{sel.ver}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button className="px-8 py-4 bg-white text-black font-black text-[9px] uppercase tracking-[0.35em] rounded-full hover:bg-amber-400 transition-all">Execute Core</button>
                <button className="px-8 py-4 bg-white/5 border border-white/8 text-white font-black text-[9px] uppercase tracking-[0.35em] rounded-full hover:bg-white/10 transition-all">Audit Trails</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CHAT UPLINK ── */}
      {chat && (
        <div className="fixed bottom-10 right-10 z-[300] w-[400px]">
          <ChatUplink persona={chat} onExit={()=>setChat(null)}/>
        </div>
      )}
    </div>
  );
}
APPEOF

# ── INSTALL & LAUNCH ──────────────────────────────────────────
echo ""
echo "  ███╗   ██╗ █████╗ ████████╗████████╗    ██╗   ██╗██╗  ████████╗██████╗  █████╗"
echo "  ████╗  ██║██╔══██╗╚══██╔══╝╚══██╔══╝    ██║   ██║██║  ╚══██╔══╝██╔══██╗██╔══██╗"
echo "  ██╔██╗ ██║███████║   ██║      ██║       ██║   ██║██║     ██║   ██████╔╝███████║"
echo "  ██║╚██╗██║██╔══██║   ██║      ██║       ██║   ██║██║     ██║   ██╔══██╗██╔══██║"
echo "  ██║ ╚████║██║  ██║   ██║      ██║       ╚██████╔╝███████╗██║   ██║  ██║██║  ██║"
echo "  ╚═╝  ╚═══╝╚═╝  ╚═╝   ╚═╝      ╚═╝        ╚═════╝ ╚══════╝╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝"
echo ""
echo "  [HOLO · CAUSTIC · PBR · BEYOND VISIONOS]"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  TECHNIQUES ACTIVE:"
echo "  ① Holo Card    — CSS @property prismatic rainbow"
echo "  ② SVG Caustics — feTurbulence animated light ripple"
echo "  ③ PBR Metal    — conic-gradient tracks mouse angle"
echo "  ④ DOF Blur     — depth-of-field per cursor distance"
echo "  ⑤ 3-layer Z    — icon floats at Z=65px parallax"
echo "  ⑥ Specular     — metal shine sweep on hover"
echo "  ⑦ Bloom pass   — dual-radius additive glow"
echo "  ⑧ Fresnel rim  — edge lighting simulation"
echo "  ⑨ Holo irid    — direction-dependent color shift"
echo "  ⑩ Film grain   — fractalNoise reaction-diffusion"
echo "  ⑪ Scan line    — CRT scan pass"
echo "  ⑫ Chromatic    — RGB aberration on title"
echo ""
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "  [1/2] Installing dependencies..."
npm install --silent 2>&1 | tail -2

echo ""
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✓  Natt-OS ULTRA ENGINE v5 — DEPLOYED"
echo "  → http://localhost:5173"
echo "  → Gemini key: paste vào apiKey= trong src/App.jsx"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  [2/2] Launching..."
npm run dev
