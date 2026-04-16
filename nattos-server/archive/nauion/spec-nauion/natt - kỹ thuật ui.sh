#!/bin/bash
# ============================================================
# NATT-OS SPATIAL ENGINE V5.0 — FULL DEPLOY (FIXED)
# 1 COMMAND: bash natt-full.sh
# Includes: Responsive layout + 8‑layer medals + AI Chat Uplink
# ============================================================

set -e
DIR="natt-os-v5"

echo ""
echo "  ███╗   ██╗ █████╗ ████████╗████████╗    ██████╗ ███████╗"
echo "  ████╗  ██║██╔══██╗╚══██╔══╝╚══██╔══╝   ██╔═══██╗██╔════╝"
echo "  ██╔██╗ ██║███████║   ██║      ██║      ██║   ██║███████╗"
echo "  ██║╚██╗██║██╔══██║   ██║      ██║      ██║   ██║╚════██║"
echo "  ██║ ╚████║██║  ██║   ██║      ██║      ╚██████╔╝███████║"
echo "  ╚═╝  ╚═══╝╚═╝  ╚═╝   ╚═╝      ╚═╝       ╚═════╝ ╚══════╝"
echo ""
echo "  [FULL SPATIAL ENGINE v5.0 — RESPONSIVE + LAYERED]"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

mkdir -p $DIR/src
cd $DIR

# ── package.json ──────────────────────────────────────────
cat > package.json << 'EOF'
{
  "name": "natt-os-v5",
  "version": "5.0.0",
  "type": "module",
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
EOF

# ── vite.config.js ────────────────────────────────────────
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ plugins: [react()] })
EOF

# ── tailwind.config.js ────────────────────────────────────
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
}
EOF

# ── postcss.config.js ─────────────────────────────────────
cat > postcss.config.js << 'EOF'
export default { plugins: { tailwindcss: {}, autoprefixer: {} } }
EOF

# ── index.html ────────────────────────────────────────────
cat > index.html << 'EOF'
<!doctype html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes" />
  <title>NATT-OS · Spatial Engine v5.0</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⬡</text></svg>" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
EOF

