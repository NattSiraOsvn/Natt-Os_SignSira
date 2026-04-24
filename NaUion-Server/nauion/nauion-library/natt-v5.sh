import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  ChevronRight, ChevronLeft, AlertTriangle, Globe, RadioTower, Zap as ZapIcon, Target,
  Pin, Maximize2, Monitor
} from 'lucide-react';

/**
 * natt-os NaUion Vision Engine v5.2.8 [MULTI-TASKING NEURAL HUD]
 * Architecture: Floating Workspace, Pinned Shards, Intelligent Carousel
 * Feature: Multitasking support with parallel module monitoring
 */

const apiKey = "";

// ── DESIGN TOKENS ──────────────────────────────────────────
const TOKENS = {
  colors: {
    bg: '#000105',
    glass: 'rgba(10, 20, 45, 0.4)',
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
  { id:'biz-prod', cat:'Business', title:'production', icon:Factory, color:'green', desc:'Dây chuyền logic.' },
  { id:'biz-sale', cat:'Business', title:'sales-cell', icon:TrendingUp, color:'green', desc:'Tăng trưởng Wave 3.' },
  { id:'biz-pay', cat:'Business', title:'payment', icon:Coins, color:'green', desc:'Cổng thanh toán.' },
  { id:'inf-01', cat:'Infra', title:'SmartLink', icon:Zap, color:'blue', desc:'Hệ thần kinh số.' },
  { id:'exe-01', cat:'Intel', title:'UEI Logic', icon:Brain, color:'purple', desc:'Não bộ điều phối.' },
  { id:'ai-3', cat:'AI', title:'BỐI BỐI', icon:Workflow, color:'red', desc:'Constitutional Builder.' },
  { id:'ai-4', cat:'AI', title:'thiên', icon:PenTool, color:'red', desc:'UI/UX Architect.' },
  { id:'biz-stone', cat:'Business', title:'stone-cell', icon:Gem, color:'green' },
  { id:'biz-warehouse', cat:'Business', title:'warehouse', icon:Warehouse, color:'amber' },
];

// ── API UPLINK ──────────────────────────────────────────────
const callGemini = async (prompt, systemInstruction = "") => {
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
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Communication lost.";
  } catch (e) {
    return "Neural link failed.";
  }
};

