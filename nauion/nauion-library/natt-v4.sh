#!/bin/bash
# ============================================================
# NATT-OS PIPELINE v4 — ORIGINAL CINEMATIC (11 CELLS)
# bash natt-v4.sh
# ============================================================
set -e; DIR="natt-v4"; mkdir -p $DIR/src; cd $DIR

cat > package.json << 'EOF'
{"name":"natt-v4","version":"4.0.0","type":"module","private":true,
"scripts":{"dev":"vite --host","build":"vite build"},
"dependencies":{"react":"^18.3.1","react-dom":"^18.3.1","lucide-react":"^0.483.0"},
"devDependencies":{"@vitejs/plugin-react":"^4.3.4","autoprefixer":"^10.4.20","postcss":"^8.4.49","tailwindcss":"^3.4.17","vite":"^6.0.11"}}
EOF
cat > vite.config.js << 'EOF'
import{defineConfig}from'vite';import react from'@vitejs/plugin-react';export default defineConfig({plugins:[react()]})
EOF
cat > tailwind.config.js << 'EOF'
export default{content:["./index.html","./src/**/*.{js,jsx}"],theme:{extend:{}},plugins:[]}
EOF
cat > postcss.config.js << 'EOF'
export default{plugins:{tailwindcss:{},autoprefixer:{}}}
EOF
cat > index.html << 'EOF'
<!doctype html><html lang="vi"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>NATT-OS · Pipeline v4</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>
EOF
cat > src/main.jsx << 'EOF'
import React from'react';import ReactDOM from'react-dom/client';import App from'./App.jsx';import'./index.css';
ReactDOM.createRoot(document.getElementById('root')).render(<App/>)
EOF
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
body{background-color:#010204}
@keyframes shimmer{0%{transform:translateX(-100%) skewX(12deg)}50%{transform:translateX(100%) skewX(12deg)}100%{transform:translateX(100%) skewX(12deg)}}
.custom-scrollbar::-webkit-scrollbar{width:4px}
.custom-scrollbar::-webkit-scrollbar-track{background:transparent}
.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.05);border-radius:10px}
.custom-scrollbar::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.1)}
EOF

cat > src/App.jsx << 'APPEOF'
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Scroll, Shield, User, Zap, BarChart3, Search, Activity,
  Brain, ShieldCheck, Workflow, X, Fingerprint, Send
} from 'lucide-react';

const apiKey = "";
const callGemini = async (prompt, systemInstruction = "") => {
  let delay = 1000;
  for (let i = 0; i < 5; i++) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ contents:[{parts:[{text:prompt}]}], systemInstruction:{parts:[{text:systemInstruction}]} }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message||'API Error');
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch(e) { if(i===4) throw e; await new Promise(r=>setTimeout(r,delay)); delay*=2; }
  }
};

const CELL_REGISTRY = [
  { id:'const-1', category:'Constitution',  title:'Hiến Pháp',  icon:Scroll,     color:'gold',   desc:'The fundamental DNA protocol. Implementation Truth enforced.',            version:'2.0.1', status:'Immutable'           },
  { id:'const-2', category:'Constitution',  title:'Gatekeeper', icon:User,       color:'gold',   desc:'Primary authentication authority. Zero-trust boundary.',                 version:'1.5.0', status:'Active'              },
  { id:'const-3', category:'Constitution',  title:'NattSira Seal',icon:Shield,   color:'gold',   desc:'Gold Master Ultimate Seal. Hashing Discipline active.',                  version:'3.0.0', status:'Locked'              },
  { id:'kern-1',  category:'Kernel Cells',  title:'audit-cell', icon:Search,     color:'amber',  desc:'Continuous evidence block monitoring. Density score: High.',             version:'1.0.0', status:'Observing'           },
  { id:'kern-3',  category:'Kernel Cells',  title:'monitor-cell',icon:Activity,  color:'amber',  desc:'Real-time telemetry and QCET Resonance tracking.',                       version:'1.8.2', status:'Active'              },
  { id:'infra-1', category:'Infrastructure',title:'smartlink',  icon:Zap,        color:'blue',   desc:'High-speed shared contract communication bus.',                          version:'1.2.0', status:'Fluid'               },
  { id:'biz-1',   category:'Business Units',title:'analytics',  icon:BarChart3,  color:'green',  desc:'Deep data pattern recognition for market intelligence.',                 version:'2.2.0', status:'Active'              },
  { id:'intel-3', category:'Intelligence',  title:'Neural MAIN',icon:Brain,      color:'purple', desc:'Consciousness emulation with ACES Tone Mapping.',                        version:'Alpha-X',status:'Evolving'           },
  { id:'ai-3',    category:'AI Entities',   title:'BỐI BỐI',    icon:Workflow,   color:'red',    desc:'Ultimate Constitutional Builder. Kernel Guardian.',                      version:'1.5.0', status:'Gold Master Auth',   instruction:"Act as BỐI BỐI, the Ultimate Constitutional Builder of NATT-OS. Implementation Truth enforced. Focus on logic density and architectural integrity." },
  { id:'ai-1',    category:'AI Entities',   title:'KIM',        icon:ShieldCheck,color:'gold',   desc:'Chief Governance Enforcer. Enforcement authority.',                      version:'1.0',   status:'Sentient',           instruction:"Act as KIM, the Chief Governance Enforcer. You focus on laws, boundaries, and enforcing the NATT-OS constitution." },
];