# ── src/main.jsx ──────────────────────────────────────────
cat > src/main.jsx << 'EOF'
import React, { useState, useMemo, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import {
  Scroll, Shield, User, Zap, RefreshCw, Radio, Handshake, Bell,
  BarChart3, Scale, Users, Landmark, ShoppingCart, Factory, Award,
  Brain, Timer, Cloud, Layers, Database, Search, Key, ShieldAlert,
  Activity, Settings, Warehouse, Route, History, FileSignature,
  ShieldCheck, Workflow, PenTool, Layout, Gauge, Save,
  Crown, Fingerprint, Sparkles, X, Terminal, Cpu, Activity as ActivityIcon,
  Truck, Gem, Flame, Coins, ClipboardCheck, Ship, UserCheck, Briefcase,
  Camera, Construction, Archive, Recycle, Boxes, Lock, Eye, Send, Binary, TrendingUp,
  RotateCcw, Command, Dna, ZapOff, PieChart, LayoutDashboard, MessageSquare, Menu,
  ChevronRight, AlertTriangle, Globe, RadioTower, Zap as ZapIcon, Target
} from 'lucide-react';

/**
 * NATT-OS NaUion Vision Engine v5.2.6 [VR-SPATIAL HUD]
 * "Hệ thực tế ảo cho sinh thể số phân tán"
 * Architecture: Floating HUDs, Curved Perspective, Deep Galaxy
 * Compliance: NaUion Spec v1.0
 */

const apiKey = ""; // Thay bằng key nếu cần

// ── DESIGN TOKENS (VR ADJUSTED) ──────────────────────────
const TOKENS = {
  colors: {
    bg: '#000105',
    glass: 'rgba(5, 10, 25, 0.3)',
    accent: '#fbbf24',
    cyan: '#00FFFF',
    gold: { p:'#fbbf24', em:'#FFD700', glow:'rgba(251,191,36,0.3)', deep:'#4a3701' },
    blue: { p:'#3b82f6', em:'#60a5fa', glow:'rgba(59,130,246,0.3)', deep:'#1e3a8a' },
    green: { p:'#10b981', em:'#34d399', glow:'rgba(16,185,129,0.3)', deep:'#064e3b' },
    purple: { p:'#a78bfa', em:'#c084fc', glow:'rgba(167,139,250,0.3)', deep:'#4c1d95' },
    red: { p:'#f43f5e', em:'#fb7185', glow:'rgba(244,63,94,0.3)', deep:'#881337' },
  }
};

const CELL_REGISTRY = [
  { id:'ctn-01', cat:'Core', title:'HIẾN PHÁP', icon:Scroll, color:'gold', desc:'DNA gốc bất biến.', path:'src/cells/core/constitution' },
  { id:'ctn-02', cat:'Core', title:'Gatekeeper', icon:User, color:'gold', desc:'Quyền tối thượng.', path:'src/cells/core/gatekeeper' },
  { id:'biz-prod', cat:'Business', title:'production', icon:Factory, color:'green', desc:'Dây chuyền logic.', path:'src/cells/business/production' },
  { id:'biz-sale', cat:'Business', title:'sales-cell', icon:TrendingUp, color:'green', desc:'Tăng trưởng Wave 3.', path:'src/cells/business/sales' },
  { id:'biz-pay', cat:'Business', title:'payment', icon:Coins, color:'green', desc:'Cổng thanh toán.', path:'src/cells/business/payment' },
  { id:'inf-01', cat:'Infra', title:'smartlink', icon:Zap, color:'blue', desc:'Hệ thần kinh số.', path:'src/cells/infra/smartlink' },
  { id:'exe-01', cat:'Intel', title:'UEI Logic', icon:Brain, color:'purple', desc:'Não bộ điều phối.', path:'src/cells/intel/uei' },
  { id:'ai-3', cat:'AI', title:'BỐI BỐI', icon:Workflow, color:'red', desc:'Constitutional Builder.' },
  { id:'ai-4', cat:'AI', title:'THIÊN', icon:PenTool, color:'red', desc:'UI/UX Architect.' },
];

// ── API UPLINK ──────────────────────────────────────────────
const callGemini = async (prompt, systemInstruction = "") => {
  if (!apiKey) return "API key not configured. Please add your key.";
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
      })
    });
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Link severed.";
  } catch (e) {
    return "Neural link failed.";
  }
};

