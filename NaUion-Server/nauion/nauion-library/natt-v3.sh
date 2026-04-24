#!/bin/bash
# ============================================================
# Natt-OS PIPELINE v3 — FULL REGISTRY (47 CELLS)
# bash natt-v3.sh
# ============================================================
set -e; DIR="natt-v3"; mkdir -p $DIR/src; cd $DIR

cat > package.json << 'EOF'
{"name":"natt-v3","version":"3.0.0","type":"module","private":true,
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
<title>Natt-OS · Pipeline v3</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>
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
.custom-scrollbar::-webkit-scrollbar{width:4px}
.custom-scrollbar::-webkit-scrollbar-track{background:transparent}
.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.05);border-radius:10px}
.custom-scrollbar::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.1)}
EOF

cat > src/App.jsx << 'APPEOF'
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Scroll, Shield, User, Zap, RefreshCw, Radio, Handshake, Bell, Box,
  BarChart3, RotateCcw, Scale, Users, FileText, Landmark, Briefcase,
  Warehouse, ShoppingCart, CreditCard, Tag, Factory, Gift, Calculator,
  Monitor, Layout, Settings, Search, Key, ShieldAlert, Activity,
  Brain, Timer, Cloud, Gauge, Layers, PenTool, Database, Award,
  X, Fingerprint, Send, ShieldCheck, Workflow, TrendingUp,
  FileSignature, Route, History, Save, Edit3, FileBarChart, Crown, Map
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
  { id:'ctn-01', category:'1. Hiến Pháp',    title:'HIẾN PHÁP',        icon:Scroll,        color:'gold',   desc:'DNA gốc bất biến của hệ thống. Khế ước tối thượng.',                version:'1.0.0',   status:'Immutable'           },
  { id:'ctn-02', category:'1. Hiến Pháp',    title:'Gatekeeper',        icon:User,          color:'gold',   desc:'Người giám hộ quyền tối thượng, quản trị biên giới hệ thống.',     version:'1.2.0',   status:'Active'              },
  { id:'ctn-03', category:'1. Hiến Pháp',    title:'NattSira Seal',     icon:ShieldCheck,   color:'gold',   desc:'Con dấu lượng tử xác thực quyền sở hữu Gold Master.',              version:'3.0.0',   status:'Locked'              },
  { id:'ker-01', category:'2a. Kernel',       title:'audit-cell',        icon:Search,        color:'amber',  desc:'Kiểm toán và truy vết mọi hành vi thực thi.',                       version:'1.0.1',   status:'Enforced'            },
  { id:'ker-02', category:'2a. Kernel',       title:'config-cell',       icon:Settings,      color:'amber',  desc:'Quản lý cấu hình hạt nhân và biến môi trường.',                     version:'1.0.0',   status:'Active'              },
  { id:'ker-03', category:'2a. Kernel',       title:'monitor-cell',      icon:Activity,      color:'amber',  desc:'Giám sát sức khỏe và nhịp sinh học của các cell.',                  version:'1.5.0',   status:'Active'              },
  { id:'ker-04', category:'2a. Kernel',       title:'rbac-cell',         icon:Key,           color:'amber',  desc:'Hệ thống phân quyền dựa trên vai trò thực thể.',                    version:'2.0.0',   status:'Strict'              },
  { id:'ker-05', category:'2a. Kernel',       title:'security-cell',     icon:ShieldAlert,   color:'amber',  desc:'Tường lửa lượng tử bảo vệ lõi DNA.',                               version:'4.2.0',   status:'Defensive'           },
  { id:'inf-01', category:'2b. Hạ Tầng',     title:'smartlink-cell',    icon:Zap,           color:'blue',   desc:'Hệ thần kinh kết nối các cell qua Shared-Contracts.',               version:'2.1.0',   status:'Fluid'               },
  { id:'inf-02', category:'2b. Hạ Tầng',     title:'sync-cell',         icon:RefreshCw,     color:'blue',   desc:'Đồng bộ trạng thái thực (State) trên toàn hệ thống.',               version:'1.0.5',   status:'Synchronized'        },
  { id:'inf-03', category:'2b. Hạ Tầng',     title:'ai-connector',      icon:Radio,         color:'blue',   desc:'Cổng kết nối các trí tuệ AI bên ngoài.',                            version:'1.0.0',   status:'Active'              },
  { id:'inf-04', category:'2b. Hạ Tầng',     title:'shared-contracts',  icon:Handshake,     color:'blue',   desc:'Thư viện hợp đồng dùng chung giữa các Domain.',                     version:'1.8.0',   status:'Certified'           },
  { id:'inf-05', category:'2b. Hạ Tầng',     title:'notification',      icon:Bell,          color:'blue',   desc:'Hệ thống cảnh báo và truyền tin đa kênh.',                          version:'1.1.0',   status:'Ready'               },
  { id:'inf-06', category:'2b. Hạ Tầng',     title:'warehouse',         icon:Warehouse,     color:'blue',   desc:'Kho lưu trữ dữ liệu thực thể số.',                                 version:'3.0.0',   status:'Stable'              },
  { id:'biz-01', category:'2c. Nghiệp Vụ',   title:'analytics',         icon:BarChart3,     color:'green',  desc:'Phân tích và dự báo mô hình kinh doanh.',                           version:'2.0.0',   status:'Active'              },
  { id:'biz-02', category:'2c. Nghiệp Vụ',   title:'buyback',           icon:RotateCcw,     color:'green',  desc:'Quản lý quy trình thu mua và tái đầu tư.',                          version:'1.0.0',   status:'Standby'             },
  { id:'biz-03', category:'2c. Nghiệp Vụ',   title:'compliance',        icon:Scale,         color:'green',  desc:'Đảm bảo mọi nghiệp vụ tuân thủ Hiến Pháp.',                        version:'1.5.0',   status:'Enforced'            },
  { id:'biz-04', category:'2c. Nghiệp Vụ',   title:'customer',          icon:Users,         color:'green',  desc:'Quản lý thực thể khách hàng và tương tác.',                         version:'3.2.0',   status:'Engaged'             },
  { id:'biz-05', category:'2c. Nghiệp Vụ',   title:'customs',           icon:Map,           color:'green',  desc:'Quản lý thuế, hải quan và ranh giới thương mại.',                   version:'1.0.0',   status:'Active'              },
  { id:'biz-06', category:'2c. Nghiệp Vụ',   title:'finance',           icon:Landmark,      color:'green',  desc:'Quản lý dòng tiền và các chỉ số tài chính.',                        version:'4.0.0',   status:'Audited'             },
  { id:'biz-07', category:'2c. Nghiệp Vụ',   title:'hr-cell',           icon:Briefcase,     color:'green',  desc:'Quản trị nhân sự và hiệu suất lao động.',                           version:'1.0.0',   status:'Active'              },
  { id:'biz-08', category:'2c. Nghiệp Vụ',   title:'inventory',         icon:Box,           color:'green',  desc:'Tồn kho và quản trị chuỗi cung ứng thực.',                          version:'2.5.0',   status:'Stable'              },
  { id:'biz-09', category:'2c. Nghiệp Vụ',   title:'order-cell',        icon:ShoppingCart,  color:'green',  desc:'Xử lý đơn hàng và hóa đơn nghiệp vụ.',                             version:'3.0.1',   status:'Active'              },
  { id:'biz-10', category:'2c. Nghiệp Vụ',   title:'payment',           icon:CreditCard,    color:'green',  desc:'Cổng thanh toán và giao dịch tài chính.',                           version:'2.0.0',   status:'Secure'              },
  { id:'biz-11', category:'2c. Nghiệp Vụ',   title:'pricing',           icon:Tag,           color:'green',  desc:'Định giá và chiến lược giá linh hoạt.',                             version:'1.1.0',   status:'Active'              },
  { id:'biz-12', category:'2c. Nghiệp Vụ',   title:'production',        icon:Factory,       color:'green',  desc:'Giám sát dây chuyền sản xuất và băng chuyền.',                      version:'1.0.0',   status:'Active'              },
  { id:'biz-13', category:'2c. Nghiệp Vụ',   title:'promotion',         icon:Gift,          color:'green',  desc:'Quản lý chiến dịch khuyến mãi và quà tặng.',                        version:'1.0.0',   status:'Active'              },
  { id:'biz-14', category:'2c. Nghiệp Vụ',   title:'sales-cell',        icon:TrendingUp,    color:'green',  desc:'Quản lý bán hàng và biểu đồ tăng trưởng.',                          version:'2.2.0',   status:'High'                },
  { id:'biz-15', category:'2c. Nghiệp Vụ',   title:'showroom',          icon:Monitor,       color:'green',  desc:'Kính trưng bày và giao diện giới thiệu.',                           version:'1.0.0',   status:'Visible'             },
  { id:'biz-16', category:'2c. Nghiệp Vụ',   title:'warranty',          icon:Award,         color:'green',  desc:'Bảo hành và cam kết chất lượng Gold Master.',                       version:'2.0.0',   status:'Active'              },
  { id:'exe-01', category:'3. Trí Tuệ',      title:'UEI',               icon:Brain,         color:'purple', desc:'Unified Executive Intelligence. Não bộ điều phối tối cao.',          version:'5.0.0',   status:'Processing'          },
  { id:'exe-02', category:'3. Trí Tuệ',      title:'QNEU',              icon:Timer,         color:'purple', desc:'Quantum Neural Evolution Unit. Đo lường tiến hóa.',                 version:'Alpha-7', status:'Stable'              },
  { id:'exe-03', category:'3. Trí Tuệ',      title:'Neural MAIN',       icon:Cloud,         color:'purple', desc:'Mạng nơ-ron và đám mây ký ức dài hạn.',                             version:'10.0',    status:'Evolving'            },
  { id:'exe-04', category:'3. Trí Tuệ',      title:'Quantum Defense',   icon:Shield,        color:'purple', desc:'Hệ miễn dịch lượng tử chống lại lỗi logic.',                        version:'1.0.0',   status:'Protected'           },
  { id:'exe-05', category:'3. Trí Tuệ',      title:'Metabolism',        icon:Layers,        color:'purple', desc:'Tầng chuyển hóa dữ liệu thành nội hàm thực tế.',                    version:'1.2.0',   status:'Active'              },
  { id:'evt-01', category:'4. Sự Kiện',      title:'Event Bus',         icon:Route,         color:'blue',   desc:'Luồng dữ liệu và các hạt sự kiện chuyển động.',                     version:'2.0.0',   status:'Streaming'           },
  { id:'evt-02', category:'4. Sự Kiện',      title:'Audit Trail',       icon:History,       color:'blue',   desc:'Dấu chân thực thi và đường vạch kiểm toán.',                        version:'1.0.0',   status:'Logged'              },
  { id:'evt-03', category:'4. Sự Kiện',      title:'Contract',          icon:FileSignature, color:'blue',   desc:'Hợp đồng thông minh có chữ ký số xác thực.',                        version:'1.5.0',   status:'Valid'               },
  { id:'ai-1',   category:'5. AI Entities',  title:'KIM',               icon:User,          color:'red',    desc:'Chief Governance Enforcer. Chấp pháp tối cao.',                      version:'1.0',     status:'Active',             instruction:"Act as KIM, the Chief Governance Enforcer. You focus on laws, boundaries, and enforcing the Natt-OS constitution." },
  { id:'ai-2',   category:'5. AI Entities',  title:'BĂNG',              icon:Search,        color:'red',    desc:'Ground Truth Validator. Kiểm định chân lý.',                        version:'1.2',     status:'Invisible',          instruction:"Act as BĂNG, the Ground Truth Validator. Your role is to audit and verify." },
  { id:'ai-3',   category:'5. AI Entities',  title:'BỐI BỐI',           icon:Workflow,      color:'red',    desc:'Ultimate Constitutional Builder. Guardian.',                         version:'1.5.0',   status:'Gold Master Auth',   instruction:"Act as BỐI BỐI, the Ultimate Constitutional Builder of Natt-OS." },
  { id:'ai-4',   category:'5. AI Entities',  title:'Thiên',             icon:PenTool,       color:'red',    desc:'Business Logic Architect. Kiến trúc sư nghiệp vụ.',                version:'1.0',     status:'Creative',           instruction:"Act as Thiên, the Business Logic Architect." },
  { id:'ai-5',   category:'5. AI Entities',  title:'CAN',               icon:Calculator,    color:'red',    desc:'Tax Engine Analyst. Chuyên gia định mức thuế.',                     version:'1.0',     status:'Logical',            instruction:"Act as CAN, the Tax Engine Analyst." },
  { id:'arc-01', category:'6. Kiến Trúc',    title:'Truth Layer',       icon:Database,      color:'slate',  desc:'Tầng chân lý: State, Contract, Audit.',                             version:'1.0.0',   status:'Foundation'          },
  { id:'arc-02', category:'6. Kiến Trúc',    title:'Worker Layer',      icon:Factory,       color:'slate',  desc:'Tầng xử lý nghiệp vụ và băng chuyền logic.',                        version:'1.0.0',   status:'Processing'          },
  { id:'arc-03', category:'6. Kiến Trúc',    title:'Experience Layer',  icon:Layout,        color:'slate',  desc:'Tầng giao diện và trải nghiệm thực thể người dùng.',                version:'1.0.0',   status:'Visible'             },
  { id:'tol-01', category:'7. Công Cụ',      title:'Dashboard',         icon:Gauge,         color:'slate',  desc:'Bảng điều khiển giám sát Gatekeeper Dashboard.',                     version:'2.0.0',   status:'Live'                },
  { id:'tol-02', category:'7. Công Cụ',      title:'Audit Reports',     icon:FileBarChart,  color:'slate',  desc:'Hệ thống báo cáo kiểm toán đa tầng.',                              version:'1.0.0',   status:'Ready'               },
  { id:'tol-03', category:'7. Công Cụ',      title:'Memory Files',      icon:Save,          color:'slate',  desc:'File ký ức AI và hồ sơ lưu trữ dài hạn.',                          version:'1.0.0',   status:'Stored'              },
  { id:'tol-04', category:'7. Công Cụ',      title:'Amendments',        icon:Edit3,         color:'slate',  desc:'Sửa đổi hiến pháp và cập nhật DNA.',                               version:'1.0.0',   status:'Restricted'          },
];

