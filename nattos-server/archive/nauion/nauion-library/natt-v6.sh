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
  RotateCcw, Command, Dna, ZapOff, LayoutDashboard, MessageSquare,
  ChevronRight, ChevronLeft, Globe, Zap as ZapIcon, Monitor, Pin, Maximize2, Share2,
  Phone, MessagesSquare, Volume2, Wifi
} from 'lucide-react';

/**
 * NATT-OS NaUion Vision Engine v5.3.3 [AETHERIAL HUD EDITION]
 * "Hệ thực tế ảo đa nhiệm tích hợp hiệu ứng Khói 3D & Truyền thông"
 * Aesthetics: 3D Smoke Logo, Tactile Docker, Continuous Ticker
 * Features: Call Protocol, Chat Room, Shard Registry
 */

const apiKey = "";

const TOKENS = {
  colors: {
    bg: '#000105',
    glass: 'rgba(10, 25, 50, 0.3)',
    gold: { p:'#F7E7CE', em:'#F0E68C', glow:'rgba(247,231,206,0.3)', deep:'#4a3701' },
    blue: { p:'#E0FFFF', em:'#B0E0E6', glow:'rgba(224,255,224,0.3)', deep:'#1e3a8a' },
    red: { p:'#FFE4E1', em:'#FFB6C1', glow:'rgba(255,228,225,0.3)', deep:'#881337' },
  }
};

const CELL_REGISTRY = [
  { id:'ctn-01', cat:'Core', title:'HIẾN PHÁP', icon:Scroll, color:'gold', desc:'DNA gốc bất biến.' },
  { id:'ctn-02', cat:'Core', title:'Gatekeeper', icon:User, color:'gold', desc:'Quyền tối thượng.' },
  { id:'biz-prod', cat:'Business', title:'production', icon:Factory, color:'green', desc:'Dây chuyền logic.' },
  { id:'biz-sale', cat:'Business', title:'sales-cell', icon:TrendingUp, color:'green', desc:'Tăng trưởng Wave 3.' },
  { id:'inf-01', cat:'Infra', title:'smartlink', icon:Zap, color:'blue', desc:'Hệ thần kinh số.' },
  { id:'exe-01', cat:'Intel', title:'UEI Logic', icon:Brain, color:'purple', desc:'Não bộ điều phối.' },
  { id:'ai-3', cat:'AI', title:'BỐI BỐI', icon:Workflow, color:'red', desc:'Constitutional Builder.' },
  { id:'ai-4', cat:'AI', title:'THIÊN', icon:PenTool, color:'red', desc:'UI/UX Architect.' },
  { id:'biz-stone', cat:'Business', title:'stone-cell', icon:Gem, color:'green' },
];

