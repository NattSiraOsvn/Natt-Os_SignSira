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
  TrendingDown, Info, HardDrive, Network, Microchip, Server,
  CheckCircle2, Clock, BarChart4, PieChart
} from 'lucide-react';

// --- HELPER COMPONENTS (Defined before App to avoid hoisting issues) ---

const ListChecks = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>
  </svg>
);

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

// --- MOCK DATA ---
const CELL_REGISTRY = [
  { id: 'ctn-01', cat: 'Constitution', title: 'HIẾN PHÁP', icon: Scroll, color: 'gold', qneu: 0.98, status: 'Immutable' },
  { id: 'ctn-02', cat: 'Kernel', title: 'Gatekeeper', icon: Crown, color: 'amber', qneu: 1.0, status: 'Active' },
  { id: 'inf-01', cat: 'Infrastructure', title: 'SmartLink', icon: Zap, color: 'blue', qneu: 0.85, status: 'Optimized' },
  { id: 'biz-01', cat: 'Business', title: 'Logic-Flow', icon: Factory, color: 'green', qneu: 0.72, status: 'Processing' },
  { id: 'intel-01', cat: 'Intelligence', title: 'Neural MAIN', icon: Brain, color: 'purple', qneu: 0.94, status: 'Learning' },
  { id: 'ai-01', cat: 'AI Entity', title: 'Bối Bối', icon: Workflow, color: 'red', qneu: 1.0, status: 'Uplink' },
  { id: 'biz-04', cat: 'Business', title: 'Logistics', icon: Truck, color: 'green', qneu: 0.75, status: 'Moving' },
  { id: 'inf-06', cat: 'Infrastructure', title: 'Mainframe', icon: Server, color: 'blue', qneu: 1.0, status: 'Critical' },
];

const GOLD_DATA = [
  { label: 'SJC', buy: '82.50M', sell: '84.50M', trend: 'up' },
  { label: 'PNJ', buy: '81.80M', sell: '83.80M', trend: 'down' },
  { label: 'NHẪN TRƠN 24K', buy: '78.50M', sell: '80.00M', trend: 'up' },
  { label: 'USD/VND', buy: '25.210', sell: '25.450', trend: 'up' },
];

const NEWS_DATA = [
  { type: 'OS', content: 'natt-os NÂNG CẤP GOLD MASTER 5.8.1 THÀNH CÔNG' },
  { type: 'LEGAL', content: 'TUÂN THỦ HIẾN PHÁP NAUION V1.0 BẮT BUỘC CHO MỌI CELL' },
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
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Signal Lost.";
    } catch (e) { await new Promise(r => setTimeout(r, delay)); delay *= 2; }
  }
  return "Neural link failed.";
};

// --- SUB-COMPONENTS ---

const MidnightGalaxy = () => {
  const [time] = useState(new Date().getHours());
  const galaxyTheme = useMemo(() => {
    if (time >= 5 && time < 8) return 'from-[#1e1b4b] via-[#4c1d95] to-[#831843]';
    if (time >= 8 && time < 17) return 'from-[#020617] via-[#1e1b4b] to-[#0f172a]';
    if (time >= 17 && time < 20) return 'from-[#0f172a] via-[#581c87] to-[#1e1b4b]';
    return 'from-[#000105] via-[#020617] to-[#000105]';
  }, [time]);

  const stars = useMemo(() => [...Array(100)].map((_, i) => ({
    id: i, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 0.5, delay: Math.random() * 5, duration: 3 + Math.random() * 4
  })), []);

  return (
    <div className={`fixed inset-0 z-0 bg-gradient-to-br ${galaxyTheme} transition-colors duration-[5000ms] overflow-hidden pointer-events-none`}>
      {stars.map(star => (
        <div key={star.id} className="absolute bg-white rounded-full animate-pulse"
             style={{ top: star.top, left: star.left, width: `${star.size}px`, height: `${star.size}px`, animationDelay: `${star.delay}s`, animationDuration: `${star.duration}s` }} />
      ))}
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
    </div>
  );
};