// ── GLOBAL STYLES (VR PERSPECTIVE + RESPONSIVE) ─────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;700;800&display=swap');
    @property --holo-angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
    @property --mouse-x { syntax: '<number>'; initial-value: 0.5; inherits: false; }
    @property --mouse-y { syntax: '<number>'; initial-value: 0.5; inherits: false; }

    body { background-color: #000105; color: white; font-family: 'JetBrains Mono', monospace; margin: 0; overflow-x: hidden; }
    
    .hud-glass {
      background: rgba(10, 15, 35, 0.25);
      backdrop-filter: blur(30px) saturate(200%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 0 50px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,255,255,0.03);
    }

    @keyframes star-pulse { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.6; } }
    @keyframes scan-line { 0% { top: -10%; } 100% { top: 110%; } }

    .custom-scrollbar::-webkit-scrollbar { width: 2px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 215, 0, 0.2); border-radius: 10px; }
    
    .scanner-active::before {
      content: ''; position: absolute; left: 0; width: 100%; height: 2px;
      background: linear-gradient(90deg, transparent, #fbbf24, transparent);
      animation: scan-line 6s linear infinite; z-index: 10;
    }

    /* Responsive base */
    @media (max-width: 768px) {
      .hud-glass { backdrop-filter: blur(20px); }
    }
  `}</style>
);

// ── LAYERED MEDAL (8 layers) ───────────────────────────────
const NaUionMedal = ({ item, mousePos, onClick }) => {
  const Icon = item.icon;
  const theme = TOKENS.colors[item.color] || TOKENS.colors.gold;
  const [hovered, setHovered] = useState(false);
  const medalRef = useRef(null);
  
  // Tính góc kim loại và parallax dựa trên chuột
  const px = (s) => ({ x: (mousePos.x - window.innerWidth / 2) * s, y: (mousePos.y - window.innerHeight / 2) * s });
  const p1 = px(0.012);  // lớp ngoài
  const p2 = px(0.025);  // lớp giữa
  const p3 = px(0.04);   // lớp icon
  const angle = Math.atan2(mousePos.y - window.innerHeight / 2, mousePos.x - window.innerWidth / 2) * 180 / Math.PI;

  // Hiệu ứng Depth of Field (mờ dần khi xa)
  const [dof, setDof] = useState(0);
  useEffect(() => {
    if (!medalRef.current) return;
    const rect = medalRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width/2;
    const centerY = rect.top + rect.height/2;
    const dist = Math.hypot(mousePos.x - centerX, mousePos.y - centerY);
    setDof(Math.max(0, (dist - 300) * 0.012));
  }, [mousePos]);

  return (
    <button
      ref={medalRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(item)}
      className="flex flex-col items-center group relative outline-none py-4 transition-transform"
      style={{ filter: `blur(${dof}px)` }}
    >
      <div className="relative w-24 h-24 md:w-32 md:h-32 transition-all duration-700"
           style={{ transformStyle: 'preserve-3d', transform: `rotateX(${-p1.y}deg) rotateY(${p1.x}deg) scale(${hovered ? 1.15 : 1})` }}>
        
        {/* Layer 0: Orbital rings (3 vòng) */}
        <div className="absolute inset-[-20%] pointer-events-none opacity-20 group-hover:opacity-100 transition-opacity">
          <svg className="absolute w-full h-full animate-[spin_20s_linear_infinite]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke={theme.p} strokeWidth="0.3" strokeDasharray="2 6" />
          </svg>
          <svg className="absolute w-full h-full animate-[spin_14s_linear_infinite_reverse]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke={theme.p} strokeWidth="0.2" strokeDasharray="1 8" />
          </svg>
          <svg className="absolute w-full h-full animate-[spin_28s_linear_infinite]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="36" fill="none" stroke={theme.p} strokeWidth="0.1" strokeDasharray="3 4" />
          </svg>
        </div>

        {/* Layer 1: PBR metallic shell (conic-gradient theo góc chuột) */}
        <div className="absolute inset-0 rounded-full border border-white/5"
             style={{
               background: `conic-gradient(from ${angle}deg, #0a0a0a, #2a2a2a, #1a1a1a, #0a0a0a)`,
               boxShadow: `0 20px 40px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,255,255,0.1)`
             }} />

        {/* Layer 2: Specular sweep (chỉ hiện khi hover) */}
        {hovered && (
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
          </div>
        )}

        {/* Layer 3: Fresnel rim (viền sáng cạnh) */}
        <div className="absolute inset-0 rounded-full border border-white/20 blur-[0.5px]" />

        {/* Layer 4: Holo prismatic (ẩn, hiện khi hover) */}
        <div className={`absolute inset-0 rounded-full transition-opacity duration-500 ${hovered ? 'opacity-40' : 'opacity-0'}`}
             style={{
               background: `conic-gradient(from var(--holo-angle), #ff00ff, #00ffff, #ffff00, #ff00ff)`,
               mixBlendMode: 'color-dodge',
               animation: 'holo-shift 6s linear infinite'
             }} />

        {/* Layer 5: Glass core (kính khúc xạ) */}
        <div className="absolute inset-[15%] rounded-full backdrop-blur-xl bg-white/[0.02] border border-white/10"
             style={{ transform: `translateZ(20px) translate(${p2.x}px, ${p2.y}px)` }} />

        {/* Layer 6: Caustics (gợn sáng dạng nước) – dùng SVG filter */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: 'translateZ(15px)' }}>
          <defs>
            <filter id="caustic">
              <feTurbulence type="turbulence" baseFrequency="0.018 0.022" result="noise">
                <animate attributeName="baseFrequency" values="0.018 0.022;0.022 0.018;0.018 0.022" dur="8s" repeatCount="indefinite" />
              </feTurbulence>
              <feColorMatrix in="noise" mode="luminanceToAlpha" result="alphaNoise" />
              <feComposite in="SourceGraphic" in2="alphaNoise" operator="in" />
            </filter>
          </defs>
          <circle cx="50%" cy="50%" r="30%" fill="white" filter="url(#caustic)" opacity="0.15" />
        </svg>

        {/* Layer 7: Holographic iridescence (lớp ánh kim chuyển sắc) */}
        <div className="absolute inset-0 rounded-full mix-blend-screen opacity-30"
             style={{
               background: 'linear-gradient(45deg, rgba(255,0,255,0.2), rgba(0,255,255,0.2), rgba(255,255,0,0.2))',
               transform: `rotate(${angle}deg)`
             }} />

        {/* Layer 8: Emissive icon (nổi trên cùng) */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `translateZ(40px) translate(${p3.x}px, ${p3.y}px)` }}>
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center"
               style={{
                 background: `radial-gradient(circle at 30% 30%, ${theme.em}, ${theme.deep})`,
                 boxShadow: `0 0 30px ${theme.glow}`
               }}>
            {Icon && <Icon size={hovered ? 26 : 22} className="text-black/90 transition-all" strokeWidth={2.5} />}
          </div>
        </div>
      </div>

      {/* Chữ bên dưới medal */}
      <h3 className={`mt-4 md:mt-6 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] transition-all ${hovered ? 'text-white' : 'text-white/20'}`}>
        {item.title}
      </h3>
    </button>
  );
};