const callGemini = async (prompt, systemInstruction = "") => {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
      })
    });
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Signal lost.";
  } catch (e) { return "Neural link error."; }
};

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;700;800&display=swap');
    
    body { background-color: #000105; color: #E2E8F0; font-family: 'JetBrains Mono', monospace; margin: 0; overflow: hidden; }
    
    /* 3D Smoke Text Animation */
    .smoke-container {
      position: relative;
      filter: blur(1px) contrast(1.2);
    }
    .smoke-text {
      font-size: 10rem; font-weight: 900; letter-spacing: -0.05em;
      background: linear-gradient(180deg, #fff 0%, #aaa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      position: relative;
      z-index: 2;
    }
    .smoke-layer {
      position: absolute; inset: 0;
      font-size: 10rem; font-weight: 900; letter-spacing: -0.05em;
      filter: blur(25px); opacity: 0.4;
      animation: smoke-spiral 8s infinite ease-in-out;
      pointer-events: none;
    }
    .smoke-1 { color: #fff; animation-delay: 0s; }
    .smoke-2 { color: #3b82f6; animation-delay: 2s; }
    .smoke-3 { color: #fbbf24; animation-delay: 4s; }

    @keyframes smoke-spiral {
      0% { transform: scale(1) rotate(0deg) translate(0, 0); opacity: 0.4; }
      33% { transform: scale(1.2) rotate(120deg) translate(15px, -10px); opacity: 0.2; }
      66% { transform: scale(0.9) rotate(240deg) translate(-15px, 10px); opacity: 0.5; }
      100% { transform: scale(1) rotate(360deg) translate(0, 0); opacity: 0.4; }
    }

    /* Ticker / Pop-up Bar */
    .ticker-bar {
      position: fixed; top: 0; left: 0; width: 100%; height: 32px;
      background: rgba(255, 215, 0, 0.03); border-bottom: 1px solid rgba(255, 215, 0, 0.1);
      display: flex; align-items: center; z-index: 1000; overflow: hidden;
      backdrop-filter: blur(10px);
    }
    .ticker-content {
      white-space: nowrap; animation: ticker-move 30s linear infinite;
      text-transform: uppercase; font-size: 9px; font-weight: 900;
      letter-spacing: 0.5em; color: rgba(251, 191, 36, 0.6);
    }
    @keyframes ticker-move { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }

    /* Tactile Docker */
    .docker-tactile {
      background: rgba(10, 15, 30, 0.6);
      backdrop-filter: blur(30px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 -20px 80px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.1);
      border-radius: 40px;
    }
    .docker-btn {
      position: relative; padding: 16px; border-radius: 20px;
      background: rgba(255,255,255,0.02); border: 1px solid transparent;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      color: #64748b;
    }
    .docker-btn:hover {
      background: rgba(255,255,255,0.05); transform: translateY(-12px) scale(1.2);
      border-color: rgba(255,255,255,0.1); color: #fff;
      box-shadow: 0 15px 30px rgba(0,0,0,0.5);
    }

    .shimmer-bg {
      background: linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(251,191,36,0.05) 100%);
    }

    .custom-scrollbar::-webkit-scrollbar { width: 1px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); }
  `}</style>
);

// ── SUB-COMPONENTS ──────────────────────────────────────────

const TickerBar = () => (
  <div className="ticker-bar">
    <div className="absolute left-6 z-10 bg-amber-500 text-black px-2 py-0.5 text-[7px] font-black tracking-widest rounded-sm">SYSTEM LIVE</div>
    <div className="ticker-content flex gap-20">
      <span>• NATT-OS v5.3.3 GOLD MASTER SYNCED • KCS HOLD STATE ENFORCED • ALL SHARDS INTEGRITY VERIFIED • DNA SYNTHESIS PROTOCOL READY • NEURAL FLOW OPTIMAL • 0 DRIFT DETECTED •</span>
      <span>• BMF v1.5.0 STABLE • IMPLEMENTATION TRUTH: 100% • SCAR REGISTRY AUDIT: CLEAR • WAVE 3 ULTIMATE SEQUENCE INITIATED •</span>
    </div>
  </div>
);

const NaUionMedal = ({ item, isFocus, distance, mousePos, onClick }) => {
  const Icon = item.icon;
  const theme = TOKENS.colors[item.color] || TOKENS.colors.gold;
  const absDist = Math.abs(distance);
  const scale = isFocus ? 1.4 : 0.8 - absDist * 0.15;
  const zDepth = isFocus ? 150 : absDist * -250;
  const xOffset = distance * 360;
  const opacity = isFocus ? 1 : 0.2 / (absDist || 0.5);

  return (
    <div className="absolute flex flex-col items-center transition-all duration-1000 ease-out"
      style={{ transform: `translateX(${xOffset}px) translateZ(${zDepth}px) rotateY(${distance * -20}deg) scale(${scale})`, opacity, zIndex: 100 - absDist }}>
      <button onClick={() => onClick(item)} className="relative w-36 h-36 group outline-none" style={{ transformStyle: 'preserve-3d' }}>
        <div className="absolute inset-0 rounded-full border border-white/5 bg-[#020202] shadow-2xl" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="absolute inset-[10%] rounded-full border border-white/10" style={{ transform: `rotate(${i * 90}deg) translateZ(${i*2}px)`, backdropFilter: 'blur(20px)' }} />
        ))}
        <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `translateZ(30px)` }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center"
               style={{ background: `radial-gradient(circle at 30% 30%, ${theme.em}, ${theme.deep})`, boxShadow: isFocus ? `0 0 40px ${theme.glow}` : 'none' }}>
            {Icon && <Icon size={22} className="text-black/80" strokeWidth={3} />}
          </div>
        </div>
      </button>
      {isFocus && <h3 className="mt-8 text-[11px] font-black uppercase tracking-[0.4em] text-white/80">{item.title}</h3>}
    </div>
  );
};

// ── MAIN APPLICATION ────────────────────────────────────────

export default function App() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [activeItem, setActiveItem] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeComm, setActiveComm] = useState(null); // 'chat' or 'call'

  useEffect(() => {
    const h = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  const move = (dir) => setCurrentIndex(p => (p + dir + CELL_REGISTRY.length) % CELL_REGISTRY.length);

  return (
    <div className="h-screen w-screen relative overflow-hidden flex flex-col items-center pt-20 shimmer-bg">
      <GlobalStyles />
      <TickerBar />

      {/* INFINITE GALAXY */}
      <div className="fixed inset-0 z-[-1] bg-[#000105]">
        <div className="absolute inset-0 opacity-[0.2]" style={{ background: 'radial-gradient(circle at center, transparent, #000 90%)' }} />
        <div className="absolute top-[-20%] left-[-10%] w-[130%] h-[130%] bg-blue-900/[0.04] blur-[200px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[100%] bg-amber-900/[0.03] blur-[220px]" />
      </div>

      {/* ── HEADER: 3D SMOKE SPIRAL LOGO ── */}
      <header className="relative z-50 flex flex-col items-center">
         <div className="smoke-container">
            <div className="smoke-layer smoke-1">NATT.OS</div>
            <div className="smoke-layer smoke-2">NATT.OS</div>
            <div className="smoke-layer smoke-3">NATT.OS</div>
            <h1 className="smoke-text">NATT.OS</h1>
         </div>
         <div className="flex gap-16 text-[7px] font-mono text-slate-800 tracking-[1em] uppercase mt-4">
            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-amber-500 rounded-full animate-pulse" /> Gold Master 5.3.3</span>
            <span>Implementation Truth</span>
         </div>
      </header>

      {/* ── NEURAL CAROUSEL ── */}
      <div className="absolute top-[50vh] w-full flex items-center justify-center" style={{ perspective: '2000px' }}>
         <button onClick={() => move(-1)} className="absolute left-[20%] z-[200] p-6 text-slate-700 hover:text-amber-500 transition-all"><ChevronLeft size={48} /></button>
         <button onClick={() => move(1)} className="absolute right-[20%] z-[200] p-6 text-slate-700 hover:text-amber-500 transition-all"><ChevronRight size={48} /></button>
         
         <div className="relative w-full flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
            {CELL_REGISTRY.map((cell, i) => (
              <NaUionMedal
                key={cell.id} item={cell} isFocus={i === currentIndex}
                distance={i - currentIndex} mousePos={mouse}
                onClick={() => i === currentIndex ? setActiveItem(cell) : setCurrentIndex(i)}
              />
            ))}
         </div>
      </div>

      {/* ── TACTILE DOCKER (BOTTOM) ── */}
      <div className="fixed bottom-10 z-[500] docker-tactile px-12 py-5 flex items-center gap-10">
         <button onClick={() => setActiveComm('chat')} className={`docker-btn ${activeComm === 'chat' ? 'text-blue-400 border-blue-500/20 bg-blue-500/5' : ''}`}>
            <MessagesSquare size={24} />
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[7px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100">Chat Room</span>
         </button>
         <button onClick={() => setActiveComm('call')} className={`docker-btn ${activeComm === 'call' ? 'text-green-400 border-green-500/20 bg-green-500/5' : ''}`}>
            <Phone size={24} />
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[7px] font-black uppercase tracking-widest">Call protocol</span>
         </button>
         
         <div className="w-px h-8 bg-white/10" />
         
         <button className="docker-btn group">
            <LayoutDashboard size={24} />
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[7px] font-black uppercase tracking-widest">Dashboard</span>
         </button>
         <button className="docker-btn">
            <Globe size={24} />
         </button>
         <button className="docker-btn" onClick={() => setActiveItem(CELL_REGISTRY.find(c => c.color === 'gold'))}>
            <Fingerprint size={24} />
         </button>
         
         <div className="w-px h-8 bg-white/10" />

         <div className="flex flex-col gap-1 items-end pl-4">
            <div className="flex gap-2 items-center">
               <Wifi size={10} className="text-green-500" />
               <Volume2 size={10} className="text-slate-600" />
            </div>
            <span className="text-[8px] font-bold text-slate-700 font-mono">02:23:45</span>
         </div>
      </div>

      {/* MODALS */}
      {activeItem && <NeuralTerminal item={activeItem} onClose={() => setActiveItem(null)} />}
      
      {/* COMMUNICATION PANELS */}
      {activeComm === 'chat' && (
        <div className="fixed bottom-32 right-12 z-[600] w-96 h-[500px] hud-glass rounded-[40px] border border-white/10 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
           <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-4 text-blue-400">
                 <MessagesSquare size={18} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Neural Chat Room</span>
              </div>
              <button onClick={() => setActiveComm(null)}><X size={18}/></button>
           </div>
           <div className="flex-1 p-6 overflow-y-auto font-mono text-[10px] text-slate-500 space-y-4 custom-scrollbar">
              <div className="p-4 bg-white/5 rounded-2xl">Bối Bối: Hệ thống đã ổn định. Chào anh Nat.</div>
              <div className="p-4 bg-white/5 rounded-2xl opacity-60">System: Encryption handshake established.</div>
           </div>
           <div className="p-6 border-t border-white/5">
              <input placeholder="Type to dispatch..." className="w-full bg-black/40 border border-white/10 rounded-full py-3 px-6 text-[10px] focus:outline-none" />
           </div>
        </div>
      )}

      {activeComm === 'call' && (
        <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-3xl flex items-center justify-center animate-in zoom-in-110">
           <div className="flex flex-col items-center gap-12">
              <div className="relative w-48 h-48 flex items-center justify-center">
                 <div className="absolute inset-0 border-4 border-green-500/20 rounded-full animate-ping" />
                 <div className="absolute inset-[-20px] border border-green-500/10 rounded-full animate-spin" />
                 <div className="w-32 h-32 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 shadow-[0_0_100px_rgba(34,197,94,0.2)]">
                    <Phone size={64} />
                 </div>
              </div>
              <div className="text-center space-y-2">
                 <h2 className="text-3xl font-black uppercase tracking-[0.5em]">Voice protocol</h2>
                 <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Establishing encrypted neural link...</p>
              </div>
              <button onClick={() => setActiveComm(null)} className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-white hover:scale-110 transition-all shadow-2xl">
                 <X size={32} />
              </button>
           </div>
        </div>
      )}

    </div>
  );
}

const NeuralTerminal = ({ item, onClose }) => {
  const [dossier, setDossier] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const res = await callGemini(`Shard: ${item.title}. VR context summary.`, "Observer.");
      setDossier(res); setLoading(false);
    };
    fetch();
  }, [item]);

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-12 bg-black/95 backdrop-blur-3xl animate-in zoom-in-95">
      <div className="w-full max-w-5xl h-[80vh] docker-tactile rounded-[60px] flex flex-col overflow-hidden relative border border-white/10 shadow-[0_0_200px_rgba(0,0,0,1)]">
        <div className="px-12 py-10 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
           <div className="flex items-center gap-6 text-amber-500"><Terminal size={24} /> <span className="text-sm font-black uppercase tracking-[0.5em]">{item.title} // DIAGNOSTIC</span></div>
           <button onClick={onClose} className="p-3 bg-white/5 rounded-full hover:rotate-90 transition-all text-slate-500"><X size={28}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-16 space-y-12 custom-scrollbar">
           <div className="p-10 rounded-[40px] bg-black/40 border border-white/5 font-mono text-[12px] leading-relaxed text-slate-400">
              <div className="text-amber-500 font-black uppercase mb-6 tracking-widest flex items-center gap-3"><Eye size={16}/> Manifest Evidence</div>
              {loading ? <span className="animate-pulse">Analyzing...</span> : dossier}
           </div>
        </div>
      </div>
    </div>
  );
};
