import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Scroll, Shield, User, Zap, RefreshCw, Radio, Handshake, Bell,
  BarChart3, Scale, Users, Landmark, ShoppingCart, Factory, Award,
  Brain, Timer, Cloud, Layers, Database, Search, Key, ShieldAlert,
  Activity as ActivityIcon, Settings, Warehouse, Route, History, FileSignature,
  ShieldCheck, Workflow, PenTool, Layout, Gauge, Save,
  Crown, Fingerprint, Sparkles, X, Terminal, Cpu, Truck, Gem, Flame, 
  Coins, ClipboardCheck, Ship, UserCheck, Briefcase, Camera, 
  Construction, Archive, Recycle, Boxes, Lock, Eye, Send, Binary, 
  TrendingUp, RotateCcw, Command, Dna, ZapOff, LayoutDashboard, 
  MessageSquare, ChevronRight, ChevronLeft, Globe, Monitor, Pin, 
  Maximize2, Share2, Phone, MessagesSquare, Volume2, Wifi, Star,
  TrendingDown, Info, HardDrive, Network, Microchip, Server
} from 'lucide-react';

// --- CONFIG & TOKENS ---
const apiKey = "";

const THEMES = {
  gold: { shell: '#030303 0deg, #1e1e1e 40deg, #ffd700 80deg, #090909 120deg', glow: 'rgba(255, 215, 0, 0.4)', color: '#FFD700' },
  blue: { shell: '#030303 0deg, #0a192f 40deg, #3b82f6 80deg, #020617 120deg', glow: 'rgba(59, 130, 246, 0.4)', color: '#3B82F6' },
  green: { shell: '#030303 0deg, #064e3b 40deg, #10b981 80deg, #022c22 120deg', glow: 'rgba(16, 185, 129, 0.4)', color: '#10B981' },
  purple: { shell: '#030303 0deg, #4c1d95 40deg, #8b5cf6 80deg, #2e1065 120deg', glow: 'rgba(139, 92, 246, 0.4)', color: '#8B5CF6' },
  red: { shell: '#030303 0deg, #7f1d1d 40deg, #ef4444 80deg, #450a0a 120deg', glow: 'rgba(239, 68, 68, 0.4)', color: '#EF4444' },
  amber: { shell: '#030303 0deg, #78350f 40deg, #ffbf00 80deg, #451a03 120deg', glow: 'rgba(255, 191, 0, 0.4)', color: '#FFBF00' }
};

