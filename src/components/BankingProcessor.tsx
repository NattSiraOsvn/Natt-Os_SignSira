// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { BankingEngine } from '@/cells/business/finance-cell/domain/services/banking.engine';
import { BankTransaction, BankSummary, PersonaID } from '../types';
import { NotifyBus } from '@/cells/infrastructure/notification-cell/domain/services/notify-bus';
import AIAvatar from './AIAvatar';

const BankingProcessor: React.FC = () => {
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [summary, setSummary] = useState<BankSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [robotStatus, setRobotStatus] = useState<'IDLE' | 'SCANNING' | 'TRANSMITTING' | 'SYNCED'>('IDLE');
  const [lastSync, setLastSync] = useState<number>(Date.now());

  // Giả lập luồng Robot VietinBank của Anh Natt
  const triggerRobotSync = () => {
    setRobotStatus('SCANNING');
    setIsProcessing(true);
    
    NotifyBus.push({
      type: 'NEWS',
      title: 'Kris: Kích hoạt Robot VietinBank',
      content: 'Đang khởi động Puppeteer Shard để bóc tách sao kê eFast...',
      persona: PersonaID.KRIS
    });

    setTimeout(() => {
      setRobotStatus('TRANSMITTING');
      // Dữ liệu giả lập 12 cột từ Robot
      const robotRows = [
        ["1", "24/01/2025", "Nộp thuế hải quan to khai 10686394446", "45,000,000", "0", "8,500,000,000", "HCM222425-001", "10686394446", "KHO BAC NN", "MT-001", "ID-99", "24/01/2025"],
        ["2", "24/01/2025", "Doanh thu POS Merchant - Skvt 2026", "0", "125,500,000", "8,625,500,000", "BAO CO POS", "9999", "VTB MERCHANT", "MT-002", "ID-100", "24/01/2025"],
        ["3", "24/01/2025", "THU SAN PHAM VANG SJC - KHACH NATT", "85,000,000", "0", "8,540,500,000", "REF-8899", "7788", "ANH NATT", "MT-003", "ID-101", "24/01/2025"]
      ];

      // Update call with metadata signature
      const processed = BankingEngine.processRobotData(robotRows, { fileName: 'ROBOT_SYNC_AUTO_JOB' });
      setTransactions(processed);

      const stats = processed.reduce((acc, curr) => {
        if (curr.valueGroup === 'THU') acc.totalRevenue += curr.amount;
        if (curr.valueGroup === 'CHI_GIÁ_VỐN') acc.totalCogs += curr.amount;
        if (curr.valueGroup === 'CHI_VẬN_HÀNH') acc.totalOperating += curr.amount;
        if (curr.valueGroup === 'THUẾ') acc.totalTax += curr.amount;
        return acc;
      }, { totalRevenue: 0, totalCogs: 0, totalOperating: 0, totalTax: 0, netFlow: 0, transactionCount: processed.length });

      stats.netFlow = stats.totalRevenue - (stats.totalCogs + stats.totalOperating + stats.totalTax);
      setSummary({ ...stats, lastSync: Date.now() });
      setRobotStatus('SYNCED');
      setIsProcessing(false);
      setLastSync(Date.now());

      NotifyBus.push({
        type: 'SUCCESS',
        title: 'Kris: Đối soát Robot Hoàn Tất',
        content: `Đã nạp ${processed.length} giao dịch vào Shard Tài chính. Tất cả đã băm Hash SHA-256.`,
        persona: PersonaID.KRIS
      });
    }, 3000);
  };

  return (
    <div className="p-8 max-w-[1800px] mx-auto h-full overflow-y-auto space-y-8 animate-in fade-in duration-700 pb-24 no-scrollbar">
      
      {/* 🤖 KRIS AUTOMATION STATUS BAR */}
      <section className="glass p-8 rounded-[3.5rem] border border-blue-500/20 bg-blue-500/5 flex flex-col lg:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
         <div className="flex items-center gap-8">
            <AIAvatar personaId={PersonaID.KRIS} size="md" isThinking={isProcessing} />
            <div>
               <h3 className="text-xl font-bold text-blue-400 uppercase italic flex items-center gap-3">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></span>
                  Kris: Robot VietinBank eFast (v2.3)
               </h3>
               <p className="text-[11px] text-gray-400 font-light mt-2 italic">
                  "Thưa Anh Natt, Robot đang theo dõi lịch sao kê tự động 08:30 hằng ngày. Mọi dữ liệu bóc tách được đối soát trực tiếp với Sổ cái."
               </p>
            </div>
         </div>
         <div className="flex items-center gap-10">
            <div className="text-right">
               <p className="text-[9px] text-gray-500 font-black uppercase mb-1">Status</p>
               <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase border tracking-widest ${
                 robotStatus === 'SYNCED' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                 robotStatus === 'IDLE' ? 'bg-gray-500/20 text-gray-400 border-gray-500/20' : 'bg-amber-500/20 text-amber-500 animate-pulse'
               }`}>
                  {robotStatus}
               </span>
            </div>
            <div className="text-right">
               <p className="text-[9px] text-gray-500 font-black uppercase mb-1">Last Sync</p>
               <p className="text-xs font-mono font-bold text-white">{new Date(lastSync).toLocaleTimeString()}</p>
            </div>
            <button 
              onClick={triggerRobotSync}
              disabled={isProcessing}
              className="px-10 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-500 shadow-xl transition-all active:scale-95"
            >
               FORCED ROBOT RUN
            </button>
         </div>
      </section>

      <header className="flex flex-col md:items-end justify-between border-b border-white/5 pb-8">
        <div>
          <h2 className="text-4xl font-serif gold-gradient italic tracking-tighter uppercase leading-none">Fiscal Ledger Control</h2>
          <p className="text-gray-400 mt-2">Phân loại Dòng tiền (TT200) • Hệ thống bóc tách liên Shard Master.</p>
        </div>
      </header>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 animate-in slide-in-from-top-4 duration-500">
          {[
            { label: 'Doanh Thu (Robot)', value: summary.totalRevenue, color: 'text-green-400' },
            { label: 'Giá Vốn (COGS)', value: summary.totalCogs, color: 'text-red-400' },
            { label: 'Vận Hành (OpEx)', value: summary.totalOperating, color: 'text-pink-400' },
            { label: 'Thuế & Lệ Phí', value: summary.totalTax, color: 'text-amber-500' },
            { label: 'Dòng Tiền Net', value: summary.netFlow, color: 'text-white' },
          ].map((item, i) => (
            <div key={i} className="ai-panel p-6 bg-white/[0.02] border-white/5">
              <p className="text-[9px] text-gray-500 uppercase font-black mb-2 tracking-widest">{item.label}</p>
              <p className={`text-xl font-mono font-bold ${item.color}`}>{item.value.toLocaleString()} đ</p>
            </div>
          ))}
        </div>
      )}

      <div className="ai-panel p-10 bg-black/40 border-white/5 shadow-2xl overflow-hidden relative">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold italic flex items-center">
            <span className="mr-3">📊</span> Giao Dịch Ngân Hàng Chi Tiết (13 Cột)
          </h3>
          <span className="text-[9px] text-amber-500/50 font-mono tracking-widest">Shard Sync Active</span>
        </div>
        
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-[11px] border-collapse min-w-[1500px]">
            <thead>
              <tr className="text-gray-500 uppercase font-black tracking-widest border-b border-white/10 pb-4">
                <th className="p-4 w-24">ID</th>
                <th className="p-4 w-24">Ngày GD</th>
                <th className="p-4 w-24">Số Tham Chiếu</th>
                <th className="p-4 w-32">Ngân Hàng</th>
                <th className="p-4 w-32">Số TK</th>
                <th className="p-4 w-32">Loại GD</th>
                <th className="p-4">Mô Tả</th>
                <th className="p-4 text-right w-32">Số Tiền</th>
                <th className="p-4 text-center w-16">Thuế (%)</th>
                <th className="p-4 text-right w-24">Tỷ Giá</th>
                <th className="p-4 text-center w-24">Tình Trạng</th>
                <th className="p-4 text-center w-16">File</th>
                <th className="p-4 w-24">Ngày Xử Lý</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {transactions.map((tx, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4 font-mono text-cyan-400 font-bold">{tx.id}</td>
                  <td className="p-4 font-bold text-white">{tx.date}</td>
                  <td className="p-4 text-gray-400 font-mono text-[10px]">{tx.refNo}</td>
                  <td className="p-4 text-blue-400 font-bold">{tx.bankName}</td>
                  <td className="p-4 font-mono text-[10px]">{tx.accountNumber}</td>
                  <td className="p-4">
                     <span className="px-2 py-1 rounded border border-white/10 bg-white/5 text-[9px] font-black uppercase text-gray-400">{tx.type}</span>
                  </td>
                  <td className="p-4 max-w-xs truncate italic text-gray-400 group-hover:text-white transition-colors">{tx.description}</td>
                  <td className="p-4 text-right font-mono font-black text-white">
                    {tx.amount.toLocaleString()}
                  </td>
                  <td className="p-4 text-center font-mono">{tx.taxRate > 0 ? tx.taxRate : '-'}</td>
                  <td className="p-4 text-right font-mono text-amber-500">{tx.exchangeRate !== 1 ? tx.exchangeRate.toLocaleString() : '-'}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded text-[8px] font-black uppercase ${tx.status === 'SYNCED' ? 'text-green-500 bg-green-500/10' : 'text-amber-500 bg-amber-500/10'}`}>
                       {tx.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                     {tx.attachment ? <span className="text-lg cursor-pointer hover:text-white text-gray-600">📎</span> : '-'}
                  </td>
                  <td className="p-4 text-[10px] text-gray-500 font-mono">{tx.processDate}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={13} className="py-40 text-center opacity-10 flex flex-col items-center">
                    <span className="text-8xl mb-8 grayscale">🏦</span>
                    <p className="text-2xl font-serif italic uppercase tracking-widest">Sẵn sàng nạp dữ liệu từ Robot</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="glass p-10 rounded-[3rem] border border-amber-500/20 bg-amber-500/5 shadow-2xl">
            <h4 className="text-[10px] text-amber-500 font-black uppercase tracking-widest mb-6">Tham mưu Kế toán (Thiên)</h4>
            <p className="text-[13px] text-gray-400 italic leading-relaxed font-light">
              "Thưa Anh Natt, Robot đã bóc tách chính xác các khoản thuế hải quan từ nội dung giao dịch. Thiên kiến nghị Anh kiểm tra lại Shard 'HCM222425' - đây là mã tờ khai có giá trị lớn cần đối soát GĐB nhập khẩu ngay."
            </p>
         </div>
         <div className="glass p-10 rounded-[3rem] border border-blue-500/20 bg-blue-500/5 shadow-2xl">
            <h4 className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-6">Logistics Sync (Kris)</h4>
            <p className="text-[13px] text-gray-400 italic leading-relaxed font-light">
              "Kris đã đồng bộ hóa các khoản chi phí vận hành từ sao kê. Phát hiện 01 giao dịch chưa có mã định danh (Virtual Account). Kris đang chờ Anh xác nhận để băm Shard này."
            </p>
         </div>
      </div>
    </div>
  );
};

export default BankingProcessor;