// ── FLOATING HUD (Responsive: ẩn trên mobile, hiện trên desktop) ──
const FloatingHUD = ({ children, title, side, ry, className = '' }) => {
  const sideClass = side === 'left' ? 'left-4 xl:left-8' : 'right-4 xl:right-8';
  return (
    <div
      className={`absolute top-[10vh] z-40 hidden xl:block hud-glass rounded-[30px] xl:rounded-[50px] p-6 xl:p-8 w-[280px] xl:w-[340px] transition-all duration-1000 ${sideClass} ${className}`}
      style={{ transform: `rotateY(${ry}deg)` }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-5 bg-amber-500 rounded-full" />
        <h4 className="text-[8px] xl:text-[10px] font-black uppercase tracking-[0.5em] text-amber-500/80">{title}</h4>
      </div>
      {children}
    </div>
  );
};

const HUDStat = ({ label, value, color }) => (
  <div className="bg-white/[0.02] border border-white/5 p-4 xl:p-5 rounded-[20px] xl:rounded-[25px] hover:bg-white/[0.04] transition-all">
    <div className="text-[7px] xl:text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</div>
    <div className="text-lg xl:text-xl font-black tracking-tighter" style={{ color }}>{value}</div>
  </div>
);

// ── MAIN VR APP (Responsive + Layers) ────────────────────────
export default function App() {
  const [mouse, setMouse] = useState({ x: window.innerWidth/2, y: window.innerHeight/2 });
  const [activeItem, setActiveItem] = useState(null);
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false); // cho mobile

  useEffect(() => {
    const handleMouse = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const filteredCells = useMemo(() =>
    CELL_REGISTRY.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <GlobalStyles />

      {/* BACKGROUND (Truth Layer) */}
      <div className="fixed inset-0 z-[-1] bg-[#000105]">
        <div className="absolute inset-0 opacity-[0.4]" style={{ background: 'radial-gradient(circle at center, transparent, #000105 80%)' }} />
        {[...Array(80)].map((_, i) => (
          <div key={i} className="absolute bg-white rounded-full animate-pulse"
               style={{
                 top: `${Math.random() * 100}%`,
                 left: `${Math.random() * 100}%`,
                 width: `${Math.random() * 2}px`, height: `${Math.random() * 2}px`,
                 animationDuration: `${3 + Math.random() * 5}s`,
                 opacity: Math.random() * 0.5
               }} />
        ))}
        <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-blue-900/[0.05] blur-[150px] mix-blend-screen"
             style={{ transform: `translate(${mouse.x * 0.01}px, ${mouse.y * 0.01}px)` }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-amber-900/[0.03] blur-[180px] mix-blend-screen" />
      </div>

      {/* LEFT HUD (System Vitals) - Worker/Experience Layer */}
      <FloatingHUD title="System Vitals" side="left" ry={25}>
        <div className="space-y-3 xl:space-y-4">
          <HUDStat label="Confidence Score" value="99.98%" color="#fbbf24" />
          <HUDStat label="Logic Density" value="5240 Th/s" color="#3b82f6" />
          <HUDStat label="Synapse Load" value="12.4%" color="#10b981" />
          <div className="pt-4 xl:pt-6">
            <div className="text-[7px] xl:text-[8px] font-black text-slate-600 uppercase tracking-widest mb-4">Neural Health</div>
            <div className="h-20 xl:h-32 flex items-end gap-1">
               {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.4, 0.9, 0.7].map((h, i) => (
                 <div key={i} className="flex-1 bg-amber-500/20 rounded-t-sm relative overflow-hidden" style={{ height: `${h * 100}%` }}>
                    <div className="absolute inset-0 bg-amber-500/40 animate-pulse" />
                 </div>
               ))}
            </div>
          </div>
        </div>
      </FloatingHUD>

      {/* RIGHT HUD (Event Stream) - Experience Layer */}
      <FloatingHUD title="Event Stream" side="right" ry={-25}>
        <div className="h-[300px] xl:h-[450px] overflow-y-auto custom-scrollbar space-y-3 xl:space-y-4 pr-2">
           {[...Array(8)].map((_, i) => (
             <div key={i} className="p-3 xl:p-4 rounded-2xl xl:rounded-3xl bg-white/[0.02] border border-white/5 font-mono text-[8px] xl:text-[9px] space-y-2 opacity-60 hover:opacity-100 transition-opacity">
                <div className="flex justify-between text-amber-500/60 font-black">
                   <span>ID_0x{Math.floor(Math.random()*1000)}</span>
                   <span>{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="text-slate-400 uppercase leading-relaxed tracking-tighter">
                   LOG_ENTRY: Shard metadata verification pulse. Integrity: 1.0. No drift detected.
                </div>
             </div>
           ))}
        </div>
        <div className="pt-3 xl:pt-4 border-t border-white/5 mt-2">
           <div className="flex items-center justify-between text-[7px] xl:text-[8px] font-black text-slate-700 uppercase">
              <span>Shard: Niêm Phong</span>
              <span className="text-green-500">Live Connection</span>
           </div>
        </div>
      </FloatingHUD>

      {/* MAIN CENTER (Worker Layer - Medal Grid) */}
      <div className="relative z-10 w-full px-4 py-6 md:py-12 flex flex-col items-center">
        {/* Header */}
        <header className="mb-8 md:mb-16 text-center space-y-4 md:space-y-8 w-full">
           <div className="inline-flex items-center gap-2 md:gap-4 px-4 md:px-6 py-1 md:py-2 rounded-full bg-white/[0.03] border border-white/5 text-amber-500 text-[7px] md:text-[9px] font-black tracking-[0.5em] md:tracking-[1em] uppercase">
              <Crown size={12} className="animate-bounce" /> Spatial Interface v5.2.6
           </div>
           
           <div className="relative transform-gpu" style={{ transform: `rotateY(${(mouse.x - window.innerWidth/2) * 0.003}deg)` }}>
              <h1 className="text-[5rem] md:text-[8rem] lg:text-[12rem] font-black tracking-tighter text-white leading-none select-none drop-shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                NATT<span className="opacity-20">.OS</span>
              </h1>
              <div className="absolute inset-0 text-red-500/[0.03] blur-sm translate-x-1 translate-y-1">NATT.OS</div>
           </div>

           {/* Search - responsive */}
           <div className="flex items-center justify-center px-4 md:px-0">
              <div className="relative w-full max-w-xs md:max-w-md lg:max-w-lg">
                <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-700" size={14} />
                <input
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="QUERY REGISTRY..."
                  className="w-full bg-white/[0.02] border border-white/5 rounded-full py-2 md:py-3 pl-8 md:pl-12 pr-4 text-[9px] md:text-[10px] font-bold text-white focus:outline-none focus:border-amber-500/40 transition-all text-center tracking-widest" />
              </div>
           </div>
        </header>

        {/* Medal Grid - responsive columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8 lg:gap-12 justify-items-center w-full max-w-6xl">
           {filteredCells.map(cell => (
             <NaUionMedal key={cell.id} item={cell} mousePos={mouse} onClick={setActiveItem} />
           ))}
        </div>
      </div>

      {/* BOTTOM DOCK (Experience Layer) - responsive */}
      <div className="fixed bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 z-[100] hud-glass px-4 md:px-8 py-2 md:py-3 rounded-full flex items-center gap-3 md:gap-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,1)]">
         <button onClick={() => setIsCmdOpen(true)} className="flex flex-col items-center gap-0.5 md:gap-1.5 text-slate-500 hover:text-amber-500 transition-all group">
            <Command size={18} className="md:w-[22px] group-hover:scale-110 transition-transform" />
            <span className="text-[6px] md:text-[7px] font-black uppercase tracking-widest hidden md:inline">Neural Cmd</span>
         </button>
         <div className="w-px h-4 md:h-8 bg-white/5" />
         <button className="flex flex-col items-center gap-0.5 md:gap-1.5 text-slate-500 hover:text-blue-500 transition-all">
            <LayoutDashboard size={18} className="md:w-[22px]" />
            <span className="text-[6px] md:text-[7px] font-black uppercase tracking-widest hidden md:inline">Dashboard</span>
         </button>
         <button className="flex flex-col items-center gap-0.5 md:gap-1.5 text-slate-500 hover:text-purple-500 transition-all">
            <Globe size={18} className="md:w-[22px]" />
            <span className="text-[6px] md:text-[7px] font-black uppercase tracking-widest hidden md:inline">Global</span>
         </button>
         <button className="flex flex-col items-center gap-0.5 md:gap-1.5 text-slate-500 hover:text-red-500 transition-all">
            <Fingerprint size={18} className="md:w-[22px]" />
            <span className="text-[6px] md:text-[7px] font-black uppercase tracking-widest hidden md:inline">ID</span>
         </button>
         {/* Mobile menu toggle - có thể mở rộng thêm */}
         <button onClick={() => setMenuOpen(!menuOpen)} className="xl:hidden flex flex-col items-center gap-0.5 text-slate-500 hover:text-amber-500">
            <Menu size={20} />
            <span className="text-[6px] font-black uppercase tracking-widest">Menu</span>
         </button>
      </div>

      {/* MODALS (Worker/Experience Layer) */}
      {activeItem && <NeuralTerminal item={activeItem} onClose={() => setActiveItem(null)} />}
      <GlobalCommand isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} />
    </div>
  );
}

// ── SPATIAL MODAL COMPONENTS (Responsive) ───────────────────

const NeuralTerminal = ({ item, onClose }) => {
  const [dossier, setDossier] = useState("");
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const fetchDossier = async () => {
      const res = await callGemini(`System component: ${item.title}. Path: ${item.path}. Generate technical VR dossier.`, "Observer Sub-routine.");
      setDossier(res); setLoading(false);
    };
    fetchDossier();
  }, [item]);

  const handleChat = async (e) => {
    e.preventDefault(); if(!input.trim()) return;
    const msg = input; setInput("");
    setChat(p => [...p, { role:'user', text:msg }]);
    const res = await callGemini(msg, `You are ${item.title} logic.`);
    setChat(p => [...p, { role:'ai', text:res }]);
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-2 md:p-8 bg-black/90 backdrop-blur-3xl animate-in zoom-in-95">
      <div className="w-full max-w-4xl h-[90vh] md:h-[85vh] hud-glass rounded-[30px] md:rounded-[60px] flex flex-col overflow-hidden relative border border-white/10 shadow-[0_0_150px_rgba(0,0,0,1)] scanner-active">
        <div className="px-4 md:px-8 py-4 md:py-6 border-b border-white/5 flex justify-between items-center">
           <div className="flex items-center gap-2 md:gap-4">
              <Terminal className="text-amber-500" size={18} />
              <h2 className="text-[10px] md:text-sm font-black uppercase tracking-[0.3em] md:tracking-[0.5em] truncate">{item.title} // VR DIAGNOSTIC</h2>
           </div>
           <button onClick={onClose} className="p-2 md:p-3 bg-white/5 rounded-full hover:rotate-90 transition-all text-slate-500 hover:text-white"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 custom-scrollbar">
           <div className="p-4 md:p-6 rounded-[20px] md:rounded-[30px] bg-black/40 border border-white/5 font-mono text-[10px] md:text-[12px] leading-relaxed text-slate-400">
              <div className="text-amber-500 font-black uppercase mb-3 md:mb-4 tracking-widest flex items-center gap-2"><Eye size={12} /> Manifest Data Shard</div>
              {loading ? <span className="animate-pulse">Interpreting digital reality...</span> : dossier}
           </div>
           <div className="bg-white/[0.01] rounded-[20px] md:rounded-[30px] p-4 md:p-6 border border-white/5 flex flex-col gap-4 min-h-[200px] md:min-h-[300px]">
              <div className="flex-1 space-y-3 md:space-y-4">
                 {chat.map((m, i) => (
                   <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <span className="text-[7px] md:text-[8px] uppercase opacity-30 mb-1 font-black">{m.role === 'user' ? 'Anh Nat' : item.title}</span>
                      <div className={`px-3 md:px-4 py-2 md:py-3 rounded-[16px] md:rounded-[20px] max-w-[90%] text-[11px] md:text-[13px] ${m.role === 'user' ? 'bg-amber-500/10 text-amber-200 border border-amber-500/20' : 'bg-white/5 text-slate-300'}`}>{m.text}</div>
                   </div>
                 ))}
              </div>
              <form onSubmit={handleChat} className="relative">
                 <input value={input} onChange={e => setInput(e.target.value)} placeholder="INJECT SPATIAL DIRECTIVE..." className="w-full bg-white/[0.03] border border-white/10 rounded-full py-3 md:py-4 px-4 md:px-6 text-[11px] md:text-[12px] focus:outline-none focus:border-amber-500/40 transition-all" />
                 <button className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-amber-500 rounded-full text-black hover:scale-110 transition-all"><Send size={16} /></button>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
};

const GlobalCommand = ({ isOpen, onClose }) => {
  const [cmd, setCmd] = useState("");
  const [res, setRes] = useState("");
  const [busy, setBusy] = useState(false);

  const exec = async (e) => {
    e.preventDefault(); if(!cmd.trim() || busy) return;
    setBusy(true); setRes("");
    const result = await callGemini(cmd, "NATT-OS Central Brain Protocol.");
    setRes(result); setBusy(false);
  };

  if(!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/95 backdrop-blur-[100px] animate-in zoom-in-110">
      <div className="w-full max-w-2xl space-y-6 md:space-y-8">
         <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-[30px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-[0_0_40px_rgba(251,191,36,0.3)]">
               <Command size={36} className={busy ? "animate-spin" : ""} />
            </div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-[0.3em] drop-shadow-glow text-white">Neural Hub</h2>
            <p className="text-slate-600 text-[8px] md:text-[9px] font-mono tracking-[0.3em] uppercase">SYSTEM DISPATCHER // AUTH: ANH NAT</p>
         </div>
         <form onSubmit={exec} className="relative">
            <input autoFocus value={cmd} onChange={e => setCmd(e.target.value)} placeholder="TYPE ULTIMATE DIRECTIVE..." className="w-full bg-white/[0.02] border-b-2 border-white/10 py-6 md:py-8 text-xl md:text-2xl font-black text-center text-white focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-800 uppercase tracking-tighter" />
         </form>
         {res && (
           <div className="p-6 md:p-8 hud-glass rounded-[30px] md:rounded-[40px] border-amber-500/20 animate-in fade-in slide-in-from-bottom-5">
              <div className="text-[12px] md:text-[14px] font-mono leading-loose text-slate-300 whitespace-pre-wrap">{res}</div>
              <button onClick={() => setRes("")} className="mt-4 md:mt-6 text-[8px] md:text-[9px] font-black text-white/20 hover:text-white uppercase tracking-widest">Reset Core Buffer</button>
           </div>
         )}
         <div className="flex justify-center pt-4">
            <button onClick={onClose} className="p-3 md:p-4 bg-white/5 rounded-full text-slate-600 hover:text-white transition-all"><X size={24} /></button>
         </div>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
EOF

echo ""
echo "  ✅ DEPLOY HOÀN TẤT – NHẬP LỆNH:"
echo "  ──────────────────────────────────"
echo "  cd natt-os-v5 && npm install && npm run dev"
echo ""