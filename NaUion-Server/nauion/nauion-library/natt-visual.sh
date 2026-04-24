 #!/bin/bash
# ============================================================
# Natt-OS VISUAL ENGINE v5.0 — SPATIAL ICON SHOWCASE
# 1 COMMAND DEPLOY: bash natt-visual.sh
# ============================================================

set -e
DIR="natt-visual-engine"

echo ""
echo "  ███╗   ██╗ █████╗ ████████╗████████╗    ██████╗ ███████╗"
echo "  ████╗  ██║██╔══██╗╚══██╔══╝╚══██╔══╝   ██╔═══██╗██╔════╝"
echo "  ██╔██╗ ██║███████║   ██║      ██║      ██║   ██║███████╗"
echo "  ██║╚██╗██║██╔══██║   ██║      ██║      ██║   ██║╚════██║"
echo "  ██║ ╚████║██║  ██║   ██║      ██║      ╚██████╔╝███████║"
echo "  ╚═╝  ╚═══╝╚═╝  ╚═╝   ╚═╝      ╚═╝       ╚═════╝ ╚══════╝"
echo ""
echo "  [SPATIAL ICON ENGINE v5.0 — CINEMATIC DEPLOY]"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── SCAFFOLD ──────────────────────────────────────────────
mkdir -p $DIR/src
cd $DIR

# package.json
cat > package.json << 'PKGJSON'
{
  "name": "natt-visual-engine",
  "version": "5.0.0",
  "private": true,
  "scripts": {
    "dev": "vite --host",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.483.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "vite": "^6.0.11"
  }
}
PKGJSON

# vite config
cat > vite.config.js << 'VITECONF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ plugins: [react()] })
VITECONF

# tailwind
cat > tailwind.config.js << 'TAILWIND'
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
}
TAILWIND

cat > postcss.config.js << 'POSTCSS'
export default { plugins: { tailwindcss: {}, autoprefixer: {} } }
POSTCSS

# index.html
cat > index.html << 'HTMLEOF'
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Natt-OS ∙ Spatial Icon Engine v5.0</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⬡</text></svg>" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
HTMLEOF

# main.jsx
cat > src/main.jsx << 'MAINJSX'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
MAINJSX

# index.css
cat > src/index.css << 'CSSEOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

