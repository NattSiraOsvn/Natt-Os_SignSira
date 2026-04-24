import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Scroll, Shield, User, Zap, RefreshCw, Radio, Handshake, Bell, Box,
  BarChart3, RotateCcw, Scale, Users, FileText, Landmark, Briefcase,
  Warehouse, ShoppingCart, CreditCard, Tag, Factory, Gift, Layout, Eye, Wrench,
  Monitor, Settings, Search, Key, ShieldAlert, Cpu, Activity,
  Brain, Timer, Cloud, Gauge, Layers, PenTool, Database, Award,
  X, Info, ChevronRight, Binary, Fingerprint, Dna, MessageSquare, Send,
  Sparkles, Terminal, ShieldCheck, ZapOff, Workflow, Wand2, ActivityIcon,
  LayoutDashboard, FileSignature, Microscope, FileArchive, FileEdit, Calculator
} from 'lucide-react';

/**
 * CẤU HÌNH THEME CYBON (NEON CYBERNETIC)
 */
const CYBON_THEMES = {
  gold: { core: "#FFF000", accent: "#FFD700", glow: "rgba(255, 240, 0, 0.6)", bg: "rgba(255, 240, 0, 0.05)" },
  blue: { core: "#00F0FF", accent: "#007FFF", glow: "rgba(0, 240, 255, 0.6)", bg: "rgba(0, 240, 255, 0.05)" },
  green: { core: "#00FF41", accent: "#008F11", glow: "rgba(0, 255, 65, 0.6)", bg: "rgba(0, 255, 65, 0.05)" },
  purple: { core: "#BC13FE", accent: "#8B00FF", glow: "rgba(188, 19, 254, 0.6)", bg: "rgba(188, 19, 254, 0.05)" },
  red: { core: "#FF003C", accent: "#9D002C", glow: "rgba(255, 0, 60, 0.6)", bg: "rgba(255, 0, 60, 0.05)" },
  amber: { core: "#FF9900", accent: "#CC7A00", glow: "rgba(255, 153, 0, 0.6)", bg: "rgba(255, 153, 0, 0.05)" },
};

/**
 * COMPONENT: CYBON CORE RENDER ENGINE
 * Nâng cấp từ cấu trúc Neron Core gốc với hiệu ứng Circuitry và Scanlines
 */
