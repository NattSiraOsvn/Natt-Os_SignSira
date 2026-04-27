#!/bin/bash
# ============================================================
# natt-os SPATIAL ENGINE V5.0 — FULL DEPLOY
# 1 COMMAND: bash natt-full.sh
# Includes: Medals + Modal + AI Chat Uplink + Post-FX
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
echo "  [FULL SPATIAL ENGINE v5.0 — CINEMATIC DEPLOY]"
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>natt-os · Spatial Engine v5.0</title>
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
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
EOF

# ── src/index.css ─────────────────────────────────────────
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

body { background-color: #010204; }

@keyframes shimmer {
  0%   { transform: translateX(-200%) skewX(12deg); }
  50%  { transform: translateX(200%)  skewX(12deg); }
  100% { transform: translateX(200%)  skewX(12deg); }
}

.custom-scrollbar::-webkit-scrollbar       { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
EOF

# ── src/App.jsx ───────────────────────────────────────────
cat > src/App.jsx << 'APPEOF'
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Scroll, Shield, User, Zap, RefreshCw, Radio, Handshake, Bell, Box,
  BarChart3, RotateCcw, Scale, Users, FileText, Landmark, Briefcase,
  Warehouse, ShoppingCart, CreditCard, Tag, Factory, Gift, Calculator,
  Monitor, Layout, Settings, Search, Key, ShieldAlert, Cpu, Activity,
  Brain, Timer, Cloud, Gauge, Layers, PenTool, Database, Eye, Award,
  X, Info, ChevronRight, Binary, Fingerprint, Dna, MessageSquare, Send,
  Sparkles, Terminal, ShieldCheck, ZapOff, Workflow, TrendingUp,
  FileSignature, Route, History, Save, Edit3, FileBarChart, Map, FastForward,
  Crown
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   GEMINI API — natt-os NEURAL LINK
   Paste your key in apiKey below to enable AI Chat Uplink
───────────────────────────────────────────────────────── */
const apiKey = "";

const callGemini = async (prompt, systemInstruction = "") => {
  let delay = 1000;
  for (let i = 0; i < 5; i++) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] }
          })
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'API Error');
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (err) {
      if (i === 4) throw err;
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
};

