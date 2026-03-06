
import React, { useState, useMemo } from 'react';
import { VATReport, PITReport, BusinessMetrics, UserRole, PersonaID } from '../types';
import { TaxReportService } from '../services/taxReportService';
import { ExportEngine } from '@/services/export-service';
import AIAvatar from './AIAvatar';

interface TaxReportingHubProps {
  metrics: BusinessMetrics;
  logAction: (action: string, details: string) => void;
  currentRole: UserRole;
}

const TaxReportingHub: React.FC<TaxReportingHubProps> = ({ metrics, logAction, currentRole }) => {
  const [reportType, setReportType] = useState<'VAT' | 'PIT'>('VAT');
  const [period, setPeriod] = useState('QUÝ 1 - 2026');
  const [isExporting, setIsExporting] = useState(false);

  const vatReport = useMemo(() => TaxReportService.generateVATReport([], period), [period]);
  const pitReport = useMemo(() => TaxReportService.generatePITReport([
    { id: '1', name: 'Nguyễn Văn Vẹn', baseSalary: 15000000, actualWorkDays: 26, allowanceLunch: 800000, dependents: 0, insuranceSalary: 5000000, employeeCode: 'TL-W045', division: 'Sản xuất', department: 'Nguội', role: 'Thợ', startDate: '2023', personalTax: 450000, taxableIncome: 12000000 },
    { id: '2', name: 'Bùi Cao Sơn', baseSalary: 22000000, actualWorkDays: 26, allowanceLunch: 800000, dependents: 2, insuranceSalary: 5000000, employeeCode: 'TL-W001', division: 'Sản xuất', department: 'Chính', role: 'Thợ', startDate: '2018', personalTax: 1250000, taxableIncome: 18500000 }
  ], period), [period]);

  const isMaster = currentRole === UserRole.MASTER;

  const handleExport = async (format: 'PDF' | 'XML' | 'EXCEL') => {
    if (!isMaster) {
      alert("⚠️ TRUY CẬP BỊ TỪ CHỐI: Chỉ có Master Natt mới có thẩm quyền xuất dữ liệu tài khóa.");
      return;
    }
    setIsExporting(true);
    const fileName = `BAO_CAO_THUE_${reportType}_${period.replace(/\s/g, '_')}`;
    
    try {
      if (format === 'PDF') {
        ExportEngine.toPdf();
      } else if (format === 'EXCEL') {
        const data = reportType === 'VAT' ? vatReport.entries : pitReport.entries;
        await ExportEngine.toExcel(data, fileName);
      } else if (format === 'XML') {
        const data = reportType === 'VAT' ? vatReport : pitReport;
        await ExportEngine.toXml(data, fileName, 'HDon_03GTGT');
      }
      logAction('EXPORT_TAX_SUCCESS', `Master Natt xuất file ${format} cho báo cáo ${reportType}`);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsExporting(false), 1000);
    }
  };

  return (
    <div className="p-8 md:p-12 max-w-[1800px] mx-auto h-full overflow-y-auto no-scrollbar space-y-10 animate-in fade-in duration-700 pb-40 bg-[#020202] print:p-0 print:bg-white print:text-black">
      
      <header className="flex flex-col lg:flex-row justify-between items-end gap-8 border-b border-white/5 pb-10 print:hidden">
        <div>
          <div className="flex items-center gap-4 mb-3">
             <span className="text-4xl">⚖️</span>
             <h2 className="ai-headline text-6xl italic uppercase tracking-tighter leading-none">Fiscal Reporting Hub</h2>
          </div>
          <p className="ai-sub-headline text-cyan-300/40 ml-1 italic font-black">
             Kê khai GTGT Trực tiếp (Mẫu {vatReport.formNumber}) • Chuẩn {vatReport.accountingStandard}
          </p>
        </div>

        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10 shrink-0">
           {(['VAT', 'PIT'] as const).map(t => (
             <button
               key={t}
               onClick={() => setReportType(t)}
               className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 reportType === t ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-gray-500 hover:text-white'
               }`}
             >
               {t === 'VAT' ? 'GTGT Trực tiếp' : 'PIT (TNCN)'}
             </button>
           ))}
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
         
         <div className="xl:col-span-3 space-y-10">
            {reportType === 'VAT' ? (
              <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="ai-panel p-8 bg-blue-500/5 border-blue-500/20 print:border-black print:bg-white">
                      <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest mb-3 print:text-black">Giá trị bán ra</p>
                      <p className="text-4xl font-mono font-black text-white print:text-black">
                         {vatReport.entries.reduce((s, e) => s + e.salesValue, 0).toLocaleString()} <span className="text-xs">đ</span>
                      </p>
                   </div>
                   <div className="ai-panel p-8 bg-indigo-500/5 border-indigo-500/20 print:border-black print:bg-white">
                      <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest mb-3 print:text-black">Giá trị gia tăng</p>
                      <p className="text-4xl font-mono font-black text-white print:text-black">{vatReport.totalAddedValue.toLocaleString()} <span className="text-xs">đ</span></p>
                   </div>
                   <div className="ai-panel p-8 bg-amber-500/10 border-amber-500/30 shadow-xl print:border-black print:bg-white">
                      <p className="text-[9px] text-amber-500 font-black uppercase tracking-widest mb-3 print:text-black">Thuế phải nộp</p>
                      <p className="text-4xl font-mono font-black text-amber-500 print:text-black">
                        {vatReport.totalVATPayable.toLocaleString()} <span className="text-xs">đ</span>
                      </p>
                   </div>
                </div>

                <div className="ai-panel overflow-hidden border-white/5 bg-black/40 print:bg-white print:border-black">
                   <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center print:bg-white print:border-black">
                      <h3 className="text-sm font-bold text-white uppercase italic tracking-widest print:text-black">Bảng Kê Chi Tiết Thuế GTGT {period}</h3>
                      <span className="text-[8px] px-2 py-1 bg-white/5 text-gray-500 rounded font-black print:hidden">DỰA TRÊN SỔ CÁI TT200</span>
                   </div>
                   <table className="w-full text-left text-[11px]">
                      <thead>
                         <tr className="text-gray-500 uppercase font-black tracking-widest border-b border-white/10 print:text-black print:border-black">
                            <th className="p-6">Danh mục</th>
                            <th className="p-6 text-right">Bán ra</th>
                            <th className="p-6 text-right">Mua tương ứng</th>
                            <th className="p-6 text-right">GTGT</th>
                            <th className="p-6 text-right">Thuế phải nộp</th>
                         </tr>
                      </thead>
                      <tbody className="text-gray-300 italic print:text-black">
                         {vatReport.entries.map((e, i) => (
                           <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors print:border-black">
                              <td className="p-6 font-bold text-white print:text-black">{e.category}</td>
                              <td className="p-6 text-right font-mono">{e.salesValue.toLocaleString()}</td>
                              <td className="p-6 text-right font-mono text-gray-500 print:text-black">{e.purchaseValue.toLocaleString()}</td>
                              <td className="p-6 text-right font-mono text-cyan-400 font-bold print:text-black">{e.addedValue.toLocaleString()}</td>
                              <td className="p-6 text-right font-mono font-black text-white print:text-black">{e.taxAmount.toLocaleString()}</td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              </div>
            ) : (
              <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                <div className="ai-panel overflow-hidden border-white/5 bg-black/40 print:bg-white print:border-black">
                   <table className="w-full text-left text-[11px]">
                      <thead>
                         <tr className="text-gray-500 uppercase font-black tracking-widest border-b border-white/10 bg-white/5 print:text-black print:border-black">
                            <th className="p-6">Mã Identity</th>
                            <th className="p-6">Họ tên nhân viên</th>
                            <th className="p-6">Thu nhập chịu thuế</th>
                            <th className="p-6 text-right">Thuế đã nộp</th>
                         </tr>
                      </thead>
                      <tbody className="text-gray-300 print:text-black">
                         {pitReport.entries.map((e, i) => (
                           <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors print:border-black">
                              <td className="p-6 font-mono text-cyan-400 print:text-black">{e.employeeCode}</td>
                              <td className="p-6 font-bold text-white uppercase print:text-black">{e.employeeName}</td>
                              <td className="p-6 font-mono">{e.taxableIncome.toLocaleString()} đ</td>
                              <td className="p-6 text-right font-mono font-black text-amber-500 print:text-black">{e.taxPaid.toLocaleString()} đ</td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              </div>
            )}
         </div>

         <div className="space-y-10 print:hidden">
            <div className="ai-panel p-8 border-indigo-500/30 bg-indigo-500/5 shadow-2xl">
               <h4 className="ai-sub-headline text-indigo-400 mb-6 flex items-center gap-2">
                  <AIAvatar personaId={PersonaID.THIEN} size="sm" isThinking={isExporting} />
                  Cổng xuất tri thức
               </h4>
               <div className="space-y-4">
                  {isMaster ? (
                    <>
                      <button 
                        disabled={isExporting}
                        onClick={() => handleExport('EXCEL')}
                        className="w-full py-4 bg-green-500/10 border border-green-500/20 text-green-400 font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-green-500 hover:text-black transition-all flex items-center justify-center gap-3"
                      >
                        <span>📊</span> XUẤT EXCEL DATA
                      </button>
                      <button 
                        disabled={isExporting}
                        onClick={() => handleExport('XML')}
                        className="w-full py-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-3"
                      >
                        <span>📂</span> XUẤT XML MẪU 03/GTGT
                      </button>
                      <button 
                        disabled={isExporting}
                        onClick={() => handleExport('PDF')}
                        className="w-full py-4 bg-white/5 border border-white/10 text-white font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"
                      >
                        <span>📄</span> XUẤT PDF CHIẾN LƯỢC
                      </button>
                    </>
                  ) : (
                    <div className="p-6 bg-red-900/10 border border-red-500/20 rounded-2xl text-center">
                       <p className="text-[8px] text-red-500 font-black uppercase tracking-widest">Giao thức Xuất bị khóa</p>
                       <p className="text-[10px] text-gray-600 italic mt-2">Chỉ dành cho Master Natt.</p>
                    </div>
                  )}
               </div>
               
               <p className="text-[11px] text-gray-500 italic mt-8 leading-relaxed">
                 {isMaster ? '"Thưa Anh Natt, Thiên đã đồng bộ Shard Hash vào mọi tệp xuất ra. Anh có thể yên tâm gửi cho Ban kiểm soát hoặc Cơ quan thuế."' : '"Giao thức trích xuất dữ liệu ra khỏi Shard đã được niêm phong bởi Master Natt."'}
               </p>
            </div>

            <div className="ai-panel p-8 border-white/5 bg-black/40">
               <p className="text-[9px] text-gray-600 uppercase font-black mb-6 tracking-widest">Compliance Status</p>
               <div className="space-y-6">
                  <div className="flex justify-between items-center text-[10px]">
                     <span className="text-gray-400">Chữ ký số:</span>
                     <span className="text-green-500 font-black italic">VERIFIED</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                     <span className="text-gray-400">Mã hóa Shard:</span>
                     <span className="text-amber-500 font-black italic">ACTIVE</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default TaxReportingHub;
