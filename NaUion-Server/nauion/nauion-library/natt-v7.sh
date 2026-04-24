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
  Phone, MessagesSquare, Volume2, Wifi, Star, UserCircle, BarChart, Quote,
  Activity as PulseIcon
} from 'lucide-react';

/**
 * Natt-OS NaUion Vision Engine v5.4.8 [GLASS BUBBLE MASTER]
 * "Hệ thực tế ảo đa nhiệm - Logo 3D Glass Bubble Rose Gold"
 * Aesthetics: NaUion Glass Core, Fresnel Rim, Liquid Caustics, 10-Layer Extrusion
 * Feature: Advanced Refraction & Surface Tension Simulation
 */

const apiKey = "";

const TOKENS = {
  colors: {
    bg: '#000105',
    glass: 'rgba(10, 20, 50, 0.4)',
    roseGold: {
      light: '#FFD1DC',
      main: '#E5B3BB',
      deep: '#B76E79',
      glow: 'rgba(229, 179, 187, 0.5)',
      rim: 'rgba(255, 209, 220, 0.8)'
    },
    gold: { p:'#F7E7CE', em:'#FFD700', glow:'rgba(251,191,36,0.3)', deep:'#4a3701' },
    blue: { p:'#E0FFFF', em:'#B0E0E6', glow:'rgba(59,130,246,0.3)', deep:'#1e3a8a' },
  }
};