body { background-color: #010204; }

@keyframes shimmer {
  0% { transform: translateX(-200%) skewX(12deg); }
  50% { transform: translateX(200%) skewX(12deg); }
  100% { transform: translateX(200%) skewX(12deg); }
}

@keyframes floatUp {
  0%, 100% { transform: translateY(0px) scale(1); opacity: 0.15; }
  50% { transform: translateY(-30px) scale(1.1); opacity: 0.4; }
}

@keyframes orbit1 { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes orbit2 { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }

.ring-orbit-1 { animation: orbit1 28s linear infinite; }
.ring-orbit-2 { animation: orbit2 14s linear infinite; }
.ring-orbit-3 { animation: orbit1 42s linear infinite; }

.particle { animation: floatUp var(--dur, 8s) ease-in-out infinite; animation-delay: var(--delay, 0s); }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
CSSEOF

# App.jsx — STRIPPED TO ICON + FX ONLY
cat > src/App.jsx << 'APPEOF'
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Scroll, Shield, User, Zap, RefreshCw, Radio, Handshake, Bell,
  BarChart3, Scale, Users, Landmark, ShoppingCart, Factory, Award,
  Brain, Timer, Cloud, Layers, Database, Search, Key, ShieldAlert,
  Activity, Settings, Warehouse, Route, History, FileSignature,
  ShieldCheck, Workflow, PenTool, Layout, Gauge, Save,
  Crown, Fingerprint, Sparkles
} from 'lucide-react';

// ── REGISTRY (stripped, icons + meta only) ─────────────────
const CELLS = [
  { id:'ctn-01', cat:'Nền Tảng',     title:'HIẾN PHÁP',       icon:Scroll,       color:'gold'   },
  { id:'ctn-02', cat:'Nền Tảng',     title:'Gatekeeper',      icon:User,         color:'gold'   },
  { id:'ctn-03', cat:'Nền Tảng',     title:'NattSira Seal',   icon:ShieldCheck,  color:'gold'   },
  { id:'ker-01', cat:'Kernel',       title:'audit-cell',      icon:Search,       color:'amber'  },
  { id:'ker-02', cat:'Kernel',       title:'config-cell',     icon:Settings,     color:'amber'  },
  { id:'ker-03', cat:'Kernel',       title:'monitor-cell',    icon:Activity,     color:'amber'  },
  { id:'ker-04', cat:'Kernel',       title:'rbac-cell',       icon:Key,          color:'amber'  },
  { id:'ker-05', cat:'Kernel',       title:'security-cell',   icon:ShieldAlert,  color:'amber'  },
  { id:'inf-01', cat:'Hạ Tầng',      title:'smartlink-cell',  icon:Zap,          color:'blue'   },
  { id:'inf-02', cat:'Hạ Tầng',      title:'sync-cell',       icon:RefreshCw,    color:'blue'   },
  { id:'inf-03', cat:'Hạ Tầng',      title:'ai-connector',    icon:Radio,        color:'blue'   },
  { id:'inf-04', cat:'Hạ Tầng',      title:'shared-contracts',icon:Handshake,    color:'blue'   },
  { id:'inf-05', cat:'Hạ Tầng',      title:'notification',    icon:Bell,         color:'blue'   },
  { id:'inf-06', cat:'Hạ Tầng',      title:'warehouse',       icon:Warehouse,    color:'blue'   },
  { id:'biz-01', cat:'Nghiệp Vụ',    title:'analytics',       icon:BarChart3,    color:'green'  },
  { id:'biz-03', cat:'Nghiệp Vụ',    title:'compliance',      icon:Scale,        color:'green'  },
  { id:'biz-04', cat:'Nghiệp Vụ',    title:'customer',        icon:Users,        color:'green'  },
  { id:'biz-06', cat:'Nghiệp Vụ',    title:'finance',         icon:Landmark,     color:'green'  },
  { id:'biz-09', cat:'Nghiệp Vụ',    title:'order-cell',      icon:ShoppingCart, color:'green'  },
  { id:'biz-12', cat:'Nghiệp Vụ',    title:'production',      icon:Factory,      color:'green'  },
  { id:'biz-16', cat:'Nghiệp Vụ',    title:'warranty',        icon:Award,        color:'green'  },
  { id:'exe-01', cat:'Trí Tuệ',      title:'UEI',             icon:Brain,        color:'purple' },
  { id:'exe-02', cat:'Trí Tuệ',      title:'QNEU',            icon:Timer,        color:'purple' },
  { id:'exe-03', cat:'Trí Tuệ',      title:'Neural MAIN',     icon:Cloud,        color:'purple' },
  { id:'exe-05', cat:'Trí Tuệ',      title:'Metabolism',      icon:Layers,       color:'purple' },
  { id:'evt-01', cat:'Sự Kiện',      title:'Event Bus',       icon:Route,        color:'blue'   },
  { id:'evt-02', cat:'Sự Kiện',      title:'Audit Trail',     icon:History,      color:'blue'   },
  { id:'evt-03', cat:'Sự Kiện',      title:'Contract',        icon:FileSignature,color:'blue'   },
  { id:'ai-1',   cat:'AI Entities',  title:'KIM',             icon:ShieldCheck,  color:'red'    },
  { id:'ai-2',   cat:'AI Entities',  title:'BĂNG',            icon:Search,       color:'red'    },
  { id:'ai-3',   cat:'AI Entities',  title:'BỐI BỐI',         icon:Workflow,     color:'red'    },
  { id:'ai-4',   cat:'AI Entities',  title:'Thiên',           icon:PenTool,      color:'red'    },
  { id:'arc-01', cat:'Kiến Trúc',    title:'Truth Layer',     icon:Database,     color:'slate'  },
  { id:'arc-02', cat:'Kiến Trúc',    title:'Worker Layer',    icon:Factory,      color:'slate'  },
  { id:'arc-03', cat:'Kiến Trúc',    title:'Experience Layer',icon:Layout,       color:'slate'  },
  { id:'tol-01', cat:'Công Cụ',      title:'Dashboard',       icon:Gauge,        color:'slate'  },
  { id:'tol-03', cat:'Công Cụ',      title:'Memory Files',    icon:Save,         color:'slate'  },
];

// ── THEME MAP ──────────────────────────────────────────────
const T = {
  gold:   { p:'#fbbf24', glow:'rgba(251,191,36,0.5)',  em:'rgba(251,191,36,0.95)'  },
  blue:   { p:'#3b82f6', glow:'rgba(59,130,246,0.5)',  em:'rgba(59,130,246,0.95)'  },
  green:  { p:'#10b981', glow:'rgba(16,185,129,0.5)',  em:'rgba(16,185,129,0.95)'  },
  purple: { p:'#a78bfa', glow:'rgba(167,139,250,0.5)', em:'rgba(167,139,250,0.95)' },
  red:    { p:'#f43f5e', glow:'rgba(244,63,94,0.5)',   em:'rgba(244,63,94,0.95)'   },
  amber:  { p:'#f59e0b', glow:'rgba(245,158,11,0.5)',  em:'rgba(245,158,11,0.95)'  },
  slate:  { p:'#94a3b8', glow:'rgba(148,163,184,0.4)', em:'rgba(148,163,184,0.9)'  },
};

// ── CINEMATIC MEDAL ────────────────────────────────────────
const Medal = ({ item, mousePos }) => {
  const Icon = item.icon;
  const theme = T[item.color] || T.blue;
  const ref = useRef(null);
  const [dof, setDof] = useState(0);
  const [hovered, setHovered] = useState(false);

  // Depth-of-Field
  useEffect(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const dist = Math.hypot(mousePos.x - cx, mousePos.y - cy);
    setDof(Math.max(0, (dist - 200) * 0.018));
  }, [mousePos]);

  // Parallax layers
  const px = (s) => ({ x:(mousePos.x - window.innerWidth/2)*s, y:(mousePos.y - window.innerHeight/2)*s });
  const p1 = px(0.012), p2 = px(0.028), p3 = px(0.05);

  return (
    <button
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col items-center group relative outline-none py-10"
      style={{
        perspective: '1400px',
        filter: `blur(${dof}px)`,
        opacity: dof > 8 ? 0.25 : 1,
        transition: 'filter 0.4s, opacity 0.4s',
      }}
    >
      {/* ── MEDAL BODY ── */}
      <div
        className="relative w-32 h-32"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${-p1.y}deg) rotateY(${p1.x}deg) scale(${hovered ? 1.12 : 1})`,
          transition: 'transform 0.6s cubic-bezier(0.23,1,0.32,1)',
        }}
      >
        {/* ORBITAL RINGS */}
        <div className="absolute inset-[-28%] pointer-events-none" style={{ opacity: hovered ? 1 : 0.18, transition:'opacity 0.8s' }}>
          <svg className="w-full h-full ring-orbit-1" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke={theme.p} strokeWidth="0.08" strokeDasharray="1 7"/>
            <circle cx="50" cy="50" r="45" fill="none" stroke={theme.p} strokeWidth="0.2" strokeDasharray="12 22"/>
          </svg>
          <svg className="absolute inset-0 w-full h-full ring-orbit-2" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="41" fill="none" stroke={theme.p} strokeWidth="0.12" strokeDasharray="3 12"/>
          </svg>
          <svg className="absolute inset-0 w-full h-full ring-orbit-3" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="49.5" fill="none" stroke={theme.p} strokeWidth="0.04" strokeDasharray="0.5 3"/>
          </svg>
        </div>

        {/* LAYER 1 — PBR METALLIC SHELL */}
        <div
          className="absolute inset-0 rounded-full border border-white/10"
          style={{
            background: `conic-gradient(from ${mousePos.x * 0.08}deg at 50% 50%, #020202 0%, #1a1a1a 25%, #020202 50%, #1c1c1c 75%, #020202 100%)`,
            boxShadow: `0 20px 55px rgba(0,0,0,0.95), inset 0 0 20px rgba(255,255,255,0.04)`,
            transform: 'translateZ(0px)',
          }}
        >
          {/* Specular sweep */}
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
              style={{
                transform: `translateX(${hovered ? '200%' : '-200%'}) skewX(12deg)`,
                transition: 'transform 1.2s cubic-bezier(0.23,1,0.32,1)',
              }}
            />
          </div>
          {/* Fresnel edge */}
          <div className="absolute inset-0 rounded-full border-[1.5px] border-white/15 pointer-events-none" style={{ opacity: hovered ? 1 : 0.4, transition:'opacity 0.6s' }}/>
        </div>

        {/* LAYER 2 — GLASS REFRACTION CORE */}
        <div
          className="absolute inset-[10%] rounded-full overflow-hidden flex items-center justify-center border border-white/20"
          style={{
            backdropFilter: 'blur(20px)',
            background: `radial-gradient(circle at ${40 + mousePos.x*0.01}% ${40 + mousePos.y*0.01}%, rgba(255,255,255,0.12), transparent 80%)`,
            boxShadow: `inset 0 0 35px rgba(0,0,0,0.85), 0 8px 32px rgba(0,0,0,0.6), 0 0 ${hovered?'60px':'20px'} ${theme.glow}`,
            transform: `translateZ(28px) translateX(${p2.x}px) translateY(${p2.y}px)`,
            transition: 'box-shadow 0.6s, transform 0.6s',
          }}
        >
          {/* Holographic iridescence */}
          <div className="absolute inset-0 mix-blend-screen bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-amber-500/10 animate-pulse"/>
        </div>

        {/* LAYER 3 — EMISSIVE ICON (floating Z-apex) */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ transform: `translateZ(62px) translateX(${p3.x}px) translateY(${p3.y}px)`, transition: 'transform 0.8s' }}
        >
          {/* Bloom */}
          <div
            className="absolute rounded-full"
            style={{
              inset: '-30%',
              background: theme.p,
              filter: 'blur(22px)',
              opacity: hovered ? 0.75 : 0.35,
              transform: 'scale(1.4)',
              transition: 'opacity 0.6s',
            }}
          />
          {Icon && (
            <Icon
              size={40}
              strokeWidth={1.5}
              className="relative z-10 text-white"
              style={{ filter:`drop-shadow(0 0 10px ${theme.em}) drop-shadow(0 0 25px ${theme.glow})` }}
            />
          )}
        </div>

        {/* Dynamic light follow */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none mix-blend-overlay"
          style={{
            background: `radial-gradient(circle at ${mousePos.x/4}px ${mousePos.y/4}px, rgba(255,255,255,0.25), transparent 60%)`,
            opacity: hovered ? 0.45 : 0,
            transition: 'opacity 0.4s',
          }}
        />
      </div>

      {/* LABEL */}
      <div className="mt-12 text-center" style={{ transform:`translateY(${hovered?'6px':'0'})`, transition:'transform 0.5s' }}>
        <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em] block mb-1.5">
          {item.cat}
        </span>
        <h3
          className="text-[12px] font-black text-white uppercase tracking-[0.22em] transition-all duration-500"
          style={{ color: hovered ? theme.p : undefined, textShadow: hovered ? `0 0 20px ${theme.glow}` : 'none' }}
        >
          {item.title}
        </h3>
      </div>
    </button>
  );
};