// ── GLOBAL STYLES ───────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;700;800&display=swap');
    
    body { background-color: #000105; color: white; font-family: 'JetBrains Mono', monospace; margin: 0; overflow: hidden; }
    
    .hud-glass {
      background: rgba(10, 20, 50, 0.25);
      backdrop-filter: blur(30px) saturate(200%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 0 50px rgba(0,0,0,0.6);
    }

    .shimmer-text {
      background: linear-gradient(90deg, #666 0%, #fff 50%, #666 100%);
      background-size: 200% 100%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: shimmer-anim 5s linear infinite;
    }
    @keyframes shimmer-anim { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    
    @keyframes logo-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
    @keyframes scan-glow { 0% { opacity: 0.2; } 50% { opacity: 0.6; } 100% { opacity: 0.2; } }

    .vr-scene {
      perspective: 2000px;
      height: 100vh;
      width: 100vw;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding-top: 8vh;
      overflow: hidden;
    }

    .neural-belt-container {
      position: absolute;
      bottom: 22vh;
      width: 100%;
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 50;
    }

    .custom-scrollbar::-webkit-scrollbar { width: 2px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(251, 191, 36, 0.2); border-radius: 10px; }
  `}</style>
);

// ── VR MULTI-TASKING COMPONENTS ────────────────────────────

const WorkspaceShard = ({ cell, onRemove }) => (
  <div className="hud-glass p-5 rounded-[30px] border-white/5 flex flex-col gap-4 animate-in slide-in-from-left-5 duration-500 w-64 group relative">
    <button onClick={onRemove} className="absolute -top-2 -right-2 p-1.5 bg-red-500/20 border border-red-500/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
      <X size={10} className="text-red-400" />
    </button>
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full flex items-center justify-center"
           style={{ background: TOKENS.colors[cell.color]?.deep, border: `1px solid ${TOKENS.colors[cell.color]?.p}44` }}>
        <cell.icon size={18} style={{ color: TOKENS.colors[cell.color]?.p }} />
      </div>
      <div className="overflow-hidden">
        <h4 className="text-[10px] font-black uppercase truncate tracking-widest">{cell.title}</h4>
        <span className="text-[7px] text-slate-500 font-bold uppercase">{cell.cat} Shard</span>
      </div>
    </div>
    <div className="h-16 bg-black/40 rounded-xl p-3 flex flex-col gap-2">
       <div className="flex justify-between items-center text-[7px] font-mono text-amber-500/60">
          <span>MONITORING...</span>
          <span>99.9%</span>
       </div>
       <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 w-[80%] animate-pulse" />
       </div>
    </div>
  </div>
);

const NaUionMedal = ({ item, isCenter, distance, mousePos, onClick, onPin }) => {
  const Icon = item.icon;
  const theme = TOKENS.colors[item.color] || TOKENS.colors.gold;
  
  const opacity = Math.max(0.05, 1 - Math.abs(distance) * 0.45);
  const scale = isCenter ? 1.4 : 1 - Math.abs(distance) * 0.2;
  const rotateY = distance * -20;
  const zDepth = Math.abs(distance) * -250;

  const angle = Math.atan2(mousePos.y - window.innerHeight / 2, mousePos.x - window.innerWidth / 2) * 180 / Math.PI;

  return (
    <div
      className="absolute flex flex-col items-center transition-all duration-1000 ease-out"
      style={{
        transform: `translateX(${distance * 320}px) translateZ(${zDepth}px) rotateY(${rotateY}deg) scale(${scale})`,
        opacity: opacity,
        zIndex: 100 - Math.abs(distance) * 10
      }}
    >
      <button
        onClick={() => onClick(item)}
        className="relative w-32 h-32 md:w-36 md:h-36 group outline-none"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="absolute inset-[-10%] pointer-events-none opacity-20 group-hover:opacity-100 transition-opacity">
          <svg className="w-full h-full animate-[spin_40s_linear_infinite]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke={theme.p} strokeWidth="0.1" strokeDasharray="1 10" />
          </svg>
        </div>

        <div className="absolute inset-0 rounded-full border border-white/10"
             style={{ background: `conic-gradient(from ${angle}deg, #050505, #1a1a1a, #050505)`, boxShadow: `0 15px 35px rgba(0,0,0,0.7)` }} />

        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute inset-[8%] hud-glass"
               style={{
                 borderRadius: '50%',
                 transform: `rotate(${i * 60}deg) translateZ(${i * 2}px)`,
                 border: '1px solid rgba(255,255,255,0.1)',
                 opacity: 0.5
               }} />
        ))}

        <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `translateZ(25px)` }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
               style={{
                 background: `radial-gradient(circle at 30% 30%, ${theme.em}, ${theme.deep})`,
                 boxShadow: isCenter ? `0 0 40px ${theme.glow}` : 'none'
               }}>
            {Icon && <Icon size={20} className="text-black/90" strokeWidth={3} />}
          </div>
        </div>

        {isCenter && (
          <button
            onClick={(e) => { e.stopPropagation(); onPin(item); }}
            className="absolute -top-4 -right-4 p-3 bg-amber-500 rounded-full text-black hover:scale-110 transition-all shadow-[0_0_20px_rgba(251,191,36,0.4)]"
          >
            <Pin size={14} />
          </button>
        )}
      </button>
      
      {isCenter && (
        <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-2 duration-700">
          <span className="text-[7px] font-black text-amber-500/80 uppercase tracking-[0.6em] mb-1 block">Active Implementation Shard</span>
          <h3 className="text-[14px] font-black uppercase tracking-[0.4em] text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{item.title}</h3>
        </div>
      )}
    </div>
  );
};

// ── MAIN APP ───────────────────────────────────────────────

