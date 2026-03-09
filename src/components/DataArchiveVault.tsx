
import React, { useState, useEffect } from 'react';
import { ShardingService } from '@/core/audit/sharding-engine';
import { EventBridge } from '@/core/events/event-bridge';
import AIAvatar from './AIAvatar';
import { PersonaID, UserRole, BusinessMetrics, UserPosition } from '../types';

// Interface nhận đúng Props từ DynamicModuleRenderer để tránh Crash
interface DataArchiveVaultProps {
  currentRole: UserRole;
  currentPosition: UserPosition;
  logAction: (action: string, details: string) => void;
  metrics: BusinessMetrics;
  updateFinance: (data: Partial<BusinessMetrics>) => void;
}

interface ArchivePartition {
  tableName: string;
  recordCount: number;
  dataSize: string;
  hash: string;
  status: 'VERIFIED' | 'CORRUPTED' | 'SEALED';
}

interface ArchiveYear {
  year: number;
  status: 'OPEN' | 'CLOSING' | 'LOCKED' | 'ARCHIVED';
  revenue: number;
  taxPaid: number;
  merkleRoot: string;
  docCount: number;
  lastAudit: string;
  retentionUntil: string;
  partitions: ArchivePartition[];
}

const DataArchiveVault: React.FC<DataArchiveVaultProps> = ({ currentRole, logAction }) => {
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [archives, setArchives] = useState<ArchiveYear[]>([]);
  const [isSealing, setIsSealing] = useState(false);

  // Chỉ Master mới có quyền niêm phong số liệu
  const canSeal = currentRole === UserRole.MASTER;

  useEffect(() => {
    const generatedArchives: ArchiveYear[] = [];
    const currentYear = new Date().getFullYear();

    for (let i = 0; i < 6; i++) {
      const y = currentYear - i;
      let status: ArchiveYear['status'] = 'ARCHIVED';
      
      if (i === 0) status = 'OPEN';
      else if (i === 1) status = 'CLOSING';
      else if (i === 2) status = 'LOCKED';
      else status = 'ARCHIVED';

      const revenueBase = 100000000000 + (Math.random() * 500000000000);
      
      // Tạo Partition Hashes Deterministic
      const partHashes = {
        sales: ShardingService.generateShardHash({ year: y, table: 'sales', type: 'PARTITION' }),
        inv: ShardingService.generateShardHash({ year: y, table: 'invoices', type: 'PARTITION' }),
        stock: ShardingService.generateShardHash({ year: y, table: 'inventory', type: 'PARTITION' }),
        gl: ShardingService.generateShardHash({ year: y, table: 'ledger', type: 'PARTITION' })
      };

      generatedArchives.push({
        year: y,
        status: status,
        revenue: revenueBase,
        taxPaid: revenueBase * 0.1,
        merkleRoot: status === 'OPEN' ? 'PENDING...' : ShardingService.generateShardHash({ year: y, parts: partHashes, type: 'ROOT' }),
        docCount: Math.floor(10000 + Math.random() * 20000),
        lastAudit: status === 'OPEN' ? 'Real-time' : `31/12/${y}`,
        retentionUntil: `31/12/${y + 10}`,
        partitions: [
          { tableName: 'sales_orders', recordCount: Math.floor(15000 + Math.random() * 5000), dataSize: '4.2 GB', hash: partHashes.sales, status: status === 'OPEN' ? 'VERIFIED' : 'SEALED' },
          { tableName: 'e_invoices', recordCount: Math.floor(15000 + Math.random() * 5000), dataSize: '2.1 GB', hash: partHashes.inv, status: status === 'OPEN' ? 'VERIFIED' : 'SEALED' },
          { tableName: 'inventory_movements', recordCount: Math.floor(40000 + Math.random() * 10000), dataSize: '5.8 GB', hash: partHashes.stock, status: status === 'OPEN' ? 'VERIFIED' : 'SEALED' },
          { tableName: 'general_ledger', recordCount: Math.floor(8000 + Math.random() * 2000), dataSize: '1.2 GB', hash: partHashes.gl, status: status === 'OPEN' ? 'VERIFIED' : 'SEALED' }
        ]
      });
    }
    setArchives(generatedArchives);
    setActiveYear(currentYear);
  }, []);

  const handleSealYear = (year: number) => {
    if (!canSeal) {
      alert("⚠️ TRUY CẬP BỊ TỪ CHỐI: Chỉ Master Natt mới có quyền niêm phong số liệu.");
      return;
    }

    if (!window.confirm(`XÁC NHẬN QUẢN TRỊ:\nBạn đang thực hiện niêm phong số liệu năm ${year}.\nHành động này sẽ khóa dữ liệu trong 10 năm.\n\nTiếp tục?`)) return;

    setIsSealing(true);
    
    setTimeout(() => {
      const newHash = ShardingService.generateShardHash({ year, timestamp: Date.now(), magic: 'OMEGA_SEAL_10Y' });
      
      setArchives(prev => prev.map(a => a.year === year ? { 
        ...a, 
        status: 'LOCKED', 
        merkleRoot: newHash, 
        lastAudit: new Date().toLocaleDateString('vi-VN'),
        retentionUntil: `31/12/${year + 10}`,
        partitions: a.partitions.map(p => ({...p, status: 'SEALED' as const}))
      } : a));
      
      // Phát sự kiện toàn hệ thống
      EventBridge.publish('ARCHIVE_SEALED', { year, merkleRoot: newHash });
      logAction('FISCAL_YEAR_SEAL', `Đã niêm phong số liệu năm ${year}. Merkle Root: ${newHash}`);
      
      setIsSealing(false);
    }, 2000);
  };

  const selectedArchive = archives.find(a => a.year === activeYear);

  return (
    <div className="h-full bg-[#020202] p-8 md:p-12 overflow-hidden flex flex-col animate-in fade-in duration-700">
      
      <header className="flex flex-col md:flex-row justify-between items-end border-b border-white/5 pb-10 mb-8 gap-6">
         <div>
            <div className="flex items-center gap-4 mb-2">
               <span className="text-4xl">🗄️</span>
               <h2 className="ai-headline text-5xl italic uppercase tracking-tighter">Data Archive Vault</h2>
            </div>
            <p className="ai-sub-headline text-gray-500 font-black tracking-[0.3em] ml-1">
               Bộ nhớ vĩnh cửu • Tuân thủ pháp lý 10 năm
            </p>
         </div>
         <div className="flex items-center gap-6 bg-black/40 p-4 rounded-2xl border border-white/5">
            <div className="flex flex-col items-end">
               <span className="text-[9px] text-gray-500 font-bold uppercase">Retention Policy</span>
               <span className="text-xl font-mono font-black text-amber-500">10 YEARS</span>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="flex flex-col items-end">
               <span className="text-[9px] text-gray-500 font-bold uppercase">Encryption</span>
               <span className="text-xl font-mono font-black text-green-500">AES-256</span>
            </div>
         </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 flex-1 min-h-0">
         
         {/* LEFT: TIMELINE */}
         <div className="xl:col-span-3 space-y-4 overflow-y-auto no-scrollbar pr-2 border-r border-white/5">
            {archives.map(arch => (
               <div 
                  key={arch.year}
                  onClick={() => setActiveYear(arch.year)}
                  className={`p-6 rounded-[2rem] border cursor-pointer transition-all group relative overflow-hidden ${
                     activeYear === arch.year 
                     ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.1)]' 
                     : 'bg-black/40 border-white/5 hover:border-white/20'
                  }`}
               >
                  <div className="flex justify-between items-center mb-2">
                     <span className={`text-3xl font-serif font-black italic tracking-tighter ${activeYear === arch.year ? 'text-white' : 'text-gray-600 group-hover:text-gray-400'}`}>
                        {arch.year}
                     </span>
                     <span className={`text-[8px] font-black uppercase px-2 py-1 rounded border ${
                        arch.status === 'ARCHIVED' ? 'bg-purple-900/30 text-purple-400 border-purple-500/30' :
                        arch.status === 'LOCKED' ? 'bg-red-900/30 text-red-400 border-red-500/30' :
                        arch.status === 'CLOSING' ? 'bg-amber-900/30 text-amber-400 border-amber-500/30' :
                        'bg-green-900/30 text-green-400 border-green-500/30'
                     }`}>
                        {arch.status}
                     </span>
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                     <span>Rev: {(arch.revenue/1000000000).toFixed(0)}B</span>
                     <span className="italic">Exp: {arch.retentionUntil.split('/')[2]}</span>
                  </div>
               </div>
            ))}
         </div>

         {/* CENTER: DETAIL & PARTITIONS */}
         <div className="xl:col-span-6 flex flex-col space-y-8 overflow-y-auto no-scrollbar">
            {selectedArchive ? (
               <div className="animate-in slide-in-from-bottom-10 duration-500 space-y-8">
                  {/* HERO CARD */}
                  <div className="ai-panel p-10 bg-black/60 border-white/10 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-[120px] font-serif italic select-none pointer-events-none">
                        {selectedArchive.year}
                     </div>
                     
                     <div className="flex justify-between items-start relative z-10">
                        <div>
                           <h3 className="text-3xl font-bold text-white uppercase tracking-tight italic mb-2">Hồ sơ Niên độ {selectedArchive.year}</h3>
                           <div className="flex items-center gap-3">
                              <p className="text-[10px] text-gray-400 font-mono font-bold">MERKLE ROOT:</p>
                              <code className="bg-white/10 px-2 py-1 rounded text-[9px] font-mono text-amber-500">{selectedArchive.merkleRoot}</code>
                           </div>
                        </div>
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border shadow-xl ${
                           selectedArchive.status === 'OPEN' ? 'border-green-500 text-green-500 bg-green-500/10' : 'border-white/20 text-gray-400 bg-white/5'
                        }`}>
                           {selectedArchive.status === 'OPEN' ? '🔓' : '🔒'}
                        </div>
                     </div>

                     <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-white/5">
                        <div>
                           <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Tổng Doanh thu</p>
                           <p className="text-2xl font-mono font-black text-white">{(selectedArchive.revenue/1000000000).toFixed(1)} <span className="text-xs text-gray-500">Tỷ</span></p>
                        </div>
                        <div>
                           <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Thuế Đã Nộp</p>
                           <p className="text-2xl font-mono font-black text-white">{(selectedArchive.taxPaid/1000000000).toFixed(1)} <span className="text-xs text-gray-500">Tỷ</span></p>
                        </div>
                        <div>
                           <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Số lượng Chứng từ</p>
                           <p className="text-2xl font-mono font-black text-white">{selectedArchive.docCount.toLocaleString()}</p>
                        </div>
                     </div>
                  </div>

                  {/* PARTITIONS TABLE */}
                  <div>
                     <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 ml-1">Archive Partitions (Phân vùng)</h4>
                     <div className="space-y-3">
                        {selectedArchive.partitions.map((part, idx) => (
                           <div key={idx} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                              <div className="flex items-center gap-4">
                                 <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs">🗃️</div>
                                 <div>
                                    <p className="text-xs font-bold text-white font-mono">{part.tableName}</p>
                                    <p className="text-[9px] text-gray-500 mt-0.5">{part.recordCount.toLocaleString()} records • {part.dataSize}</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-[8px] font-mono text-gray-600 group-hover:text-amber-500 transition-colors uppercase">Hash: {part.hash.substring(0, 12)}...</p>
                                 <span className={`text-[8px] font-black uppercase tracking-widest ${part.status === 'SEALED' ? 'text-red-500' : 'text-green-500'}`}>
                                    {part.status === 'SEALED' ? '🔒 SEALED' : '✓ VERIFIED'}
                                 </span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            ) : (
               <div className="h-full flex flex-col items-center justify-center opacity-20">
                  <span className="text-9xl mb-6 grayscale">🏛️</span>
                  <p className="text-xl uppercase tracking-widest">Chọn niên độ để truy cập Vault</p>
               </div>
            )}
         </div>

         {/* RIGHT: ACTIONS & STATUS */}
         <div className="xl:col-span-3 flex flex-col gap-8">
            <div className="ai-panel p-8 bg-amber-500/5 border-amber-500/20 shadow-2xl">
               <div className="flex items-center gap-4 mb-6">
                  <AIAvatar personaId={PersonaID.THIEN} size="sm" />
                  <h4 className="text-sm font-black text-amber-500 uppercase tracking-widest">Thiên Advisor</h4>
               </div>
               <p className="text-[11px] text-gray-400 italic leading-relaxed">
                  "Thưa Anh Natt, phân vùng dữ liệu '{selectedArchive ? selectedArchive.year : '...'}' đang được giám sát. Niêm phong sẽ tạo ra Merkle Root không thể đảo ngược, đảm bảo tính toàn vẹn 100% trước cơ quan kiểm toán."
               </p>
               
               {selectedArchive && selectedArchive.status !== 'LOCKED' && selectedArchive.status !== 'ARCHIVED' && canSeal && (
                  <button 
                     onClick={() => handleSealYear(selectedArchive.year)}
                     disabled={isSealing}
                     className="w-full mt-6 py-4 bg-amber-500 text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-amber-400 shadow-xl transition-all active:scale-95 disabled:opacity-50"
                  >
                     {isSealing ? '⏳ ĐANG BĂM SHARD...' : '🔐 NIÊM PHONG SỔ CÁI'}
                  </button>
               )}
            </div>

            {selectedArchive && (
               <div className="ai-panel p-8 bg-black/40 border-white/5">
                  <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">Retention Lifecycle</h4>
                  <div className="relative pl-4 border-l border-white/10 space-y-6">
                     <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        <p className="text-[10px] text-white font-bold">Năm tài chính: {selectedArchive.year}</p>
                     </div>
                     <div className="relative">
                        <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${selectedArchive.status === 'OPEN' ? 'bg-gray-600' : 'bg-amber-500'}`}></div>
                        <p className="text-[10px] text-gray-400">Niêm phong: {selectedArchive.status === 'OPEN' ? 'Chưa' : selectedArchive.lastAudit}</p>
                     </div>
                     <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                        <p className="text-[10px] text-gray-400">Hết hạn lưu trữ: {selectedArchive.retentionUntil}</p>
                     </div>
                  </div>
               </div>
            )}
         </div>

      </div>
    </div>
  );
};

export default DataArchiveVault;