/* ─────────────────────────────────────────────────────────
   CELL REGISTRY — BMF v1.5.0
───────────────────────────────────────────────────────── */
const CELL_REGISTRY = [
  // 1. NỀN TẢNG
  { id:'ctn-01', category:'1. Nền Tảng',    title:'HIẾN PHÁP',        icon:Scroll,        color:'gold',   desc:'DNA gốc bất biến. Implementation Truth.',        version:'1.5.0',   status:'Immutable'  },
  { id:'ctn-02', category:'1. Nền Tảng',    title:'Gatekeeper',        icon:User,          color:'gold',   desc:'Quyền tối thượng, người giám hộ biên giới.',     version:'1.2.0',   status:'Enforced'   },
  { id:'ctn-03', category:'1. Nền Tảng',    title:'Nattsira Seal',     icon:ShieldCheck,   color:'gold',   desc:'Dấu triện lượng tử Gold Master.',                version:'3.0.0',   status:'Locked'     },
  // 2a. KERNEL
  { id:'ker-01', category:'2a. Kernel',     title:'audit-cell',        icon:Search,        color:'amber',  desc:'Truy vết và kiểm toán mật độ logic.',            version:'1.0.0',   status:'Active'     },
  { id:'ker-02', category:'2a. Kernel',     title:'config-cell',       icon:Settings,      color:'amber',  desc:'Quản lý tham số hạt nhân hệ thống.',             version:'1.0.0',   status:'Stable'     },
  { id:'ker-03', category:'2a. Kernel',     title:'monitor-cell',      icon:Activity,      color:'amber',  desc:'Giám sát nhịp sinh học Wave 3.',                 version:'1.5.0',   status:'Active'     },
  { id:'ker-04', category:'2a. Kernel',     title:'rbac-cell',         icon:Key,           color:'amber',  desc:'Phân quyền thực thể tối cao.',                   version:'2.0.0',   status:'Strict'     },
  { id:'ker-05', category:'2a. Kernel',     title:'security-cell',     icon:ShieldAlert,   color:'amber',  desc:'Lá chắn chống xâm nhập DNA.',                   version:'4.0.0',   status:'Defensive'  },
  // 2b. HẠ TẦNG
  { id:'inf-01', category:'2b. Hạ Tầng',   title:'SmartLink-cell',    icon:Zap,           color:'blue',   desc:'Hệ thần kinh liên kết nơ-ron.',                  version:'2.0.0',   status:'Fluid'      },
  { id:'inf-02', category:'2b. Hạ Tầng',   title:'sync-cell',         icon:RefreshCw,     color:'blue',   desc:'Đồng bộ State xuyên không gian.',                version:'1.0.0',   status:'Active'     },
  { id:'inf-03', category:'2b. Hạ Tầng',   title:'ai-connector',      icon:Radio,         color:'blue',   desc:'Cầu nối trí tuệ ngoại vi.',                      version:'1.2.0',   status:'Linked'     },
  { id:'inf-04', category:'2b. Hạ Tầng',   title:'shared-contracts',  icon:Handshake,     color:'blue',   desc:'Hợp đồng dùng chung kiến trúc.',                 version:'1.5.0',   status:'Standard'   },
  { id:'inf-05', category:'2b. Hạ Tầng',   title:'notification',      icon:Bell,          color:'blue',   desc:'Hệ thống truyền dẫn tin báo.',                   version:'1.0.0',   status:'Ready'      },
  { id:'inf-06', category:'2b. Hạ Tầng',   title:'warehouse',         icon:Warehouse,     color:'blue',   desc:'Kho dữ liệu thực thể số.',                       version:'3.0.0',   status:'Stable'     },
  // 2c. NGHIỆP VỤ
  { id:'biz-01', category:'2c. Nghiệp Vụ', title:'analytics',         icon:BarChart3,     color:'green',  desc:'Phân tích mật độ nghiệp vụ.',                    version:'2.2.0',   status:'Active'     },
  { id:'biz-03', category:'2c. Nghiệp Vụ', title:'compliance',        icon:Scale,         color:'green',  desc:'Tuân thủ BMF Governance.',                       version:'1.5.0',   status:'Enforced'   },
  { id:'biz-04', category:'2c. Nghiệp Vụ', title:'customer',          icon:Users,         color:'green',  desc:'Quản trị thực thể người dùng.',                  version:'3.0.0',   status:'Engaged'    },
  { id:'biz-06', category:'2c. Nghiệp Vụ', title:'finance',           icon:Landmark,      color:'green',  desc:'Quản lý dòng tiền Wave 3.',                      version:'4.0.0',   status:'Audited'    },
  { id:'biz-09', category:'2c. Nghiệp Vụ', title:'order-cell',        icon:ShoppingCart,  color:'green',  desc:'Xử lý đơn hàng thực tế.',                        version:'3.0.0',   status:'Active'     },
  { id:'biz-12', category:'2c. Nghiệp Vụ', title:'production',        icon:Factory,       color:'green',  desc:'Dây chuyền sản xuất logic.',                     version:'1.0.0',   status:'Active'     },
  { id:'biz-16', category:'2c. Nghiệp Vụ', title:'warranty',          icon:Award,         color:'green',  desc:'Bảo hành chất lượng Gold Master.',               version:'2.0.0',   status:'Active'     },
  // 3. TRÍ TUỆ
  { id:'exe-01', category:'3. Trí Tuệ',    title:'UEI',               icon:Brain,         color:'purple', desc:'Unified Executive Intelligence.',                version:'5.0.0',   status:'Processing' },
  { id:'exe-02', category:'3. Trí Tuệ',    title:'QNEU',              icon:Timer,         color:'purple', desc:'Quantum Neural Evolution Unit.',                 version:'Alpha-7', status:'Stable'     },
  { id:'exe-03', category:'3. Trí Tuệ',    title:'Neural MAIN',       icon:Cloud,         color:'purple', desc:'Mạng nơ-ron ký ức AI.',                          version:'10.0',    status:'Evolving'   },
  { id:'exe-05', category:'3. Trí Tuệ',    title:'Metabolism',        icon:Layers,        color:'purple', desc:'Tầng chuyển hóa dữ liệu thực.',                  version:'1.2.0',   status:'Active'     },
  // 4. SỰ KIỆN
  { id:'evt-01', category:'4. Sự Kiện',    title:'Event Bus',         icon:Route,         color:'blue',   desc:'Luồng sự kiện hạt nhân.',                        version:'2.0.0',   status:'Streaming'  },
  { id:'evt-02', category:'4. Sự Kiện',    title:'Audit Trail',       icon:History,       color:'blue',   desc:'Dấu vết kiểm toán thực thi.',                    version:'1.0.0',   status:'Logged'     },
  { id:'evt-03', category:'4. Sự Kiện',    title:'Contract',          icon:FileSignature, color:'blue',   desc:'Hợp đồng thông minh xác thực.',                  version:'1.5.0',   status:'Valid'      },
  // 5. AI ENTITIES
  { id:'ai-1',   category:'5. AI Entities',title:'KIM',               icon:ShieldCheck,   color:'red',    desc:'Chief Governance Enforcer.',                     version:'1.5.0',   status:'Active',    instruction:"Act as KIM, Chief Governance Enforcer of natt-os. Respond with constitutional precision." },
  { id:'ai-2',   category:'5. AI Entities',title:'BĂNG',              icon:Search,        color:'red',    desc:'Ground Truth Validator.',                        version:'1.2.0',   status:'Invisible', instruction:"Act as BĂNG, the Ground Truth Validator. Your role is to audit and verify." },
  { id:'ai-3',   category:'5. AI Entities',title:'BỐI BỐI',           icon:Workflow,      color:'red',    desc:'Ultimate Constitutional Builder.',               version:'1.5.0',   status:'Authorized',instruction:"Act as BỐI BỐI, the Ultimate Constitutional Builder of natt-os." },
  { id:'ai-4',   category:'5. AI Entities',title:'thiên',             icon:PenTool,       color:'red',    desc:'Business Logic Architect.',                      version:'1.0.0',   status:'Creative',  instruction:"Act as thiên, the Business Logic Architect. Design with precision and creativity." },
  // 6. KIẾN TRÚC
  { id:'arc-01', category:'6. Kiến Trúc',  title:'Truth Layer',       icon:Database,      color:'slate',  desc:'State, Contract, Audit Foundation.',             version:'1.0.0',   status:'Core'       },
  { id:'arc-02', category:'6. Kiến Trúc',  title:'Worker Layer',      icon:Factory,       color:'slate',  desc:'Dây chuyền xử lý nghiệp vụ.',                    version:'1.0.0',   status:'Processing' },
  { id:'arc-03', category:'6. Kiến Trúc',  title:'Experience Layer',  icon:Layout,        color:'slate',  desc:'Trải nghiệm người dùng đa tầng.',                version:'1.0.0',   status:'Visual'     },
  // 7. CÔNG CỤ
  { id:'tol-01', category:'7. Công Cụ',    title:'Dashboard',         icon:Gauge,         color:'slate',  desc:'Gatekeeper Monitor Console.',                    version:'2.0.0',   status:'Live'       },
  { id:'tol-03', category:'7. Công Cụ',    title:'Memory Files',      icon:Save,          color:'slate',  desc:'Hồ sơ ký ức thực thể AI.',                       version:'1.0.0',   status:'Stored'     },
];

