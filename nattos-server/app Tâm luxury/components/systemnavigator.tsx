
import React, { useState, useEffect } from 'react';
import { ViewType, WorkflowNode, WorkflowEdge } from '../types';
import { EventBridge } from '../services/eventBridge';

interface SystemNavigatorProps {
  setActiveView: (view: ViewType) => void;
}

const SystemNavigator: React.FC<SystemNavigatorProps> = ({ setActiveView }) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [activePulse, setActivePulse] = useState<string | null>(null);

  // Subscribe to Event Bridge to visualize flow
  useEffect(() => {
    // Khi có event Sales -> Pulse Sales Node
    const unsubSales = EventBridge.subscribe('SALES_ORDER_created', () => {
        setActivePulse('SALES');
        setTimeout(() => setActivePulse(null), 2000);
    });
    const unsubInv = EventBridge.subscribe('INVENTORY_CHECKED', () => {
        setActivePulse('WAREHOUSE');
        setTimeout(() => setActivePulse(null), 2000);
    });
    const unsubArchive = EventBridge.subscribe('ARCHIVE_SEALED', () => {
        setActivePulse('FINANCE'); // Finance/Archive linked
        setTimeout(() => setActivePulse(null), 3000);
    });

    return () => {
        unsubSales();
        unsubInv();
        unsubArchive();
    };
  }, []);

  // Nodes Configuration
  const nodes: WorkflowNode[] = [
    { id: 'SHOWROOM', label: 'LUXURY SHOWROOM', view: ViewType.showroom, x: 10, y: 50, color: 'amber', icon: '💎', desc: 'Điểm chạm khách hàng. Khởi tạo đơn hàng & RFQ.', status: 'ACTIVE' },
    { id: 'SALES', label: 'SALES TERMINAL', view: ViewType.sales_terminal, x: 30, y: 50, color: 'indigo', icon: '💳', desc: 'Xử lý đơn hàng, tính hoa hồng, tạo yêu cầu xuất kho.', status: 'ACTIVE' },
    { id: 'WAREHOUSE', label: 'KHO TỔNG', view: ViewType.warehouse, x: 50, y: 30, color: 'blue', icon: '🏰', desc: 'Quản lý tồn kho đa điểm (HCM-HN). Xuất/Nhập/Điều chuyển.', status: 'IDLE' },
    { id: 'PRODUCTION', label: 'XƯỞNG SẢN XUẤT', view: ViewType.production_manager, x: 50, y: 70, color: 'purple', icon: '⚒️', desc: 'Chế tác, đúc, gắn đá. Quản lý hao hụt & SNT.', status: 'ACTIVE' },
    { id: 'LOGISTICS', label: 'GIAO VẬN', view: ViewType.ops_terminal, x: 70, y: 50, color: 'cyan', icon: '🚢', desc: 'Kết nối đơn vị vận chuyển (GHN/VTP). Theo dõi hành trình.', status: 'IDLE' },
    { id: 'FINANCE', label: 'TÀI CHÍNH & VAULT', view: ViewType.data_archive, x: 90, y: 50, color: 'green', icon: '🏦', desc: 'Đối soát dòng tiền, xuất hóa đơn điện tử, lưu trữ vĩnh cửu.', status: 'ACTIVE' }
  ];

  // Edges
  const edges: WorkflowEdge[] = [
    { from: 'SHOWROOM', to: 'SALES', label: 'RFQ', active: true },
    { from: 'SALES', to: 'WAREHOUSE', label: 'Check Stock', active: true },
    { from: 'SALES', to: 'PRODUCTION', label: 'Custom Order', active: true },
    { from: 'WAREHOUSE', to: 'LOGISTICS', label: 'Packing', active: false },
    { from: 'PRODUCTION', to: 'WAREHOUSE', label: 'Finished Goods', active: true },
    { from: 'LOGISTICS', to: 'FINANCE', label: 'COD & Docs', active: false },
    { from: 'SALES', to: 'FINANCE', label: 'Revenue', active: true }
  ];

  // Render curved lines
  const renderPath = (start: WorkflowNode, end: WorkflowNode, active: boolean) => {
    const midX = (start.x + end.x) / 2;
    const d = `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`;
    return (
      <path 
        d={d}
        fill="none"
        stroke={active ? "url(#flowGradient)" : "#374151"}
        strokeWidth="2"
        strokeDasharray={active ? "5,5" : "0"}
        className={active ? "animate-[dash_1s_linear_infinite]" : ""}
        vectorEffect="non-scaling-stroke"
      />
    );
  };

  return (
    <div className="h-full bg-transparent p-8 overflow-hidden flex flex-col animate-in fade-in duration-700 relative">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      <header className="mb-8 relative z-10 flex justify-between items-end">
        <div>
           <h2 className="ai-headline text-5xl italic uppercase tracking-tighter">Bản Đồ Long Mạch Số</h2>
           <p className="ai-sub-headline text-indigo-400 mt-2 font-black tracking-[0.3em]">Live Workflow Orchestration • Real-time Pulse</p>
        </div>
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
           <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">System Online</span>
        </div>
      </header>

      <div className="flex-1 relative rounded-[3rem] border border-white/5 bg-black/40 shadow-2xl overflow-hidden backdrop-blur-sm group/container">
         <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
               <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4b5563" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#4b5563" />
               </linearGradient>
            </defs>
            {edges.map((edge, i) => {
               const start = nodes.find(n => n.id === edge.from)!;
               const end = nodes.find(n => n.id === edge.to)!;
               return <g key={i}>{renderPath(start, end, !!edge.active)}</g>;
            })}
         </svg>

         {nodes.map(node => (
            <div 
               key={node.id}
               className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 flex flex-col items-center group"
               style={{ left: `${node.x}%`, top: `${node.y}%` }}
               onClick={() => setActiveView(node.view as string)}
               onMouseEnter={() => setHoveredNode(node.id)}
               onMouseLeave={() => setHoveredNode(null)}
            >
               {/* Active Pulse Animation from EventBridge */}
               {activePulse === node.id && (
                  <div className="absolute inset-0 rounded-3xl bg-white/20 blur-xl animate-ping"></div>
               )}
               
               <div className={`
                  w-32 h-24 rounded-2xl bg-black border border-white/10 flex flex-col items-center justify-center 
                  shadow-2xl transition-all duration-300 relative z-20 overflow-hidden
                  hover:scale-110 hover:border-${node.color}-500 ${activePulse === node.id ? `border-${node.color}-500` : ''}
               `}>
                  {/* Watermark Icon */}
                  <div className={`absolute -bottom-6 -right-6 text-6xl opacity-10 grayscale pointer-events-none select-none transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12`}>
                     {node.icon}
                  </div>

                  <div className={`absolute top-0 left-0 w-full h-1 bg-${node.color}-500`}></div>
                  <div className="text-3xl mb-2 relative z-10 drop-shadow-md">{node.icon}</div>
                  <div className={`px-2 py-0.5 rounded text-[6px] font-black uppercase tracking-widest relative z-10 ${node.status === 'ACTIVE' ? `bg-${node.color}-500 text-black` : 'bg-gray-800 text-gray-500'}`}>
                     {node.status}
                  </div>
               </div>

               <div className="mt-4 text-center">
                  <p className={`text-[10px] font-black uppercase tracking-widest text-${node.color}-500 bg-black/80 px-3 py-1 rounded-full border border-white/10`}>{node.label}</p>
                  
                  <div className={`absolute top-28 w-56 bg-black/90 border border-white/10 p-4 rounded-xl text-center backdrop-blur-md transition-all duration-300 pointer-events-none z-30 ${hoveredNode === node.id ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                     <p className="text-[9px] text-gray-300 leading-relaxed italic">{node.desc}</p>
                  </div>
               </div>
            </div>
         ))}
      </div>
      <style>{`@keyframes dash { to { stroke-dashoffset: -20; } }`}</style>
    </div>
  );
};

export default SystemNavigator;