const T = {
  gold:   {p:'#fbbf24',em:'rgba(251,191,36,0.8)',  glow:'rgba(251,191,36,0.4)' },
  blue:   {p:'#3b82f6',em:'rgba(59,130,246,0.8)',  glow:'rgba(59,130,246,0.4)' },
  green:  {p:'#10b981',em:'rgba(16,185,129,0.8)',  glow:'rgba(16,185,129,0.4)' },
  purple: {p:'#a78bfa',em:'rgba(167,139,250,0.8)', glow:'rgba(167,139,250,0.4)'},
  red:    {p:'#f43f5e',em:'rgba(244,63,94,0.8)',   glow:'rgba(244,63,94,0.4)'  },
  amber:  {p:'#f59e0b',em:'rgba(245,158,11,0.8)',  glow:'rgba(245,158,11,0.4)' },
};

const Medal = ({ item, mousePos, onClick }) => {
  const Icon = item.icon;
  const theme = T[item.color] || T.blue;
  const ref = useRef(null);
  const [dof, setDof] = useState(0);
  const [hov, setHov] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dist = Math.hypot(mousePos.x-(r.left+r.width/2), mousePos.y-(r.top+r.height/2));
    setDof(Math.max(0,(dist-160)*0.018));
  }, [mousePos]);

  const px = s => ({ x:(mousePos.x-window.innerWidth/2)*s, y:(mousePos.y-window.innerHeight/2)*s });
  const p1=px(0.015), p2=px(0.035), p3=px(0.06);

  return (
    <button ref={ref} onClick={()=>onClick(item)}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      className="flex flex-col items-center group relative outline-none py-12"
      style={{perspective:'1200px',filter:`blur(${dof}px)`,opacity:dof>9?0.2:1,transition:'filter 0.4s,opacity 0.4s'}}>
      <div className="relative w-32 h-32 md:w-40 md:h-40"
        style={{transformStyle:'preserve-3d',
          transform:`rotateX(${-p1.y}deg) rotateY(${p1.x}deg) scale(${hov?1.1:1})`,
          transition:'transform 0.8s cubic-bezier(0.23,1,0.32,1)'}}>
        {/* Orbital rings — V4 has extra crosshair marks */}
        <div className="absolute inset-[-20%] pointer-events-none"
          style={{opacity:hov?1:0.3,transition:'opacity 0.7s'}}>
          <svg className="w-full h-full animate-[spin_15s_linear_infinite]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke={theme.p} strokeWidth="0.1" strokeDasharray="1 4"/>
            <circle cx="50" cy="50" r="44" fill="none" stroke={theme.p} strokeWidth="0.3" strokeDasharray="10 20"/>
          </svg>
          <svg className="absolute inset-0 w-full h-full animate-[spin_8s_linear_infinite_reverse]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="38" fill="none" stroke={theme.p} strokeWidth="0.05"/>
            {/* Crosshair marks — signature of v4 */}
            <path d="M50 2 L50 8 M50 92 L50 98 M2 50 L8 50 M92 50 L98 50" stroke={theme.p} strokeWidth="0.5"/>
          </svg>
        </div>
        {/* PBR metallic shell */}
        <div className="absolute inset-0 rounded-full border border-white/10"
          style={{background:'conic-gradient(from 45deg at 50% 50%,#050505,#1a1a1a,#050505,#1a1a1a,#050505)',
            boxShadow:`0 20px 50px rgba(0,0,0,0.8),inset 0 0 20px rgba(255,255,255,0.05),0 0 ${hov?'60px':'20px'} ${theme.glow}`,
            transition:'box-shadow 0.6s',transform:'translateZ(0px)'}}>
          {/* Rim lighting */}
          <div className="absolute inset-0 rounded-full border-[1.5px] border-white/20 blur-[0.5px] pointer-events-none"/>
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-50"/>
          {/* Specular sweep on hover */}
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent"
              style={{transform:`translateX(${hov?'200%':'-200%'}) skewX(12deg)`,transition:'transform 1.4s cubic-bezier(0.23,1,0.32,1)'}}/>
          </div>
        </div>
        {/* Glass refraction */}
        <div className="absolute inset-[8%] rounded-full border border-white/20 overflow-hidden"
          style={{backdropFilter:'blur(15px)',
            background:'radial-gradient(circle at 30% 30%,rgba(255,255,255,0.15),transparent 80%)',
            transform:`translateZ(25px) translateX(${p2.x}px) translateY(${p2.y}px)`,
            boxShadow:'inset 0 0 30px rgba(0,0,0,0.6),0 10px 30px rgba(0,0,0,0.5)',transition:'transform 0.7s'}}>
          {/* Fresnel edge */}
          <div className="absolute inset-0 rounded-full ring-[6px] ring-white/5 blur-[2px] opacity-40"/>
          {/* Holographic iridescence */}
          <div className="absolute inset-0 opacity-[0.07] mix-blend-screen bg-gradient-to-br from-blue-400 via-purple-400 to-amber-400 animate-pulse"/>
        </div>
        {/* Emissive icon Z-apex */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{transform:`translateZ(55px) translateX(${p3.x}px) translateY(${p3.y}px)`,transition:'transform 0.9s'}}>
          <div className="relative">
            <div className="absolute rounded-full" style={{inset:0,background:theme.p,filter:'blur(20px)',opacity:hov?0.75:0.5,transform:'scale(1.25)',transition:'opacity 0.6s'}}/>
            {Icon&&<Icon size={44} strokeWidth={1.5} className="relative z-10 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]"
              style={{filter:`drop-shadow(0 0 8px ${theme.em})`}}/>}
          </div>
        </div>
        {/* Subsurface key light */}
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] rounded-full pointer-events-none"
          style={{background:'rgba(255,255,255,0.2)',filter:'blur(25px)',opacity:hov?1:0,transition:'opacity 0.5s'}}/>
      </div>
      <div className="mt-12 text-center" style={{transform:`translateY(${hov?'6px':'0'})`,transition:'transform 0.5s'}}>
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="h-px w-6 bg-gradient-to-r from-transparent to-white/20"/>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">{item.category}</span>
          <div className="h-px w-6 bg-gradient-to-l from-transparent to-white/20"/>
        </div>
        <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em] transition-all"
          style={{color:hov?theme.p:undefined,textShadow:hov?`0 0 20px ${theme.glow} drop-shadow(0_0_10px_rgba(251,191,36,0.5))`:'none'}}>
          {item.title}
        </h3>
        <div className="mt-2 text-[8px] font-bold text-slate-600 tracking-widest"
          style={{opacity:hov?1:0,transition:'opacity 0.4s'}}>
          ID: {item.id} // VER: {item.version}
        </div>
      </div>
    </button>
  );
};