export default function App() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [activeItem, setActiveItem] = useState(null);
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pinnedShards, setPinnedShards] = useState([]);

  useEffect(() => {
    const h = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  const moveCarousel = (dir) => {
    setCurrentIndex(prev => {
      const next = prev + dir;
      if (next < 0) return CELL_REGISTRY.length - 1;
      if (next >= CELL_REGISTRY.length) return 0;
      return next;
    });
  };

  const togglePin = (cell) => {
    if (pinnedShards.find(s => s.id === cell.id)) return;
    setPinnedShards(prev => [...prev, cell]);
  };

  return (
    <div className="vr-scene">
      <GlobalStyles />

      {/* INFINITE NEBULA ENVIRONMENT */}
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#000105]">
        <div className="absolute inset-0 opacity-[0.6]" style={{ background: 'radial-gradient(circle at center, transparent, #000105 90%)' }} />
        <div className="absolute top-[-20%] left-[-10%] w-[130%] h-[130%] bg-blue-900/[0.04] blur-[180px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[100%] bg-purple-900/[0.03] blur-[220px] mix-blend-screen" />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }} />
      </div>

      {/* ── LOGO HEADER (FIXED & CENTERED) ── */}
      <header className="relative z-[100] flex flex-col items-center mb-10 animate-[logo-float_12s_ease-in-out_infinite]">
        <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-white/[0.03] border border-white/5 text-amber-500 text-[9px] font-black tracking-[1em] uppercase mb-12">
           <Crown size={14} className="animate-pulse" /> NaUion Gold Master 5.2.8
        </div>
        
        <div className="relative group">
           <h1 className="text-[12rem] font-black tracking-tighter text-white leading-none select-none drop-shadow-[0_0_50px_rgba(255,255,255,0.05)]">
             NATT<span className="opacity-40 shimmer-text drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">.OS</span>
           </h1>
           {/* Glow halo behind logo */}
           <div className="absolute inset-[-40px] bg-white/[0.01] blur-[80px] -z-10 rounded-full" />
        </div>

        <div className="flex gap-16 mt-10 text-[7px] font-mono text-slate-700 tracking-[0.8em] uppercase">
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"/> BMF STABLE</span>
          <span>IMPLEMENTATION TRUTH</span>
          <span>VR MULTI-TASKING</span>
        </div>
      </header>

      {/* ── WORKSPACE: PINNED MULTI-TASKING HUD (LEFT SIDE) ── */}
      <div className="fixed left-12 top-[30vh] z-50 flex flex-col gap-6">
        <div className="flex items-center gap-3 mb-4 opacity-40">
           <Monitor size={14} className="text-amber-500" />
           <span className="text-[9px] font-black uppercase tracking-widest">Active Workspace</span>
        </div>
        {pinnedShards.map(shard => (
          <WorkspaceShard
            key={shard.id}
            cell={shard}
            onRemove={() => setPinnedShards(prev => prev.filter(s => s.id !== shard.id))}
          />
        ))}
        {pinnedShards.length === 0 && (
          <div className="text-[8px] font-mono text-slate-800 italic uppercase tracking-widest border border-white/5 p-8 rounded-[30px] border-dashed">
            No shards pinned for parallel monitoring
          </div>
        )}
      </div>

      {/* ── RIGHT SIDE: DATA FLOW HUD ── */}
      <div className="fixed right-12 top-[30vh] z-50 w-72 space-y-6">
        <div className="flex items-center gap-3 mb-4 opacity-40 justify-end">
           <span className="text-[9px] font-black uppercase tracking-widest">System Pulse</span>
           <ActivityIcon size={14} className="text-blue-500" />
        </div>
        <div className="hud-glass p-8 rounded-[40px] space-y-6 border-white/5">
           <div className="space-y-4">
              <div className="flex justify-between items-center text-[8px] font-black text-slate-600">
                 <span>CONFIDENCE</span>
                 <span className="text-amber-500">99.9%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-amber-500 w-[95%]" />
              </div>
           </div>
           <div className="h-40 overflow-hidden relative">
              <div className="absolute bottom-0 w-full space-y-3">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="text-[7px] font-mono text-green-500/40 uppercase leading-relaxed">
                     0x{Math.floor(Math.random()*9999)} SYNC: Cell_Validation_Success
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* ── NEURAL CAROUSEL BELT (SMART SELECTION) ── */}
      <div className="neural-belt-container">
        
        {/* Navigation Overlays */}
        <button onClick={() => moveCarousel(-1)} className="absolute left-[20%] z-[150] p-6 rounded-full bg-white/5 hover:bg-amber-500/10 text-slate-600 hover:text-amber-500 transition-all border border-white/5 group">
           <ChevronLeft size={36} className="group-hover:-translate-x-2 transition-transform" />
        </button>
        <button onClick={() => moveCarousel(1)} className="absolute right-[20%] z-[150] p-6 rounded-full bg-white/5 hover:bg-amber-500/10 text-slate-600 hover:text-amber-500 transition-all border border-white/5 group">
           <ChevronRight size={36} className="group-hover:translate-x-2 transition-transform" />
        </button>

        {/* Carousel Items */}
        <div className="relative w-full flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
           {CELL_REGISTRY.map((cell, i) => (
             <NaUionMedal
               key={cell.id}
               item={cell}
               isCenter={i === currentIndex}
               distance={i - currentIndex}
               mousePos={mouse}
               onClick={() => {
                 if (i === currentIndex) setActiveItem(cell);
                 else setCurrentIndex(i);
               }}
               onPin={togglePin}
             />
           ))}
        </div>
      </div>

      {/* ── NAVIGATION DOCK ── */}
      <div className="fixed bottom-10 z-[200] hud-glass px-16 py-6 rounded-full flex items-center gap-16 border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
         <button onClick={() => setIsCmdOpen(true)} className="flex flex-col items-center gap-2.5 text-slate-500 hover:text-amber-500 transition-all group">
            <Command size={22} className="group-hover:scale-110" />
            <span className="text-[7px] font-black uppercase tracking-widest">Command Hub</span>
         </button>
         <div className="w-px h-8 bg-white/10" />
         <button className="flex flex-col items-center gap-2.5 text-slate-500 hover:text-blue-500 transition-all">
            <LayoutDashboard size={22} />
            <span className="text-[7px] font-black uppercase tracking-widest">Dashboard</span>
         </button>
         <button className="flex flex-col items-center gap-2.5 text-slate-500 hover:text-purple-500 transition-all">
            <Globe size={22} />
            <span className="text-[7px] font-black uppercase tracking-widest">Global Link</span>
         </button>
         <button className="flex flex-col items-center gap-2.5 text-slate-500 hover:text-red-500 transition-all" onClick={() => setActiveItem(CELL_REGISTRY.find(c => c.id === 'ai-3'))}>
            <MessageSquare size={22} />
            <span className="text-[7px] font-black uppercase tracking-widest">Neural Chat</span>
         </button>
      </div>

      {/* MODALS */}
      {activeItem && <NeuralTerminal item={activeItem} onClose={() => setActiveItem(null)} />}
      <GlobalCommand isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} />

    </div>
  );
}

