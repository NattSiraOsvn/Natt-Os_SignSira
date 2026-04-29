
import React, { useState, useEffect } from 'react';
import { ProductionOrder, OrderStatus, UserRole, DistributedTask } from '../types';
import { TaskRouter } from '../services/taskRouter';

interface ProductionManagerProps {
  currentRole: UserRole;
  logAction: (action: string, details: string) => void;
}

const ProductionManager: React.FC<ProductionManagerProps> = ({ currentRole, logAction }) => {
  const [activeTab, setActiveTab] = useState<'live' | 'omega_queue' | 'costing'>('omega_queue');
  const [omegaTasks, setOmegaTasks] = useState<DistributedTask[]>([]);
  
  useEffect(() => {
     const unsubscribe = TaskRouter.subscribe((allTasks) => {
        setOmegaTasks(allTasks.filter(t => t.targetModule === 'production_manager'));
     });
     return unsubscribe;
  }, []);

  const handleStartOrder = (task: DistributedTask) => {
    window.dispatchEvent(new CustomEvent('NAUION_PULSE', { detail: { type: 'production.started', source: 'ProductionManager', taskId: task.id } }));
    logAction('PROD_ORDER_INIT', `Phát lệnh sản xuất Master từ OMEGA ID: ${task.id}`);
    alert(`💎 ĐÃ KHỞI TẠO ĐƠN HÀNG MASTER: Dữ liệu Shard ${task.id} đã được đẩy vào Pipeline Sản Xuất.`);
    TaskRouter.completeTask(task.id);
  };

  return (
    <div className="h-full flex flex-col bg-[#050505] p-8 md:p-12 overflow-y-auto no-scrollbar gap-10 animate-in fade-in duration-700 pb-32">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-10">
        <div>
          <h2 className="ai-headline text-5xl italic uppercase tracking-tighter leading-none">Factory Command</h2>
          <p className="ai-sub-headline text-indigo-300/40 mt-3 italic uppercase font-black tracking-[0.4em]">Quản đốc Sản xuất • Truyền tin Liên khối v5.5</p>
        </div>
        
        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10 shrink-0">
          {[
            { id: 'omega_queue', label: 'Hàng chờ Omega' },
            { id: 'live', label: 'Pipeline SNT' },
            { id: 'costing', label: 'Định mức WAC' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as string)}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all relative ${activeTab === tab.id ? 'bg-amber-500 text-black shadow-xl shadow-amber-500/20 border-amber-400' : 'text-gray-500 hover:text-white'}`}
            >
              {tab.label}
              {tab.id === 'omega_queue' && omegaTasks.filter(t => t.status === 'PENDING').length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white text-[9px] flex items-center justify-center rounded-full animate-pulse font-black shadow-lg">
                  {omegaTasks.filter(t => t.status === 'PENDING').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1">
        {activeTab === 'omega_queue' && (
          <div className="space-y-10 animate-in slide-in-from-right-10 duration-700">
             <div className="flex justify-between items-center px-2">
                <h3 className="text-2xl font-bold italic text-amber-500 uppercase tracking-tighter">Lệnh sản xuất từ Shard Bóc Tách</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Xử lý {omegaTasks.length} nhiệm vụ truyền tin</p>
             </div>

             <div className="grid grid-cols-1 gap-8">
                {omegaTasks.map(task => (
                  <div key={task.id} className={`ai-panel p-10 flex flex-col lg:flex-row justify-between items-center gap-12 group transition-all ${task.status === 'COMPLETED' ? 'opacity-40 border-white/5' : 'hover:border-amber-500/30 bg-white/[0.02]'}`}>
                    <div className="flex-1 flex items-center gap-12">
                       <div className={`w-20 h-20 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-4xl shadow-inner ${task.status === 'PENDING' ? 'animate-pulse' : ''}`}>🧬</div>
                       <div>
                          <div className="flex items-center gap-4 mb-3">
                             <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${task.priority === 'URGENT' ? 'bg-red-600 text-white border-red-500 animate-pulse' : 'bg-blue-600 text-white border-blue-500'}`}>{task.priority}</span>
                             <h4 className="text-2xl font-bold text-white uppercase tracking-tight italic">LỆNH OMEGA: {task.id}</h4>
                          </div>
                          <p className="text-[11px] text-gray-500 italic leading-relaxed max-w-2xl bg-black/40 p-5 rounded-2xl border border-white/5 font-mono shadow-inner group-hover:text-amber-200 transition-colors">
                            {JSON.stringify(task.payload)}
                          </p>
                       </div>
                    </div>
                    
                    {task.status === 'PENDING' && (
                      <div className="flex gap-4 shrink-0">
                         <button onClick={() => handleStartOrder(task)} className="px-12 py-5 bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-amber-400 shadow-2xl transition-all active:scale-95">PHÁT LỆNH SẢN XUẤT</button>
                         <button className="px-8 py-5 border border-white/10 text-gray-500 font-black text-[10px] uppercase rounded-2xl hover:text-white transition-all tracking-widest">TỪ CHỐI NODE</button>
                      </div>
                    )}
                  </div>
                ))}
                
                {omegaTasks.length === 0 && (
                  <div className="py-48 text-center opacity-10 flex flex-col items-center gap-10 grayscale">
                     <p className="text-[140px] mb-12">🏭</p>
                     <p className="text-4xl font-serif italic uppercase tracking-[0.4em]">No Incoming Shards</p>
                     <p className="text-xs font-black uppercase text-amber-500 tracking-[0.2em]">Hệ thống đang sẵn sàng tiếp nhận bóc tách từ Anh Natt.</p>
                  </div>
                )}
             </div>
          </div>
        )}

        {activeTab === 'live' && (
           <div className="h-full flex flex-col items-center justify-center py-48 text-center opacity-20 italic grayscale">
              <p className="text-[100px] mb-8">💍</p>
              <h3 className="text-4xl font-serif gold-gradient uppercase tracking-tighter">Pipeline Real-time</h3>
              <p className="text-xs uppercase font-black mt-4 tracking-[0.5em]">Đang đồng bộ SNT (Serial Number Tracking)...</p>
           </div>
        )}
      </main>
    </div>
  );
};

export default ProductionManager;
