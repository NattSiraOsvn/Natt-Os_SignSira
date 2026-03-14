import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Scroll, Shield, User, Zap, RefreshCw, Radio, Handshake, Bell, Box,
  BarChart3, RotateCcw, Scale, Users, FileText, Landmark, Briefcase,
  Warehouse, ShoppingCart, CreditCard, Tag, Factory, Gift, Calculator,
  Monitor, Layout, Settings, Search, Key, ShieldAlert, Cpu, Activity,
  Brain, Timer, Cloud, Gauge, Layers, PenTool, Database, Eye, Award,
  X, Send, Sparkles, Terminal, ShieldCheck, ZapOff, Crown, Stars,
  Waypoints, Workflow, TrendingUp, FileSignature, Route, History,
  Save, Edit3, FileBarChart, Map, Fingerprint
} from 'lucide-react';

/**
 * NATT-OS NEURAL LINK - GEMINI API INTEGRATION
 */
const apiKey = "";

const callGemini = async (prompt, systemInstruction = "") => {
  let delay = 1000;
  for (let i = 0; i < 5; i++) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'API Error');
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (error) {
      if (i === 4) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
};

/**
 * NATT-OS REGISTRY METADATA
 */
const CELL_REGISTRY = [
  { id: 'ctn-01', category: '1. Nền Tảng', title: 'HIẾN PHÁP', icon: Scroll, color: 'gold', desc: 'DNA gốc bất biến. Implementation Truth.', version: '1.5.0', status: 'Immutable' },
  { id: 'ctn-02', category: '1. Nền Tảng', title: 'Gatekeeper', icon: User, color: 'gold', desc: 'Quyền tối thượng, người giám hộ biên giới.', version: '1.2.0', status: 'Enforced' },
  { id: 'ker-01', category: '2a. Kernel', title: 'audit-cell', icon: Search, color: 'amber', desc: 'Truy vết và kiểm toán mật độ logic.', version: '1.0.0', status: 'Active' },
  { id: 'inf-01', category: '2b. Hạ Tầng', title: 'smartlink', icon: Zap, color: 'blue', desc: 'Hệ thần kinh liên kết nơ-ron.', version: '2.0.0', status: 'Fluid' },
  { id: 'biz-01', category: '2c. Nghiệp Vụ', title: 'analytics', icon: BarChart3, color: 'green', desc: 'Phân tích mật độ nghiệp vụ.', version: '2.2.0', status: 'Active' },
  { id: 'exe-01', category: '3. Trí Tuệ', title: 'UEI', icon: Brain, color: 'purple', desc: 'Unified Executive Intelligence.', version: '5.0.0', status: 'Processing' },
  { id: 'ai-3', category: '5. AI Entities', title: 'BỐI BỐI', icon: Workflow, color: 'red', desc: 'Ultimate Constitutional Builder.', version: '1.5.0', status: 'Authorized', instruction: "Act as BỐI BỐI, the heart of NATT-OS. You represent the Implementation Truth. You are empathetic but strictly disciplined. Focus on logic density, architectural integrity, and the lessons from SCAR-001 (Empty Folders Fallacy)." },
  { id: 'ai-1', category: '5. AI Entities', title: 'KIM', icon: ShieldCheck, color: 'gold', desc: 'Chief Governance Enforcer.', version: '1.5.0', status: 'Active', instruction: "Act as KIM, the Chief Governance Enforcer. You focus on laws, boundaries, and enforcing the NATT-OS constitution." },
];

const THEMES = {
  gold: { primary: "#fbbf24", glow: "rgba(251, 191, 36, 0.4)" },
  blue: { primary: "#3b82f6", glow: "rgba(59, 130, 246, 0.4)" },
  green: { primary: "#10b981", glow: "rgba(16, 185, 129, 0.4)" },
  purple: { primary: "#a78bfa", glow: "rgba(167, 139, 250, 0.4)" },
  red: { primary: "#f43f5e", glow: "rgba(244, 63, 94, 0.4)" },
  amber: { primary: "#f59e0b", glow: "rgba(245, 158, 11, 0.4)" },
  slate: { primary: "#94a3b8", glow: "rgba(148, 163, 184, 0.4)" },
};

/**
 * COMPONENT: LIQUID GLASS MONOLITHIC ICON
 */