const INITIAL_REGISTRY = [
  { id:'ctn-01', cat:'Core', title:'HIẾN PHÁP', icon:Scroll, color:'gold', desc:'DNA gốc bất biến.' },
  { id:'ctn-02', cat:'Core', title:'Gatekeeper', icon:User, color:'gold', desc:'Quyền tối thượng.' },
  { id:'biz-prod', cat:'Business', title:'production', icon:Factory, color:'green', desc:'Dây chuyền logic.' },
  { id:'biz-sale', cat:'Business', title:'sales-cell', icon:TrendingUp, color:'green', desc:'Tăng trưởng Wave 3.' },
  { id:'inf-01', cat:'Infra', title:'smartlink', icon:Zap, color:'blue', desc:'Hệ thần kinh số.' },
  { id:'ai-3', cat:'AI', title:'BỐI BỐI', icon:Workflow, color:'red', desc:'Guardians of the Constitution.' },
  { id:'ai-4', cat:'AI', title:'Thiên', icon:PenTool, color:'red', desc:'Digital Vision Architect.' },
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
    
    /* NaUion Glass Bubble Logic */
    .bubble-atom {
      position: relative;
      width: 140px; height: 180px;
      display: flex; align-items: center; justify-content: center;
      transform-style: preserve-3d;
      transition: all 0.7s cubic-bezier(0.23, 1, 0.32, 1);
    }

    .bubble-char-layer {
      position: absolute;
      font-size: 11rem; font-weight: 900;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      user-select: none;
      line-height: 1;
    }

    /* 1. Base Physical Extrusion (Depth Layers) - Sử dụng rose gold đậm dần */
    .b-depth-1 { background: ${TOKENS.colors.roseGold.deep}; transform: translateZ(0px); opacity: 0.8; }
    .b-depth-2 { background: ${TOKENS.colors.roseGold.deep}; transform: translateZ(4px); opacity: 0.6; }
    .b-depth-3 { background: ${TOKENS.colors.roseGold.main}; transform: translateZ(8px); opacity: 0.4; }
    .b-depth-4 { background: ${TOKENS.colors.roseGold.main}; transform: translateZ(12px); opacity: 0.3; }

    /* 2. Glass Core (Refracted Interior) - Trong suốt với ánh rose gold nhẹ */
    .b-glass-core {
      background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), ${TOKENS.colors.roseGold.main}22 70%);
      backdrop-filter: blur(12px) saturate(180%);
      transform: translateZ(18px);
      -webkit-text-fill-color: transparent;
      -webkit-background-clip: text;
      filter: contrast(1.2);
    }

    /* 3. Fresnel Rim (Rose Gold Edge Highlight) */
    .b-fresnel-rim {
      transform: translateZ(20px);
      -webkit-text-stroke: 2px ${TOKENS.colors.roseGold.rim};
      filter: drop-shadow(0 0 15px ${TOKENS.colors.roseGold.glow});
    }

    /* 4. Front Surface (Liquid Tension) - Ánh rose gold chính */
    .b-surface-front {
      background: linear-gradient(135deg, #fff 0%, ${TOKENS.colors.roseGold.light} 40%, ${TOKENS.colors.roseGold.main} 100%);
      transform: translateZ(24px);
      opacity: 0.95;
      -webkit-text-fill-color: transparent;
      -webkit-background-clip: text;
    }

    /* 5. Specular Highlights & Caustics (hiệu ứng lấp lánh di chuyển) */
    .b-surface-front::after {
      content: attr(data-char);
      position: absolute; inset: 0;
      background: radial-gradient(circle at 25% 25%, rgba(255,255,255,0.9) 0%, transparent 50%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: bubble-caustics 8s infinite alternate ease-in-out;
    }

    @keyframes bubble-caustics {
      0% { background-position: 0% 0%; filter: brightness(1); }
      100% { background-position: 15% 10%; filter: brightness(1.3); }
    }

    .bubble-atom:hover {
      transform: scale(1.18) translateZ(80px);
    }
    .bubble-atom:hover .b-fresnel-rim {
      filter: drop-shadow(0 0 30px ${TOKENS.colors.roseGold.glow});
    }

    /* Super Ticker */
    .super-ticker {
      position: fixed; top: 0; left: 0; width: 100%; height: 64px;
      background: rgba(0, 0, 0, 0.96); border-bottom: 2px solid ${TOKENS.colors.roseGold.main}22;
      display: flex; flex-direction: column; justify-content: center; z-index: 1000;
      backdrop-filter: blur(20px);
    }
    .ticker-row { display: flex; white-space: nowrap; overflow: hidden; height: 32px; align-items: center; }
    .ticker-anim { display: inline-flex; animation: ticker-scroll 45s linear infinite; }
    @keyframes ticker-scroll { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }

    /* Tactile Docker Buttons */
    .docker-tactile {
      background: rgba(10, 20, 40, 0.85);
      backdrop-filter: blur(60px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 -35px 120px rgba(0,0,0,1), inset 0 2px 2px rgba(255,255,255,0.1);
      border-radius: 55px;
    }
    .docker-btn {
      position: relative; padding: 24px; border-radius: 30px;
      background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%);
      border: 1px solid rgba(255, 255, 255, 0.05);
      transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      color: #94a3b8;
      display: flex; align-items: center; justify-content: center;
    }
    .docker-btn:hover {
      background: rgba(255,255,255,0.15); transform: translateY(-30px) scale(1.4);
      border-color: ${TOKENS.colors.roseGold.main}; color: #fff;
      box-shadow: 0 25px 50px rgba(0,0,0,0.8), 0 0 30px ${TOKENS.colors.roseGold.glow};
    }

    .custom-scrollbar::-webkit-scrollbar { width: 2px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: ${TOKENS.colors.roseGold.main}; }
    
    @keyframes floating-bubble { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
    .animate-bubble-float { animation: floating-bubble 10s infinite ease-in-out; }
  `}</style>
);

// ── SUB-COMPONENTS ──────────────────────────────────────────

const TickerRow = ({ title, content, bgColor, textColor, speed }) => (
  <div className="ticker-row border-b border-white/5">
     <div className={`px-5 h-full flex items-center text-[10px] font-black tracking-widest z-10 ${bgColor} ${textColor}`}>{title}</div>
     <div className="ticker-anim gap-28" style={{ animationDuration: speed }}>
        <span className="text-white/70 font-mono text-[11px] uppercase tracking-widest font-bold">{content}</span>
     </div>
  </div>
);

const GlassBubbleLogo = ({ mousePos }) => {
  const letters = ["N", "A", "T", "T", ".", "O", "S"];
  return (
    <div className="flex gap-2 items-center animate-bubble-float">
       {letters.map((char, i) => (
         <div
           key={i}
           className="bubble-atom"
           style={{
             transform: `rotateY(${(mousePos.x - window.innerWidth/2) * 0.015}deg) rotateX(${(mousePos.y - window.innerHeight/2) * -0.015}deg)`,
             transitionDelay: `${i * 45}ms`
           }}
         >
            {/* 10-Layer NaUion Bubble Extrusion */}
            <span className="bubble-char-layer b-depth-1">{char}</span>
            <span className="bubble-char-layer b-depth-2">{char}</span>
            <span className="bubble-char-layer b-depth-3">{char}</span>
            <span className="bubble-char-layer b-depth-4">{char}</span>
            
            <span className="bubble-char-layer b-glass-core">{char}</span>
            <span className="bubble-char-layer b-fresnel-rim">{char}</span>
            
            <span className="bubble-char-layer b-surface-front" data-char={char}>{char}</span>
         </div>
       ))}
    </div>
  );
};

const NaUionMedal = ({ item, isFocus, distance, mousePos, onClick }) => {
  const Icon = item.icon;
  const theme = TOKENS.colors[item.color] || TOKENS.colors.gold;
  const absDist = Math.abs(distance);
  const scale = isFocus ? 1.5 : Math.max(0.6, 0.85 - absDist * 0.22);
  const zDepth = isFocus ? 200 : absDist * -300;
  const xOffset = distance * 420;
  const opacity = isFocus ? 1 : 0.3 / (absDist || 0.5);

  const angle = Math.atan2(mousePos.y - window.innerHeight / 2, mousePos.x - window.innerWidth / 2) * 180 / Math.PI;

  return (
    <div className="absolute flex flex-col items-center transition-all duration-1000 ease-out"
      style={{ transform: `translateX(${xOffset}px) translateZ(${zDepth}px) rotateY(${distance * -25}deg) scale(${scale})`, opacity, zIndex: 100 - absDist }}>
      <button onClick={() => onClick(item)} className="relative w-44 h-44 group outline-none" style={{ transformStyle: 'preserve-3d' }}>
        <div className="absolute inset-0 rounded-full border border-white/5 bg-[#020202]/95 shadow-[0_30px_70px_rgba(0,0,0,1)]" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute inset-[10%] rounded-full border border-white/10" style={{ transform: `rotate(${i * 60}deg) translateZ(${i*4}px)`, backdropFilter: 'blur(30px)', background: 'rgba(255,255,255,0.02)' }} />
        ))}
        <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `translateZ(45px)` }}>
          <div className="w-18 h-18 rounded-full flex items-center justify-center"
               style={{ background: `radial-gradient(circle at 30% 30%, ${theme.em}, ${theme.deep})`, boxShadow: isFocus ? `0 0 55px ${theme.glow}` : 'none' }}>
            {Icon && <Icon size={32} className="text-black/90" strokeWidth={2.5} />}
          </div>
        </div>
      </button>
      {isFocus && (
        <div className="mt-14 text-center animate-in fade-in zoom-in-95 duration-700">
           <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.8em] mb-3 block opacity-60">System Cell</span>
           <h3 className="text-2xl font-black uppercase tracking-[0.4em] text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">{item.title}</h3>
        </div>
      )}
    </div>
  );
};

// ── MAIN APPLICATION ────────────────────────────────────────

export default function App() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [activeItem, setActiveItem] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeComm, setActiveComm] = useState(null);
  const [cells] = useState(INITIAL_REGISTRY);

  useEffect(() => {
    const h = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  const move = (dir) => setCurrentIndex(p => (p + dir + cells.length) % cells.length);

  return (
    <div className="h-screen w-screen relative overflow-hidden flex flex-col items-center">
      <GlobalStyles />
      
      {/* ENTERPRISE SUPER TICKER */}
      <div className="super-ticker">
         <TickerRow
           title="MARKET HUB"
           bgColor="bg-[#B76E79]" textColor="text-white" speed="45s"
           content="XAU/USD: 2,168.50 (+1.25%) • SJC GOLD: 82.500.000 VND • DENSITY: 5.2k Th/s • KCS_HOLD: ACTIVE • OPERATOR: THIEN@IMAC • BMF v1.5.0 SYNCED"
         />
         <TickerRow
           title="TAM LUXURY NEWS"
           bgColor="bg-white/5" textColor="text-[#FFB7C5]" speed="35s"
           content="URGENT: BỘ SƯU TẬP ATOMIC BUBBLE ROSE GOLD ĐÃ ĐẠT ĐỘ THẨM MỸ TUYỆT ĐỐI • CHÀO MỪNG ANH NAT QUAY LẠI TRẠM ĐIỀU HÀNH THẦN KINH •"
         />
      </div>

      {/* MIDNIGHT GALAXY BACKGROUND */}
      <div className="fixed inset-0 z-[-1] bg-[#000105]">
        <div className="absolute inset-0 opacity-[0.6]" style={{ background: 'radial-gradient(circle at center, transparent, #000 95%)' }} />
        <div className="absolute top-[-20%] right-[-10%] w-[140%] h-[140%] bg-blue-900/[0.07] blur-[220px]" />
        <div className="absolute bottom-[-10%] left-[-15%] w-[120%] h-[120%] bg-rose-900/[0.04] blur-[250px]" />
        {[...Array(60)].map((_, i) => (
          <div key={i} className="absolute bg-white rounded-full animate-pulse opacity-30"
               style={{ top: `${Math.random()*100}%`, left: `${Math.random()*100}%`, width: '1.5px', height: '1.5px', animationDuration: `${4+Math.random()*6}s` }} />
        ))}
      </div>

      {/* ── HEADER: ROSE GOLD GLASS BUBBLE LOGO (NaUion Spec) ── */}
      <header className="relative z-50 flex flex-col items-center mt-36">
         <GlassBubbleLogo mousePos={mouse} />
         
         <div className="flex items-center gap-14 mt-20">
            <div className="px-12 py-3 rounded-full bg-white/[0.03] border border-white/10 text-amber-500 text-[10px] font-black tracking-[1.2em] uppercase">
               <Crown size={16} className="animate-bounce inline-block mr-4" /> GOLD MASTER v5.4.8
            </div>
            <div className="px-10 py-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-[0.5em] uppercase shadow-[0_0_30px_rgba(59,130,246,0.3)]">
               ✨ NEURAL ARCHITECT NODE LIVE
            </div>
         </div>
      </header>

      {/* ── NEURAL CAROUSEL ── */}
      <div className="absolute top-[66vh] w-full flex items-center justify-center" style={{ perspective: '2500px' }}>
         <button onClick={() => move(-1)} className="absolute left-[10%] z-[200] p-8 text-slate-700 hover:text-white transition-all focus:outline-none"><ChevronLeft size={72} /></button>
         <button onClick={() => move(1)} className="absolute right-[10%] z-[200] p-8 text-slate-700 hover:text-white transition-all focus:outline-none"><ChevronRight size={72} /></button>
         
         <div className="relative w-full flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
            {cells.map((cell, i) => (
              <NaUionMedal
                key={cell.id} item={cell} isFocus={i === currentIndex}
                distance={i - currentIndex} mousePos={mouse}
                onClick={() => i === currentIndex ? setActiveItem(cell) : setCurrentIndex(i)}
              />
            ))}
         </div>
      </div>

      {/* ── TACTILE DOCKER ── */}
      <div className="fixed bottom-12 z-[500] docker-tactile px-20 py-8 flex items-center gap-20 shadow-[0_-40px_100px_rgba(0,0,0,0.8)]">
         <button onClick={() => setActiveComm('chat')} className={`docker-btn group ${activeComm === 'chat' ? 'text-blue-400 border-blue-500/30 bg-blue-500/10' : ''}`}>
            <MessagesSquare size={36} />
            <span className="absolute -top-14 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 bg-black/80 px-4 py-2 rounded-lg border border-white/10 whitespace-nowrap shadow-2xl">Neural Room</span>
         </button>
         
         <button className="docker-btn group" onClick={() => setActiveComm('profile')}>
            <UserCircle size={36} />
            <span className="absolute -top-14 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 bg-black/80 px-4 py-2 rounded-lg border border-white/10 whitespace-nowrap shadow-2xl">Gatekeeper Profile</span>
         </button>
         
         <div className="w-px h-16 bg-white/10" />
         
         <button className="docker-btn group">
            <LayoutDashboard size={36} />
         </button>
         <button className="docker-btn group" onClick={() => setActiveItem(cells.find(c => c.id === 'ctn-02'))}>
            <Fingerprint size={36} />
         </button>
         
         <div className="w-px h-16 bg-white/10" />

         <div className="flex flex-col gap-2 items-end pl-10">
            <div className="flex gap-5 items-center">
               <Wifi size={18} className="text-green-500 animate-pulse shadow-[0_0_20px_#22c55e]" />
               <Volume2 size={18} className="text-slate-500" />
            </div>
            <span className="text-[11px] font-black text-slate-800 font-mono tracking-[0.3em] uppercase">NEURAL_LIVE</span>
         </div>
      </div>

      {/* MODALS */}
      {activeItem && <NeuralTerminal item={activeItem} onClose={() => setActiveItem(null)} />}
      
      {/* IDENTITY HUD */}
      {activeComm === 'profile' && (
        <div className="fixed inset-0 z-[1000] bg-black/98 backdrop-blur-3xl flex items-center justify-center animate-in zoom-in-110">
           <div className="w-full max-w-2xl hud-glass p-24 flex flex-col items-center gap-16 relative overflow-hidden rounded-[80px]">
              <div className="w-48 h-48 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_80px_rgba(229,179,187,0.3)]">
                 <Fingerprint size={120} className="text-[#FFB7C5]" />
              </div>
              <div className="text-center space-y-5">
                 <h2 className="text-6xl font-black uppercase tracking-[0.7em] text-white">Thien@iMac</h2>
                 <p className="text-[12px] font-mono text-slate-500 uppercase tracking-widest font-black">SUPREME GATEKEEPER AUTHORITY // AUTH: DIAMOND_MASTER</p>
              </div>
              <button onClick={() => setActiveComm(null)} className="px-20 py-6 bg-white/5 border border-white/15 rounded-full text-[#FFB7C5] hover:bg-white/10 transition-all uppercase tracking-[0.6em] text-[11px] font-black">Disconnect Gateway</button>
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
      const res = await callGemini(`Shard: ${item.title}. VR Role.`, "Diagnostic.");
      setDossier(res); setLoading(false);
    };
    fetch();
  }, [item]);

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-12 bg-black/98 backdrop-blur-[100px] animate-in zoom-in-95">
      <div className="w-full max-w-6xl h-[85vh] docker-tactile rounded-[80px] flex flex-col overflow-hidden relative border border-white/10 shadow-[0_0_350px_rgba(0,0,0,1)]">
        <div className="px-20 py-16 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
           <div className="flex items-center gap-10 text-[#FFB7C5]">
             <Terminal size={48} />
             <span className="text-2xl font-black uppercase tracking-[0.8em]">{item.title}</span>
           </div>
           <button onClick={onClose} className="p-6 bg-white/5 rounded-full hover:rotate-90 transition-all text-slate-500 hover:text-white"><X size={48}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-24 space-y-20 custom-scrollbar">
           <div className="p-16 rounded-[60px] bg-black/60 border border-white/5 font-mono text-[16px] leading-loose text-slate-400 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2.5 h-full bg-[#B76E79] shadow-[0_0_25px_#B76E79]" />
              <div className="text-[#FFB7C5] font-black uppercase mb-12 tracking-[1.2em] flex items-center gap-6"><Eye size={32}/> Core Evidence Shard</div>
              {loading ? <span className="animate-pulse flex items-center gap-6 italic font-black text-[#FFB7C5]/30 tracking-widest"><RefreshCw className="animate-spin" size={24} /> ANALYZING ATOMIC DNA...</span> : dossier}
           </div>
        </div>
      </div>
    </div>
  );
};
