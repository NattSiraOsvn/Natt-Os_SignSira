
import React, { useState } from 'react';
import { BusinessMetrics, UserRole, UserPosition, ActionLog, PersonaID } from '../types';
import AIAvatar from './AIAvatar';
import { NattMedal } from './common/NattMedal';

interface MasterDashboardProps {
  metrics: BusinessMetrics;
  actionLogs: ActionLog[];
  currentRole: UserRole;
  currentPosition: UserPosition;
}

const MasterDashboard: React.FC<MasterDashboardProps> = ({ metrics, actionLogs, currentRole, currentPosition }) => {
  const [activeApprovalTab, setActiveApprovalTab] = useState<'PROD' | 'FINANCE' | 'HR'>('PROD');

  return (
    <div className="h-full flex flex-col p-8 md:p-12 overflow-y-auto no-scrollbar gap-8 bg-[#020202] pb-40 animate-in fade-in duration-700">
      
      {/* 1. SUPREME HUD - NATT-CELL MEDALS (Bắt Xung HEYNA OPT-01R) */}
      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 shrink-0">
          {[
            { label: 'Doanh thu Thuần (NET)', value: metrics.revenue.toLocaleString() + ' đ', color: 'text-cyan-400', icon: '💰', domain: 'finance' },
            { label: 'Thuế phải nộp (VAT/TNDN)', value: metrics.totalTaxDue.toLocaleString() + ' đ', color: 'text-red-400', icon: '⚖️', domain: 'tax' },
            { label: 'Quỹ Lương Hệ Thống', value: metrics.totalPayroll.toLocaleString() + ' đ', color: 'text-indigo-400', icon: '👥', domain: 'hr' },
            { label: 'Chi phí vận hành', value: metrics.currentOperatingCost.toLocaleString() + ' đ', color: 'text-pink-400', icon: '📉', domain: 'finance' },
            { label: 'Nhập khẩu (GEMS/GOLD)', value: metrics.importVolume.toLocaleString() + ' lô', color: 'text-amber-500', icon: '🚢', domain: 'customs' },
          ].map((stat, i) => (
            <NattMedal 
              key={i} 
              label={stat.label} 
              value={stat.value} 
              icon={stat.icon} 
              colorClass={stat.color} 
              domain={stat.domain} 
            />
          ))}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 flex-1">
         
         {/* 2. CỘT TRÁI: PHÊ DUYỆT & CAD */}
         <div className="space-y-8">
            {/* LỆNH CẦN DUYỆT - URGENT HUB */}
            <div className="ai-panel p-8 bg-amber-500/[0.03] border-amber-500/20 shadow-2xl relative overflow-hidden h-[450px] flex flex-col">
               <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-[100px]">🔔</div>
               <div className="flex justify-between items-center mb-8 shrink-0">
                  <h3 className="ai-sub-headline text-amber-500 italic">PHÊ DUYỆT MASTER ({metrics.pendingApprovals})</h3>
                  <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                     {(['PROD', 'FINANCE', 'HR'] as const).map(t => (
                        <button key={t} onClick={() => setActiveApprovalTab(t)} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${activeApprovalTab === t ? 'bg-amber-500 text-black shadow-lg' : 'text-gray-500'}`}>{t}</button>
                     ))}
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="p-4 bg-black/60 border border-white/5 rounded-2xl flex justify-between items-center group hover:border-amber-500/50 transition-all cursor-pointer">
                       <div>
                          <p className="text-[11px] font-bold text-white uppercase">{activeApprovalTab === 'PROD' ? 'Duyệt Hao Hụt Đúc (-2.1%)' : activeApprovalTab === 'FINANCE' ? 'Ký Hóa Đơn TCT' : 'Duyệt Lương Thợ Nguội'}</p>
                          <p className="text-[9px] text-gray-500 font-mono mt-1 italic opacity-60">Shard-ID: 0x{Math.random().toString(16).slice(2, 8).toUpperCase()}</p>
                       </div>
                       <button className="px-4 py-2 bg-amber-500 text-black text-[9px] font-black uppercase rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg">DUYỆT</button>
                    </div>
                  ))}
               </div>
               <button className="w-full mt-6 py-4 border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase rounded-xl hover:bg-amber-500 hover:text-black transition-all shrink-0">Bảng phê duyệt chi tiết</button>
            </div>

            {/* CAD & BẢN VẼ 3D - DESIGN SHARD */}
            <div className="ai-panel p-8 bg-blue-500/[0.03] border-blue-500/20">
               <h3 className="ai-sub-headline text-blue-400 mb-8 italic">THEO DÕI CAD & IN SÁP (4K)</h3>
               <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Bản vẽ chờ duyệt', val: metrics.cadPending, icon: '📐' },
                    { label: 'In sáp Ready', val: '08', icon: '🕯️' },
                    { label: 'Thợ vẽ Online', val: '03', icon: '🎨' },
                    { label: 'Lỗi Mesh 3D', val: '01', icon: '⚠️', color: 'text-red-500' }
                  ].map((item, i) => (
                    <div key={i} className="p-5 bg-black/40 border border-white/5 rounded-2xl flex flex-col gap-2 hover:border-blue-400/30 transition-all group">
                       <div className="flex justify-between items-center">
                          <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                          <span className={`text-xl font-mono font-black ${item.color || 'text-white'}`}>{item.val}</span>
                       </div>
                       <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">{item.label}</p>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         {/* 3. CỘT GIỮA: VẬN HÀNH XƯỞNG & NHẬP KHẨU */}
         <div className="space-y-8">
            {/* TIẾN ĐỘ XƯỞNG - PRODUCTION LEDGER */}
            <div className="ai-panel p-8 border-indigo-500/20 bg-indigo-900/10 h-[450px] flex flex-col">
               <h3 className="ai-sub-headline text-indigo-400 mb-8 flex items-center gap-3 italic">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,1)]"></span>
                  XƯỞNG SẢN XUẤT (SNT TRACKING)
               </h3>
               <div className="flex-1 space-y-8 overflow-y-auto no-scrollbar pr-2">
                  {[
                    { stage: 'Chuẩn bị phôi đúc', p: 85, color: 'bg-blue-500', count: '12 SP', detail: 'Đang đổ thạch cao' },
                    { stage: 'Chế tác nguội', p: 62, color: 'bg-amber-500', count: '45 SP', detail: 'Thợ Vẹn, Phúc, Sơn' },
                    { stage: 'Gắn đá quý (Hột)', p: 40, color: 'bg-purple-500', count: '28 SP', detail: 'Hột tấm 2.4mm' },
                    { stage: 'Xi mạ & Kiểm định QC', p: 15, color: 'bg-green-500', count: '06 SP', detail: 'Vàng trắng 18K' }
                  ].map(s => (
                    <div key={s.stage} className="space-y-3">
                       <div className="flex justify-between items-end">
                          <div>
                             <span className="text-[10px] text-white font-bold uppercase tracking-tight">{s.stage}</span>
                             <p className="text-[9px] text-gray-500 italic mt-0.5">{s.detail}</p>
                          </div>
                          <span className="text-[10px] text-white font-mono font-black">{s.count} | {s.p}%</span>
                       </div>
                       <div className="h-2 bg-white/5 rounded-full overflow-hidden shadow-inner">
                          <div className={`h-full ${s.color} transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.2)]`} style={{ width: `${s.p}%` }}></div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* NHẬP KHẨU & TỜ KHAI - CUSTOMS SHARD */}
            <div className="ai-panel p-8 border-green-500/20 bg-green-500/[0.02]">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="ai-sub-headline text-green-500 italic">LOGISTICS & TỜ KHAI (52 CỘT)</h3>
                  <button className="text-[8px] font-black text-green-400 uppercase tracking-widest hover:underline">Xem Robot</button>
               </div>
               <div className="space-y-4">
                  {[
                    { id: '1062345678', name: 'Lô Kim Cương GIA (HK)', status: 'HQ THÔNG QUAN', stream: 'YELLOW', color: 'text-amber-400' },
                    { id: '1062345699', name: 'Phôi Vàng 18K (Italy)', status: 'ĐANG VẬN CHUYỂN', stream: 'GREEN', color: 'text-green-400' }
                  ].map(ship => (
                    <div key={ship.id} className="p-5 bg-black/40 border border-white/5 rounded-2xl flex justify-between items-center group hover:border-green-400/30 transition-all">
                       <div>
                          <p className="text-xs font-bold text-white uppercase tracking-tight group-hover:text-green-400 transition-colors">{ship.name}</p>
                          <p className={`text-[9px] font-black uppercase mt-1 ${ship.color}`}>{ship.status}</p>
                       </div>
                       <div className="text-right">
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${ship.stream === 'YELLOW' ? 'border-amber-500/30 text-amber-500' : 'border-green-500/30 text-green-500'}`}>{ship.stream}</span>
                          <p className="text-[8px] text-gray-700 font-black mt-2">ID: {ship.id}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         {/* 4. CỘT PHẢI: KINH DOANH & THUẾ */}
         <div className="space-y-8">
            {/* KINH DOANH & HÓA ĐƠN ĐT - FISCAL SHARD */}
            <div className="ai-panel p-8 border-cyan-500/20 bg-cyan-500/[0.02] h-[450px] flex flex-col">
               <h3 className="ai-sub-headline text-cyan-400 mb-8 italic">POS MERCHANT & HÓA ĐƠN (TCT)</h3>
               <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-6 bg-black/40 rounded-3xl border border-white/5 text-center">
                        <p className="text-[9px] text-gray-500 font-black uppercase mb-2">Đơn bóc tách 24h</p>
                        <p className="text-3xl font-mono font-black text-white">42</p>
                     </div>
                     <div className="p-6 bg-black/40 rounded-3xl border border-white/5 text-center">
                        <p className="text-[9px] text-gray-500 font-black uppercase mb-2">Đã Ký Số (TCT)</p>
                        <p className="text-3xl font-mono font-black text-green-400">156</p>
                     </div>
                  </div>
                  <div className="p-8 bg-cyan-400/5 border border-cyan-400/20 rounded-[2.5rem] shadow-inner">
                     <p className="text-[10px] text-cyan-400 font-black uppercase mb-6 tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                        Đối soát Dòng tiền POS
                     </p>
                     <div className="space-y-5">
                        {[
                           { name: 'Vietcombank Merchant', val: '1.250.450.000 đ' },
                           { name: 'Momo Business', val: '450.200.000 đ' },
                           { name: 'ZaloPay Enterprise', val: '312.000.000 đ' }
                        ].map((m, i) => (
                           <div key={i} className="flex justify-between items-center text-[11px] group">
                              <span className="text-gray-500 group-hover:text-gray-300 transition-colors uppercase font-bold tracking-tight">{m.name}:</span>
                              <span className="text-white font-mono font-black">{m.val}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
               <button className="w-full mt-6 py-4 bg-white/5 border border-white/10 text-gray-400 text-[10px] font-black uppercase rounded-xl hover:text-cyan-400 transition-all shrink-0">Chi tiết Sổ cái Thuế</button>
            </div>

            {/* AI ADVISORY - THIÊN STRATEGIC */}
            <div className="flex-1 ai-panel p-10 flex flex-col items-center text-center bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20 relative shadow-2xl overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-9xl group-hover:opacity-[0.05] transition-opacity">🏛️</div>
               <AIAvatar personaId={PersonaID.THIEN} size="lg" isThinking={false} />
               <h4 className="mt-8 ai-sub-headline text-amber-500 italic">TỔNG THAM MƯU THIÊN</h4>
               <div className="mt-6 p-6 bg-black/60 rounded-[2.5rem] border border-white/5 italic font-light text-gray-400 text-[13px] leading-relaxed relative z-10 shadow-inner">
                  "Thưa Anh Natt, Robot đã đồng bộ **52 cột tờ khai**. Thiên phát hiện chênh lệch thuế VAT hàng nhập khẩu 1.5% tại Shard HK-2026. Anh nên thực hiện lệnh **AUDIT SCAN** ngay."
               </div>
               <div className="mt-8 w-full space-y-3 relative z-10">
                  <button className="w-full py-4 bg-amber-500 text-black font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-amber-400 shadow-xl transition-all active:scale-95">XÁC THỰC SHARD 2026</button>
                  <p className="text-[9px] text-gray-700 font-black uppercase tracking-[0.4em] italic opacity-60">Status: Omega Secure Sharding</p>
               </div>
            </div>
         </div>

      </div>

      {/* 5. BOTTOM LEDGER - NHẬT KÝ THỰC THI (BLOCKCHAIN LOG) */}
      <section className="ai-panel p-8 bg-black/40 border-white/10 h-64 flex flex-col shrink-0 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
         <h3 className="ai-sub-headline text-gray-500 mb-6 italic tracking-[0.5em] uppercase">IMMUTABLE AUDIT TRAIL (SHARD LOGS)</h3>
         <div className="flex-1 overflow-y-auto no-scrollbar font-mono text-[10px] space-y-3">
            {actionLogs.slice(0, 20).map(log => (
              <div key={log.id} className="flex gap-8 border-l border-white/10 pl-6 py-1 group hover:border-amber-500 transition-all relative">
                 <div className="absolute left-[-3px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white/10 rounded-full group-hover:bg-amber-500"></div>
                 <span className="text-cyan-500 shrink-0 font-black opacity-60 group-hover:opacity-100">{new Date(log.timestamp).toLocaleTimeString()}</span>
                 <p className="text-gray-400 truncate flex-1">
                    <span className="text-white font-bold uppercase tracking-widest">[{log.module}]</span> 
                    <span className="ml-4 italic text-gray-500">{log.action}: {log.details}</span>
                 </p>
                 <span className="text-[8px] text-gray-800 font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">Hash: {log.hash.substring(0, 16)}...</span>
              </div>
            ))}
         </div>
      </section>

    </div>
  );
};

export default MasterDashboard;