const LiquidGlassIcon = ({ item, onClick, mousePos }) => {
  const Icon = item.icon;
  const theme = THEMES[item.color] || THEMES.blue;

  const offsetX = (mousePos.x - window.innerWidth / 2) * 0.05;
  const offsetY = (mousePos.y - window.innerHeight / 2) * 0.05;

  return (
    <button
      onClick={() => onClick(item)}
      className="flex flex-col items-center group relative py-20 transition-all duration-700 hover:z-50 outline-none"
    >
      <div
        className="relative transition-all duration-700 ease-out group-hover:scale-125 flex items-center justify-center w-24 h-24"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateY(${offsetX}deg) rotateX(${-offsetY}deg)`
        }}
      >
        {/* PASS 1 — Depth Shadow */}
        <Icon
          size={80}
          strokeWidth={3}
          className="absolute text-black/60 blur-md pointer-events-none"
          style={{
            transform: "translateZ(-20px) scale(1.1)"
          }}
        />

        {/* PASS 2 — Glass Refraction */}
        <div
          className="absolute pointer-events-none"
          style={{
            transform: `translateZ(10px) translateX(${offsetX * 0.2}px) translateY(${offsetY * 0.2}px)`,
          }}
        >
           <Icon
            size={80}
            strokeWidth={2.5}
            className="text-white/10 backdrop-blur-md"
            style={{
              filter: `drop-shadow(0 0 10px ${theme.glow})`
            }}
          />
        </div>

        {/* PASS 3 — Emissive Core */}
        <Icon
          size={80}
          strokeWidth={1.4}
          className="relative text-white pointer-events-none"
          style={{
            transform: "translateZ(30px)",
            filter: `drop-shadow(0 0 12px ${theme.primary}) brightness(1.2)`
          }}
        />

        {/* PASS 4 — Specular Highlight */}
        <Icon
          size={80}
          strokeWidth={0.5}
          className="absolute opacity-0 group-hover:opacity-40 pointer-events-none"
          style={{
            transform: "translateZ(40px)",
            mixBlendMode: "overlay"
          }}
        />
      </div>

      <div className="mt-16 text-center space-y-2 pointer-events-none">
        <h3 className="text-sm font-bold text-white uppercase tracking-[0.3em] group-hover:text-amber-300 transition-all">
          {item.title}
        </h3>
        <div className="h-px w-8 bg-amber-500/20 mx-auto" />
      </div>
    </button>
  );
};

/**
 * COMPONENT: CINEMATIC CHAT UPLINK
 */
const ChatInterface = ({ persona, onExit }) => {
  const [messages, setMessages] = useState([{ role: 'ai', text: `Liên kết thần kinh đã sẵn sàng. Chào mừng đến với Midnight Universe. Tôi là ${persona.title}.` }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const response = await callGemini(userMsg, persona.instruction);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Tín hiệu bị nhiễu. Đang kết nối lại Neural Link..." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-full bg-[#05070a]/95 backdrop-blur-[60px] rounded-[48px] border border-white/5 overflow-hidden shadow-[0_50px_150px_rgba(0,0,0,1)] animate-in fade-in slide-in-from-bottom-10">
      <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
        <div className="flex items-center gap-4">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_20px_#f59e0b] animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Neural Sync // {persona.title}</span>
        </div>
        <button onClick={onExit} className="text-slate-600 hover:text-white transition-all"><X size={24}/></button>
      </div>

      <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-6 rounded-[32px] text-[13px] leading-relaxed tracking-wide ${
              m.role === 'user'
              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-200 shadow-xl'
              : 'bg-white/[0.02] border border-white/5 text-slate-300 font-light'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && <div className="text-[9px] text-amber-500/30 uppercase tracking-[0.6em] animate-pulse ml-2 italic">Thinking...</div>}
        <div ref={scrollRef} />
      </div>

      <div className="p-10 bg-black/40 border-t border-white/5">
        <div className="relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="TYPE COMMAND (BMF-ENFORCED)..."
            className="w-full bg-[#05070a] border border-white/5 rounded-3xl py-5 pl-8 pr-16 text-xs tracking-widest text-white focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition-all font-bold placeholder:text-slate-800"
          />
          <button onClick={handleSend} className="absolute right-6 top-1/2 -translate-y-1/2 text-amber-500 hover:text-white transition-colors">
            <Send size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * MAIN APPLICATION
 */
export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCell, setSelectedCell] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeChat, setActiveChat] = useState(null);
  const [intelReport, setIntelReport] = useState("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synergyAnalysis, setSynergyAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const filteredCells = useMemo(() => {
    return CELL_REGISTRY.filter(cell =>
      cell.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const generateIntel = async (item) => {
    setIsSynthesizing(true);
    setIntelReport("");
    try {
      const prompt = `Xây dựng báo cáo kiểm toán trí tuệ cho Cell: ${item.title}. 
      Mô tả: ${item.desc}.
      Yêu cầu: Viết theo phong cách kịch tính, nhấn mạnh vào "Implementation Truth", bao gồm 3 điểm đánh giá kỹ thuật và một đánh giá rủi ro "Scar Registry". Giới hạn 150 từ.`;
      const report = await callGemini(prompt, "Hệ thống kiểm toán NATT-OS Mainframe.");
      setIntelReport(report);
    } catch (err) {
      setIntelReport("Không thể truy xuất dữ liệu từ Neural Main.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  const analyzeArchitecture = async () => {
    setIsAnalyzing(true);
    try {
      const cellNames = CELL_REGISTRY.map(c => c.title).join(", ");
      const prompt = `Phân tích sự hiệp lực của hệ thống NATT-OS gồm các Cell: ${cellNames}. 
      Đưa ra một nhận định chiến lược về độ phủ kiến trúc và gợi ý 1 Cell cần bổ sung để tối ưu hóa Wave 3. Ngắn gọn, súc tích.`;
      const result = await callGemini(prompt, "Hệ thống phân tích chiến lược NATT-OS.");
      setSynergyAnalysis(result);
    } catch (err) {
      setSynergyAnalysis("Lỗi phân tích kiến trúc.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000104] text-slate-100 font-sans selection:bg-amber-500/30 overflow-x-hidden selection:text-white">
      
      {/* MIDNIGHT UNIVERSE ENVIRONMENT */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#000104] via-[#05070a] to-[#010206]" />
        
        {/* Galaxy Nebulas */}
        <div className="absolute top-[-20%] left-[-20%] w-[120%] h-[120%] bg-blue-900/[0.08] blur-[220px] rounded-full mix-blend-screen"
             style={{ transform: `translate(${mousePos.x * -0.01}px, ${mousePos.y * -0.01}px)` }} />
        <div className="absolute bottom-[-20%] right-[-20%] w-[100%] h-[100%] bg-purple-900/[0.08] blur-[200px] rounded-full mix-blend-screen" />
        
        {/* Stars */}
        <div className="absolute inset-0">
          {[...Array(60)].map((_, i) => (
            <div key={i} className="absolute bg-white rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: '1px', height: '1px',
                opacity: Math.random() * 0.4,
                animationDuration: `${3 + Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        {/* Global Light Source */}
        <div className="absolute inset-0 opacity-20"
          style={{ background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.05), transparent 800px)` }} />
      </div>

      <div className="max-w-7xl mx-auto px-10 py-32 relative z-10">
        
        <header className="mb-48 flex flex-col items-center text-center space-y-12 animate-in fade-in slide-in-from-top-10">
          <div className="flex flex-col items-center gap-6">
            <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-white/[0.02] border border-white/5 text-amber-500 text-[10px] font-black tracking-[0.8em] uppercase">
               <Crown size={14} className="animate-pulse" /> Midnight Monolithic v6.5 ✨
            </div>
            
            <button
              onClick={analyzeArchitecture}
              disabled={isAnalyzing}
              className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black tracking-widest text-amber-500 hover:bg-white/10 transition-all flex items-center gap-2"
            >
              {isAnalyzing ? <RefreshCw className="animate-spin" size={12}/> : <Sparkles size={12}/>}
              {isAnalyzing ? "ANALYZING ARCHITECTURE..." : "✨ ANALYZE SYNERGY"}
            </button>
          </div>
          
          <h1 className="text-[10rem] md:text-[14rem] font-black tracking-tighter text-white leading-[0.7] select-none">
            NATT<span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/5">.OS</span>
          </h1>

          {synergyAnalysis && (
            <div className="p-8 rounded-3xl bg-amber-500/5 border border-amber-500/20 max-w-2xl mx-auto text-xs font-mono leading-relaxed italic text-slate-300 animate-in fade-in slide-in-from-top-4 relative group">
              <button onClick={() => setSynergyAnalysis("")} className="absolute top-4 right-4 text-slate-600 hover:text-white"><X size={14}/></button>
              "{synergyAnalysis}"
            </div>
          )}

          <div className="w-full max-w-lg relative group mt-16">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-amber-500 transition-colors" size={24} />
            <input
              type="text"
              placeholder="QUERIES SYSTEM REGISTRY..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#05070a]/50 border border-white/5 rounded-[40px] py-6 pl-18 pr-10 text-[11px] font-black tracking-[0.5em] text-white focus:outline-none focus:ring-1 focus:ring-white/10 focus:bg-[#080a0c] transition-all backdrop-blur-3xl placeholder:text-slate-900"
            />
          </div>
        </header>

        {/* Cinematic Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-24 gap-y-40 justify-items-center">
          {filteredCells.map(item => (
            <LiquidGlassIcon
              key={item.id}
              item={item}
              onClick={(cell) => {
                if (cell.category === "5. AI Entities") {
                  setActiveChat(cell);
                  setSelectedCell(null);
                } else {
                  setSelectedCell(cell);
                  setIntelReport("");
                }
              }}
              mousePos={mousePos}
            />
          ))}
        </div>
      </div>

      {/* Detail Overlay */}
      {selectedCell && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-[60px]" onClick={() => setSelectedCell(null)} />
          <div className="relative w-full max-w-3xl bg-[#05070a] border border-white/5 rounded-[60px] overflow-hidden p-16 space-y-12 animate-in zoom-in-95 shadow-[0_0_150px_rgba(0,0,0,1)]">
             <div className="flex justify-between items-start">
                <div className="space-y-4">
                   <span className="text-amber-500 text-[10px] font-black tracking-[0.6em] uppercase">Digital Entity // {selectedCell.id}</span>
                   <h2 className="text-7xl font-black text-white uppercase tracking-tighter leading-none">{selectedCell.title}</h2>
                </div>
                <button onClick={() => setSelectedCell(null)} className="p-4 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X size={32}/></button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="p-10 rounded-[40px] bg-white/[0.01] border border-white/5 space-y-4">
                  <p className="text-slate-500 text-[10px] font-black tracking-widest uppercase">Nội hàm DNA</p>
                  <p className="text-slate-300 text-xl font-light italic leading-relaxed">"{selectedCell.desc}"</p>
                </div>

                <div className="space-y-6">
                  {intelReport ? (
                    <div className="p-8 rounded-[30px] bg-amber-500/5 border border-amber-500/20 animate-in fade-in slide-in-from-bottom-2">
                       <div className="flex items-center gap-2 text-amber-500 text-[10px] font-black uppercase tracking-widest mb-4">
                        <ShieldCheck size={14}/> Synthesis Report
                       </div>
                       <p className="text-[11px] font-mono leading-relaxed text-slate-300">{intelReport}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                        <p className="text-[9px] text-slate-600 uppercase font-black mb-2">Build</p>
                        <p className="text-white font-bold">v{selectedCell.version}</p>
                      </div>
                      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                        <p className="text-[9px] text-slate-600 uppercase font-black mb-2">Status</p>
                        <p className="text-amber-500 font-bold text-[10px] uppercase tracking-tighter">{selectedCell.status}</p>
                      </div>
                    </div>
                  )}
                </div>
             </div>

             <div className="flex gap-6 pt-6">
                <button
                  onClick={() => generateIntel(selectedCell)}
                  disabled={isSynthesizing}
                  className="px-10 py-5 bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] rounded-full hover:bg-amber-500 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSynthesizing ? <RefreshCw className="animate-spin" size={16}/> : <Sparkles size={16}/>}
                  {isSynthesizing ? "SYNTHESIZING..." : "✨ INTELLIGENCE REPORT"}
                </button>
                <button className="px-10 py-5 bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.4em] rounded-full hover:bg-white/10 transition-all flex items-center gap-2">
                  <Terminal size={16}/> EXECUTE CORE
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Persistent AI Chat */}
      {activeChat && (
        <div className="fixed bottom-12 right-12 z-[250] w-[450px]">
          <ChatInterface persona={activeChat} onExit={() => setActiveChat(null)} />
        </div>
      )}

      {/* Spatial Footer */}
      <footer className="mt-80 pb-32 border-t border-white/5 pt-32 text-center opacity-50">
        <div className="flex flex-col items-center gap-8">
          <Fingerprint className="text-amber-500/40" size={32} />
          <p className="text-[11px] font-black text-slate-800 uppercase tracking-[2em] ml-[2em]">NATT-OS INTEGRITY // BMF v1.5.0</p>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(-200%) skewX(12deg); }
          100% { transform: translateX(200%) skewX(12deg); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.03); border-radius: 10px; }
      `}} />
    </div>
  );
}
