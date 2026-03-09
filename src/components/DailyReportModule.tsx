
import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserRole, UserPosition, OrderStatus, 
  ProductionOrder, PersonaID, LearnedTemplate
} from '../types';
import { LearningEngine } from '@/governance/qneu/learning.engine';
import AIAvatar from './AIAvatar';

interface DailyReportModuleProps {
  currentRole: UserRole;
  currentPosition: UserPosition;
  logAction: (action: string, details: string) => void;
}

const DailyReportModule: React.FC<DailyReportModuleProps> = ({ currentRole, currentPosition, logAction }) => {
  const [learnedTpl, setLearnedTpl] = useState<any | null>(null);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Guard Rail: Kiểm tra quyền phê duyệt thực tế tại Client
  const canActuallyApprove = useMemo(() => {
    return [UserRole.MASTER, UserRole.LEVEL_1, UserRole.LEVEL_2, UserRole.LEVEL_3].includes(currentRole);
  }, [currentRole]);

  useEffect(() => {
    const tpl = LearningEngine.getTemplate(currentPosition);
    if (tpl) setLearnedTpl(tpl);
  }, [currentPosition]);

  const handleToggleTask = (taskId: string, isApprovalTask: boolean) => {
    // Nếu là task phê duyệt nhưng user là nhân viên -> Chặn
    if (isApprovalTask && !canActuallyApprove) {
      alert("⚠️ QUYỀN TRUY CẬP BỊ TỪ CHỐI: Bạn không có thẩm quyền phê duyệt tác vụ này.");
      return;
    }
    setCompletedTasks(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmitProtocol = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      /* Fix: currentPosition is an object, use role property for logging */
      logAction('DAILY_PROTOCOL_COMMIT', `Nhân sự ${currentPosition.role} đã hoàn thành báo cáo tác vụ.`);
      alert("Giao thức đã được niêm phong vào Blockchain. Chúc Anh một ngày làm việc năng suất!");
      setCompletedTasks([]);
      setFormData({});
      setIsSubmitting(false);
    }, 1500);
  };

  if (!learnedTpl) {
    return (
      <div className="h-full flex flex-col bg-[#020202] p-8 md:p-12 items-center justify-center text-center opacity-40">
         <div className="text-8xl mb-10 grayscale">🏢</div>
         <h2 className="text-3xl font-serif uppercase tracking-widest italic">Terminal đang chờ Shard cấu hình</h2>
         <p className="max-w-md mt-6 text-xs text-gray-500 leading-relaxed font-light">
           {/* Fix: currentPosition is an object, access role property */}
           "Thưa Anh Natt, vị trí **${currentPosition.role}** chưa được huấn luyện quy trình đặc thù. Anh vui lòng truy cập **NEURAL LEARNING** để thiết lập giao thức thực thi cho nhân sự này."
         </p>
      </div>
    );
  }

  const progress = Math.round((completedTasks.length / learnedTpl.dailyTasks.length) * 100);

  return (
    <div className="h-full flex flex-col bg-[#020202] p-8 md:p-12 overflow-y-auto no-scrollbar gap-10 animate-in fade-in duration-700 pb-32">
      <header className="border-b border-white/5 pb-10 flex flex-col lg:flex-row justify-between items-end gap-8">
        <div>
          <h2 className="ai-headline text-5xl italic uppercase tracking-tighter">DAILY ACTIVE PROTOCOL</h2>
          {/* Fix: currentPosition is an object, render role property */}
          <p className="ai-sub-headline text-cyan-300/40 mt-3 italic uppercase font-black tracking-[0.3em]">
             IDENT: {currentPosition.role} • ROLE: {currentRole.split(' (')[0]}
          </p>
        </div>
        <div className="flex gap-10 items-center">
           {!canActuallyApprove && (
              <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                 <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest italic">Chế độ: Thực thi trực tiếp</p>
              </div>
           )}
           <div className="text-right">
              <p className="text-4xl font-mono font-black text-amber-500 italic">{progress}%</p>
              <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-2">Completion status</p>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
         {/* TASK LIST SECTION */}
         <div className="xl:col-span-2 space-y-8">
            <div className="ai-panel p-10 bg-black/40 border-white/10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                  <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
               </div>
               <h3 className="text-xl font-bold mb-10 italic gold-gradient uppercase tracking-widest flex items-center gap-4">
                  <span className="text-2xl">📋</span> {canActuallyApprove ? 'Danh mục Kiểm soát & Phê duyệt' : 'Danh mục Tác vụ Thực thi'}
               </h3>

               <div className="space-y-6">
                  {learnedTpl.dailyTasks.map((t: any, i: number) => {
                    const isCritical = t.isCritical;
                    const isApproval = t.canApprove;
                    const isCompleted = completedTasks.includes(`task-${i}`);

                    // Logic hiển thị: Nếu là task phê duyệt mà user là nhân viên -> Hiện mờ/Vô hiệu hóa
                    const isDisabled = isApproval && !canActuallyApprove;

                    return (
                      <div 
                        key={i} 
                        onClick={() => !isDisabled && handleToggleTask(`task-${i}`, isApproval)}
                        className={`p-6 rounded-[2.5rem] border transition-all flex items-center gap-8 group ${
                          isCompleted 
                          ? 'bg-green-500/10 border-green-500/30 opacity-60' 
                          : isDisabled ? 'bg-white/[0.01] border-white/5 opacity-30 cursor-not-allowed' :
                            isCritical ? 'bg-red-500/[0.03] border-red-500/20' : 'bg-white/[0.02] border-white/10 hover:border-amber-500/30'
                        } ${!isDisabled ? 'cursor-pointer' : ''}`}
                      >
                         <div className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
                            isCompleted ? 'bg-green-500 border-green-500 text-black' : 
                            isDisabled ? 'border-gray-800' : 'border-white/10 text-transparent group-hover:border-amber-500/50'
                         }`}>
                            {isCompleted ? '✓' : isDisabled ? '🔒' : ''}
                         </div>
                         <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                               {isCritical && <span className="px-2 py-0.5 bg-red-600 text-white text-[7px] font-black rounded uppercase">Trọng yếu</span>}
                               {isApproval && <span className="px-2 py-0.5 bg-amber-600 text-black text-[7px] font-black rounded uppercase">Quyền Phê Duyệt</span>}
                               <h4 className={`text-sm font-bold uppercase tracking-tight ${isCompleted ? 'text-green-400 line-through' : 'text-white'}`}>
                                  {t.task}
                               </h4>
                            </div>
                            <p className="text-[11px] text-gray-500 italic font-light">
                               {isDisabled ? "Giao thức này chỉ dành cho cấp Quản lý/Master." : t.description}
                            </p>
                         </div>
                         {!isDisabled && isApproval && (
                            <div className="px-4 py-2 bg-amber-500 text-black text-[9px] font-black uppercase rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                               Duyệt ngay
                            </div>
                         )}
                      </div>
                    );
                  })}
               </div>
            </div>
         </div>

         {/* DATA INPUT SECTION */}
         <div className="space-y-8">
            <div className="ai-panel p-10 bg-gradient-to-br from-indigo-900/10 to-transparent border-indigo-500/20 shadow-2xl">
               <h3 className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em] mb-10 border-b border-white/5 pb-4 italic">Bóc tách dữ liệu Node</h3>
               
               <div className="space-y-8">
                  {learnedTpl.fields.map((f: any) => (
                    <div key={f.id} className="space-y-3">
                       <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1 flex justify-between">
                          <span>{f.label} {f.required && '*'}</span>
                          <span className="text-indigo-600 text-[8px] font-mono">TYPE: {f.type}</span>
                       </label>
                       {f.type === 'boolean' ? (
                          <div className="flex gap-4">
                             <button onClick={() => handleInputChange(f.id, true)} className={`flex-1 py-3 rounded-xl border text-[10px] font-bold transition-all ${formData[f.id] === true ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white/5 border-white/10 text-gray-500'}`}>ĐẠT</button>
                             <button onClick={() => handleInputChange(f.id, false)} className={`flex-1 py-3 rounded-xl border text-[10px] font-bold transition-all ${formData[f.id] === false ? 'bg-red-600 text-white border-red-500' : 'bg-white/5 border-white/10 text-gray-500'}`}>LỖI</button>
                          </div>
                       ) : (
                          <input 
                            type={f.type === 'number' ? 'number' : 'text'}
                            value={formData[f.id] || ''}
                            onChange={(e) => handleInputChange(f.id, e.target.value)}
                            className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none focus:border-amber-500 transition-all font-light"
                            placeholder="Nhập giá trị Shard..."
                          />
                       )}
                    </div>
                  ))}
               </div>

               <button 
                 onClick={handleSubmitProtocol}
                 disabled={isSubmitting || progress < 100}
                 className="w-full mt-12 py-6 bg-amber-500 text-black font-black text-[11px] uppercase tracking-[0.4em] rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.2)] hover:bg-amber-400 transition-all active:scale-95 disabled:opacity-20"
               >
                 {isSubmitting ? '⌛ ĐANG NIÊM PHONG SHARD...' : 'KÝ XÁC THỰC GIAO THỨC →'}
               </button>
            </div>

            <div className="ai-panel p-8 bg-black/40 border-white/5">
               <h4 className="ai-sub-headline text-amber-500 mb-6 flex items-center gap-3">
                  <AIAvatar personaId={PersonaID.THIEN} size="sm" isThinking={false} />
                  Tham mưu Bảo mật (Thiên)
               </h4>
               <p className="text-[12px] text-gray-400 italic leading-relaxed font-light">
                 {/* Fix: currentPosition is an object, access role property */}
                 {canActuallyApprove 
                   ? `"Thưa Anh Natt, Terminal của Anh đang ở chế độ Quản trị tối cao. Mọi hành động phê duyệt của Anh sẽ được băm Hash trực tiếp vào Ledger trung tâm."`
                   : `"Chào nhân sự ${currentPosition.role}, hệ thống đã vô hiệu hóa các tác vụ 'Phê duyệt'. Anh chỉ có quyền thực thi và báo cáo dữ liệu lên Shard cấp cao."`
                 }
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DailyReportModule;
