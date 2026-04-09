// @ts-nocheck — TODO: fix type errors, remove this pragma


import React, { useState, useEffect } from 'react';
import { EnterpriseLinker } from '@/cells/business/analytics-cell/domain/services/enterprise-linker.engine';
import { AggregatedReport, PersonaID } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Line, Area, PieChart, Pie, Cell, Treemap
} from 'recharts';
import AIAvatar from './AIAvatar';

const UnifiedReportingHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'channels' | 'costs' | 'products'>('overview');
  const [report, setReport] = useState<AggregatedReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Mounting Guard chặt chẽ
    const timer = setTimeout(() => setIsMounted(true), 200);
    
    setTimeout(async () => {
      const data = await EnterpriseLinker.generateMultiDimensionalReport('Q1-2026');
      setReport(data);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#020202]">
        <div className="text-9xl mb-8 animate-pulse grayscale">🧬</div>
        <h2 className="text-3xl font-serif gold-gradient italic tracking-widest">Đang liên kết Shard Đa Chiều...</h2>
      </div>
    );
  }

  if (!report) return null;

  const chartData = report.records.map(r => ({
    name: r.sku.split('-')[1] || r.sku,
    DoanhThu: r.salesPrice,
    GiaVon: r.productionCost,
    LoiNhuan: r.grossProfit,
    DongTienVe: r.receivedAmount
  }));

  return (
    <div className="p-8 md:p-12 max-w-[1800px] mx-auto h-full overflow-y-auto no-scrollbar space-y-12 animate-in fade-in duration-700 pb-40 bg-[#020202]">
      
      <header className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-4 mb-3">
             <span className="text-4xl">📊</span>
             <h2 className="ai-headline text-6xl italic uppercase tracking-tighter leading-none">Unified Intelligence</h2>
          </div>
          <p className="ai-sub-headline text-cyan-300/40 ml-1 italic font-black">Báo cáo Liên kết Đa chiều (Cross-Module Linking) • {report.period}</p>
        </div>
        
        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10 shrink-0">
           <button onClick={() => setActiveTab('overview')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'overview' ? 'bg-amber-500 text-black' : 'text-gray-500'}`}>Tổng quan</button>
           <button onClick={() => setActiveTab('channels')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'channels' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>Kênh Bán</button>
        </div>
      </header>

      {/* OVERVIEW GRAPHS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
         <div className="ai-panel p-10 bg-black/40 border-white/10 h-[500px] flex flex-col">
            <h3 className="ai-sub-headline text-indigo-400 mb-8 uppercase italic">Phân tích Hiệu quả từng SKU</h3>
            <div className="flex-1 w-full min-h-[350px]">
               {isMounted && (
               <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                     <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} />
                     <XAxis dataKey="name" stroke="#666" fontSize={10} />
                     <YAxis stroke="#666" fontSize={10} tickFormatter={(val) => `${val/1000000}M`} />
                     <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} formatter={(v: any) => v.toLocaleString()} />
                     <Bar dataKey="DoanhThu" barSize={20} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                     <Line type="monotone" dataKey="LoiNhuan" stroke="#10b981" strokeWidth={3} />
                  </ComposedChart>
               </ResponsiveContainer>
               )}
            </div>
         </div>

         <div className="ai-panel p-10 bg-black/40 border-white/10 h-[500px] flex flex-col">
            <h3 className="ai-sub-headline text-amber-500 mb-8 uppercase italic">Đối soát Dòng tiền (Reconciliation Flow)</h3>
            <div className="flex-1 w-full min-h-[350px]">
               {isMounted && (
               <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                     <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} />
                     <XAxis dataKey="name" stroke="#666" fontSize={10} />
                     <YAxis stroke="#666" fontSize={10} />
                     <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                     <Area type="monotone" dataKey="DoanhThu" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.1} />
                     <Area type="monotone" dataKey="DongTienVe" fill="#f59e0b" stroke="#f59e0b" fillOpacity={0.3} />
                  </ComposedChart>
               </ResponsiveContainer>
               )}
            </div>
         </div>
      </div>

      {/* DETAILED TABLE */}
      <div className="ai-panel overflow-hidden border-white/10 bg-black/40 shadow-2xl">
         <div className="p-8 border-b border-white/10 bg-white/[0.02] flex justify-between items-center">
            <h3 className="text-xl font-bold italic text-white uppercase tracking-tighter">Bảng Kê Chi Tiết Liên Kết</h3>
         </div>
         <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-[11px] border-collapse">
               <thead>
                  <tr className="text-gray-500 uppercase font-black tracking-widest border-b border-white/10 bg-black">
                     <th className="p-6">Sản Phẩm (SKU)</th>
                     <th className="p-6 text-right">Giá Vốn</th>
                     <th className="p-6 text-right">Giá Bán</th>
                     <th className="p-6 text-right">Tiền Về</th>
                     <th className="p-6 text-center">Trạng Thái</th>
                  </tr>
               </thead>
               <tbody className="text-gray-300">
                  {report.records.map((r) => (
                     <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                        <td className="p-6 font-bold text-white">{r.sku}</td>
                        <td className="p-6 text-right font-mono">{r.productionCost.toLocaleString()}</td>
                        <td className="p-6 text-right font-mono">{r.salesPrice.toLocaleString()}</td>
                        <td className="p-6 text-right font-mono text-amber-500">{r.receivedAmount.toLocaleString()}</td>
                        <td className="p-6 text-center">
                           <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${
                              r.status === 'MATCHED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                           }`}>{r.status}</span>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default UnifiedReportingHub;
