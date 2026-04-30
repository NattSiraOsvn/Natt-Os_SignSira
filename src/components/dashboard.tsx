

import React from 'react';
import { BusinessMetrics, ActionLog, UserRole, UserPosition, PersonaID } from '../types';
import AIAvatar from './aiavatar';

interface DashboardProps {
  metrics: BusinessMetrics;
  onSelectDomain: (domain: any) => void;
  actionLogs: ActionLog[];
  currentRole: UserRole;
  currentPosition: UserPosition;
}

const Dashboard: React.FC<DashboardProps> = ({ metrics, actionLogs, currentRole, currentPosition }) => {
  const isMaster = currentRole === UserRole.MASTER;
  const canSeeFinance = isMaster || currentRole === UserRole.LEVEL_1 || currentRole === UserRole.LEVEL_8;

  return (
    <div className="h-full flex flex-col p-6 lg:p-12 overflow-y-auto no-scrollbar gap-8 lg:gap-12 bg-[#020202] pb-32">
      
      {/* SUPREME HEADER: ADAPTIVE */}
      <section className="shrink-0 flex flex-col lg:flex-row justify-between items-center ai-panel p-8 lg:p-12 border-white/5 bg-white/[0.01] shadow-2xl relative overflow-hidden heat-1">
         <div className="absolute top-0 right-0 p-10 opacity-[0.02] text-9xl pointer-events-none">🏛️</div>
         <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 w-full lg:w-auto">
            <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-2xl transition-all duration-700 ${
                isMaster ? 'heat-3 text-white' : 'heat-1 text-amber-500'
            }`}>
                {isMaster ? '👑' : '🏢'}
            </div>
            <div className="text-center md:text-left">
                <h1 className="ai-headline italic leading-none uppercase tracking-tighter">
                    {/* Fix: currentPosition is an object, access role property for rendering */}
                    {currentPosition.role} TERMINAL
                </h1>
                <p className="ai-sub-headline mt-4">Node: {isMaster ? 'OMEGA PRIME (SSOT)' : 'BUSINESS ISOLATED'}</p>
            </div>
         </div>
         
         <div className="flex flex-wrap justify-center lg:justify-end gap-10 mt-10 lg:mt-0 items-center relative z-10 w-full lg:w-auto">
            {canSeeFinance && (
                <div className="text-center lg:text-right border-white/5 lg:border-r lg:pr-10">
                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-2">Tài sản Shard</p>
                    <p className="text-4xl font-mono font-black text-white italic tracking-tighter">449.120 <span className="text-xs not-italic text-amber-600">M</span></p>
                </div>
            )}
            <div className="text-center lg:text-right">
                <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-2">Trạng thái Xung</p>
                <div className="flex items-center gap-3 justify-center lg:justify-end">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,1)]"></div>
                   <p className="text-2xl font-black italic uppercase text-green-500 tracking-widest">NOMINAL</p>
                </div>
            </div>
         </div>
      </section>

      {/* ADAPTIVE CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 min-h-0">
         
         {/* MAIN STATS & LOGS (8 COLS ON DESKTOP) */}
         <section className="lg:col-span-8 flex flex-col gap-8 lg:gap-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="ai-panel p-10 heat-2 group cursor-pointer hover:scale-[1.02] transition-transform">
                    <div className="flex justify-between items-start mb-6">
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">FINANCE PULSE</span>
                        <span className="text-xl">💰</span>
                    </div>
                    <p className="text-5xl font-mono font-black text-white leading-none tracking-tighter group-hover:gold-gradient transition-all">
                        {metrics.revenue.toLocaleString()}
                    </p>
                    <p className="text-[9px] text-gray-600 uppercase mt-5 font-bold tracking-widest">Doanh thu chốt Shard (NET)</p>
                </div>

                <div className="ai-panel p-10 heat-1 group cursor-pointer hover:scale-[1.02] transition-transform">
                    <div className="flex justify-between items-start mb-6">
                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em]">FACTORY FLOW</span>
                        <span className="text-xl">🏭</span>
                    </div>
                    <p className="text-5xl font-mono font-black text-white leading-none tracking-tighter">
                        {metrics.productionProgress}%
                    </p>
                    <p className="text-[9px] text-gray-600 uppercase mt-5 font-bold tracking-widest">Tiến độ xưởng Master</p>
                </div>
            </div>

            {/* AUDIT TRAIL: RESPONSIVE TABLE */}
            <div className="ai-panel flex flex-col min-h-[500px] bg-black/40 shadow-inner border-white/5 heat-0">
               <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                  <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.5em] italic">
                        NHẬT KÝ SHARD (IMMUTABLE LOGS)
                  </h3>
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
               </div>
               <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 font-mono p-4">
                  {actionLogs.map((log) => (
                    <div key={log.id} className="flex flex-col md:flex-row md:items-center gap-4 lg:gap-8 p-5 border-b border-white/5 text-[10px] hover:bg-white/[0.03] rounded-2xl group transition-all">
                       <span className="text-amber-500/60 w-24 shrink-0 italic">{new Date(log.timestamp).toLocaleTimeString()}</span>
                       <span className="px-3 py-1 heat-1 text-[8px] uppercase font-black w-24 text-center rounded-lg">{log.module.split('_')[0]}</span>
                       <span className="flex-1 text-gray-400 truncate font-bold italic group-hover:text-white transition-colors">{log.action}</span>
                       <span className="hidden md:block text-[8px] text-gray-800 uppercase font-black opacity-40 group-hover:opacity-100 transition-opacity">Hash: {log.hash.substring(0,12)}</span>
                    </div>
                  ))}
               </div>
            </div>
         </section>

         {/* ADVISORY & PULSE (4 COLS ON DESKTOP) */}
         <section className="lg:col-span-4 flex flex-col gap-8 lg:gap-12">
            <div className="flex-1 ai-panel p-10 bg-gradient-to-br from-amber-500/5 to-transparent border-white/5 relative overflow-hidden heat-1 flex flex-col">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-8xl pointer-events-none">☯️</div>
               <div className="flex items-center gap-5 mb-10 shrink-0">
                  <AIAvatar personaId={PersonaID.THIEN} size="md" isThinking={false} />
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Cố vấn thiên</h3>
                    <p className="text-[8px] text-amber-600 font-bold uppercase mt-1">Supreme Protocol Active</p>
                  </div>
               </div>
               <div className="flex-1 bg-black/60 p-8 rounded-[2.5rem] border border-white/5 relative z-10 shadow-inner italic font-light text-gray-400 text-sm leading-relaxed">
                  {isMaster 
                     ? `"Thưa Anh Natt, thiên đã đồng bộ Shard đối soát. Phát hiện rò rỉ 1.2% tại Node Kim cương tấm. Đề xuất lệnh rà soát kho HCM ngay."`
                     : `"Chào Chủ Doanh Nghiệp, hệ thống đang ở trạng thái an toàn. Doanh thu Net đang bám sát kịch bản Tấn Công đã thiết lập."`
                  }
               </div>
               <button className="mt-10 w-full py-5 heat-2 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:heat-3 transition-all active:scale-95 shadow-xl">
                  RÀ SOÁT RỦI RO CHIẾN LƯỢC
               </button>
            </div>
            
            <div className="h-64 ai-panel p-10 heat-0 border-white/5 bg-black/40 flex flex-col justify-between group overflow-hidden">
               <div className="flex justify-between items-center">
                  <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-widest">SECURITY PULSE</h3>
                  <span className="text-[10px] text-green-500 font-black">ENCRYPTED</span>
               </div>
               <div className="space-y-6">
                  <div className="flex justify-between items-center text-[10px]">
                     <span className="text-gray-600 font-bold uppercase tracking-widest group-hover:text-gray-400">Isolated Shards:</span>
                     <span className="text-white font-mono font-black italic">32/32 ACTIVE</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 w-[98%] animate-pulse"></div>
                  </div>
               </div>
            </div>
         </section>
      </div>
    </div>
  );
};

export default Dashboard;
