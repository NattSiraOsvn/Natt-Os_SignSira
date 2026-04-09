
import React, { useState, useEffect } from 'react';
import { useSmartMapping } from '../../hooks/useSmartMapping';
import { useAccounting } from '../../contexts/AccountingContext';
import { AccountingEntry } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import { SalesCore } from '../../services/salesCore';

// Mock Component for Overview Cards
const FinancialOverviewCard = ({ title, value, sub, color }: { title: string, value: string, sub: string, color: string }) => (
  <div className={`natt-cell-medal bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(255,255,255,0.03)] rounded-3xl transition-all p-6 border-white/5 bg-transparent flex flex-col justify-between hover:border-white/20 transition-all group relative overflow-hidden`}>
    <div className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-${color}-500 to-transparent`}></div>
    <div className="flex justify-between items-start mb-4">
        <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] leading-tight">{title}</span>
    </div>
    <p className={`text-xl font-mono font-black italic tracking-tighter ${color === 'blue' ? 'text-blue-400' : color === 'green' ? 'text-green-400' : 'text-amber-500'}`}>{value}</p>
    <p className="text-[9px] text-gray-600 mt-2">{sub}</p>
  </div>
);

const FinancialDashboard: React.FC = () => {
  const { realTimeUpdates, mapSalesEvent } = useSmartMapping();
  const { entries, postEntry, refreshData, getSummary, isLoading } = useAccounting();
  const [activeTab, setActiveTab] = useState<'ENTRIES' | 'RULES' | 'ANALYTICS'>('ENTRIES');
  const [summary, setSummary] = useState(getSummary());

  useEffect(() => {
    setSummary(getSummary());
  }, [entries, getSummary]);

  // Simulate incoming data for demo
  const triggerSimulation = async () => {
    const mockOrder = SalesCore.createSalesOrder(
      'DIRECT_SALE' as string, 
      { id: 'C1', name: 'DEMO CUSTOMER', phone: '0909', tier: 'VIP_GOLD', loyaltyPoints: 10 },
      { id: 'S1', name: 'Sale 1', position: 'CONSULTANT' as string, kpiScore: 100 },
      [{ productId: 'P1', productCode: 'SP001', productName: 'Nhẫn Kim Cương', productType: 'FINISHED_GOOD' as string, quantity: 1, unitPrice: 50000000, costPrice: 38000000, discount: 0, taxRate: 10, warehouseLocation: 'HCM_HEADQUARTER' as string }]
    );
    
    await mapSalesEvent({
      type: 'ORDER_CREATED',
      order: mockOrder,
      timestamp: new Date()
    });
  };

  if (isLoading) return <LoadingSpinner message="Loading Financial Core..." />;

  return (
    <div className="h-full flex flex-col bg-transparent p-8 overflow-y-auto no-scrollbar gap-8 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
             <span className="text-4xl animate-pulse">💹</span>
             <h1 className="ai-headline text-5xl italic uppercase tracking-tighter">Financial Center</h1>
          </div>
          <p className="ai-sub-headline text-cyan-300/40 ml-1 italic font-black tracking-[0.3em]">Accounting Core • TT200 Compliance</p>
        </div>
        
        <div className="flex items-center gap-4">
           <button onClick={triggerSimulation} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg">
              + Simulate Tx
           </button>
           <button onClick={() => refreshData()} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 text-white">
              ↻
           </button>
        </div>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <FinancialOverviewCard title="Doanh thu (Revenue)" value={summary.totalRevenue.toLocaleString()} sub="Total Credit 511" color="green" />
         <FinancialOverviewCard title="Chi phí (Expense)" value={summary.totalExpenses.toLocaleString()} sub="Total Debit 6/8" color="amber" />
         <FinancialOverviewCard title="Lợi nhuận (Profit)" value={(summary.totalRevenue - summary.totalExpenses).toLocaleString()} sub="Net Income" color="blue" />
         <div className="natt-cell-medal bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(255,255,255,0.03)] rounded-3xl transition-all p-6 bg-red-500/10 border-red-500/20 flex flex-col justify-between">
            <p className="text-[9px] text-red-400 font-black uppercase tracking-widest">Pending Journals</p>
            <p className="text-3xl font-mono text-white">{summary.pendingCount}</p>
         </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="grid grid-cols-12 gap-8 flex-1 min-h-0">
         
         {/* LEFT: ENTRIES TABLE */}
         <div className="col-span-12 lg:col-span-8 ai-panel overflow-hidden border-white/10 bg-black/40 flex flex-col">
            <div className="p-4 border-b border-white/10 bg-transparent flex justify-between items-center">
               <h3 className="text-sm font-bold text-white uppercase tracking-widest">Sổ Nhật Ký Chung (General Ledger)</h3>
               <div className="flex gap-2">
                  <span className="text-[10px] text-gray-500 font-mono">{entries.length} entries</span>
               </div>
            </div>
            <div className="flex-1 overflow-auto no-scrollbar">
               <table className="w-full text-left text-[11px]">
                  <thead className="sticky top-0 bg-[#050505] z-10 shadow-lg">
                     <tr className="text-gray-500 uppercase font-black border-b border-white/10">
                        <th className="p-4">ID / Ngày</th>
                        <th className="p-4">Diễn giải</th>
                        <th className="p-4 text-right">Nợ (Debit)</th>
                        <th className="p-4 text-right">Có (Credit)</th>
                        <th className="p-4 text-center">Trạng thái</th>
                        <th className="p-4 text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody className="text-gray-300">
                     {entries.map(entry => (
                        <React.Fragment key={entry.journalId}>
                           <tr className="bg-transparent border-t border-white/5">
                              <td colSpan={6} className="p-2 px-4 text-[10px] font-mono text-amber-500 bg-amber-500/5">
                                 {entry.journalId} <span className="text-gray-500 ml-2 italic">// {entry.description}</span>
                              </td>
                           </tr>
                           {entry.entries.map((line, idx) => (
                              <tr key={`${entry.journalId}-${idx}`} className="border-b border-white/5 hover:bg-white/[0.05]">
                                 <td className="p-4 pl-8 text-gray-500 font-mono">{idx === 0 ? new Date(entry.transactionDate).toLocaleDateString() : ''}</td>
                                 <td className="p-4">
                                    <span className="font-bold text-white block">{line.accountNumber}</span>
                                    <span className="text-[9px] text-gray-500 italic">{line.accountName}</span>
                                 </td>
                                 <td className="p-4 text-right font-mono text-white">{line.debit > 0 ? line.debit.toLocaleString() : '-'}</td>
                                 <td className="p-4 text-right font-mono text-white">{line.credit > 0 ? line.credit.toLocaleString() : '-'}</td>
                                 <td className="p-4 text-center">
                                    {idx === 0 && (
                                       <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                                          entry.status === 'POSTED' ? 'bg-green-500/20 text-green-500 border-green-500/30' : 
                                          'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                       }`}>
                                          {entry.status}
                                       </span>
                                    )}
                                 </td>
                                 <td className="p-4 text-right">
                                    {entry.status !== 'POSTED' && idx === 0 && (
                                       <button onClick={() => postEntry(entry.journalId)} className="px-3 py-1 bg-indigo-600 text-white rounded text-[8px] font-black uppercase hover:bg-indigo-500">
                                          POST
                                       </button>
                                    )}
                                 </td>
                              </tr>
                           ))}
                        </React.Fragment>
                     ))}
                     {entries.length === 0 && (
                        <tr>
                           <td colSpan={6} className="p-10 text-center text-gray-600 italic">No journal entries found.</td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* RIGHT: REALTIME UPDATES */}
         <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="natt-cell-medal bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(255,255,255,0.03)] rounded-3xl transition-all p-6 bg-black/40 border-white/10 h-full flex flex-col">
               <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Real-time Stream</h3>
               <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                  {realTimeUpdates.map(update => (
                     <div key={update.id} className="p-3 border-l-2 border-cyan-500 bg-transparent animate-in slide-in-from-right-4">
                        <div className="flex justify-between items-center mb-1">
                           <span className="text-[9px] font-black text-cyan-400 uppercase">{update.type}</span>
                           <span className="text-[8px] text-gray-600">{update.timestamp.toLocaleTimeString()}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 italic line-clamp-2">{JSON.stringify(update.data)}</p>
                     </div>
                  ))}
                  {realTimeUpdates.length === 0 && <p className="text-[10px] text-gray-600 text-center mt-10">Waiting for signals...</p>}
               </div>
            </div>
         </div>

      </div>
    </div>
  );
};

export default FinancialDashboard;
