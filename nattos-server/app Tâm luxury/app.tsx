import { initMachHeyna } from './services/heynaConnector';
import React, { useState, useEffect } from 'react';
import MasterDashboard from './components/masterdashboard';
import SalesTerminal from './components/salesterminal';
import ProductionManager from './components/productionmanager';
import WarehouseManagement from './components/warehousemanagement';
import FinancialDashboard from './components/financial/financialdashboard';
import HRManagement from './components/hrmanagement';
import ProductionTaskBoard from './components/production/ProductionTaskBoard';
import { ButterflyProtocol } from './components/common/ButterflyProtocol';

// TÚI MÁU DỰ PHÒNG (Mock Data để UI sống mượt mà không bao giờ trắng màn hình)
const mockMetrics = { revenue: 12500000000, totalTaxDue: 1250000000, totalPayroll: 450000000, currentOperatingCost: 120000000, importVolume: 24, pendingApprovals: 8, cadPending: 12 };
const mockActionLogs = [
  { id: '1', module: 'SALES', action: 'CHỐT ĐƠN', details: 'Bán 1 Nhẫn Kim Cương VVS1', timestamp: Date.now(), hash: '0xabc123' },
  { id: '2', module: 'PROD', action: 'PHÁT LỆNH', details: 'Đúc 5 phôi vàng 18K', timestamp: Date.now() - 60000, hash: '0xdef456' },
  { id: '3', module: 'FINANCE', action: 'KÝ SỐ', details: 'Duyệt bảng lương tháng', timestamp: Date.now() - 120000, hash: '0xghi789' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('DASHBOARD');

  // ATTENTION TRACKER - KHIÊN LƯỢNG TỬ (Tự mờ sau 10s IDLE)
  useEffect(() => {
    // [SPEC P0] KHỞI ĐỘNG MẠCH HEYNA (SSE) ĐỂ MỞ KHÓA DỮ LIỆU REAL-TIME
    const sseConnection = initMachHeyna();

    let timeout: NodeJS.Timeout;
    const resetIdle = () => {
      if (document.documentElement.getAttribute('data-resonance-state') === 'IDLE') {
         document.documentElement.setAttribute('data-resonance-state', 'STABLE');
      }
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        document.documentElement.setAttribute('data-resonance-state', 'IDLE');
      }, 10000); 
    };
    
    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('keydown', resetIdle);
    window.addEventListener('click', resetIdle);
    resetIdle();
    
    return () => {
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      window.removeEventListener('click', resetIdle);
      clearTimeout(timeout);
      if (sseConnection) sseConnection.close();
    }
  }, []);

  // WIRING: KHỚP NỐI UI
  const renderContent = () => {
    switch(activeTab) {
      case 'DASHBOARD': return <MasterDashboard metrics={mockMetrics as any} actionLogs={mockActionLogs as any} currentRole={'MASTER' as any} currentPosition={'CEO' as any} />;
      case 'SALES': return <SalesTerminal metrics={mockMetrics as any} updateFinance={() => {}} logAction={() => {}} currentRole={'MASTER' as any} currentPosition={'CEO' as any} />;
      case 'PROD': return <ProductionManager currentRole={'MASTER' as any} logAction={() => {}} />;
      case 'WH': return <WarehouseManagement currentRole={'MASTER' as any} logAction={() => {}} />;
      case 'FINANCE': return <FinancialDashboard />;
      case 'HR': return <HRManagement currentRole={'MASTER' as any} currentPosition={'CEO' as any} metrics={mockMetrics as any} logAction={() => {}} />;
      case 'TASKS': return <ProductionTaskBoard />;
      default: return <MasterDashboard metrics={mockMetrics as any} actionLogs={mockActionLogs as any} currentRole={'MASTER' as any} currentPosition={'CEO' as any} />;
    }
  };

  return (
    <div className="w-screen h-screen bg-[#020202] text-white flex overflow-hidden font-sans">
      <ButterflyProtocol />
      
      {/* CỘT TỦY SỐNG (SIDEBAR NAVIGATION) */}
      <div className="w-64 bg-black/50 border-r border-white/10 flex flex-col p-4 space-y-4 z-50 backdrop-blur-xl shrink-0">
        <div className="text-xl font-black tracking-widest text-amber-500 mb-8 border-b border-white/10 pb-4">
            Natt-OS <span className="text-[10px] text-cyan-400 align-top">v2.4</span>
        </div>
        
        {['DASHBOARD', 'SALES', 'PROD', 'WH', 'FINANCE', 'HR'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-left px-4 py-3 rounded-xl text-[11px] font-bold tracking-[0.2em] transition-all duration-300 ${activeTab === tab ? 'bg-white/10 text-amber-400 border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            {tab}
          </button>
        ))}
        
        <div className="mt-auto pt-4 border-t border-white/10 text-[9px] text-gray-600 font-mono text-center">
            System Online • Liquid Glass
        </div>
      </div>

      {/* VÙNG KHÔNG GIAN THỰC THI (MAIN CONTENT) */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-[#050505] to-[#0a0a0a]">
        {renderContent()}
      </div>
    </div>
  );
}
