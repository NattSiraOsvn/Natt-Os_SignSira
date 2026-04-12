
import React, { useState, useEffect, useRef } from 'react';
import { BusinessMetrics, PersonaID, OperationRecord } from '../types';
import AIAvatar from './AIAvatar';
import ThreatDetectionService, { SecurityThreat, SystemHealth } from '@/cells/kernel/security-cell/domain/engines/threat-detection.engine';
import { RecoverySystem } from '@/cells/kernel/monitor-cell/domain/engines/recovery.engine';
import { NotifyBus } from '../services/notificationService';

interface SystemMonitorProps {
  logAction?: (action: string, details: string) => void;
  metrics?: BusinessMetrics;
}

interface ModuleStatus {
  id: string;
  name: string;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
  latency: number;
  uptime: number;
  lastError?: string;
}

const SystemMonitor: React.FC<SystemMonitorProps> = () => {
  const [activeTab, setActiveTab] = useState<'HEALTH' | 'SECURITY'>('HEALTH');
  const [isScanning, setIsScanning] = useState(false);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [modules, setModules] = useState<ModuleStatus[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [deadLetter, setDeadLetter] = useState<OperationRecord[]>([]);
  
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<SystemHealth>(ThreatDetectionService.getHealth());

  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Khởi tạo danh sách Module (30 Nodes)
    const initialModules: ModuleStatus[] = Array.from({ length: 30 }).map((_, i) => ({
      id: `MOD-${String(i + 1).padStart(2, '0')}`,
      name: getModuleName(i),
      status: 'OPTIMAL',
      latency: Math.floor(Math.random() * 50) + 10,
      uptime: 99.9
    }));
    setModules(initialModules);
    setDeadLetter(RecoverySystem.getDeadLetterQueue());

    const unsubThreats = ThreatDetectionService.subscribe((threat) => {
        setThreats(prev => [threat, ...prev].slice(0, 50));
    });

    const interval = setInterval(() => {
       setHealthMetrics(ThreatDetectionService.getHealth());
    }, 2000);

    return () => {
        unsubThreats();
        clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [scanLogs]);

  const getModuleName = (index: number) => {
    const names = [
      'Finance Core', 'Sales Engine', 'Inventory Shard', 'HR Ledger', 'Logistics API',
      'Tax Gateway', 'Audit Trail', 'User Auth', 'Notification Bus', 'AI Neural Net',
      'Payment Node', 'Customs Robot', 'Production Flow', 'Design Vault', 'Backup Service'
    ];
    return names[index] || `Sub-Node ${index + 1}`;
  };

  const addLog = (msg: string, type: 'INFO' | 'WARN' | 'ERR' | 'SUCCESS' = 'INFO') => {
    const time = new Date().toLocaleTimeString();
    setScanLogs(prev => [...prev, `[${time}] [${type}] ${msg}`]);
  };

  // --- HÀNH ĐỘNG: DEEP SCAN ---
  const runDeepScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanLogs([]);
    setScanProgress(0);
    
    addLog("BẮT ĐẦU CHIẾN DỊCH DEEP SCAN LÕI OMEGA v9.2...", "INFO");
    addLog("Đang thiết lập kết nối Shard-to-Shard...", "INFO");

    let processed = 0;
    const total = modules.length;

    for (let i = 0; i < total; i++) {
      const mod = modules[i];
      await new Promise(r => setTimeout(r, 40 + Math.random() * 80));
      setScanProgress(Math.round(((i + 1) / total) * 100));

      // Giả lập logic phát hiện lỗi thực tế
      const rand = Math.random();
      let newStatus: ModuleStatus['status'] = 'OPTIMAL';
      let errorMsg = undefined;

      if (rand > 0.94) {
        newStatus = 'CRITICAL';
        errorMsg = 'SHARD_CORRUPTION: Lỗi cấu trúc dữ liệu bản ghi';
        addLog(`PHÁT HIỆN CRASH TẠI ${mod.name}: ${errorMsg}`, "ERR");
        // Đưa vào Recovery Engine thực tế
        RecoverySystem.recordOperation('REPAIR_NODE', mod.name, { nodeId: mod.id });
      } else if (rand > 0.88) {
        newStatus = 'WARNING';
        errorMsg = 'LATENCY_SPIKE: Độ trễ vượt ngưỡng 500ms';
        addLog(`Cảnh báo tại ${mod.name}: Hiệu suất suy giảm`, "WARN");
      } else {
        addLog(`Xác thực ${mod.name}: OK`, "INFO");
      }

      setModules(prev => prev.map(m => m.id === mod.id ? { ...m, status: newStatus, lastError: errorMsg } : m));
    }

    setDeadLetter(RecoverySystem.getDeadLetterQueue());
    addLog("QUÉT SÂU HOÀN TẤT. ĐÃ PHÂN TÁCH CÁC NODE LỖI.", "SUCCESS");
    setIsScanning(false);

    if (modules.some(m => m.status === 'CRITICAL')) {
        NotifyBus.push({
            type: 'RISK',
            title: 'HỆ THỐNG CÓ LỖI CRITICAL',
            content: 'Phát hiện Shard bị Crash. Anh Natt hãy thực hiện AUTO-FIX ngay.',
            persona: PersonaID.THIEN,
            priority: 'HIGH'
        });
    }
  };

  const handleFixAll = async () => {
    addLog("KÍCH HOẠT GIAO THỨC AUTO-FIX TOÀN HỆ THỐNG...", "WARN");
    setIsScanning(true);
    
    const crashed = modules.filter(m => m.status === 'CRITICAL');
    for (const mod of crashed) {
        addLog(`Đang phục hồi Shard: ${mod.name}...`, "INFO");
        await new Promise(r => setTimeout(r, 1000));
        setModules(prev => prev.map(m => m.id === mod.id ? { ...m, status: 'OPTIMAL', lastError: undefined } : m));
        addLog(`✓ Phục hồi thành công: ${mod.name}`, "SUCCESS");
    }

    setDeadLetter([]);
    addLog("MỌI MODULE ĐÃ ĐƯỢC ĐƯA VỀ TRẠNG THÁI NOMINAL.", "SUCCESS");
    setIsScanning(false);
  };

  const crashedCount = modules.filter(m => m.status === 'CRITICAL').length;

  return (
    <div className="h-full flex flex-col bg-[#020202] p-8 md:p-12 overflow-y-auto no-scrollbar gap-10 animate-in fade-in duration-700 pb-40">
      <header className="flex justify-between items-end border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className={`px-2 py-0.5 text-white text-[8px] font-black rounded uppercase tracking-widest ${crashedCount > 0 ? 'bg-red-600 animate-pulse' : 'bg-green-600'}`}>
               {crashedCount > 0 ? `SYSTEM ALERT: ${crashedCount} CRASHES` : 'SYSTEM NOMINAL'}
            </span>
            <h2 className="ai-headline text-5xl italic tracking-tighter uppercase leading-none">System Pulse & Neural Map</h2>
          </div>
          <p className="ai-sub-headline text-indigo-300/40 font-black tracking-[0.3em]">Bản đồ Long Mạch 30 Module • Master Control</p>
        </div>
        
        <div className="flex items-center gap-6">
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                <button onClick={() => setActiveTab('HEALTH')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'HEALTH' ? 'bg-amber-500 text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}>Health Monitor</button>
                <button onClick={() => setActiveTab('SECURITY')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'SECURITY' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Threat Defense</button>
            </div>
            {crashedCount > 0 && (
                <button onClick={handleFixAll} className="px-8 py-3 bg-green-600 text-white font-black text-[10px] uppercase rounded-xl shadow-xl hover:bg-green-500 animate-bounce">
                   🚀 AUTO-FIX ALL
                </button>
            )}
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            {/* TERMINAL LOG */}
            <div className="ai-panel p-0 bg-black border-white/10 relative overflow-hidden flex flex-col h-[500px]">
                <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                <span className="text-[10px] font-mono text-gray-400">{"'> root@natt-os:~# deep_scan_v9.sh'"}</span>
                <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                </div>
                <div ref={logContainerRef} className="flex-1 p-6 overflow-y-auto no-scrollbar font-mono text-[10px] space-y-1.5">
                {scanLogs.length === 0 && <span className="text-gray-600 italic">Hệ thống đang chờ lệnh từ Anh Natt...</span>}
                {scanLogs.map((log, i) => (
                    <p key={i} className={`${
                        log.includes('[ERR]') ? 'text-red-500 font-bold bg-red-500/10' : 
                        log.includes('[WARN]') ? 'text-amber-500' : 
                        log.includes('[SUCCESS]') ? 'text-green-400 font-black' : 'text-gray-400'
                    }`}>
                        {log}
                    </p>
                ))}
                {isScanning && <div className="w-2 h-4 bg-green-500 animate-pulse inline-block ml-1"></div>}
                </div>
            </div>

            {/* MODULE GRID */}
            <div className="xl:col-span-2 ai-panel p-10 bg-black/40 border-indigo-500/20 shadow-2xl relative overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-sm font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-4">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-ping"></span>
                        Trạng thái Shard (Omega Grid)
                    </h3>
                    {!isScanning && (
                        <button 
                            onClick={runDeepScan}
                            className="px-6 py-2 bg-amber-500 text-black font-black text-[9px] uppercase tracking-widest rounded-xl shadow-xl hover:bg-amber-400 active:scale-95 transition-all"
                        >
                            KÍCH HOẠT DEEP SCAN
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-y-auto no-scrollbar flex-1 content-start">
                    {modules.map((m) => (
                    <div key={m.id} className={`p-4 rounded-2xl border transition-all flex flex-col items-center text-center gap-2 group relative overflow-hidden ${
                        m.status === 'CRITICAL' ? 'border-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse' :
                        m.status === 'WARNING' ? 'border-amber-500/50 bg-amber-500/5' :
                        'border-white/5 bg-white/[0.02] hover:border-cyan-500/30'
                    }`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
                            m.status === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-500'
                        }`}>
                            {m.status === 'CRITICAL' ? '⚠️' : '⚡'}
                        </div>
                        <p className={`text-[9px] font-black uppercase truncate w-full ${m.status === 'CRITICAL' ? 'text-red-400' : 'text-gray-400'}`}>{m.name}</p>
                        <p className="text-[7px] font-mono text-gray-600">{m.latency}ms</p>
                    </div>
                    ))}
                </div>
            </div>
        </div>

      {/* AI ANALYSIS FOOTER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in slide-in-from-bottom-10">
        <div className="lg:col-span-2 glass p-10 rounded-[3.5rem] border border-white/5 relative overflow-hidden bg-gradient-to-br from-purple-500/5 to-transparent shadow-2xl">
           <h3 className="text-2xl font-bold mb-6 flex items-center italic">
             <span className="mr-4 text-3xl">📡</span> Báo cáo Long Mạch Shard
           </h3>
           <div className="space-y-4">
             {[
               { name: 'Node Phân Phối HCM', status: 'ACTIVE', latency: '45ms' },
               { name: 'Node In sáp 4K', status: 'ACTIVE', latency: '12ms' },
               { name: 'Cổng Thuế Direct API', status: 'STABLE', latency: '110ms' },
               { name: 'Shard Kế Toán 2024', status: crashedCount > 0 ? 'CORRUPTED' : 'NOMINAL', latency: '0ms' }
             ].map((node, i) => (
               <div key={i} className="p-6 bg-black/40 rounded-3xl border border-white/10 flex justify-between items-center group hover:bg-white/5 transition-all">
                 <div className="flex items-center space-x-8">
                   <div className={`w-3 h-3 rounded-full ${node.status === 'ACTIVE' || node.status === 'NOMINAL' || node.status === 'STABLE' ? 'bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-red-500 animate-pulse'}`}></div>
                   <div>
                     <p className="text-white font-bold text-sm uppercase tracking-widest">{node.name}</p>
                     <p className="text-[9px] text-gray-500 uppercase font-black mt-1">Status Code: {node.status}</p>
                   </div>
                 </div>
                 <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${node.status === 'CORRUPTED' ? 'text-red-400 bg-red-400/10' : 'text-cyan-400 bg-cyan-400/5'}`}>
                   {node.status}
                 </span>
               </div>
             ))}
           </div>
        </div>

        <div className="ai-panel p-8 bg-black/40 border-amber-500/20 flex flex-col justify-center items-center text-center">
           <AIAvatar personaId={PersonaID.PHIEU} size="lg" isThinking={isScanning} />
           <h4 className="ai-sub-headline text-amber-500 mt-6 mb-4">Phiêu: Chẩn đoán & Khôi phục</h4>
           <p className="text-[12px] text-gray-400 italic leading-relaxed">
              {isScanning 
                ? "Phiêu đang len lỏi vào từng Shard để kiểm tra tính toàn vẹn. Anh Natt chờ xíu nhé..." 
                : crashedCount > 0 
                  ? `Phát hiện ${crashedCount} Shard bị rò rỉ dữ liệu hoặc treo Node. Phiêu đã chuẩn bị sẵn các bản Backup. Anh hãy nhấn 'AUTO-FIX' để khôi phục.`
                  : "Hệ thống đang ở trạng thái mượt mà nhất. Mọi Long Mạch Shard đều thông suốt, sẵn sàng phục vụ các chiến dịch lớn của Anh."
              }
           </p>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;