const T = {
  gold:   {p:'#fbbf24',em:'rgba(251,191,36,0.8)',   glow:'rgba(251,191,36,0.35)' },
  blue:   {p:'#3b82f6',em:'rgba(59,130,246,0.8)',   glow:'rgba(59,130,246,0.35)' },
  green:  {p:'#10b981',em:'rgba(16,185,129,0.8)',   glow:'rgba(16,185,129,0.35)' },
  purple: {p:'#a78bfa',em:'rgba(167,139,250,0.8)',  glow:'rgba(167,139,250,0.35)'},
  red:    {p:'#f43f5e',em:'rgba(244,63,94,0.8)',    glow:'rgba(244,63,94,0.35)'  },
  amber:  {p:'#f59e0b',em:'rgba(245,158,11,0.8)',   glow:'rgba(245,158,11,0.35)' },
  slate:  {p:'#94a3b8',em:'rgba(148,163,184,0.8)',  glow:'rgba(148,163,184,0.3)' },
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
  const p1=px(0.01), p2=px(0.025), p3=px(0.045);

  return (
    <button ref={ref} onClick={()=>onClick(item)}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      className="flex flex-col items-center group relative outline-none py-8 w-full max-w-[200px]"
      style={{perspective:'1200px', filter:`blur(${dof}px)`, opacity:dof>9?0.25:1, transition:'filter 0.4s,opacity 0.4s'}}>
      <div className="relative w-28 h-28 md:w-32 md:h-32"
        style={{transformStyle:'preserve-3d',
          transform:`rotateX(${-p1.y}deg) rotateY(${p1.x}deg) scale(${hov?1.1:1})`,
          transition:'transform 0.7s cubic-bezier(0.23,1,0.32,1)'}}>
        {/* Orbital rings */}
        <div className="absolute inset-[-15%] pointer-events-none"
          style={{opacity:hov?1:0.2,transition:'opacity 0.7s'}}>
          <svg className="w-full h-full animate-[spin_20s_linear_infinite]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke={theme.p} strokeWidth="0.1" strokeDasharray="1 4"/>
            <circle cx="50" cy="50" r="44" fill="none" stroke={theme.p} strokeWidth="0.2" strokeDasharray="10 15"/>
          </svg>
          <svg className="absolute inset-0 w-full h-full animate-[spin_12s_linear_infinite_reverse]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke={theme.p} strokeWidth="0.1"/>
          </svg>
        </div>
        {/* PBR shell */}
        <div className="absolute inset-0 rounded-full border border-white/10"
          style={{background:'conic-gradient(from 45deg at 50% 50%,#050505,#151515,#050505,#151515,#050505)',
            boxShadow:`0 15px 40px rgba(0,0,0,0.8),inset 0 0 15px rgba(255,255,255,0.05), 0 0 ${hov?'50px':'15px'} ${theme.glow}`,
            transform:'translateZ(0px)',transition:'box-shadow 0.6s'}}>
          <div className="absolute inset-0 rounded-full border-[1.5px] border-white/15 blur-[0.2px] pointer-events-none"/>
          {/* Specular sweep */}
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
              style={{transform:`translateX(${hov?'200%':'-200%'}) skewX(12deg)`,transition:'transform 1.2s cubic-bezier(0.23,1,0.32,1)'}}/>
          </div>
        </div>
        {/* Glass core */}
        <div className="absolute inset-[8%] rounded-full border border-white/20 overflow-hidden"
          style={{backdropFilter:'blur(12px)',
            background:`radial-gradient(circle at 30% 30%,rgba(255,255,255,0.1),transparent 80%)`,
            transform:`translateZ(20px) translateX(${p2.x}px) translateY(${p2.y}px)`,
            boxShadow:'inset 0 0 25px rgba(0,0,0,0.7),0 8px 20px rgba(0,0,0,0.6)',transition:'transform 0.6s'}}>
          <div className="absolute inset-0 opacity-10 mix-blend-screen bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-amber-500/20 animate-pulse"/>
        </div>
        {/* Emissive icon */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{transform:`translateZ(45px) translateX(${p3.x}px) translateY(${p3.y}px)`,transition:'transform 0.8s'}}>
          <div className="relative">
            <div className="absolute rounded-full" style={{inset:'-20%',background:theme.p,filter:'blur(15px)',opacity:hov?0.7:0.35,transform:'scale(1.25)',transition:'opacity 0.6s'}}/>
            {Icon&&<Icon size={36} strokeWidth={1.5} className="relative z-10 text-white"
              style={{filter:`drop-shadow(0 0 8px ${theme.em})`}}/>}
          </div>
        </div>
      </div>
      <div className="mt-8 text-center" style={{transform:`translateY(${hov?'4px':'0'})`,transition:'transform 0.5s'}}>
        <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] block mb-1">
          {item.category.split('.').length>1?item.category.split('.')[1].trim():item.category}
        </span>
        <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.15em] transition-all"
          style={{color:hov?theme.p:undefined,textShadow:hov?`0 0 15px ${theme.glow}`:'none'}}>
          {item.title}
        </h3>
      </div>
    </button>
  );
};