const ChatInterface = ({ persona, onExit }) => {
  const [messages,setMessages]=useState([{role:'ai',text:`Uplink established. System ID: ${persona.title}. Constitutional Builder mode active. Implementation Truth enforced.`}]);
  const [input,setInput]=useState(""); const [typing,setTyping]=useState(false); const scrollRef=useRef(null);
  useEffect(()=>{scrollRef.current?.scrollIntoView({behavior:'smooth'})},[messages,typing]);
  const send=async()=>{
    if(!input.trim()||typing)return; const msg=input.trim(); setInput("");
    setMessages(p=>[...p,{role:'user',text:msg}]); setTyping(true);
    try{const r=await callGemini(msg,persona.instruction);setMessages(p=>[...p,{role:'ai',text:r}]);}
    catch{setMessages(p=>[...p,{role:'ai',text:"Signal corrupted. Memory sync failed. Check Scar Registry."}]);}
    finally{setTyping(false);}
  };
  return(
    <div className="flex flex-col h-[550px] w-full bg-[#05070a]/95 backdrop-blur-[40px] rounded-[32px] border border-white/10 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_15px_#f59e0b] animate-pulse"/>
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Neural Sync: {persona.title}</span>
        </div>
        <button onClick={onExit} className="text-slate-600 hover:text-white transition-colors"><X size={20}/></button>
      </div>
      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        {messages.map((m,i)=>(
          <div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
            <div className={`max-w-[85%] p-5 rounded-3xl text-[13px] leading-relaxed ${m.role==='user'?'bg-amber-500/10 border border-amber-500/30 text-amber-200':'bg-white/[0.03] border border-white/5 text-slate-300 font-light'}`}>{m.text}</div>
          </div>
        ))}
        {typing&&<div className="text-[9px] text-amber-500/40 uppercase tracking-[0.5em] animate-pulse ml-2">Synthesizing Implementation Truth...</div>}
        <div ref={scrollRef}/>
      </div>
      <div className="p-8 border-t border-white/5">
        <div className="relative">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}
            placeholder="TYPE COMMAND (BMF-ENFORCED)..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-8 pr-16 text-[11px] tracking-[0.2em] text-white focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition-all placeholder:text-slate-700 font-bold"/>
          <button onClick={send} className="absolute right-5 top-1/2 -translate-y-1/2 text-amber-500 hover:text-white transition-colors"><Send size={24}/></button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [search,setSearch]=useState(""); const [sel,setSel]=useState(null);
  const [chat,setChat]=useState(null); const [mouse,setMouse]=useState({x:0,y:0});
  useEffect(()=>{const h=e=>setMouse({x:e.clientX,y:e.clientY});window.addEventListener('mousemove',h);return()=>window.removeEventListener('mousemove',h);},[]);
  const filtered=useMemo(()=>CELL_REGISTRY.filter(c=>c.title.toLowerCase().includes(search.toLowerCase())),[search]);
  return(
    <div className="min-h-screen bg-[#010204] text-slate-100 font-sans overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-amber-600/10 blur-[200px] rounded-full mix-blend-screen"/>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[200px] rounded-full"/>
        <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay" style={{backgroundImage:"url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')"}}/>
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)',backgroundSize:'60px 60px'}}/>
      </div>
      <div className="max-w-7xl mx-auto px-10 py-32 relative z-10">
        <header className="mb-48 flex flex-col items-center text-center space-y-12">
          <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-white/[0.03] border border-white/10 text-amber-500 text-[11px] font-black tracking-[0.8em] uppercase hover:bg-white/5 transition-all">
            <ShieldCheck size={16} className="animate-pulse"/> Gold Master Integrity Pipeline v4.0
          </div>
          <div className="relative" style={{transform:`rotateY(${(mouse.x-window.innerWidth/2)*0.004}deg)`,transition:'transform 0.1s linear'}}>
            <h1 className="font-black tracking-tighter text-white leading-[0.75] select-none" style={{fontSize:'clamp(6rem,14vw,14rem)'}}>
              NATT<span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/10">.OS</span>
            </h1>
            {/* Shimmer on logo */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-[shimmer_10s_infinite] pointer-events-none"/>
            {/* Chromatic aberration */}
            <div className="absolute inset-0 font-black tracking-tighter leading-[0.75] text-red-500/[0.02] pointer-events-none select-none" style={{fontSize:'clamp(6rem,14vw,14rem)',transform:'translate(2px,2px)'}}>NATT.OS</div>
            <div className="h-[2px] w-full max-w-4xl mx-auto mt-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"/>
          </div>
          <div className="max-w-2xl space-y-4">
            <p className="text-slate-500 text-sm font-bold tracking-[0.4em] uppercase opacity-70">
              Hệ thống thực thể số đa tầng<br/><span className="text-white/80 font-black">"Implementation Truth Enforced"</span>
            </p>
            <p className="text-[9px] text-slate-700 tracking-[0.2em] font-mono">BMF v1.5.0 // SCAR-001 MEMORY SYNCED // NO EMPTY FOLDERS</p>
          </div>
          <div className="w-full max-w-lg relative group mt-16">
            <div className="absolute inset-0 bg-amber-500/10 blur-[30px] rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity"/>
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-amber-500 transition-colors" size={24}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="SEARCHING SYSTEM REGISTRY..."
              className="w-full bg-white/[0.02] border border-white/10 rounded-[40px] py-7 pl-20 pr-10 text-[12px] font-black tracking-[0.5em] text-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-all backdrop-blur-3xl placeholder:text-slate-800"/>
          </div>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-20 gap-y-32 justify-items-center mb-60">
          {filtered.map(item=><Medal key={item.id} item={item} mousePos={mouse} onClick={c=>{if(c.category==='AI Entities')setChat(c);else setSel(c);}}/>)}
        </div>
        <footer className="mt-80 pt-32 border-t border-white/5 pb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20 items-center">
            <div className="space-y-4 text-center md:text-left">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">Pipeline Architecture</p>
              <div className="flex gap-4 justify-center md:justify-start">
                <div className="px-3 py-1 bg-white/5 border border-white/5 rounded text-[8px] font-bold text-slate-400">PBR_RENDER_V4</div>
                <div className="px-3 py-1 bg-white/5 border border-white/5 rounded text-[8px] font-bold text-slate-400">ACES_TONE_MAPPING</div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-10">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 border border-amber-500/20 rounded-full animate-ping"/>
                <Fingerprint className="text-amber-500/40" size={32}/>
              </div>
              <p className="text-[11px] font-black text-white/40 uppercase tracking-[1.5em] ml-[1.5em] whitespace-nowrap">NATT-OS INTEGRITY ENFORCED</p>
            </div>
            <div className="text-center md:text-right space-y-2">
              <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">BMF System Status: STABLE</p>
              <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest leading-loose">
                Code Density: 5200+ Thoughts<br/>Implementation Truth: 100%
              </p>
            </div>
          </div>
        </footer>
      </div>
      {sel&&(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-12">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={()=>setSel(null)}/>
          <div className="relative w-full max-w-3xl bg-[#080a0d] border border-white/10 rounded-[60px] overflow-hidden shadow-[0_0_150px_rgba(0,0,0,1)]">
            <div className="p-16 md:p-24 space-y-12">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <span className="text-amber-500 text-[10px] font-black tracking-[0.6em] uppercase">System Artifact // {sel.id}</span>
                  <h2 className="text-6xl font-black text-white uppercase tracking-tighter">{sel.title}</h2>
                </div>
                <button onClick={()=>setSel(null)} className="p-4 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X size={32}/></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-6">
                  <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.3em]">Core Intent</p>
                  <p className="text-slate-300 text-xl leading-relaxed font-light">{sel.desc}</p>
                </div>
                <div className="space-y-6">
                  <div className="p-8 rounded-[30px] bg-white/[0.02] border border-white/5">
                    <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-3">Compliance Phase</p>
                    <p className="text-white text-lg font-bold uppercase">{sel.status}</p>
                  </div>
                  <div className="p-8 rounded-[30px] bg-white/[0.02] border border-white/5">
                    <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-3">Manifest Version</p>
                    <p className="text-white text-lg font-bold">v{sel.version}</p>
                  </div>
                </div>
              </div>
              <div className="pt-10 flex gap-6">
                <button className="px-10 py-5 bg-white text-black font-black text-xs uppercase tracking-[0.3em] rounded-full hover:bg-amber-500 transition-all">Execute Core</button>
                <button className="px-10 py-5 bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-[0.3em] rounded-full hover:bg-white/10 transition-all">Audit Trails</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {chat&&(
        <div className="fixed bottom-12 right-12 z-[250] w-[450px]">
          <ChatInterface persona={chat} onExit={()=>setChat(null)}/>
        </div>
      )}
    </div>
  );
}
APPEOF

echo "  [1/2] Installing..."; npm install --silent 2>&1 | tail -2
echo ""
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✓  NATT-OS v4 (11 cells) — DEPLOYED"
echo "  → http://localhost:5173"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  [2/2] Launching..."; npm run dev
