
import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  activeView: ViewType | 'command';
  setActiveView: (view: ViewType | 'command') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'dashboard', label: 'TỔNG QUAN MASTER', icon: '🏠' },
    { id: 'customs_intelligence', label: 'HẢI QUAN | CUSTOMS', icon: '🚢' },
    { id: 'showroom', label: 'GIAN HÀNG | SHOWROOM', icon: '💎' },
    { id: 'suppliers', label: 'NHÀ CUNG CẤP | SUPPLIERS', icon: '🤝' },
    { id: 'rooms', label: 'PHÒNG CHIẾN LƯỢC | ROOMS', icon: '🏛️' },
    { id: 'analytics', label: 'PHÂN TÍCH | ANALYTICS', icon: '📈' },
    { id: 'kris_email', label: 'KRIS EMAIL HUB', icon: '📥' },
    { id: 'sales_tax', label: 'BÁN HÀNG & THUẾ | TAX', icon: '🧾' },
    { id: 'processor', label: 'OMEGA SYNC HUB', icon: '🧬' },
    { id: 'warehouse', label: 'KHO & MEDIA (4K)', icon: '📦' },
    { id: 'hr', label: 'NHÂN SỰ | HR', icon: '👥' },
    { id: 'monitoring', label: 'SYSTEM PULSE', icon: '📡' },
    { id: 'dev', label: 'OPS PORTAL', icon: '⚙️' },
  ];

  return (
    <div className="w-80 h-full glass border-r border-white/5 flex flex-col p-8 hidden md:flex shrink-0 overflow-hidden bg-black">
      <div className="mb-12">
        <h1 className="text-4xl font-serif gold-gradient italic leading-none tracking-tighter">Natt-OS</h1>
        <p className="text-[9px] text-gray-600 uppercase tracking-[0.4em] mt-3 font-black">OMEGA PRIME UNIFIED</p>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
        <button
          onClick={() => setActiveView('command')}
          className={`w-full mb-10 flex items-center space-x-4 px-6 py-5 rounded-2xl transition-all relative group overflow-hidden ${
            activeView === 'command' 
            ? 'bg-red-600/90 text-white shadow-[0_0_40px_rgba(220,38,38,0.4)] border border-red-500' 
            : 'bg-white/[0.03] border border-white/5 text-gray-400 hover:border-red-500/30'
          }`}
        >
          <span className="text-xl relative z-10">💂‍♂️</span>
          <span className="font-black text-[10px] uppercase tracking-[0.3em] relative z-10">COMMAND CENTER</span>
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-transparent opacity-0 group-hover:opacity-20 transition-opacity"></div>
        </button>

        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id as ViewType)}
            className={`w-full flex items-center space-x-5 px-6 py-4 rounded-xl transition-all active:scale-95 ${
              activeView === item.id
                ? 'bg-amber-500/10 text-amber-500 shadow-lg border border-amber-500/20'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
            }`}
          >
            <span className="text-lg grayscale group-hover:grayscale-0">{item.icon}</span>
            <span className="font-bold text-[10px] uppercase tracking-[0.2em]">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-white/5 text-[9px] text-gray-700">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]"></div>
          <p className="font-black uppercase tracking-widest text-amber-500/40">Neural Link Active</p>
        </div>
        <div className="flex justify-between items-center italic">
           <span>© 2026 NATT ENTERPRISE</span>
           <span className="text-gray-800">V.3.1.26</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