const HeaderTicker = () => (
  <div className="flex-1 h-20 flex flex-col justify-center overflow-hidden border-x border-white/10 px-4 relative">
    <div className="relative h-9 flex items-center overflow-hidden">
      <div className="flex gap-8 whitespace-nowrap animate-[ticker_40s_linear_infinite] items-center">
        {[...GOLD_DATA, ...GOLD_DATA].map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 bg-white/5 border border-amber-500/20 rounded-lg px-4 py-1.5">
            <span className="text-[14px] font-black text-amber-500">{item.label}</span>
            <div className="flex items-center gap-3 font-mono text-[14px]">
              <span className="text-white/40 text-[10px] font-bold">MUA</span>
              <span className="text-white font-bold">{item.buy}</span>
              <span className="text-white/40 text-[10px] font-bold">BÁN</span>
              <span className="text-amber-400 font-bold">{item.sell}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="relative h-9 flex items-center overflow-hidden">
      <div className="flex gap-8 whitespace-nowrap animate-[ticker_55s_linear_infinite_reverse] items-center">
        {[...NEWS_DATA, ...NEWS_DATA].map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-lg px-4 py-1.5">
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">{item.type}</span>
            <span className="text-[14px] font-medium text-white/80 uppercase">{item.content}</span>
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
  const [angle, setAngle] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setAngle(Math.atan2(mousePos.y - centerY, mousePos.x - centerX) * 180 / Math.PI);
  }, [mousePos]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-3 p-4 transition-all group cursor-pointer" onClick={() => onClick(item)}>
      <div className="relative w-28 h-28" style={{ transformStyle: 'preserve-3d' }}>
        <div className="absolute inset-0 rounded-full border border-white/5 transition-transform group-hover:scale-110"
             style={{ background: `conic-gradient(from ${angle}deg, ${theme.shell})`, boxShadow: `0 0 20px ${theme.glow}` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[sweep_1.5s_ease-in-out]" />
        </div>
        <div className="absolute inset-[15%] rounded-full backdrop-blur-xl border border-white/5 flex items-center justify-center">
          {IconComponent && <IconComponent size={24} className="text-white" />}
        </div>
      </div>
      <p className="text-[10px] font-bold text-white/60 group-hover:text-white uppercase tracking-widest">{item.title}</p>
    </div>
  );
};

// --- DASHBOARD COMPONENTS ---

const KpiCard = ({ title, value, unit, trend, icon: Icon, color }) => (
  <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 flex flex-col gap-4 hover:border-white/20 transition-all relative overflow-hidden group">
    <div className={`absolute top-0 left-0 w-1 h-full bg-${color}-500 opacity-50`} />
    <div className="flex justify-between items-start">
      <div className="p-3 rounded-2xl bg-white/5 text-white/40 group-hover:text-white transition-colors">
        {Icon && <Icon size={20} />}
      </div>
      <div className={`flex items-center gap-1 text-xs ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
        {trend > 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>} {Math.abs(trend)}%
      </div>
    </div>
    <div className="flex flex-col">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{title}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black text-white">{value}</span>
        <span className="text-[10px] font-mono text-white/20 uppercase">{unit}</span>
      </div>
    </div>
  </div>
);

const TaskItem = ({ title, status, deadline, progress }) => (
  <div className="flex items-center gap-6 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 transition-all">
    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
      <Briefcase size={18} className="text-blue-400" />
    </div>
    <div className="flex-1 min-w-0">
      <h5 className="text-[13px] font-bold text-white/90 truncate uppercase tracking-wide">{title}</h5>
      <div className="flex items-center gap-4 mt-1">
        <span className="text-[9px] text-white/30 flex items-center gap-1"><Clock size={10}/> {deadline}</span>
        <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold uppercase">{status}</span>
      </div>
    </div>
    <div className="w-32 flex flex-col gap-1">
      <div className="flex justify-between text-[9px] font-mono text-white/40">
        <span>Tiến độ</span>
        <span>{progress}%</span>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  </div>
);

const PerformanceChart = () => (
  <div className="flex flex-col gap-6 h-full">
    <div className="flex justify-between items-center">
      <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-500 flex items-center gap-3">
        <BarChart4 size={14}/> Hiệu suất nhân sự (7 ngày qua)
      </h4>
      <div className="flex gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-500" />
        <div className="w-2 h-2 rounded-full bg-purple-500" />
      </div>
    </div>
    <div className="flex-1 flex items-end gap-3 px-4 pb-4 border-b border-l border-white/10">
      {[45, 78, 52, 91, 65, 84, 95].map((h, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
          <div className="relative w-full rounded-t-lg bg-gradient-to-t from-blue-600/20 to-blue-400 group-hover:to-white transition-all duration-700" 
               style={{ height: `${h}%` }}>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
              {h}%
            </div>
          </div>
          <span className="text-[8px] font-mono text-white/20">T{i+2}</span>
        </div>
      ))}
    </div>
  </div>
);

// --- MAIN APPLICATION ---

export default function App() {
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'grid'
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

      {/* HEADER: Bloomberg Style Tickers & Nav Bar */}
      <header className="fixed top-0 left-0 w-full z-[100] bg-black/40 backdrop-blur-3xl border-b border-white/10">
         <div className="px-8 py-4 flex justify-between items-center h-28">
            <div className="logo-container group cursor-pointer flex items-center gap-4 shrink-0">
                <div className="relative text-2xl font-black tracking-tighter">
                    NATT.OS
                    <div className="absolute -top-1 -right-4 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                </div>
            </div>
            
            <HeaderTicker />

            <div className="flex items-center gap-4 shrink-0 ml-4">
               <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all cursor-pointer"><Bell size={18}/></div>
               <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all cursor-pointer"><Settings size={18}/></div>
            </div>
         </div>

         {/* KHOANG ĐIỀU HƯỚNG NGHIỆP VỤ (Sub-header) */}
         <div className="h-14 border-t border-white/5 flex items-center px-10 gap-10 bg-white/[0.01]">
            <button 
              onClick={() => setView('dashboard')}
              className={`text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3 transition-all ${view === 'dashboard' ? 'text-amber-500' : 'text-white/30 hover:text-white'}`}
            >
              <LayoutDashboard size={14}/> Trung tâm nghiệp vụ
            </button>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex gap-8">
               {['Sản xuất', 'Tài chính', 'Nhân sự', 'Hậu cần'].map(item => (
                 <button key={item} className="text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white transition-all">{item}</button>
               ))}
            </div>
         </div>
      </header>

      {/* MAIN BODY */}
      <main className="h-full w-full pt-48 pb-32 px-10 overflow-y-auto custom-scrollbar relative z-10">
         {view === 'dashboard' ? (
           <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* LEFT: KPI Indicators */}
              <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                 <KpiCard title="Doanh thu Wave 3" value="12.84" unit="Tỷ VNĐ" trend={+12.4} icon={TrendingUp} color="amber" />
                 <KpiCard title="Năng suất hệ thống" value="98.2" unit="QNEU" trend={+2.1} icon={Zap} color="blue" />
                 <KpiCard title="Nhân sự Active" value="142" unit="Tế bào" trend={-1.4} icon={Users} color="purple" />
                 <KpiCard title="Tỷ lệ hoàn tất" value="86" unit="Phần trăm" trend={+5.8} icon={CheckCircle2} color="green" />
              </div>

              {/* MIDDLE: Work Focus (Tasks) */}
              <div className="lg:col-span-7 bg-white/[0.03] border border-white/10 rounded-[40px] p-10 flex flex-col gap-8 shadow-2xl backdrop-blur-md">
                 <div className="flex justify-between items-center">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-400 flex items-center gap-3">
                      <ListChecks size={16}/> Công việc trọng tâm
                    </h4>
                    <button className="text-[9px] font-bold uppercase text-white/30 hover:text-white transition-all">Xem tất cả</button>
                 </div>
                 <div className="flex flex-col gap-4">
                    <TaskItem title="Nâng cấp Protocol 5.8 cho cụm Kernel" status="Urgent" deadline="14:00 Today" progress={85} />
                    <TaskItem title="Kiểm toán Hiến pháp Showroom Stone" status="Pending" deadline="Tomorrow" progress={32} />
                    <TaskItem title="Đồng bộ AI Bối Bối với Infrastructure" status="Active" deadline="16:30 Today" progress={60} />
                    <TaskItem title="Phân tích thị trường SJC Wave 4" status="In-Review" deadline="18 Mar 2024" progress={10} />
                 </div>
              </div>

              {/* RIGHT: Performance Chart */}
              <div className="lg:col-span-5 bg-white/[0.03] border border-white/10 rounded-[40px] p-10 shadow-2xl backdrop-blur-md">
                 <PerformanceChart />
              </div>

           </div>
         ) : (
           <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-4 gap-y-12 animate-in zoom-in-95 duration-500">
              {CELL_REGISTRY.map((cell) => (
                <MedalGridItem key={cell.id} item={cell} onClick={setSelectedCell} mousePos={mousePos} />
              ))}
           </div>
         )}
      </main>

      {/* DOCKER */}
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
          
          <button 
            onClick={() => setView(view === 'dashboard' ? 'grid' : 'dashboard')}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all transform active:scale-90 shadow-lg ${view === 'grid' ? 'bg-amber-500 text-black shadow-amber-500/20' : 'bg-white/10 text-white'}`}
          >
             {view === 'grid' ? <LayoutDashboard size={24}/> : <Monitor size={24}/>}
          </button>

          <div className="w-px h-10 bg-white/10" />
          <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 text-[8px] font-black uppercase text-white/40">
                  <Fingerprint size={12} className="text-amber-500" /> Vai trò: Gatekeeper
              </div>
              <div className="text-[7px] font-mono text-amber-500 uppercase tracking-widest mt-0.5">VIGILANCE_MAX_ACTIVE</div>
          </div>
      </footer>

      {/* MODALS */}
      {selectedCell && <NeuralTerminal cell={selectedCell} onClose={() => setSelectedCell(null)} />}
      
      {activeComm === 'chat' && (
        <div className="fixed bottom-36 right-12 z-[600] w-96 h-[480px] bg-[#050505]/95 border border-white/10 rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-10 backdrop-blur-3xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-3 text-blue-400">
                    <MessagesSquare size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">AI Entity Uplink</span>
                </div>
                <button onClick={() => setActiveComm(null)}><X size={18}/></button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar text-[11px] leading-relaxed">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-white/60 font-mono">
                    <span className="text-amber-500 font-bold">SYSTEM:</span> Chào anh Nat. Em đã cấu trúc lại Dashboard chính để anh theo dõi nghiệp vụ tổng quan (KPI, Tasks, Charts) một cách chuyên nghiệp nhất.
                </div>
                <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20 text-blue-100 italic">
                    <span className="text-blue-400 font-bold not-italic">Bối Bối:</span> Anh có thể nhấn vào nút Ứng dụng ở Docker (nút tròn ở giữa) để chuyển sang màn hình Grid các Cell nhé!
                </div>
            </div>
            <div className="p-6 bg-black/40 border-t border-white/5">
                <input placeholder="GỬI LỆNH CHO BỐI BỐI..." className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-6 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-amber-500/40 transition-all" />
            </div>
        </div>
      )}

      {/* Footer Secondary Status */}
      <div className="fixed bottom-0 left-0 w-full h-8 bg-black/80 border-t border-white/5 flex items-center overflow-hidden z-[1000]">
          <div className="absolute left-0 h-full px-6 bg-amber-500 text-black flex items-center font-black text-[9px] uppercase tracking-widest z-10">Neural Audit</div>
          <div className="whitespace-nowrap flex gap-12 text-[8px] font-mono text-white/20 uppercase tracking-[0.4em] animate-[ticker_80s_linear_infinite] pl-[100%]">
              <span>[CORE] Dashboard view synchronized with real-time business metrics</span>
              <span>[SECURITY] Gatekeeper level 1 authorization confirmed</span>
              <span>[PERF] 60fps locked for Neural Performance Chart rendering</span>
              <span>[TIME] Real-time galaxy sky updated to hour {new Date().getHours()}</span>
          </div>
      </div>

      <style>{`
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes sweep { 0% { transform: translateX(-100%) skewX(-20deg); } 100% { transform: translateX(200%) skewX(-20deg); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .drop-shadow-glow { filter: drop-shadow(0 0 10px rgba(255,255,255,0.3)); }
      `}</style>
    </div>
  );
}

const NeuralTerminal = ({ cell, onClose }) => {
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!cell) return;
      const prompt = `Deep audit for NATT-CELL: ${cell.id}. Status: ${cell.status}. QNEU: ${cell.qneu}. Generate structural evidence.`;
      const res = await fetchGemini(prompt, "You are the NaUion Audit Oracle.");
      setData(res); setLoading(false);
    };
    init();
  }, [cell]);

  if (!cell) return null;
  const IconComponent = cell.icon;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 md:p-12 animate-in fade-in zoom-in-95 duration-500">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={onClose} />
      <div className="relative w-full max-w-5xl h-[80vh] bg-[#050505] rounded-[40px] border border-white/10 flex flex-col overflow-hidden shadow-2xl">
        <div className="px-10 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-5">
            {IconComponent && <IconComponent size={24} className="text-amber-500" />}
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
};c