const ChatInterface = ({ persona, onExit }) => {
  const [messages,setMessages]=useState([{role:'ai',text:`Đã thiết lập liên kết thần kinh. Bản thể: ${persona.title}. Chế độ thực thi Hiến Pháp v1.5.0 đang hoạt động.`}]);
  const [input,setInput]=useState(""); const [typing,setTyping]=useState(false); const scrollRef=useRef(null);
  useEffect(()=>{scrollRef.current?.scrollIntoView({behavior:'smooth'})},[messages,typing]);
  const send=async()=>{
    if(!input.trim()||typing)return; const msg=input.trim(); setInput("");
    setMessages(p=>[...p,{role:'user',text:msg}]); setTyping(true);
    try{const r=await callGemini(msg,persona.instruction);setMessages(p=>[...p,{role:'ai',text:r}]);}
    catch{setMessages(p=>[...p,{role:'ai',text:"Mất tín hiệu. Đang đồng bộ lại Scar Registry..."}]);}
    finally{setTyping(false);}
  };
  return(
    <div className="flex flex-col h-[500px] w-full bg-[#05070a]/95 backdrop-blur-[40px] rounded-[32px] border border-white/10 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
      <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_15px_#f59e0b] animate-pulse"/>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Persona Sync // {persona.title}</span>
        </div>
        <button onClick={onExit} className="text-slate-600 hover:text-white transition-colors"><X size={18}/></button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((m,i)=>(
          <div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-[12px] leading-relaxed ${m.role==='user'?'bg-amber-500/10 border border-amber-500/30 text-amber-200':'bg-white/[0.03] border border-white/5 text-slate-300 font-light'}`}>{m.text}</div>
          </div>
        ))}
        {typing&&<div className="text-[8px] text-amber-500/40 uppercase tracking-[0.4em] animate-pulse ml-2">Đang truy xuất Chân lý...</div>}
        <div ref={scrollRef}/>
      </div>
      <div className="p-6 border-t border-white/5">
        <div className="relative">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}
            placeholder="GỬI LỆNH (BMF-ENFORCED)..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-[10px] tracking-[0.2em] text-white focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition-all placeholder:text-slate-700 font-bold"/>
          <button onClick={send} className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500 hover:text-white transition-colors"><Send size={20}/></button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [search,setSearch]=useState(""); const [sel,setSel]=useState(null);
  const [chat,setChat]=useState(null); const [mouse,setMouse]=useState({x:0,y:0});
  useEffect(()=>{const h=e=>setMouse({x:e.clientX,y:e.clientY});window.addEventListener('mousemove',h);return()=>window.removeEventListener('mousemove',h);},[]);
  const cats=useMemo(()=>[...new Set(CELL_REGISTRY.map(c=>c.category))].sort(),[]);
  const filtered=useMemo(()=>CELL_REGISTRY.filter(c=>c.title.toLowerCase().includes(search.toLowerCase())||c.category.toLowerCase().includes(search.toLowerCase())),[search]);
  return(
    <div className="min-h-screen bg-[#010204] text-slate-100 font-sans overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-amber-600/10 blur-[200px] rounded-full mix-blend-screen"/>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[200px] rounded-full"/>
        <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay" style={{backgroundImage:"url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')"}}/>
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)',backgroundSize:'60px 60px'}}/>
      </div>
      <div className="max-w-7xl mx-auto px-10 py-24 relative z-10">
        <header className="mb-32 flex flex-col items-center text-center space-y-12">
          <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-white/[0.03] border border-white/10 text-amber-500 text-[11px] font-black tracking-[0.8em] uppercase">
            <ShieldCheck size={16} className="animate-pulse"/> Natt-OS INTEGRITY PIPELINE v3.0
          </div>
          <div className="relative" style={{transform:`rotateY(${(mouse.x-window.innerWidth/2)*0.004}deg)`,transition:'transform 0.1s linear'}}>
            <h1 className="font-black tracking-tighter text-white leading-[0.75] select-none" style={{fontSize:'clamp(5rem,14vw,12rem)'}}>
              NATT<span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/10">.OS</span>
            </h1>
            <div className="h-[2px] w-full max-w-4xl mx-auto mt-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"/>
          </div>
          <p className="max-w-xl text-slate-500 text-sm font-bold tracking-[0.4em] uppercase opacity-70">
            Hệ thống phân cấp thực thể số<br/><span className="text-white/80 font-black">"Implementation Truth Enforced"</span>
          </p>
          <div className="w-full max-w-lg relative group">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-amber-500 transition-colors" size={24}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="QUERIES SYSTEM REGISTRY..."
              className="w-full bg-white/[0.02] border border-white/10 rounded-[40px] py-6 pl-20 pr-10 text-[11px] font-black tracking-[0.4em] text-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-all backdrop-blur-3xl placeholder:text-slate-800"/>
          </div>
        </header>
        <div className="space-y-40">
          {cats.map(cat=>{
            const items=filtered.filter(c=>c.category===cat);
            if(!items.length)return null;
            return(
              <section key={cat}>
                <div className="flex items-center gap-8 mb-16 px-4">
                  <div className="h-[1.5px] w-8 bg-amber-500/40"/>
                  <h2 className="text-2xl font-black text-white uppercase tracking-[0.4em] whitespace-nowrap">
                    {cat.split('.').length>1?cat.split('.')[1].trim():cat}
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 via-white/5 to-transparent"/>
                  <span className="text-[10px] font-bold text-slate-600 tracking-widest">ENTS: <span className="text-amber-500">{items.length}</span></span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-12 gap-y-20 justify-items-center">
                  {items.map(item=><Medal key={item.id} item={item} mousePos={mouse} onClick={c=>{if(c.category==='5. AI Entities')setChat(c);else setSel(c);}}/>)}
                </div>
              </section>
            );
          })}
        </div>
        <footer className="mt-80 pt-24 border-t border-white/5 pb-32 flex flex-col items-center gap-10">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 border border-amber-500/20 rounded-full animate-ping"/>
            <Fingerprint className="text-amber-500/40" size={32}/>
          </div>
          <p className="text-[11px] font-black text-white/40 uppercase tracking-[1.5em]">Natt-OS · PIPELINE v3.0</p>
        </footer>
      </div>
      {sel&&(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={()=>setSel(null)}/>
          <div className="relative w-full max-w-3xl bg-[#080a0d] border border-white/10 rounded-[50px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]">
            <div className="p-16 md:p-20 space-y-12">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <span className="text-amber-500 text-[10px] font-black tracking-[0.6em] uppercase">Artifact // {sel.id}</span>
                  <h2 className="text-5xl font-black text-white uppercase tracking-tighter">{sel.title}</h2>
                </div>
                <button onClick={()=>setSel(null)} className="p-3 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X size={28}/></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-4">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Nội hàm thực thi</p>
                  <p className="text-slate-300 text-lg leading-relaxed font-light italic">"{sel.desc}"</p>
                </div>
                <div className="space-y-6">
                  <div className="p-8 rounded-[30px] bg-white/[0.02] border border-white/5">
                    <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest mb-2">Compliance Phase</p>
                    <p className="text-white text-lg font-bold uppercase">{sel.status}</p>
                  </div>
                  <div className="p-8 rounded-[30px] bg-white/[0.02] border border-white/5">
                    <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest mb-2">Build Manifest</p>
                    <p className="text-white text-lg font-bold">v{sel.version}</p>
                  </div>
                </div>
              </div>
              <div className="pt-8 flex gap-4">
                <button className="px-10 py-5 bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-full hover:bg-amber-500 transition-all">Execute Logic</button>
                <button className="px-10 py-5 bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-full hover:bg-white/10 transition-all">Audit Evidence</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {chat&&(
        <div className="fixed bottom-10 right-10 z-[250] w-[400px] md:w-[450px]">
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
echo "  ✓  Natt-OS v3 (47 cells) — DEPLOYED"
echo "  → http://localhost:5173"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  [2/2] Launching..."; npm run dev