const CybonCoreSVG = ({ theme, Icon, size = "100%", mouseEffect = { x: 0, y: 0 }, isHovered }) => {
  const angles = [0, 30, 60, 90, 120, 150];
  
  return (
    <svg viewBox="0 0 512 512" style={{ width: size, height: size }} xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
      <defs>
        <radialGradient id={`coreG-${theme.accent}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={theme.core} />
          <stop offset="40%" stopColor={theme.accent} />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>

        <linearGradient id="orbitG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={theme.core} stopOpacity="0.8" />
          <stop offset="100%" stopColor={theme.accent} stopOpacity="0.1" />
        </linearGradient>

        <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="glitch">
          <feOffset in="SourceGraphic" dx={isHovered ? 2 : 0} dy="0" result="offset1" />
          <feOffset in="SourceGraphic" dx={isHovered ? -2 : 0} dy="0" result="offset2" />
        </filter>
      </defs>

      {/* Layer: Circuit Background (Mạng lưới vi mạch chìm) */}
      <g opacity="0.15" stroke={theme.core} fill="none" strokeWidth="0.5">
        <circle cx="256" cy="256" r="200" strokeDasharray="5 10" />
        <path d="M256 56 V100 M256 412 V456 M56 256 H100 M412 256 H456" />
        <path d="M150 150 L180 180 M362 150 L332 180 M150 362 L180 332 M362 362 L332 332" />
      </g>

      {/* Layer: Orbits (Cybon Neon Orbits) */}
      <g transform={`translate(${mouseEffect.x * -15}, ${mouseEffect.y * -15})`} filter="url(#neonGlow)">
        {angles.map((angle, i) => (
          <ellipse
            key={i}
            cx="256"
            cy="256"
            rx="190"
            ry="85"
            fill="none"
            stroke="url(#orbitG)"
            strokeWidth={isHovered ? 2 : 1}
            opacity={isHovered ? 0.8 : 0.4}
            transform={`rotate(${angle} 256 256)`}
            className="transition-all duration-500"
          />
        ))}
      </g>

      {/* Layer: Scanline Animation (Chạy dọc thực thể) */}
      {isHovered && (
        <rect x="100" y="0" width="312" height="2" fill={theme.core} opacity="0.5">
          <animate attributeName="y" from="100" to="412" dur="2s" repeatCount="indefinite" />
        </rect>
      )}

      {/* Layer: Central Core (The Cybon Heart) */}
      <g transform={`translate(${mouseEffect.x * 20}, ${mouseEffect.y * 20})`} filter="url(#neonGlow)">
        <circle cx="256" cy="256" r="72" fill={`url(#coreG-${theme.accent})`} />
        
        {/* Lucide Soul (Được rực rỡ hóa) */}
        <foreignObject x="221" y="221" width="70" height="70">
          <div className="w-full h-full flex items-center justify-center text-black" style={{ filter: 'drop-shadow(0 0 2px white)' }}>
            <Icon size={38} strokeWidth={3} />
          </div>
        </foreignObject>
      </g>
    </svg>
  );
};

const CinematicMedal = ({ item, onClick, mousePos }) => {
  const containerRef = useRef(null);
  const Icon = item.icon || Box;
  const theme = CYBON_THEMES[item.color] || CYBON_THEMES.blue;
  const [localCoords, setLocalCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setLocalCoords({
      x: (mousePos.x - (rect.left + rect.width / 2)) / (window.innerWidth / 2),
      y: (mousePos.y - (rect.top + rect.height / 2)) / (window.innerHeight / 2)
    });
  }, [mousePos]);

  return (
    <button
      ref={containerRef}
      onClick={() => onClick(item)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex flex-col items-center group relative outline-none py-12"
      style={{ perspective: '1500px' }}
    >
      {/* Cybon Pulse Ring */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-1000 ${isHovered ? 'scale-150 opacity-20' : 'scale-100 opacity-0'}`}
        style={{ border: `2px solid ${theme.core}` }}
      />

      <div
        className="relative w-52 h-52 transition-all duration-700 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${-localCoords.y * 25}deg) rotateY(${localCoords.x * 25}deg)`
        }}
      >
        <CybonCoreSVG theme={theme} Icon={Icon} mouseEffect={localCoords} isHovered={isHovered} />
        
        {/* Digital Glitch Noise Layer */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen bg-[url('https://grainy-gradients.vercel.app/noise.svg')] animate-pulse" />
        )}
      </div>

      <div className="mt-10 text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
           <div className={`w-1 h-1 rounded-full ${isHovered ? 'animate-ping' : ''}`} style={{ backgroundColor: theme.core }} />
           <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] group-hover:text-white transition-colors">
             {item.category}
           </span>
        </div>
        <h3 className={`text-sm font-black uppercase tracking-[0.3em] transition-all ${isHovered ? 'text-white' : 'text-slate-300'}`} style={{ textShadow: isHovered ? `0 0 10px ${theme.glow}` : 'none' }}>
          {item.title}
        </h3>
      </div>
    </button>
  );
};

const FULL_REGISTRY = [
  { id: 'c-1', category: 'Constitution', title: 'Hiến Pháp', icon: Scroll, color: 'gold', desc: 'DNA hệ thống - Văn bản gốc bất biến.' },
  { id: 'c-2', category: 'Constitution', title: 'Gatekeeper', icon: User, color: 'gold', desc: 'Quyền tối thượng - Người giám hộ hệ thống.' },
  { id: 'k-1', category: 'Kernel Cells', title: 'audit-cell', icon: Search, color: 'amber', desc: 'Kiểm toán và truy vết vận hành.' },
  { id: 'k-5', category: 'Kernel Cells', title: 'security-cell', icon: ShieldAlert, color: 'red', desc: 'Bảo mật và phát hiện xâm nhập.' },
  { id: 'i-1', category: 'Infrastructure', title: 'smartlink-cell', icon: Zap, color: 'blue', desc: 'Hệ thần kinh kết nối liên tế bào.' },
  { id: 'b-6', category: 'Business Units', title: 'finance', icon: Landmark, color: 'green', desc: 'Quản trị tài chính lượng tử.' },
  { id: 'e-1', category: 'Executive', title: 'UEI Logic', icon: Cpu, color: 'purple', desc: 'Não bộ điều phối tập trung.' },
  { id: 'ai-3', category: 'AI Entities', title: 'BỐI BỐI', icon: Workflow, color: 'red', desc: 'Constitutional Guardian.' },
];