// --- MASSIVE REGISTRY (24+ Cells) ---
const CELL_REGISTRY = [
  { id: 'ctn-01', cat: 'Constitution', title: 'HIẾN PHÁP', icon: Scroll, color: 'gold', qneu: 0.98, status: 'Immutable' },
  { id: 'ctn-02', cat: 'Kernel', title: 'Gatekeeper', icon: Crown, color: 'amber', qneu: 1.0, status: 'Active' },
  { id: 'inf-01', cat: 'Infrastructure', title: 'SmartLink', icon: Zap, color: 'blue', qneu: 0.85, status: 'Optimized' },
  { id: 'inf-02', cat: 'Infrastructure', title: 'Cloud-Node', icon: Cloud, color: 'blue', qneu: 0.79, status: 'Active' },
  { id: 'inf-03', cat: 'Infrastructure', title: 'Neural-Bus', icon: Network, color: 'blue', qneu: 0.92, status: 'Stable' },
  { id: 'biz-01', cat: 'Business', title: 'Logic-Flow', icon: Factory, color: 'green', qneu: 0.72, status: 'Processing' },
  { id: 'biz-02', cat: 'Business', title: 'Stone-Sale', icon: Gem, color: 'green', qneu: 0.68, status: 'High-Demand' },
  { id: 'biz-03', cat: 'Business', title: 'Asset-Registry', icon: Database, color: 'green', qneu: 0.88, status: 'Locked' },
  { id: 'intel-01', cat: 'Intelligence', title: 'Neural MAIN', icon: Brain, color: 'purple', qneu: 0.94, status: 'Learning' },
  { id: 'intel-02', cat: 'Intelligence', title: 'Vision-Core', icon: Eye, color: 'purple', qneu: 0.81, status: 'Analyzing' },
  { id: 'ai-01', cat: 'AI Entity', title: 'Bối Bối', icon: Workflow, color: 'red', qneu: 1.0, status: 'Uplink' },
  { id: 'ai-02', cat: 'AI Entity', title: 'Thiên', icon: PenTool, color: 'red', qneu: 0.95, status: 'Standby' },
  { id: 'ctn-03', cat: 'Kernel', title: 'Security-Halt', icon: ShieldAlert, color: 'amber', qneu: 0.99, status: 'Active' },
  { id: 'biz-04', cat: 'Business', title: 'Logistics', icon: Truck, color: 'green', qneu: 0.75, status: 'Moving' },
  { id: 'biz-05', cat: 'Business', title: 'Fin-Gate', icon: Coins, color: 'green', qneu: 0.91, status: 'Authorized' },
  { id: 'inf-04', cat: 'Infrastructure', title: 'Storage-01', icon: Warehouse, color: 'blue', qneu: 0.64, status: 'Active' },
  { id: 'intel-03', cat: 'Intelligence', title: 'QNEU-Synth', icon: Binary, color: 'purple', qneu: 0.87, status: 'Processing' },
  { id: 'ai-03', cat: 'AI Entity', title: 'Guard-Bot', icon: Cpu, color: 'red', qneu: 0.92, status: 'Monitoring' },
  { id: 'ctn-04', cat: 'Constitution', title: 'Scar-Registry', icon: FileSignature, color: 'gold', qneu: 0.96, status: 'Immutable' },
  { id: 'inf-05', cat: 'Infrastructure', title: 'Gate-Proxy', icon: Route, color: 'blue', qneu: 0.83, status: 'Balanced' },
  { id: 'biz-06', cat: 'Business', title: 'Audit-Cell', icon: ClipboardCheck, color: 'green', qneu: 0.99, status: 'Auditing' },
  { id: 'intel-04', cat: 'Intelligence', title: 'Market-Pulse', icon: TrendingUp, color: 'purple', qneu: 0.77, status: 'Fluctuating' },
  { id: 'inf-06', cat: 'Infrastructure', title: 'Mainframe', icon: Server, color: 'blue', qneu: 1.0, status: 'Critical' },
  { id: 'ai-04', cat: 'AI Entity', title: 'Agent-X', icon: UserCheck, color: 'red', qneu: 0.88, status: 'Hidden' },
];

// --- TICKER DATA ---
const GOLD_DATA = [
  { label: 'SJC', buy: '82.50M', sell: '84.50M', trend: 'up' },
  { label: 'PNJ', buy: '81.80M', sell: '83.80M', trend: 'down' },
  { label: 'NHẪN TRƠN 24K', buy: '78.50M', sell: '80.00M', trend: 'up' },
  { label: 'VÀNG THẾ GIỚI', buy: '2.340$', sell: '2.355$', trend: 'up' },
];

const NEWS_DATA = [
  { type: 'OS', content: 'Natt-OS NÂNG CẤP GOLD MASTER 5.8.1 THÀNH CÔNG' },
  { type: 'LEGAL', content: 'TUÂN THỦ HIẾN PHÁP NAUION V1.0 BẮT BUỘC CHO MỌI CELL' },
  { type: 'EVENT', content: 'CHÀO MỪNG CÁC ĐƠN VỊ KINH DOANH MỚI GIA NHẬP HỆ SINH THÁI' },
  { type: 'SECURITY', content: 'GATEKEEPER KÍCH HOẠT VIGILANCE MAX TRÊN TOÀN MẠNG' },
];

// --- HELPER FUNCTIONS ---
const fetchGemini = async (prompt, systemInstruction = "") => {
  let delay = 1000;
  for (let i = 0; i < 5; i++) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
        })
      });
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Communication timeout.";
    } catch (e) { await new Promise(r => setTimeout(r, delay)); delay *= 2; }
  }
  return "Neural link failed.";
};

// --- COMPONENTS ---