// ── SPATIAL MODAL COMPONENTS ───────────────────────────────

const NeuralTerminal = ({ item, onClose }) => {
  const [dossier, setDossier] = useState("");
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const res = await callGemini(`Shard: ${item.title}. Generate VR diagnostic summary.`, "Observer v5.");
      setDossier(res); setLoading(false);
    };
    fetch();
  }, [item]);

  const handleChat = async (e) => {
    e.preventDefault(); if(!input.trim()) return;
    const msg = input; setInput("");
    setChat(p => [...p, { role:'user', text:msg }]);
    const res = await callGemini(msg, `You are ${item.title} logic.`);
    setChat(p => [...p, { role:'ai', text:res }]);
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-10 bg-black/90 backdrop-blur-3xl animate-in zoom-in-95">
      <div className="w-full max-w-5xl h-[85vh] hud-glass rounded-[60px] flex flex-col overflow-hidden relative border border-white/10">
        <div className="px-12 py-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
           <div className="flex items-center gap-6">
              <Terminal className="text-amber-500" size={24} />
              <h2 className="text-sm font-black uppercase tracking-[0.5em]">{item.title} // VR DIAGNOSTIC</h2>
           </div>
           <button onClick={onClose} className="p-3 bg-white/5 rounded-full hover:rotate-90 transition-all text-slate-500 hover:text-white"><X size={28}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
           <div className="p-10 rounded-[40px] bg-black/40 border border-white/5 font-mono text-[12px] leading-relaxed text-slate-400">
              <div className="text-amber-500 font-black uppercase mb-6 tracking-widest flex items-center gap-3"><Eye size={16}/> Manifest Data Shard</div>
              {loading ? <span className="animate-pulse">Retrieving implementation truth...</span> : dossier}
           </div>
           <div className="bg-white/[0.01] rounded-[40px] p-10 border border-white/5 flex flex-col gap-8 min-h-[400px]">
              <div className="flex-1 space-y-6">
                 {chat.map((m, i) => (
                   <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <span className="text-[9px] uppercase opacity-30 mb-2 font-black">{m.role === 'user' ? 'Anh Nat' : item.title}</span>
                      <div className={`px-6 py-4 rounded-[28px] max-w-[85%] text-[13px] ${m.role === 'user' ? 'bg-amber-500/10 text-amber-200 border border-amber-500/20' : 'bg-white/5 text-slate-300'}`}>{m.text}</div>
                   </div>
                 ))}
              </div>
              <form onSubmit={handleChat} className="relative">
                 <input value={input} onChange={e => setInput(e.target.value)} placeholder="INJECT SPATIAL DIRECTIVE..." className="w-full bg-white/[0.03] border border-white/10 rounded-full py-6 px-10 text-[12px] focus:outline-none" />
                 <button className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-amber-500 rounded-full text-black hover:scale-110 transition-all"><Send size={22}/></button>
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
    const result = await callGemini(cmd, "natt-os Central Brain Protocol.");
    setRes(result); setBusy(false);
  };

  if(!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-12 bg-black/95 backdrop-blur-[100px] animate-in zoom-in-110">
      <div className="w-full max-w-3xl space-y-12">
         <div className="flex flex-col items-center text-center gap-6">
            <div className="w-24 h-24 rounded-[40px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-[0_0_60px_rgba(251,191,36,0.3)]">
               <Command size={56} className={busy ? "animate-spin" : ""} />
            </div>
            <h2 className="text-5xl font-black uppercase tracking-[0.4em] text-white">Neural Hub</h2>
            <p className="text-slate-600 text-[10px] font-mono tracking-[0.4em] uppercase">SYSTEM DISPATCHER // AUTH: ANH NAT</p>
         </div>
         <form onSubmit={exec} className="relative">
            <input autoFocus value={cmd} onChange={e => setCmd(e.target.value)} placeholder="TYPE ULTIMATE DIRECTIVE..." className="w-full bg-white/[0.02] border-b-2 border-white/10 py-10 text-3xl font-black text-center text-white focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-900 uppercase tracking-tighter" />
         </form>
         {res && (
           <div className="p-12 hud-glass rounded-[50px] border-amber-500/20 animate-in fade-in slide-in-from-bottom-5">
              <div className="text-[15px] font-mono leading-loose text-slate-300 whitespace-pre-wrap">{res}</div>
              <button onClick={() => setRes("")} className="mt-10 text-[10px] font-black text-white/20 hover:text-white uppercase tracking-widest">Clear Buffer</button>
           </div>
         )}
         <div className="flex justify-center pt-8">
            <button onClick={onClose} className="p-5 bg-white/5 rounded-full text-slate-600 hover:text-white transition-all"><X size={40}/></button>
         </div>
      </div>
    </div>
  );
};
};