export default function App() {
  const [cells] = useState(FULL_REGISTRY);
  const [selectedCell, setSelectedCell] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <div className="min-h-screen bg-[#020202] text-slate-100 font-sans selection:bg-cyan-500/40 overflow-hidden">
      
      {/* CYBON DIGITAL ENVIRONMENT */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Matrix Grid */}
        <div className="absolute inset-0 opacity-[0.07]"
             style={{
               backgroundImage: 'linear-gradient(#00F0FF 1px, transparent 1px), linear-gradient(90deg, #00F0FF 1px, transparent 1px)',
               backgroundSize: '40px 40px',
               maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
             }} />
             
        {/* Glowing Dust */}
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.03)_0%,transparent_70%)]" />
      </div>

      <div className="max-w-[1600px] mx-auto px-10 py-24 relative z-10">
        <header className="mb-40 flex flex-col items-center text-center space-y-10">
          <div className="px-8 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-[11px] font-mono tracking-[1em] uppercase animate-pulse">
            Natt-OS CYBON INTERFACE v6.0
          </div>
          
          <div className="relative">
            <h1 className="text-[12rem] font-black tracking-tighter text-white leading-none select-none" style={{ textShadow: '0 0 30px rgba(0,240,255,0.2)' }}>
              NATT<span className="text-cyan-500">.OS</span>
            </h1>
            <div className="absolute -inset-2 blur-3xl bg-cyan-500/10 -z-10" />
          </div>

          <div className="flex gap-4">
             <div className="px-4 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-mono text-slate-500">RENDER: NEON_FLUX</div>
             <div className="px-4 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-mono text-slate-500">OPTICS: SPATIAL_V6</div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-20 gap-y-40 justify-items-center">
          {cells.map(item => (
            <CinematicMedal key={item.id} item={item} onClick={setSelectedCell} mousePos={mousePos} />
          ))}
        </div>
      </div>

      {/* CYBON DETAIL OVERLAY */}
      {selectedCell && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-black/98 backdrop-blur-3xl animate-in fade-in" onClick={() => setSelectedCell(null)} />
          <div className="relative w-full max-w-5xl bg-[#010101] border border-cyan-500/20 rounded-[40px] p-24 shadow-[0_0_100px_rgba(0,240,255,0.1)] animate-in zoom-in-95">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
             
             <div className="flex justify-between items-start mb-20">
                <div className="space-y-4">
                   <span className="text-cyan-500 font-mono text-[14px] tracking-[0.8em] uppercase">UPLINK_NODE // {selectedCell.id}</span>
                   <h2 className="text-9xl font-black text-white uppercase tracking-tighter">{selectedCell.title}</h2>
                </div>
                <button onClick={() => setSelectedCell(null)} className="p-6 bg-white/5 rounded-full text-slate-500 hover:text-cyan-400 transition-all hover:rotate-90 border border-white/5"><X size={40}/></button>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="p-16 rounded-[40px] bg-cyan-500/5 border border-cyan-500/10 relative overflow-hidden">
                   <div className="absolute -top-10 -right-10 opacity-[0.05]"><Binary size={200}/></div>
                   <p className="text-cyan-200/60 font-mono text-[12px] tracking-[0.4em] mb-8">SYSTEM_INTENT</p>
                   <p className="text-white text-3xl leading-relaxed font-light italic">"{selectedCell.desc}"</p>
                </div>
                
                <div className="space-y-8">
                   <div className="p-10 rounded-[30px] bg-white/5 border border-white/10 flex justify-between items-center">
                      <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">Integrity_Score</span>
                      <span className="text-2xl font-black text-cyan-400">99.98%</span>
                   </div>
                   <div className="p-10 rounded-[30px] bg-white/5 border border-white/10 flex justify-between items-center">
                      <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">Sync_Status</span>
                      <span className="text-2xl font-black text-green-400">OPTIMAL</span>
                   </div>
                   <button className="w-full py-8 bg-cyan-500 text-black font-black text-sm uppercase tracking-[0.8em] rounded-[30px] hover:bg-white transition-all shadow-[0_0_30px_rgba(0,240,255,0.4)]">Initialize Execution</button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* UI Elements */}
      <div className="fixed bottom-10 left-10 text-[9px] font-mono text-slate-700 tracking-[0.5em] uppercase">
         Terminal_Link: Active // Crypt_Auth: Verified
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes sweep { 0% { transform: translateX(-100%) skewX(45deg); } 100% { transform: translateX(300%) skewX(45deg); } }
        body { cursor: crosshair; }
        .custom-scrollbar::-webkit-scrollbar { width: 1px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #00F0FF; }
      `}} />
    </div>
  );
}