const MidnightGalaxy = () => {
  const [time, setTime] = useState(new Date().getHours());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().getHours()), 60000);
    return () => clearInterval(timer);
  }, []);

  const galaxyTheme = useMemo(() => {
    if (time >= 5 && time < 8) return 'from-[#1e1b4b] via-[#4c1d95] to-[#831843]'; // Dawn
    if (time >= 8 && time < 17) return 'from-[#020617] via-[#1e1b4b] to-[#0f172a]'; // Day
    if (time >= 17 && time < 20) return 'from-[#0f172a] via-[#581c87] to-[#1e1b4b]'; // Dusk
    return 'from-[#000105] via-[#020617] to-[#000105]'; // Night
  }, [time]);

  const stars = useMemo(() => [...Array(150)].map((_, i) => ({
    id: i, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 0.5, delay: Math.random() * 5, duration: 3 + Math.random() * 4
  })), []);

  const shootingStars = useMemo(() => [...Array(6)].map((_, i) => ({
    id: i, top: `${Math.random() * 40}%`, left: `${Math.random() * 100}%`,
    delay: Math.random() * 20, duration: 2 + Math.random() * 3
  })), []);

  return (
    <div className={`fixed inset-0 z-0 bg-gradient-to-br ${galaxyTheme} transition-colors duration-[10000ms] overflow-hidden`}>
      <div className="absolute inset-0 opacity-30 mix-blend-screen pointer-events-none" 
           style={{ background: 'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15), transparent 40%), radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.15), transparent 40%)' }} />
      {stars.map(star => (
        <div key={star.id} className="absolute bg-white rounded-full animate-pulse"
             style={{ top: star.top, left: star.left, width: `${star.size}px`, height: `${star.size}px`, animationDelay: `${star.delay}s`, animationDuration: `${star.duration}s` }} />
      ))}
      {shootingStars.map(s => (
        <div key={s.id} className="absolute h-[1.5px] bg-gradient-to-r from-white via-white/50 to-transparent pointer-events-none"
             style={{ top: s.top, left: s.left, width: '100px', transform: 'rotate(-45deg)', opacity: 0, animation: `shootingStar ${s.duration}s linear infinite`, animationDelay: `${s.delay}s` }} />
      ))}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
    </div>
  );
};

