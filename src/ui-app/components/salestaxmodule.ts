
import React, { useState, useEffect, useMemo } from 'react';
import { EInvoice, BusinessMetrics, UserRole, DistributedTask } from '../types';
import { TaskRouter } from '../services/taskRouter';
import { TaxReportService } from '../services/taxReportService';
import AIAvatar from './AIAvatar';
import { PersonaID } from '../types';

interface SalesTaxModuleProps {
  logAction: (action: string, details: string) => void;
  metrics: BusinessMetrics;
  currentRole: UserRole;
}

const SalesTaxModule: React.FC<SalesTaxModuleProps> = ({ logAction, metrics, currentRole }) => {
  const [activeTab, setActiveTab] = useState<'foundation' | 'omega_queue' | 'cit_calc'>('omega_queue');
  const [omegaTasks, setOmegaTasks] = useState<DistributedTask[]>([]);
  
  // CIT State
  const [citResult, setCitResult] = useState<any>(null);
  
  useEffect(() => {
     const unsubscribe = TaskRouter.subscribe((allTasks) => {
        setOmegaTasks(allTasks.filter(t => t.targetModule === 'sales_tax'));
     });
     // Initial calc
     const cit = TaxReportService.calculateCorporateTax(metrics.revenue, metrics.totalCogs + metrics.totalOperating, 0.1); // 10% incentive mock
     setCitResult(cit);

     return unsubscribe;
  }, [metrics]);

  const handleQuickSign = (task: DistributedTask) => {
    logAction('E_INVOICE_SIGN', `Ký số hóa đơn từ dữ liệu truyền tin Omega: ${task.id}`);
    TaskRouter.completeTask(task.id);
    alert(`🔐 ĐÃ KÝ SỐ THÀNH CÔNG: Giao dịch ${task.id} đã được truyền lên Tổng Cục Thuế.`);
  };

  const handleAutoFile = () => {
    if (currentRole !== UserRole.MASTER && currentRole !== UserRole.LEVEL_1) return alert("Chỉ Master mới có quyền Auto-File.");
    if (!window.confirm("Xác nhận nộp tờ khai thuế tự động lên TCT?")) return;
    logAction('TAX_AUTO_FILE', 'Đã thực hiện Auto-Filing CIT & VAT.');
    alert("🚀 Tờ khai đã được gửi thành công!");
  };

  return (
    <div className="h-full flex flex-col bg-[#020202] p-8 md:p-12 overflow-y-auto no-scrollbar gap-10 animate-in fade-in duration-700 pb-32">
      
      <header className="border-b border-white/5 pb-10 flex flex-col lg:flex-row justify-between items-end gap-8">
        <div>
           <div className="flex items-center gap-4 mb-3">
              <span className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black rounded-full uppercase tracking-widest animate-pulse shadow-lg shadow-indigo-500/20">Fiscal Node 2.0</span>
              <h2 className="ai-headline text-5xl italic uppercase tracking-tighter leading-none">Fiscal Terminal</h2>
           </div>
          <p className="ai-sub-headline text-cyan-300/40 ml-1 italic uppercase font-black tracking-[0.3em]">Hệ thống Kế toán Thuế & Ký số hóa đơn liên Shard</p>
        </div>

        <nav className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10 shrink-0">
           {[
             { id: 'omega_queue', label: 'Hàng chờ Omega' },
             { id: 'cit_calc', label: 'Tính thuế TNDN (CIT)' },
             { id: 'foundation', label: 'Phát hành mới' }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all relative ${activeTab === tab.id ? 'bg-indigo-500/20 text-cyan-300 border border-indigo-500/20 shadow-xl shadow-indigo-500/5' : 'text-gray-500 hover:text-white'}`}
             >
               {tab.label}
               {tab.id === 'omega_queue' && omegaTasks.filter(t => t.status === 'PENDING').length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[8px] flex items-center justify-center rounded-full animate-bounce font-black">
                     {omegaTasks.filter(t => t.status === 'PENDING').length}
                  </span>
               )}
             </button>
           ))}
        </nav>
      </header>

      <main className="flex-1">
        {/* TAB: CIT CALCULATION */}
        {activeTab === 'cit_calc' && citResult && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-right-10">
              <div className="ai-panel p-10 bg-black/40 border-white/10 space-y-8">
                 <h3 className="text-xl font-bold text-white uppercase tracking-widest border-b border-white/5 pb-4">Dự Tính Thuế TNDN (Corporate Tax)</h3>
                 
                 <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                       <span className="text-xs text-gray-400 font-bold uppercase">Thu nhập chịu thuế</span>
                       <span className="text-xl font-mono text-white">{citResult.taxableIncome.toLocaleString()} đ</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                       <span className="text-xs text-gray-400 font-bold uppercase">Thuế suất chuẩn</span>
                       <span className="text-xl font-mono text-white">{citResult.rate}%</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
                       <span className="text-xs text-green-400 font-bold uppercase">Ưu đãi (Incentives)</span>
                       <span className="text-xl font-mono text-green-400">-{citResult.incentives.toLocaleString()} đ</span>
                    </div>
                 </div>

                 <div className="p-6 bg-indigo-500/20 rounded-[2rem] border border-indigo-500/30 text-center">
                    <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest mb-2">TỔNG THUẾ PHẢI NỘP</p>
                    <p className="text-4xl font-mono font-black text-white">{citResult.amount.toLocaleString()} đ</p>
                 </div>

                 <button onClick={handleAutoFile} className="w-full py-4 bg-red-600 text-white font-black text-[10px] uppercase rounded-xl hover:bg-red-500 transition-all shadow-lg flex items-center justify-center gap-2">
                    <span>🚀</span> AUTO-FILE TO TAX AUTHORITY
                 </button>
              </div>

              <div className="ai-panel p-8 bg-blue-500/5 border-blue-500/20">
                 <div className="flex items-center gap-4 mb-6">
                    <AIAvatar personaId={PersonaID.THIEN} size="md" />
                    <h4 className="ai-sub-headline text-blue-400 italic">Thiên Advisor</h4>
                 </div>
                 <p className="text-[13px] text-gray-400 italic leading-relaxed font-light">
                    "Dựa trên dòng tiền hiện tại, Thiên dự báo thuế TNDN quý này sẽ tăng 15%. Tuy nhiên, nhờ áp dụng ưu đãi 'Dự án Xã hội', chúng ta đã tiết kiệm được khoảng {(citResult.incentives/1000000).toFixed(0)} triệu đồng. Hãy cân nhắc nộp sớm để tránh phạt chậm nộp."
                 </p>
              </div>
           </div>
        )}

        {/* TAB: OMEGA QUEUE */}
        {activeTab === 'omega_queue' && (
          <div className="space-y-8 animate-in slide-in-from-right-10 duration-700">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold italic text-amber-500 uppercase tracking-tighter">Báo cáo dữ liệu từ Omega Sync</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Xử lý {omegaTasks.length} tác vụ truyền tin</p>
             </div>
             
             <div className="space-y-6">
                {omegaTasks.map(task => (
                  <div key={task.id} className={`ai-panel p-10 flex flex-col lg:flex-row justify-between items-center gap-10 group transition-all ${task.status === 'COMPLETED' ? 'opacity-40 border-white/5' : 'hover:border-cyan-500/40 bg-white/[0.01]'}`}>
                     <div className="flex-1">
                        <div className="flex items-center gap-6 mb-4">
                           <span className="text-xl font-mono font-black text-cyan-400">{task.id}</span>
                           <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase text-gray-500">{new Date(task.timestamp).toLocaleString()}</span>
                           {task.status === 'COMPLETED' && <span className="text-[9px] font-black text-green-500 uppercase italic">✓ Đã niêm phong Shard</span>}
                        </div>
                        <div className="p-6 bg-black/40 rounded-3xl border border-white/5 font-mono text-[11px] text-gray-400 group-hover:text-white transition-colors">
                           <p className="uppercase font-black text-indigo-400 mb-2">Dữ liệu nguồn bóc tách:</p>
                           {JSON.stringify(task.payload)}
                        </div>
                     </div>
                     {task.status === 'PENDING' && (
                       <div className="flex gap-4">
                          <button onClick={() => handleQuickSign(task)} className="px-10 py-5 bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-cyan-400 shadow-2xl transition-all active:scale-95">Xác thực Ký số</button>
                          <button className="px-8 py-5 border border-white/10 text-gray-500 font-black text-[10px] uppercase rounded-2xl hover:text-white transition-all">Lưu trữ Shard</button>
                       </div>
                     )}
                  </div>
                ))}
                
                {omegaTasks.length === 0 && (
                  <div className="py-48 text-center opacity-10 flex flex-col items-center gap-10">
                     <span className="text-[120px] grayscale">🧾</span>
                     <p className="text-3xl font-serif italic uppercase tracking-[0.4em]">Fiscal Queue Empty</p>
                     <p className="text-xs font-black uppercase text-amber-500/50">Cổng truyền tin Fiscal đang ở trạng thái lắng nghe...</p>
                  </div>
                )}
             </div>
          </div>
        )}

        {activeTab === 'foundation' && (
          <div className="ai-panel p-20 flex flex-col items-center justify-center text-center border-dashed border-white/10 opacity-30">
             <span className="text-[100px] mb-12">🔐</span>
             <h3 className="text-4xl font-serif gold-gradient italic uppercase tracking-tighter">New Protocol Initiation</h3>
             <p className="max-w-md mt-6 text-sm text-gray-500 leading-relaxed font-light italic">
                Cổng khởi tạo hóa đơn thủ công. Khuyến nghị Anh Natt sử dụng bóc tách từ Omega Hub để đảm bảo 100% tính chính xác SSOT.
             </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SalesTaxModule;
