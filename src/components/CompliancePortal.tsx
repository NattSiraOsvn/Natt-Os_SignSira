// @ts-nocheck — TODO: fix type errors, remove this pragma


import React, { useState, useEffect, useMemo } from 'react';
import { RBACEngine } from '@/cells/kernel/rbac-cell/domain/services/rbac.engine';
import { ComplianceViolation, UserRole, PersonaID } from '../types';
import AIAvatar from './AIAvatar';
import { ExportEngine } from '@/core/infrastructure/export.engine';

// --- MOCK REGULATION DATABASE ---
const REGULATIONS = [
  { id: 'ND-24/2012', title: 'Nghị định 24/2012/NĐ-CP', category: 'GOLD_BUSINESS', desc: 'Quản lý hoạt động kinh doanh vàng. Nhà nước độc quyền sản xuất vàng miếng SJC. Điều kiện cấp phép kinh doanh mua bán vàng miếng.' },
  { id: 'TT-200/2014', title: 'Thông tư 200/2014/TT-BTC', category: 'FINANCE', desc: 'Chế độ kế toán doanh nghiệp. Hướng dẫn hạch toán tài khoản 511 (Doanh thu), 632 (Giá vốn) và báo cáo tài chính.' },
  { id: 'L-PCRT-2022', title: 'Luật Phòng chống rửa tiền 2022', category: 'AML_RISK', desc: 'Báo cáo giao dịch giá trị lớn (>400 triệu đồng) và giao dịch đáng ngờ. Nhận biết khách hàng (KYC).' },
  { id: 'ND-98/2020', title: 'Nghị định 98/2020/NĐ-CP', category: 'TRADE', desc: 'Xử phạt vi phạm hành chính trong hoạt động thương mại, sản xuất, buôn bán hàng giả, hàng cấm.' },
  { id: 'L-HQ-2014', title: 'Luật Hải Quan 2014', category: 'IMPORT_EXPORT', desc: 'Quy định về thủ tục hải quan, kiểm tra, giám sát hải quan đối với hàng hóa xuất khẩu, nhập khẩu.' }
];

const CompliancePortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'REGULATIONS' | 'REPORTS'>('DASHBOARD');
  const [violations, setViolations] = useState<ComplianceViolation[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [complianceScore, setComplianceScore] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');

  // --- AUTOMATED SCAN LOGIC ---
  const runSystemAudit = () => {
    setIsScanning(true);
    // Simulate deep scan latency
    setTimeout(() => {
      // 1. Get RBAC Violations
      const rbacIssues = RBACEngine.checkCompliance();
      
      // 2. Mock Logic Checks (Rule-based)
      const logicIssues: ComplianceViolation[] = [];
      
      // Rule: Cash Limit Check
      const randomCashCheck = Math.random();
      if (randomCashCheck > 0.7) {
        logicIssues.push({
          id: `AML-${Date.now()}`,
          type: 'LUẬT PHÒNG CHỐNG RỬA TIỀN',
          description: 'Phát hiện 03 giao dịch tiền mặt > 400 triệu chưa có báo cáo STR (Suspicious Transaction Report).',
          severity: 'HIGH',
          timestamp: Date.now()
        });
      }

      // Rule: Inventory License Check
      const randomLicenseCheck = Math.random();
      if (randomLicenseCheck > 0.8) {
        logicIssues.push({
          id: `LIC-${Date.now()}`,
          type: 'GIẤY PHÉP KINH DOANH VÀNG',
          description: 'Giấy chứng nhận đủ điều kiện kinh doanh vàng miếng tại CN Hà Nội sắp hết hạn (còn 15 ngày).',
          severity: 'MEDIUM',
          timestamp: Date.now()
        });
      }

      const allViolations = [...rbacIssues, ...logicIssues];
      setViolations(allViolations);
      
      // Calculate Score (Simple Algorithm)
      // Base 100. Critical -15, High -10, Medium -5, Low -2
      let scoreDeduction = 0;
      allViolations.forEach(v => {
        if (v.severity === 'CRITICAL') scoreDeduction += 15;
        else if (v.severity === 'HIGH') scoreDeduction += 10;
        else if (v.severity === 'MEDIUM') scoreDeduction += 5;
        else scoreDeduction += 2;
      });
      
      setComplianceScore(Math.max(0, 100 - scoreDeduction));
      setIsScanning(false);
    }, 2000);
  };

  useEffect(() => {
    runSystemAudit();
  }, []);

  const handleExportReport = async () => {
    await ExportEngine.toExcel(violations, `COMPLIANCE_AUDIT_${new Date().toISOString().split('T')[0]}`);
    alert("Đã xuất báo cáo vi phạm thành công.");
  };

  const filteredRegulations = useMemo(() => {
    return REGULATIONS.filter(r => 
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="p-8 md:p-12 max-w-[1800px] mx-auto h-full overflow-y-auto space-y-12 animate-in fade-in duration-700 pb-32 no-scrollbar bg-[#020202]">
      
      <header className="flex flex-col lg:flex-row justify-between items-end border-b border-white/5 pb-10 gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
             <span className="text-4xl">⚖️</span>
             <h2 className="ai-headline text-5xl italic uppercase tracking-tighter">Compliance Sentinel</h2>
          </div>
          <p className="ai-sub-headline text-indigo-300/40 ml-1 italic uppercase font-black tracking-[0.3em]">Hệ thống Kiểm soát Tuân thủ & Pháp chế Doanh nghiệp</p>
        </div>
        
        <div className="flex gap-4 items-center">
           <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10 shrink-0">
              {['DASHBOARD', 'REGULATIONS', 'REPORTS'].map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab as any)}
                   className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
                      activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'
                   }`}
                 >
                    {tab === 'DASHBOARD' ? 'TỔNG QUAN' : tab === 'REGULATIONS' ? 'THƯ VIỆN LUẬT' : 'BÁO CÁO'}
                 </button>
              ))}
           </div>
           
           <button 
             onClick={runSystemAudit}
             disabled={isScanning}
             className="px-8 py-4 bg-red-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-red-500 transition-all active:scale-95 flex items-center gap-3"
           >
             {isScanning ? '⏳ SYSTEM SCANNING...' : '🔍 QUÉT RỦI RO NGAY'}
           </button>
        </div>
      </header>

      {/* --- DASHBOARD TAB --- */}
      {activeTab === 'DASHBOARD' && (
         <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            {/* LEFT: SCORECARD & ADVISOR */}
            <div className="space-y-8">
               <div className="ai-panel p-10 bg-gradient-to-br from-indigo-900/10 to-transparent border-indigo-500/20 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-6">Điểm tín nhiệm tuân thủ</h3>
                  
                  <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                     <svg className="w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
                           strokeDasharray={552} 
                           strokeDashoffset={552 - (552 * complianceScore) / 100}
                           className={`${getScoreColor(complianceScore)} transition-all duration-1000 ease-out`} 
                        />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-6xl font-mono font-black ${getScoreColor(complianceScore)}`}>{complianceScore}</span>
                        <span className="text-[9px] text-gray-500 font-bold uppercase mt-1">/ 100 POINTS</span>
                     </div>
                  </div>

                  <div className={`px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                     complianceScore >= 90 ? 'bg-green-500/10 border-green-500/30 text-green-500' :
                     complianceScore >= 70 ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                     'bg-red-500/10 border-red-500/30 text-red-500'
                  }`}>
                     {complianceScore >= 90 ? 'EXCELLENT COMPLIANCE' : complianceScore >= 70 ? 'warnING STATE' : 'CRITICAL RISK'}
                  </div>
               </div>

               <div className="ai-panel p-8 border-amber-500/30 bg-amber-500/5 shadow-xl">
                  <div className="flex items-center gap-4 mb-4">
                     <AIAvatar personaId={PersonaID.KRIS} size="sm" isThinking={isScanning} />
                     <h4 className="text-sm font-black text-amber-500 uppercase tracking-widest">Cố vấn Pháp chế (Kris)</h4>
                  </div>
                  <p className="text-[12px] text-gray-400 italic leading-relaxed font-light">
                     {complianceScore === 100 
                       ? `"Chúc mừng Anh Natt, hệ thống hiện tại không phát hiện vi phạm trọng yếu nào. Các chỉ số về AML và Giấy phép đều ở mức an toàn."`
                       : `"Thưa Anh, Kris phát hiện ${violations.length} vấn đề cần lưu ý. Đặc biệt là các cảnh báo về ${violations.find(v=>v.severity==='HIGH' || v.severity==='CRITICAL')?.type || 'Quy trình'}. Đề nghị khắc phục ngay để tránh bị phạt hành chính."`
                     }
                  </p>
               </div>
            </div>

            {/* RIGHT: VIOLATION LIST */}
            <div className="xl:col-span-2 ai-panel p-10 bg-black/40 border-white/10 flex flex-col h-[600px]">
               <div className="flex justify-between items-center mb-8 shrink-0">
                  <h3 className="ai-sub-headline text-red-400 italic">Nhật ký Vi phạm (Live Feed)</h3>
                  <div className="flex gap-2">
                     <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                     <span className="text-[9px] text-red-500 font-black uppercase tracking-widest">Real-time Monitoring</span>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                  {violations.map(v => (
                    <div key={v.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] flex justify-between items-center group hover:border-red-500/30 transition-all hover:bg-white/[0.04]">
                       <div className="flex items-center gap-6">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
                             v.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-500' : 
                             v.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-500' :
                             'bg-blue-500/20 text-blue-400'
                          }`}>
                             {v.severity === 'CRITICAL' ? '🚫' : v.severity === 'HIGH' ? '⚠️' : 'ℹ️'}
                          </div>
                          <div>
                             <p className="text-white font-bold text-xs uppercase tracking-widest mb-1">{v.type}</p>
                             <p className="text-[11px] text-gray-400 italic font-light max-w-lg">{v.description}</p>
                          </div>
                       </div>
                       <div className="text-right pl-4 border-l border-white/5">
                          <span className={`px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest ${
                             v.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 
                             v.severity === 'HIGH' ? 'bg-amber-500 text-black' : 
                             'bg-blue-600 text-white'
                          }`}>
                             {v.severity}
                          </span>
                          <p className="text-[8px] text-gray-600 mt-2 font-mono">{new Date(v.timestamp).toLocaleTimeString()}</p>
                       </div>
                    </div>
                  ))}

                  {violations.length === 0 && !isScanning && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 italic">
                       <span className="text-8xl mb-6 grayscale">🛡️</span>
                       <p className="text-xl uppercase tracking-widest font-serif">Hệ thống an toàn tuyệt đối</p>
                    </div>
                  )}
                  
                  {isScanning && (
                     <div className="p-10 text-center">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Đang đối soát 120 quy tắc luật...</p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}

      {/* --- REGULATIONS TAB --- */}
      {activeTab === 'REGULATIONS' && (
         <div className="animate-in slide-in-from-right-10">
            <div className="ai-panel p-10 bg-black/40 border-white/10 h-[700px] flex flex-col">
               <div className="flex justify-between items-center mb-8 shrink-0">
                  <h3 className="text-2xl font-serif gold-gradient italic uppercase tracking-tighter">Cơ sở dữ liệu Luật (Law Library)</h3>
                  <div className="relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs">🔍</span>
                     <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm nghị định, thông tư..." 
                        className="bg-black/60 border border-white/10 rounded-xl pl-10 pr-6 py-3 text-[10px] text-white outline-none focus:border-indigo-500 w-80 uppercase font-bold"
                     />
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredRegulations.map((reg, i) => (
                     <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-indigo-500/30 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                           <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-indigo-400 uppercase tracking-widest border border-white/5 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-colors">
                              {reg.category.replace('_', ' ')}
                           </span>
                           <span className="text-[10px] font-mono text-gray-600">{reg.id}</span>
                        </div>
                        <h4 className="text-lg font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">{reg.title}</h4>
                        <p className="text-xs text-gray-400 leading-relaxed font-light italic border-t border-white/5 pt-3">
                           {reg.desc}
                        </p>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      )}

      {/* --- REPORTS TAB --- */}
      {activeTab === 'REPORTS' && (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in slide-in-from-bottom-4">
            <div className="ai-panel p-10 bg-black/40 border-white/10 flex flex-col items-center text-center">
               <span className="text-6xl mb-6 grayscale opacity-50">📑</span>
               <h4 className="text-lg font-bold text-white uppercase mb-2">Báo cáo Kiểm soát Rủi ro</h4>
               <p className="text-[10px] text-gray-500 mb-8 italic">Tổng hợp vi phạm, mức độ rủi ro và khuyến nghị khắc phục.</p>
               <button onClick={handleExportReport} className="w-full py-4 bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase rounded-xl hover:bg-white/10 transition-all">
                  Xuất Excel (XLSX)
               </button>
            </div>
            
            <div className="ai-panel p-10 bg-black/40 border-white/10 flex flex-col items-center text-center">
               <span className="text-6xl mb-6 grayscale opacity-50">📜</span>
               <h4 className="text-lg font-bold text-white uppercase mb-2">Báo cáo Tuân thủ AML</h4>
               <p className="text-[10px] text-gray-500 mb-8 italic">Danh sách giao dịch trên 400M và hồ sơ KYC khách hàng.</p>
               <button onClick={() => alert("Đang trích xuất dữ liệu AML...")} className="w-full py-4 bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase rounded-xl hover:bg-white/10 transition-all">
                  Xuất báo cáo STR
               </button>
            </div>

            <div className="ai-panel p-10 bg-black/40 border-white/10 flex flex-col items-center text-center">
               <span className="text-6xl mb-6 grayscale opacity-50">🔐</span>
               <h4 className="text-lg font-bold text-white uppercase mb-2">Nhật ký Phân quyền (RBAC)</h4>
               <p className="text-[10px] text-gray-500 mb-8 italic">Lịch sử thay đổi quyền hạn và truy cập hệ thống.</p>
               <button onClick={() => alert("Đang trích xuất Audit Log...")} className="w-full py-4 bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase rounded-xl hover:bg-white/10 transition-all">
                  Xuất Audit Log
               </button>
            </div>
         </div>
      )}

    </div>
  );
};

export default CompliancePortal;