// ── MAIN APP ───────────────────────────────────────────────
export default function App() {
  const [search, setSearch] = useState('');
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const h = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  const cats = useMemo(() => [...new Set(CELLS.map(c => c.cat))], []);
  const filtered = useMemo(() =>
    CELLS.filter(c =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.cat.toLowerCase().includes(search.toLowerCase())
    ), [search]);

  return (
    <div className="min-h-screen bg-[#010204] text-slate-100 font-sans overflow-x-hidden">

      {/* ── POST-PROCESSING OVERLAY ── */}
      <div className="fixed inset-0 pointer-events-none z-[1]">
        {/* Vignette */}
        <div className="absolute inset-0" style={{ background:'radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.88) 100%)' }}/>
        {/* Warm God Ray */}
        <div className="absolute top-[-20%] left-[10%] w-[80%] h-[70%] rounded-full blur-[160px] mix-blend-screen animate-pulse" style={{ background:'rgba(251,191,36,0.04)' }}/>
        {/* Cool fill */}
        <div className="absolute bottom-0 right-[-10%] w-[60%] h-[50%] rounded-full blur-[200px] mix-blend-screen" style={{ background:'rgba(59,130,246,0.03)' }}/>
        {/* Film grain */}
        <div className="absolute inset-0 opacity-[0.055] mix-blend-overlay" style={{ backgroundImage:"url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')" }}/>
        {/* Dust particles */}
        {[...Array(25)].map((_, i) => (
          <div key={i} className="absolute rounded-full particle"
            style={{
              width: `${1 + Math.random()}px`, height: `${1 + Math.random()}px`,
              background: 'rgba(255,255,255,0.12)',
              top:`${Math.random()*100}%`, left:`${Math.random()*100}%`,
              '--dur': `${6 + Math.random()*12}s`, '--delay': `${Math.random()*10}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-[1600px] mx-auto px-12 py-32 relative z-10">

        {/* ── HEADER ── */}
        <header className="mb-48 flex flex-col items-center text-center space-y-14">
          <div className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-white/[0.03] border border-white/10 text-amber-500 text-[11px] font-black tracking-[0.8em] uppercase hover:border-amber-500/40 transition-all cursor-default">
            <Crown size={16} className="animate-bounce"/> Gold Master Registry · Spatial v5.0
          </div>

          <div
            className="relative select-none"
            style={{ transform:`rotateY(${(mouse.x - window.innerWidth/2)*0.004}deg) rotateX(${(mouse.y - window.innerHeight/2)*-0.002}deg)`, transition:'transform 0.1s linear' }}
          >
            <h1 className="font-black tracking-tighter text-white leading-[0.75]" style={{ fontSize:'clamp(6rem,18vw,18rem)' }}>
              NATT<span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white/70 to-white/10">.OS</span>
            </h1>
            {/* Chromatic aberration */}
            <div className="absolute inset-0 pointer-events-none font-black tracking-tighter leading-[0.75] text-red-500/[0.025]" style={{ fontSize:'clamp(6rem,18vw,18rem)', transform:'translate(2px,2px)' }}>NATT.OS</div>
            <div className="absolute inset-0 pointer-events-none font-black tracking-tighter leading-[0.75] text-blue-500/[0.025]" style={{ fontSize:'clamp(6rem,18vw,18rem)', transform:'translate(-2px,-2px)' }}>NATT.OS</div>
            <div className="h-[2px] mt-8 bg-gradient-to-r from-transparent via-white/20 to-transparent"/>
          </div>

          <p className="text-slate-600 text-base font-bold tracking-[0.5em] uppercase">
            Distributed Living Organism ·{' '}
            <span className="text-white font-black">Implementation Truth Enforced</span>
          </p>
          <div className="flex gap-8 text-[9px] text-slate-800 tracking-[0.4em] font-mono">
            <span>BMF v1.5.0</span><span>·</span>
            <span>CONSTITUTION v4.0</span><span>·</span>
            <span>WAVE 3 ULTIMATE</span>
          </div>

          {/* Search */}
          <div className="w-full max-w-xl relative group mt-4">
            <div className="absolute inset-0 bg-amber-500/8 blur-[40px] rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity"/>
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-amber-500 transition-colors" size={22}/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="QUERY SYSTEM REGISTRY..."
              className="w-full bg-white/[0.015] border border-white/[0.06] rounded-[50px] py-6 pl-20 pr-10 text-[12px] font-black tracking-[0.5em] text-white focus:outline-none focus:ring-1 focus:ring-white/15 focus:bg-white/[0.03] transition-all backdrop-blur-2xl placeholder:text-slate-900"
            />
          </div>
        </header>

        {/* ── CATEGORY SECTIONS ── */}
        <div className="space-y-56">
          {cats.map(cat => {
            const items = filtered.filter(c => c.cat === cat);
            if (!items.length) return null;
            return (
              <section key={cat}>
                <div className="flex items-center gap-10 mb-20 px-6">
                  <div className="h-[1.5px] w-10 bg-amber-500/50"/>
                  <h2 className="text-3xl font-black text-white uppercase tracking-[0.45em] whitespace-nowrap">{cat}</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/15 via-white/4 to-transparent"/>
                  <span className="text-[10px] text-slate-700 tracking-widest font-mono">
                    <span className="text-amber-500 font-black">{items.length}</span> ENTS
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-16 gap-y-28 justify-items-center">
                  {items.map(item => <Medal key={item.id} item={item} mousePos={mouse}/>)}
                </div>
              </section>
            );
          })}
        </div>

        {/* ── FOOTER ── */}
        <footer className="mt-96 pt-24 border-t border-white/[0.04] pb-32 flex flex-col items-center gap-12">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 border border-amber-500/20 rounded-full animate-ping scale-150"/>
            <Fingerprint className="text-amber-500/70" size={42}/>
          </div>
          <p className="text-[10px] font-black text-slate-800 uppercase tracking-[2em]">Natt-OS · SPATIAL ICON ENGINE v5.0</p>
        </footer>
      </div>
    </div>
  );
}
APPEOF

# ── INSTALL & LAUNCH ───────────────────────────────────────
echo "  [1/2] Installing dependencies..."
npm install --silent 2>&1 | tail -3

echo ""
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✓  Natt-OS Spatial Icon Engine — DEPLOYED"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  → http://localhost:5173"
echo "  → http://[your-ip]:5173  (LAN access)"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  [2/2] Launching dev server..."
npm run dev