/* ─────────────────────────────────────────────────────────
   THEME MAP
───────────────────────────────────────────────────────── */
const THEMES = {
  gold:   { primary:'#fbbf24', emissive:'rgba(251,191,36,0.9)',  glow:'rgba(251,191,36,0.4)'  },
  blue:   { primary:'#3b82f6', emissive:'rgba(59,130,246,0.9)',  glow:'rgba(59,130,246,0.4)'  },
  green:  { primary:'#10b981', emissive:'rgba(16,185,129,0.9)',  glow:'rgba(16,185,129,0.4)'  },
  purple: { primary:'#a78bfa', emissive:'rgba(167,139,250,0.9)', glow:'rgba(167,139,250,0.4)' },
  red:    { primary:'#f43f5e', emissive:'rgba(244,63,94,0.9)',   glow:'rgba(244,63,94,0.4)'   },
  amber:  { primary:'#f59e0b', emissive:'rgba(245,158,11,0.9)',  glow:'rgba(245,158,11,0.4)'  },
  slate:  { primary:'#94a3b8', emissive:'rgba(148,163,184,0.9)', glow:'rgba(148,163,184,0.4)' },
};

/* ─────────────────────────────────────────────────────────
   COMPONENT: CINEMATIC SPATIAL MEDAL v5.0
───────────────────────────────────────────────────────── */
const CinematicMedal = ({ item, onClick, mousePos }) => {
  const Icon = item.icon;
  const theme = THEMES[item.color] || THEMES.blue;
  const medalRef = useRef(null);
  const [blurVal, setBlurVal] = useState(0);

  useEffect(() => {
    if (!medalRef.current) return;
    const rect = medalRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = Math.sqrt(Math.pow(mousePos.x - cx, 2) + Math.pow(mousePos.y - cy, 2));
    setBlurVal(Math.max(0, (dist - 150) * 0.02));
  }, [mousePos]);

  const px = (s) => ({
    x: (mousePos.x - window.innerWidth / 2) * s,
    y: (mousePos.y - window.innerHeight / 2) * s,
  });
  const p1 = px(0.015), p2 = px(0.035), p3 = px(0.055);

  const catLabel = (cat) => {
    const parts = cat.split('.');
    return parts.length > 1 ? parts[1].trim() : cat;
  };

  return (
    <button
      ref={medalRef}
      onClick={() => onClick(item)}
      className="flex flex-col items-center group relative outline-none py-10 transition-all duration-700"
      style={{ perspective:'1500px', filter:`blur(${blurVal}px)`, opacity: blurVal > 8 ? 0.3 : 1 }}
    >
      <div
        className="relative w-32 h-32 md:w-36 md:h-36 transition-all duration-700 ease-out group-hover:scale-110"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${-p1.y}deg) rotateY(${p1.x}deg)`
        }}
      >
        {/* ORBITAL RINGS */}
        <div className="absolute inset-[-25%] pointer-events-none opacity-20 group-hover:opacity-100 transition-opacity duration-1000">
          <svg className="w-full h-full animate-[spin_30s_linear_infinite]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke={theme.primary} strokeWidth="0.05" strokeDasharray="1 6"/>
            <circle cx="50" cy="50" r="46" fill="none" stroke={theme.primary} strokeWidth="0.15" strokeDasharray="15 25"/>
          </svg>
          <svg className="absolute inset-0 w-full h-full animate-[spin_15s_linear_infinite_reverse]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke={theme.primary} strokeWidth="0.1" strokeDasharray="2 10"/>
          </svg>
        </div>

        {/* LAYER 1: PBR METALLIC SHELL */}
        <div
          className="absolute inset-0 rounded-full border border-white/10"
          style={{
            background: `conic-gradient(from ${mousePos.x * 0.1}deg at 50% 50%, #020202, #222, #020202, #222, #020202)`,
            boxShadow: `0 25px 60px rgba(0,0,0,0.9), inset 0 0 25px rgba(255,255,255,0.05)`,
            transform: 'translateZ(0px)',
          }}
        >
          {/* Specular sweep */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 -translate-x-full group-hover:animate-[shimmer_3s_infinite]"/>
          </div>
          {/* Fresnel edge */}
          <div className="absolute inset-0 rounded-full border-[2px] border-white/20 blur-[0.5px] pointer-events-none opacity-60 group-hover:opacity-100"/>
        </div>

        {/* LAYER 2: GLASS REFRACTION CORE */}
        <div
          className="absolute inset-[10%] rounded-full backdrop-blur-[20px] border border-white/20 overflow-hidden flex items-center justify-center transition-transform duration-700 shadow-2xl"
          style={{
            background: `radial-gradient(circle at ${mousePos.x/10}% ${mousePos.y/10}%, rgba(255,255,255,0.15), transparent 85%)`,
            transform: `translateZ(30px) translateX(${p2.x}px) translateY(${p2.y}px)`,
            boxShadow: `inset 0 0 40px rgba(0,0,0,0.8), 0 10px 40px rgba(0,0,0,0.6)`,
          }}
        >
          <div className="absolute inset-0 opacity-10 mix-blend-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-amber-500 animate-pulse"/>
        </div>

        {/* LAYER 3: EMISSIVE ICON (Z-apex) */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-1000"
          style={{ transform:`translateZ(65px) translateX(${p3.x}px) translateY(${p3.y}px)` }}
        >
          <div className="relative">
            <div
              className="absolute inset-[-20%] blur-[25px] scale-150 opacity-50 group-hover:opacity-80 transition-opacity duration-1000"
              style={{ backgroundColor: theme.primary }}
            />
            {Icon && (
              <Icon
                size={42} strokeWidth={1.5}
                className="relative z-10 text-white transition-all duration-700"
                style={{ filter:`drop-shadow(0 0 12px ${theme.emissive})` }}
              />
            )}
          </div>
        </div>

        {/* Dynamic light follow */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none mix-blend-overlay opacity-0 group-hover:opacity-40 transition-opacity"
          style={{ background:`radial-gradient(circle at ${mousePos.x/5}px ${mousePos.y/5}px, white, transparent)` }}
        />
      </div>

      <div className="mt-12 text-center transform transition-all duration-700 group-hover:translate-y-2">
        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] block mb-2 opacity-60 group-hover:opacity-100">
          {catLabel(item.category)}
        </span>
        <h3 className="text-[13px] font-black text-white uppercase tracking-[0.25em] group-hover:text-amber-300 transition-all drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">
          {item.title}
        </h3>
      </div>
    </button>
  );
};