const HeaderTicker = () => (
  <div className="flex-1 h-20 flex flex-col justify-center overflow-hidden border-x border-white/10 px-4 relative">
    <div className="relative h-9 flex items-center overflow-hidden">
      <div className="flex gap-8 whitespace-nowrap animate-[ticker_40s_linear_infinite] items-center">
        {[...GOLD_DATA, ...GOLD_DATA].map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 bg-white/5 border border-amber-500/20 rounded-lg px-4 py-1.5 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
            <span className="text-[14px] font-black text-amber-500 tracking-tighter">{item.label}</span>
            <div className="flex items-center gap-3 font-mono text-[14px]">
              <span className="text-white/40 text-[10px] uppercase font-bold">MUA</span>
              <span className="text-white font-bold">{item.buy}</span>
              <span className="text-white/40 text-[10px] uppercase font-bold">BÁN</span>
              <span className="text-amber-400 font-bold">{item.sell}</span>
              {item.trend === 'up' ? <TrendingUp size={14} className="text-green-500" /> : <TrendingDown size={14} className="text-red-500" />}
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="relative h-9 flex items-center overflow-hidden">
      <div className="flex gap-8 whitespace-nowrap animate-[ticker_55s_linear_infinite_reverse] items-center">
        {[...NEWS_DATA, ...NEWS_DATA].map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-lg px-4 py-1.5">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
              item.type === 'OS' ? 'bg-blue-500/20 text-blue-400' : 
              item.type === 'LEGAL' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-white/60'
            }`}>{item.type}</span>
            <span className="text-[14px] font-medium text-white/80 tracking-wide uppercase">{item.content}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CausticFilter = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0 }}>
    <filter id="caustic-filter">
      <feTurbulence type="turbulence" baseFrequency="0.018 0.022" numOctaves="2" result="turbulence">
        <animate attributeName="baseFrequency" values="0.018 0.022;0.022 0.018;0.018 0.022" dur="8s" repeatCount="indefinite"/>
      </feTurbulence>
      <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="15" />
    </filter>
  </svg>
);

const MedalGridItem = ({ item, onClick, mousePos }) => {
  const theme = THEMES[item.color] || THEMES.gold;
  const IconComponent = item.icon;
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    if (!ref.current || !hovered) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const a = Math.atan2(mousePos.y - centerY, mousePos.x - centerX) * 180 / Math.PI;
    setAngle(a);
  }, [mousePos, hovered]);

  return (
    <div 
      ref={ref}
      className="flex flex-col items-center gap-4 p-4 transition-all duration-300 group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(item)}
    >
      <div className="relative w-32 h-32" style={{ transformStyle: 'preserve-3d' }}>
        {/* Orbital Rings (Simplified for Grid performance) */}
        <div className="absolute inset-[-15%] pointer-events-none opacity-10 group-hover:opacity-40 transition-opacity">
          <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_25s_linear_infinite]">
            <circle cx="50" cy="50" r="48" fill="none" stroke={theme.color} strokeWidth="0.5" strokeDasharray="4, 12" />
          </svg>
        </div>

        {/* PBR Shell */}
        <div className="absolute inset-0 rounded-full overflow-hidden border border-white/5 transition-all duration-500 group-hover:scale-110"
             style={{
               background: `conic-gradient(from ${angle}deg, ${theme.shell})`,
               boxShadow: hovered ? `0 0 30px ${theme.glow}` : 'none'
             }}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[sweep_1.2s_ease-in-out]" />
          <div className="absolute inset-0 rounded-full border border-white/10" />
        </div>

        {/* Glass Core */}
        <div className="absolute inset-[15%] rounded-full backdrop-blur-xl border border-white/5 flex items-center justify-center transition-transform group-hover:translate-z-[15px]"
             style={{ background: 'rgba(255,255,255,0.03)' }}>
          {hovered && <div className="absolute inset-0 opacity-20" style={{ filter: 'url(#caustic-filter)', background: 'white' }} />}
          <IconComponent size={28} className="text-white drop-shadow-glow" />
        </div>

        {/* Confidence Ring */}
        <svg className="absolute inset-[-10%] w-[120%] h-[120%] -rotate-90">
            <circle cx="50%" cy="50%" r="48%" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <circle cx="50%" cy="50%" r="48%" fill="none" stroke={theme.color} strokeWidth="2" strokeDasharray={`${item.qneu * 301.59} 301.59`} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </svg>
      </div>
      <div className="text-center transition-all group-hover:translate-y-1">
        <p className="text-[7px] uppercase tracking-widest text-white/30">{item.cat}</p>
        <h4 className="text-[10px] font-bold text-white/70 group-hover:text-white uppercase tracking-wider">{item.title}</h4>
      </div>
    </div>
  );
};

const NeuralTerminal = ({ cell, onClose }) => {
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const prompt = `Deep audit for NATT-CELL: ${cell.id}. Status: ${cell.status}. QNEU: ${cell.qneu}. Generate structural evidence.`;
      const res = await fetchGemini(prompt, "You are the NaUion Audit Oracle.");
      setData(res); setLoading(false);
    };
    init();
  }, [cell]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 md:p-12 animate-in fade-in zoom-in-95 duration-500">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={onClose} />
      <div className="relative w-full max-w-5xl h-[80vh] bg-[#050505] rounded-[40px] border border-white/10 flex flex-col overflow-hidden shadow-2xl">
        <div className="px-10 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-5">
            <cell.icon size={24} className="text-amber-500" />
            <h2 className="text-lg font-black uppercase tracking-[0.3em] text-white">{cell.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-all text-white/30 hover:text-white"><X size={20}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-12 space-y-8 font-mono text-xs custom-scrollbar">
           <div className="bg-white/5 p-8 rounded-3xl border border-white/5 leading-relaxed text-white/50">
              <div className="flex items-center gap-3 text-amber-500 font-black uppercase mb-4"><Shield size={14} /> Audit Trail</div>
              {loading ? "Neural sync in progress..." : data}
           </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APPLICATION ---

export default function App() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedCell, setSelectedCell] = useState(null);
  const [activeComm, setActiveComm] = useState(null);

  useEffect(() => {
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div className="h-screen w-screen bg-[#000105] text-white font-mono overflow-hidden relative selection:bg-amber-500 selection:text-black">
      <CausticFilter />
      <MidnightGalaxy />

      {/* HEADER: Bloomberg Style Tickers */}
      <header className="fixed top-0 left-0 w-full z-50 px-8 py-4 flex justify-between items-center backdrop-blur-3xl bg-black/40 border-b border-white/10 h-32">
         <div className="flex flex-col gap-2 shrink-0">
            <div className="logo-container group cursor-pointer flex items-center gap-4">
                <div className="relative text-2xl font-black tracking-tighter transition-all group-hover:tracking-widest">
                    NATT.OS
                    <div className="absolute -top-1 -right-4 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                </div>
                <div className="h-6 w-[1.5px] bg-white/10" />
                <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase text-amber-500/80 tracking-widest">MASSIVE SCALE MODE</span>
                    <span className="text-[7px] font-mono text-white/20 uppercase">ENGINE v1.1.0-GRID</span>
                </div>
            </div>
         </div>
         <HeaderTicker />
         <div className="flex items-center gap-4 shrink-0 ml-4">
            <div className="hidden lg:flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2 gap-3">
                <Search size={14} className="text-white/40" />
                <input placeholder="TÌM THỰC THỂ..." className="bg-transparent border-none focus:ring-0 text-[10px] w-28 font-black uppercase tracking-widest outline-none" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500"><LayoutDashboard size={18} /></div>
         </div>
      </header>

      {/* MAIN NEURAL GRID: Handles 24+ Components professionally */}
      <main className="h-full w-full pt-40 pb-32 px-12 overflow-y-auto custom-scrollbar relative z-10">
         <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-4 gap-y-12">
            {CELL_REGISTRY.map((cell) => (
                <MedalGridItem 
                  key={cell.id} 
                  item={cell} 
                  onClick={setSelectedCell} 
                  mousePos={mousePos}
                />
            ))}
         </div>
      </main>

      {/* DOCKER & HUD */}
      <footer className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[500] px-12 py-5 bg-black/40 backdrop-blur-3xl rounded-[35px] border border-white/10 flex items-center gap-8 shadow-2xl">
          <div className="flex items-center gap-4">
             <button onClick={() => setActiveComm('chat')} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${activeComm === 'chat' ? 'bg-blue-500 text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
                <MessagesSquare size={20} />
             </button>
             <button onClick={() => setActiveComm('call')} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${activeComm === 'call' ? 'bg-green-500 text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
                <Phone size={20} />
             </button>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <button className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-black shadow-lg"><Fingerprint size={24} /></button>
          <div className="w-px h-10 bg-white/10" />
          <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 text-[8px] font-black uppercase text-white/40">
                  <Wifi size={10} className="text-green-500" /> SYNC: {CELL_REGISTRY.length} ENTITIES
              </div>
              <div className="text-[7px] font-mono text-amber-500 uppercase tracking-widest mt-0.5">GRID_MODE_STABLE</div>
          </div>
      </footer>

      {selectedCell && <NeuralTerminal cell={selectedCell} onClose={() => setSelectedCell(null)} />}

      {activeComm === 'chat' && (
        <div className="fixed bottom-36 right-12 z-[600] w-96 h-[480px] bg-black/90 border border-white/10 rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 backdrop-blur-3xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-3 text-blue-400">
                    <MessagesSquare size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">AI Entity Uplink</span>
                </div>
                <button onClick={() => setActiveComm(null)}><X size={18}/></button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar text-[11px] leading-relaxed">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-white/60">
                    <span className="text-amber-500 font-bold">SYSTEM:</span> Phát hiện {CELL_REGISTRY.length} thực thể. Đã tự động chuyển sang chế độ Neural Grid để tối ưu hiển thị.
                </div>
                <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20 text-blue-100 italic">
                    <span className="text-blue-400 font-bold not-italic">Bối Bối:</span> Khi số lượng tăng lên, Grid Mode giúp anh có cái nhìn tổng quan nhất về toàn bộ hệ thống đấy anh Nat ạ!
                </div>
            </div>
            <div className="p-6 bg-black/40">
                <input placeholder="SEND COMMAND..." className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-6 text-[10px] font-bold uppercase tracking-widest outline-none" />
            </div>
        </div>
      )}

      {/* Footer Audit Log */}
      <div className="fixed bottom-0 left-0 w-full h-8 bg-black/80 border-t border-white/5 flex items-center overflow-hidden z-[1000]">
          <div className="absolute left-0 h-full px-6 bg-amber-500 text-black flex items-center font-black text-[9px] uppercase tracking-widest z-10">Neural Audit</div>
          <div className="whitespace-nowrap flex gap-12 text-[8px] font-mono text-white/20 uppercase tracking-[0.4em] animate-[ticker_80s_linear_infinite] pl-[100%]">
              <span>[ENTITY] Grid scaling active for {CELL_REGISTRY.length} nodes</span>
              <span>[PERF] Caustics filtered by hover event for GPU stability</span>
              <span>[GALAXY] Real-time nebula shift at hour {new Date().getHours()} active</span>
              <span>[SECURITY] All {CELL_REGISTRY.length} cells integrity verified</span>
          </div>
      </div>

      <style>{`
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes sweep { 0% { transform: translateX(-100%) skewX(-20deg); } 100% { transform: translateX(200%) skewX(-20deg); } }
        @keyframes shootingStar { 0% { transform: translateX(0) translateY(0) rotate(-45deg); opacity: 1; } 70% { opacity: 1; } 100% { transform: translateX(-1000px) translateY(1000px) rotate(-45deg); opacity: 0; } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .drop-shadow-glow { filter: drop-shadow(0 0 8px rgba(255,255,255,0.5)); }
      `}</style>
    </div>
  );
}
