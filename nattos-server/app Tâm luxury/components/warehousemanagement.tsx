
import React, { useState, useEffect, useMemo } from 'react';
import { WarehouseEngine, AllocationPlan, WarehouseIntelligence } from '../services/warehouseService';
import { InventoryItem, UserRole, BusinessMetrics, WarehouseLocation } from '../types';
import { LogisticsCore } from '../services/logisticsService';
import AIAvatar from './AIAvatar';
import { PersonaID } from '../types';

interface WarehouseManagementProps {
  logAction?: (action: string, details: string, undoData?: unknown) => void;
  onBack?: () => void;
  metrics?: BusinessMetrics;
  updateFinance?: (data: Partial<BusinessMetrics>) => void;
  currentRole: UserRole;
}

const WarehouseManagement: React.FC<WarehouseManagementProps> = ({ currentRole, logAction }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'inventory' | 'dual_site' | 'recovery' | 'vault'>('inventory');
  
  // Dual Site State
  const [intelligence, setIntelligence] = useState<WarehouseIntelligence | null>(null);
  const [allocationPlan, setAllocationPlan] = useState<AllocationPlan | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showValuationReport, setShowValuationReport] = useState(false);

  // Fix invalid UserRole properties by mapping them to existing levels
  const isSigner = currentRole === UserRole.LEVEL_1;
  const isApprover = currentRole === UserRole.LEVEL_2;
  const isOperator = currentRole === UserRole.LEVEL_5;

  useEffect(() => {
    setItems(WarehouseEngine.items);
    setIntelligence(WarehouseEngine.getWarehouseIntelligence());
  }, []);

  const handleRunOptimization = async () => {
    window.dispatchEvent(new CustomEvent('NAUION_PULSE', { detail: { type: 'inventory.optimized', source: 'Warehouse' } }));
    setIsOptimizing(true);
    const plan = await WarehouseEngine.optimizeInventoryAllocation();
    setAllocationPlan(plan);
    setIsOptimizing(false);
  };

  const handleExecuteTransfer = async (transfer: unknown) => {
    window.dispatchEvent(new CustomEvent('NAUION_PULSE', { detail: { type: 'inventory.transfer', source: 'Warehouse' } }));
    logAction('WH_TRANSFER_EXEC', `Thực thi điều chuyển: ${transfer.quantity} ${transfer.productName} từ ${transfer.from} -> ${transfer.to}`);
    
    // Call Logistics Core
    await LogisticsCore.createInternalTransfer(
        transfer.productId,
        transfer.productName,
        transfer.quantity,
        transfer.from,
        transfer.to
    );

    alert("Đã tạo lệnh điều chuyển thành công. Vui lòng kiểm tra bên module OPS TERMINAL.");
    setAllocationPlan(null); // Clear plan after execution
  };

  const valuationStats = useMemo(() => {
     const hcmValue = items.filter(i => i.warehouseId === 'W-HCM-01').reduce((sum, i) => sum + (i.cost * i.quantity), 0);
     const hnValue = items.filter(i => i.warehouseId === 'W-HN-01').reduce((sum, i) => sum + (i.cost * i.quantity), 0);
     return { hcmValue, hnValue, total: hcmValue + hnValue };
  }, [items]);

  return (
    <div className="p-8 md:p-12 max-w-[1800px] mx-auto h-full overflow-y-auto space-y-12 animate-in fade-in duration-700 pb-24 no-scrollbar relative">
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-indigo-500/10 pb-10">
        <div>
          <h2 className="ai-headline text-5xl italic uppercase tracking-tighter">
            {isSigner ? 'KIỂM SOÁT TÀI SẢN KHO' : isApprover ? 'GIÁM SÁT ĐỊNH MỨC' : 'NHẬT KÝ THỰC THI XƯỞNG'}
          </h2>
          <p className="ai-sub-headline text-indigo-300/60 mt-3 italic uppercase">
            {isSigner ? 'Báo cáo Giá vốn & Giá trị Master' : 'Duyệt hao hụt & Tiến độ sản xuất'}
          </p>
        </div>
        
        <div className="flex gap-4">
           {isSigner && (
              <button 
                 onClick={() => setShowValuationReport(true)}
                 className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 shadow-xl transition-all"
              >
                 📊 BÁO CÁO ĐỊNH GIÁ (VALUATION)
              </button>
           )}
           <div className="flex bg-black/40 p-1.5 rounded-2xl border border-indigo-500/20 backdrop-blur-xl shrink-0">
             {[
               { id: 'inventory', label: 'Tồn Kho Tổng' },
               { id: 'dual_site', label: 'Điều Phối Liên Kho (HCM-HN)' },
               { id: 'recovery', label: 'Hao Hụt' },
               { id: 'vault', label: 'Bản vẽ 3D' }
             ].map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as unknown)}
                 className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest ${
                   activeTab === tab.id 
                   ? 'bg-indigo-500/20 text-cyan-300 border border-indigo-500/40' 
                   : 'text-gray-500 hover:text-white'
                 }`}
               >
                 {tab.label}
               </button>
             ))}
           </div>
        </div>
      </header>

      {/* --- TAB: INVENTORY --- */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {items.map(item => (
             <div key={item.id} className="natt-cell-medal bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(255,255,255,0.03)] rounded-3xl overflow-hidden flex flex-col group border-white/5 hover:border-cyan-500/30 transition-all bg-black/20 shadow-2xl">
                <div className="relative h-64 overflow-hidden bg-black/40 border-b border-white/5">
                   <img src={`https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=800&q=80`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" alt={item.name} />
                   <div className="absolute top-4 right-4 flex gap-2">
                      <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-500 text-[8px] font-black uppercase rounded-full">AU-750</span>
                      <span className={`px-3 py-1 border text-[8px] font-black uppercase rounded-full ${item.warehouseId === 'W-HCM-01' ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-red-500/20 border-red-500/30 text-red-400'}`}>
                        {item.warehouseId === 'W-HCM-01' ? 'HCM' : 'HN'}
                      </span>
                   </div>
                </div>
                <div className="p-8 space-y-6">
                   <div>
                      <h3 className="text-white font-black text-xl uppercase tracking-tight truncate group-hover:text-cyan-300 transition-colors">{item.name}</h3>
                      <p className="text-[10px] text-indigo-400 font-mono italic mt-2 tracking-widest">{item.sku} • {item.internalCertId}</p>
                   </div>
                   <div className="flex justify-between items-end pt-4 border-t border-white/5">
                      <div>
                         <p className="text-[8px] text-gray-600 uppercase font-black mb-2 tracking-widest">Khối lượng thực</p>
                         <p className="text-3xl font-mono font-black text-white italic">{item.quantity} <span className="text-xs text-gray-500 uppercase italic">Chỉ</span></p>
                      </div>
                      {isSigner && (
                        <div className="text-right">
                           <p className="text-[8px] text-amber-600 uppercase font-black mb-2 tracking-widest">Giá vốn Master</p>
                           <p className="text-lg font-mono font-bold text-amber-500">{(item.cost/1000000).toFixed(1)}M</p>
                        </div>
                      )}
                   </div>
                   
                   {isOperator && (
                      <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase hover:bg-white hover:text-black transition-all">
                        CẬP NHẬT HIỆN TRẠNG
                      </button>
                   )}
                </div>
             </div>
           ))}
        </div>
      )}

      {/* --- TAB: DUAL SITE OPERATIONS (NEW) --- */}
      {activeTab === 'dual_site' && intelligence && (
        <div className="space-y-12 animate-in slide-in-from-right-10">
           
           {/* 1. Comparison Dashboard */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* HCM CARD */}
              <div className="natt-cell-medal bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(255,255,255,0.03)] rounded-3xl p-10 bg-blue-900/10 border-blue-500/30 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-6 text-9xl opacity-5 grayscale">🏙️</div>
                 <h3 className="text-3xl font-serif text-blue-400 uppercase tracking-tighter mb-8">KHO TỔNG TP.HCM</h3>
                 <div className="grid grid-cols-2 gap-8">
                    <div>
                       <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Hiệu suất (Utilization)</p>
                       <p className="text-4xl font-mono font-black text-white">{intelligence.hcm.utilization}%</p>
                       <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${intelligence.hcm.utilization}%` }}></div>
                       </div>
                    </div>
                    <div>
                       <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Vòng quay (Turnover)</p>
                       <p className="text-4xl font-mono font-black text-white">{intelligence.hcm.turnover}x</p>
                    </div>
                    <div>
                       <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Chi phí / SKU</p>
                       <p className="text-2xl font-mono font-black text-white">{intelligence.hcm.costPerSku.toLocaleString()} đ</p>
                    </div>
                    <div>
                       <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Điểm hiệu quả</p>
                       <p className="text-2xl font-mono font-black text-green-400">{intelligence.hcm.efficiency}/100</p>
                    </div>
                 </div>
              </div>

              {/* HANOI CARD */}
              <div className="natt-cell-medal bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(255,255,255,0.03)] rounded-3xl p-10 bg-red-900/10 border-red-500/30 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-6 text-9xl opacity-5 grayscale">⛩️</div>
                 <h3 className="text-3xl font-serif text-red-400 uppercase tracking-tighter mb-8">CHI NHÁNH HÀ NỘI</h3>
                 <div className="grid grid-cols-2 gap-8">
                    <div>
                       <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Hiệu suất (Utilization)</p>
                       <p className="text-4xl font-mono font-black text-white">{intelligence.hanoi.utilization}%</p>
                       <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-red-500" style={{ width: `${intelligence.hanoi.utilization}%` }}></div>
                       </div>
                    </div>
                    <div>
                       <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Vòng quay (Turnover)</p>
                       <p className="text-4xl font-mono font-black text-white">{intelligence.hanoi.turnover}x</p>
                    </div>
                    <div>
                       <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Chi phí / SKU</p>
                       <p className="text-2xl font-mono font-black text-white">{intelligence.hanoi.costPerSku.toLocaleString()} đ</p>
                    </div>
                    <div>
                       <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Điểm hiệu quả</p>
                       <p className="text-2xl font-mono font-black text-amber-500">{intelligence.hanoi.efficiency}/100</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* 2. AI Optimization Engine */}
           <div className="natt-cell-medal bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(255,255,255,0.03)] rounded-3xl p-10 border-amber-500/30 bg-amber-500/5 shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-start mb-8 relative z-10">
                 <div className="flex items-center gap-6">
                    <AIAvatar personaId={PersonaID.THIEN} size="md" isThinking={isOptimizing} />
                    <div>
                       <h4 className="text-2xl font-bold text-amber-500 uppercase italic tracking-tighter">Dual-Warehouse Optimizer</h4>
                       <p className="text-xs text-gray-400 font-light italic mt-1">Cân bằng tồn kho tự động dựa trên nhu cầu vùng miền (Regional Demand)</p>
                    </div>
                 </div>
                 <button 
                   onClick={handleRunOptimization}
                   disabled={isOptimizing}
                   className="px-10 py-4 bg-amber-500 text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-amber-400 active:scale-95 transition-all disabled:opacity-50"
                 >
                   {isOptimizing ? 'AI ĐANG TÍNH TOÁN...' : 'PHÂN TÍCH & TỐI ƯU HÓA'}
                 </button>
              </div>

              {/* Recommendations */}
              {!allocationPlan && (
                 <div className="space-y-4 relative z-10">
                    {intelligence.recommendations.map((rec, i) => (
                       <div key={i} className="flex items-start gap-4 p-4 bg-black/40 rounded-2xl border border-white/5">
                          <span className="text-amber-500 text-lg">💡</span>
                          <p className="text-sm text-gray-300 italic">{rec}</p>
                       </div>
                    ))}
                 </div>
              )}

              {/* Optimization Plan Result */}
              {allocationPlan && (
                 <div className="animate-in slide-in-from-bottom-10 space-y-8 relative z-10 bg-black/60 p-8 rounded-[3rem] border border-white/10 mt-8">
                    <h5 className="text-sm font-black text-green-400 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Đề xuất điều chuyển tối ưu</h5>
                    
                    {allocationPlan.transfers.map((t, i) => (
                       <div key={i} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/10 rounded-3xl group hover:border-green-500/50 transition-all">
                          <div className="flex items-center gap-8">
                             <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl">📦</div>
                             <div>
                                <p className="text-lg font-bold text-white uppercase">{t.productName}</p>
                                <p className="text-[10px] text-gray-500 font-mono mt-1">{t.productId}</p>
                                <p className="text-[10px] text-amber-500 italic mt-2 font-bold">{t.reason}</p>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-8">
                             <div className="text-center">
                                <p className="text-[9px] text-gray-600 font-black uppercase">Từ kho</p>
                                <p className="text-sm font-bold text-blue-400 mt-1">HCM</p>
                             </div>
                             <div className="flex flex-col items-center">
                                <span className="text-2xl text-gray-600">➔</span>
                                <span className="text-[10px] font-black bg-white text-black px-3 py-1 rounded-full mt-1">{t.quantity} items</span>
                             </div>
                             <div className="text-center">
                                <p className="text-[9px] text-gray-600 font-black uppercase">Đến kho</p>
                                <p className="text-sm font-bold text-red-400 mt-1">HANOI</p>
                             </div>
                             
                             <button onClick={() => handleExecuteTransfer(t)} className="px-6 py-3 bg-green-600 text-white font-black text-[9px] uppercase rounded-xl hover:bg-green-500 shadow-lg ml-8">
                                THỰC THI NGAY
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        </div>
      )}

      {/* --- TAB: RECOVERY (Existing) --- */}
      {activeTab === 'recovery' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           <div className="lg:col-span-2 ai-panel p-12 bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/20 shadow-2xl">
              <h3 className="ai-headline text-3xl mb-12 uppercase italic tracking-tighter">Phân Tích Thu Hồi Vàng Bụi</h3>
              <div className="space-y-12">
                 <div className="grid grid-cols-3 gap-8">
                    <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 shadow-inner">
                       <p className="ai-sub-headline opacity-40 mb-3">Vàng thu hồi</p>
                       <p className="text-4xl font-mono font-black text-amber-400">42.5 <span className="text-sm">chỉ</span></p>
                    </div>
                    <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 shadow-inner">
                       <p className="ai-sub-headline opacity-40 mb-3">Tỉ lệ lọc</p>
                       <p className="text-4xl font-mono font-black text-green-400">98.2%</p>
                    </div>
                    <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 shadow-inner">
                       <p className="ai-sub-headline opacity-40 mb-3">Hao hụt dư</p>
                       <p className="text-4xl font-mono font-black text-red-400">1.8%</p>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="space-y-8">
              <div className="natt-cell-medal bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(255,255,255,0.03)] rounded-3xl p-8 border-amber-500/30 bg-amber-500/5 shadow-2xl">
                 <h4 className="ai-sub-headline text-amber-500 mb-6 flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>
                    Cố vấn Định mức (Thiên)
                 </h4>
                 <p className="text-[13px] text-indigo-100/70 italic leading-relaxed font-light">
                   {isApprover 
                        ? `"Chào Quản đốc, Thiên phát hiện hao hụt tại phòng Nguội vượt ngưỡng 0.5%. Anh nên rà soát lại khâu thu hồi tại thảm sàn và túi hút bụi."`
                        : `"Thợ xưởng lưu ý: Hãy thực hiện quy trình vệ sinh tay và máy móc định kỳ mỗi 4 tiếng để đảm bảo tối ưu thu hồi kim loại quý."`
                   }
                 </p>
              </div>
           </div>
        </div>
      )}

      {/* --- TAB: VAULT (Existing) --- */}
      {activeTab === 'vault' && (
        <div className="natt-cell-medal bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(255,255,255,0.03)] rounded-3xl p-16 min-h-[700px] flex flex-col items-center justify-center text-center relative overflow-hidden bg-black/60 border-indigo-500/20">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-10 pointer-events-none"></div>
           <div className="text-[120px] mb-12 grayscale opacity-50">🛡️</div>
           <h3 className="ai-headline text-6xl mb-8 uppercase italic tracking-tighter">Omega Design Vault</h3>
           <p className="ai-sub-headline text-indigo-300/40 max-w-lg mx-auto leading-relaxed mb-16 italic text-sm font-light">
              {isSigner 
                ? `"Kho bản vẽ Matrix 4K độc quyền. Dữ liệu đã được băm vào Shard Sản Xuất và chỉ có Anh mới có quyền cấp phép xuất tệp."`
                : `"Kho thư viện mẫu thiết kế chung. Để tải tệp Matrix gốc, vui lòng gửi yêu cầu xác thực tới Giám đốc."`
              }
           </p>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-6xl">
              {['NHẪN NAM 2025', 'BST I LIKE IT', 'ROLEX CUSTOM', 'PENDANT OMEGA'].map(coll => (
                <div key={coll} className="p-10 bg-white/5 rounded-[3.5rem] border border-cyan-500/20 hover:border-cyan-400 group transition-all cursor-pointer shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-5 text-4xl group-hover:opacity-20 transition-opacity">💎</div>
                   <p className="text-4xl mb-6 group-hover:scale-110 transition-transform">🎞️</p>
                   <p className="text-[11px] text-white font-black uppercase tracking-widest">{coll}</p>
                   <p className="text-[9px] text-gray-500 mt-3 italic">12 Bản vẽ Matrix (4K)</p>
                   {isSigner && (
                      <button className="mt-6 w-full py-2 bg-cyan-500/10 text-cyan-400 text-[8px] font-black uppercase border border-cyan-500/20 rounded-lg">Cấp quyền Xuất</button>
                   )}
                </div>
              ))}
           </div>
        </div>
      )}

      {/* VALUATION REPORT MODAL */}
      {showValuationReport && (
         <div className="fixed inset-0 z-[500] flex items-center justify-center p-8 bg-black/90 backdrop-blur-xl animate-in zoom-in-95 duration-300">
            <div className="bg-[#0a0a0a] w-full max-w-4xl p-12 rounded-[4rem] border border-amber-500/30 relative overflow-hidden shadow-2xl flex flex-col">
               <button onClick={() => setShowValuationReport(false)} className="absolute top-10 right-10 text-3xl text-gray-500 hover:text-white transition-colors">✕</button>
               
               <div className="text-center mb-12">
                  <h3 className="text-4xl font-serif gold-gradient italic uppercase tracking-tighter">Báo cáo Định giá Tồn kho Đa điểm</h3>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] mt-2">Real-time Asset Valuation • {new Date().toLocaleDateString()}</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  <div className="p-8 bg-blue-900/10 border border-blue-500/30 rounded-[2.5rem] text-center">
                     <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Kho Tổng HCM</p>
                     <p className="text-3xl font-mono font-black text-white">{(valuationStats.hcmValue / 1000000000).toFixed(1)} <span className="text-sm text-gray-500">Tỷ</span></p>
                  </div>
                  <div className="p-8 bg-red-900/10 border border-red-500/30 rounded-[2.5rem] text-center">
                     <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4">CN Hà Nội</p>
                     <p className="text-3xl font-mono font-black text-white">{(valuationStats.hnValue / 1000000000).toFixed(1)} <span className="text-sm text-gray-500">Tỷ</span></p>
                  </div>
                  <div className="p-8 bg-amber-900/10 border border-amber-500/30 rounded-[2.5rem] text-center">
                     <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4">Tổng Tài Sản</p>
                     <p className="text-3xl font-mono font-black text-white">{(valuationStats.total / 1000000000).toFixed(1)} <span className="text-sm text-gray-500">Tỷ</span></p>
                  </div>
               </div>

               <div className="flex-1 bg-black/40 border border-white/5 rounded-3xl p-8 overflow-y-auto no-scrollbar">
                  <table className="w-full text-left text-[11px]">
                     <thead>
                        <tr className="text-gray-500 font-black uppercase tracking-widest border-b border-white/10">
                           <th className="pb-4">Mã SKU</th>
                           <th className="pb-4">Tên Sản Phẩm</th>
                           <th className="pb-4 text-right">HCM (Qty)</th>
                           <th className="pb-4 text-right">HN (Qty)</th>
                           <th className="pb-4 text-right text-amber-500">Tổng Giá Trị</th>
                        </tr>
                     </thead>
                     <tbody className="text-gray-300">
                        {items.map((item, i) => (
                           <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                              <td className="py-3 font-mono text-cyan-400">{item.sku}</td>
                              <td className="py-3 font-bold text-white uppercase">{item.name}</td>
                              <td className="py-3 text-right font-mono">{item.warehouseId === 'W-HCM-01' ? item.quantity : 0}</td>
                              <td className="py-3 text-right font-mono">{item.warehouseId === 'W-HN-01' ? item.quantity : 0}</td>
                              <td className="py-3 text-right font-mono font-black text-white">{(item.cost * item.quantity).toLocaleString()} đ</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>

               <div className="mt-8 text-center">
                  <button onClick={() => alert("Xuất báo cáo thành công!")} className="px-10 py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-200 transition-all shadow-xl">
                     XUẤT FILE ĐỊNH GIÁ (EXCEL)
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default WarehouseManagement;