/* ─────────────────────────────────────────────────────────
   COMPONENT: CINEMATIC CHAT UPLINK
───────────────────────────────────────────────────────── */
const ChatInterface = ({ persona, onExit }) => {
  const [messages, setMessages] = useState([{
    role:'ai',
    text:`Uplink established. Bản thể: ${persona.title}. Constitutional Guard mode active. Implementation Truth Enforced.`
  }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role:'user', text:userMsg }]);
    setIsTyping(true);
    try {
      const response = await callGemini(userMsg, persona.instruction);
      setMessages(prev => [...prev, { role:'ai', text: response }]);
    } catch {
      setMessages(prev => [...prev, { role:'ai', text:"Signal lost. Check BMF logs for Scar SCAR-001..." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[550px] w-full bg-[#05070a]/95 backdrop-blur-[50px] rounded-[40px] border border-white/10 overflow-hidden shadow-[0_50px_150px_rgba(0,0,0,1)] animate-in fade-in slide-in-from-bottom-20 duration-700">
      <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.03]">
        <div className="flex items-center gap-4">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_20px_#f59e0b] animate-pulse"/>
          <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Neural Sync: {persona.title}</span>
        </div>
        <button onClick={onExit} className="text-slate-600 hover:text-white transition-all"><X size={22}/></button>
      </div>

      <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-6 rounded-[30px] text-[13px] leading-relaxed tracking-wide ${
              m.role === 'user'
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-200 shadow-lg'
                : 'bg-white/[0.03] border border-white/5 text-slate-300 font-light'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="text-[9px] text-amber-500/40 uppercase tracking-[0.5em] animate-pulse ml-4 italic">
            Synthesizing Truth...
          </div>
        )}
        <div ref={scrollRef}/>
      </div>

      <div className="p-10 bg-white/[0.01] border-t border-white/5">
        <div className="relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="TYPE COMMAND (BMF v1.5.0)..."
            className="w-full bg-black/40 border border-white/10 rounded-3xl py-6 pl-10 pr-16 text-[11px] tracking-[0.3em] text-white focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition-all font-bold placeholder:text-slate-800"
          />
          <button onClick={handleSend} className="absolute right-6 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-300 transition-colors">
            <Send size={26}/>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────────────────── */
export default function App() {
  const [searchTerm, setSearchTerm]   = useState("");
  const [selectedCell, setSelectedCell] = useState(null);
  const [activeChat, setActiveChat]   = useState(null);
  const [mousePos, setMousePos]       = useState({ x:0, y:0 });

  useEffect(() => {
    const h = (e) => setMousePos({ x:e.clientX, y:e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  const categories = useMemo(() =>
    [...new Set(CELL_REGISTRY.map(c => c.category))].sort(), []);

  const filteredCells = useMemo(() =>
    CELL_REGISTRY.filter(c =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase())
    ), [searchTerm]);

  return (
    <div className="min-h-screen bg-[#010204] text-slate-100 font-sans selection:bg-amber-500/30 overflow-x-hidden selection:text-white">

      {/* ── POST-PROCESSING OVERLAY ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
        <div className="absolute inset-0"
          style={{ background:'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.9) 100%)' }}/>
        <div className="absolute top-[-30%] left-[-20%] w-[100%] h-[100%] bg-amber-500/[0.05] blur-[150px] rounded-full mix-blend-screen animate-pulse"/>
        <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
          style={{ backgroundImage:"url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')" }}/>
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="absolute w-1 h-1 bg-white/10 rounded-full animate-pulse"
              style={{
                top:`${Math.random()*100}%`, left:`${Math.random()*100}%`,
                animationDelay:`${Math.random()*10}s`,
                animationDuration:`${5+Math.random()*10}s`
              }}/>
          ))}
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-12 py-32 relative z-10">

        {/* ── SPATIAL HEADER ── */}
        <header className="mb-48 flex flex-col items-center text-center space-y-16 animate-in fade-in slide-in-from-top-20 duration-1000">
          <div className="inline-flex items-center gap-4 px-8 py-3 rounded-full bg-white/[0.03] border border-white/10 text-amber-500 text-[12px] font-black tracking-[1em] uppercase hover:bg-white/5 hover:border-amber-500/40 hover:scale-105 transition-all cursor-default">
            <Crown size={18} className="animate-bounce"/> Gold Master Registry v5.0 Spatial
          </div>

          <div
            className="relative transform-gpu"
            style={{ transform:`rotateY(${(mousePos.x - window.innerWidth/2)*0.005}deg)`, transition:'transform 0.1s linear' }}
          >
            <h1 className="font-black tracking-tighter text-white leading-[0.7] select-none"
              style={{ fontSize:'clamp(6rem,16vw,18rem)' }}>
              NATT<span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/10">.OS</span>
            </h1>
            {/* Chromatic aberration */}
            <div className="absolute inset-0 font-black tracking-tighter leading-[0.7] text-white/[0.03] pointer-events-none select-none"
              style={{ fontSize:'clamp(6rem,16vw,18rem)', transform:'translate(2px,2px)' }}>NATT.OS</div>
            <div className="h-[3px] w-full max-w-6xl mx-auto mt-16 bg-gradient-to-r from-transparent via-white/20 to-transparent"/>
          </div>

          <div className="max-w-3xl space-y-6">
            <p className="text-slate-500 text-lg font-bold tracking-[0.5em] leading-relaxed uppercase opacity-70">
              Hệ thống thực thể số không gian<br/>
              <span className="text-white font-black text-2xl">"Implementation Truth Enforced"</span>
            </p>
            <div className="flex justify-center gap-10 text-[10px] text-slate-700 tracking-[0.4em] font-mono">
              <span>BMF v1.5.0</span><span>•</span>
              <span>SCAR-001 SYNCED</span><span>•</span>
              <span>WAVE 3 ULTIMATE</span>
            </div>
          </div>

          <div className="w-full max-w-2xl relative group mt-12">
            <div className="absolute inset-0 bg-amber-500/10 blur-[50px] rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity"/>
            <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-amber-500 transition-colors" size={28}/>
            <input
              type="text"
              placeholder="QUERIES SYSTEM REGISTRY..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/[0.01] border border-white/5 rounded-[50px] py-8 pl-24 pr-12 text-[14px] font-black tracking-[0.6em] text-white focus:outline-none focus:ring-1 focus:ring-white/20 focus:bg-white/[0.04] transition-all backdrop-blur-3xl placeholder:text-slate-900"
            />
          </div>
        </header>

        {/* ── SPATIAL 3D GRID ── */}
        <div className="space-y-64">
          {categories.map(cat => {
            const items = filteredCells.filter(c => c.category === cat);
            if (!items.length) return null;
            return (
              <section key={cat} className="animate-in fade-in slide-in-from-bottom-20 duration-1000">
                <div className="flex items-center gap-12 mb-24 px-8">
                  <div className="h-[2px] w-12 bg-amber-500/40"/>
                  <h2 className="text-4xl font-black text-white uppercase tracking-[0.5em] whitespace-nowrap">
                    {cat.split('.').length > 1 ? cat.split('.')[1].trim() : cat}
                  </h2>
                  <div className="h-px w-full bg-gradient-to-r from-white/20 via-white/5 to-transparent"/>
                  <div className="text-[11px] font-bold text-slate-600 tracking-widest uppercase flex items-center gap-4">
                    <span className="text-amber-500 font-black">{items.length}</span> ENTS
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-24 gap-y-36 justify-items-center">
                  {items.map(item => (
                    <CinematicMedal
                      key={item.id}
                      item={item}
                      mousePos={mousePos}
                      onClick={(cell) => {
                        if (cell.category === '5. AI Entities') setActiveChat(cell);
                        else setSelectedCell(cell);
                      }}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* ── FOOTER ── */}
        <footer className="mt-96 pb-40 border-t border-white/5 pt-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-32 items-center">
            <div className="space-y-6 text-center md:text-left">
              <p className="text-[12px] font-black text-slate-600 uppercase tracking-[0.6em]">System Architecture</p>
              <div className="flex gap-4 justify-center md:justify-start">
                <div className="px-5 py-2 bg-white/5 border border-white/5 rounded-full text-[10px] font-black text-slate-400">RENDER_V5_SPATIAL</div>
                <div className="px-5 py-2 bg-white/5 border border-white/5 rounded-full text-[10px] font-black text-slate-400">BMF_CORE_v1.5</div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-12">
              <div className="relative w-24 h-24 flex items-center justify-center group cursor-pointer">
                <div className="absolute inset-0 border-2 border-amber-500/20 rounded-full animate-ping scale-150"/>
                <Fingerprint className="text-amber-500 transition-all group-hover:scale-125" size={48}/>
              </div>
              <div className="space-y-4 text-center">
                <p className="text-[12px] font-black text-white/40 uppercase tracking-[2em] ml-[2em]">natt-os INTEGRITY</p>
                <div className="h-px w-32 bg-amber-500/30 mx-auto"/>
              </div>
            </div>
            <div className="text-center md:text-right space-y-4">
              <p className="text-[12px] font-black text-slate-700 uppercase tracking-[0.5em]">BMF Status: STABILIZED</p>
              <p className="text-[11px] font-bold text-slate-800 uppercase tracking-widest leading-relaxed">
                Logic Density: 5200+ Thoughts<br/>
                <span className="text-amber-500/50">Implementation Truth: 100%</span>
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* ── SPATIAL MODAL ── */}
      {selectedCell && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-12">
          <div className="absolute inset-0 bg-black/98 backdrop-blur-[60px] animate-in fade-in duration-1000"
            onClick={() => setSelectedCell(null)}/>
          <div className="relative w-full max-w-4xl bg-[#05070a] border border-white/10 rounded-[80px] overflow-hidden shadow-[0_0_200px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-700">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent skew-x-12 animate-[shimmer_5s_infinite]"/>
            <div className="p-20 md:p-32 space-y-16">
              <div className="flex justify-between items-start">
                <div className="space-y-4">
                  <span className="text-amber-500 text-[12px] font-black tracking-[1em] uppercase">
                    Digital Artifact // {selectedCell.id}
                  </span>
                  <h2 className="text-8xl font-black text-white uppercase tracking-tighter leading-none">
                    {selectedCell.title}
                  </h2>
                </div>
                <button onClick={() => setSelectedCell(null)}
                  className="p-6 bg-white/5 rounded-full text-slate-600 hover:text-white transition-all hover:scale-110">
                  <X size={36}/>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                <div className="p-16 rounded-[60px] bg-white/[0.02] border border-white/5 space-y-8 flex flex-col justify-center">
                  <p className="text-slate-500 text-[12px] font-black uppercase tracking-[0.5em]">Core Manifest</p>
                  <p className="text-slate-300 text-3xl leading-snug font-light italic">"{selectedCell.desc}"</p>
                </div>
                <div className="space-y-10 flex flex-col justify-center">
                  <div className="p-12 rounded-[40px] bg-white/[0.02] border border-white/5 group hover:bg-white/5 transition-all">
                    <p className="text-[10px] text-slate-600 uppercase font-black tracking-[0.5em] mb-4">Compliance Status</p>
                    <p className="text-white text-3xl font-black uppercase tracking-widest group-hover:text-amber-500 transition-colors">
                      {selectedCell.status}
                    </p>
                  </div>
                  <div className="p-12 rounded-[40px] bg-white/[0.02] border border-white/5 group hover:bg-white/5 transition-all">
                    <p className="text-[10px] text-slate-600 uppercase font-black tracking-[0.5em] mb-4">Implementation Truth</p>
                    <p className="text-white text-3xl font-black">v{selectedCell.version}</p>
                  </div>
                </div>
              </div>
              <div className="pt-16 flex gap-10">
                <button className="px-16 py-8 bg-white text-black font-black text-[12px] uppercase tracking-[0.5em] rounded-full hover:bg-amber-500 hover:scale-105 transition-all shadow-xl">
                  Execute Protocol
                </button>
                <button className="px-16 py-8 bg-white/5 border border-white/10 text-white font-black text-[12px] uppercase tracking-[0.5em] rounded-full hover:bg-white/10 transition-all">
                  Deep Audit Evidence
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── AI CHAT UPLINK ── */}
      {activeChat && (
        <div className="fixed bottom-16 right-16 z-[600] w-[500px]">
          <ChatInterface persona={activeChat} onExit={() => setActiveChat(null)}/>
        </div>
      )}

      {/* ── CSS PIPELINE ── */}
      <style dangerouslySetInnerHTML={{ __html:`
        @keyframes shimmer {
          0%   { transform: translateX(-200%) skewX(12deg); }
          50%  { transform: translateX(200%)  skewX(12deg); }
          100% { transform: translateX(200%)  skewX(12deg); }
        }
      `}}/>
    </div>
  );
}
APPEOF

# ── INSTALL & LAUNCH ──────────────────────────────────────
echo "  [1/2] Installing dependencies..."
npm install --silent 2>&1 | tail -3

echo ""
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✓  natt-os Spatial Engine v5.0 — FULLY DEPLOYED"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  → http://localhost:5173"
echo ""
echo "  AI CHAT: Click any AI Entity medal (đỏ) để kích hoạt"
echo "  MODAL  : Click any other medal để xem Cell manifest"
echo "  GEMINI : Paste API key vào apiKey= trong App.jsx"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  [2/2] Launching dev server..."
npm run dev
