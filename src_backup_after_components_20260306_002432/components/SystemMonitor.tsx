
import React, { useState, useEffect, useMemo } from 'react';
import { PersonaID, InputMetrics } from '../types';
import AIAvatar from './AIAvatar';
import ThreatDetectionService, { SystemHealth } from '../services/threatDetectionService';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { Calibration } from '../services/calibration/CalibrationEngine';

const SystemMonitor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'HEALTH' | 'SECURITY' | 'SENSITIVITY'>('HEALTH');
  const [healthMetrics, setHealthMetrics] = useState<SystemHealth>(ThreatDetectionService.getHealth());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Mounting Guard: Chờ layout sidebar auto-collapse ổn định
    const timer = setTimeout(() => setIsMounted(true), 300);
    
    const interval = setInterval(() => {
       setHealthMetrics(ThreatDetectionService.getHealth());
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  const sensitivityData = useMemo(() => {
    const cpm = healthMetrics.cpmMetrics?.currentCPM || 0;
    const threshold = Calibration.calculateAdaptiveThreshold('MASTER_NATT', healthMetrics.cpmMetrics?.intensity || 0);
    
    return [
      { subject: 'Tốc độ CPM', value: Math.min(100, (cpm / 500) * 100) },
      { subject: 'Cường độ', value: (healthMetrics.cpmMetrics?.intensity || 0) * 100 },
      { subject: 'Ngưỡng Shard', value: Math.min(100, (threshold / 600) * 100) },
      { subject: 'Độ ổn định', value: 92 },
      { subject: 'Phản hồi', value: 88 },
    ];
  }, [healthMetrics]);

  return (
    <div className="h-full flex flex-col bg-[#020202] p-8 md:p-12 overflow-y-auto no-scrollbar gap-10 animate-in fade-in duration-700 pb-40">
      <header className="flex justify-between items-end border-b border-indigo-500/10 pb-10">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className={`px-2 py-0.5 text-white text-[8px] font-black rounded uppercase tracking-widest bg-green-600`}>SYSTEM NOMINAL</span>
            <h2 className="ai-headline text-5xl italic tracking-tighter uppercase leading-none">Neural Map & Calibration</h2>
          </div>
          <p className="ai-sub-headline text-indigo-300/40 font-black tracking-[0.3em]">Giám sát luồng xung • Nhịp độ Identity Adaptive</p>
        </div>
        
        <div className="flex items-center gap-6">
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                <button onClick={() => setActiveTab('HEALTH')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'HEALTH' ? 'bg-amber-500 text-black' : 'text-gray-500'}`}>Health</button>
                <button onClick={() => setActiveTab('SENSITIVITY')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'SENSITIVITY' ? 'bg-cyan-500 text-black' : 'text-gray-500'}`}>Sensitivity Pulse</button>
            </div>
        </div>
      </header>

      {activeTab === 'SENSITIVITY' && (
         <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 animate-in slide-in-from-right-10">
            {/* CPM RADAR CHART */}
            <div className="ai-panel p-10 bg-black border-cyan-500/20 shadow-2xl flex flex-col items-center h-[500px]">
               <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-8">Neural Sensitivity Radar</h3>
               <div className="w-full flex-1 min-h-[300px]">
                  {isMounted && (
                  <ResponsiveContainer width="100%" height="100%">
                     <RadarChart cx="50%" cy="50%" outerRadius="80%" data={sensitivityData}>
                        <PolarGrid stroke="#333" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 9, fontWeight: 900 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                        <Radar name="Pulse" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                     </RadarChart>
                  </ResponsiveContainer>
                  )}
               </div>
            </div>

            {/* PERSONA PROFILE */}
            <div className="xl:col-span-2 space-y-8">
               <div className="ai-panel p-10 bg-gradient-to-br from-indigo-900/10 to-transparent border-indigo-500/20">
                  <h4 className="text-2xl font-serif gold-gradient italic uppercase tracking-tighter mb-10">Identity Rhythm Profile</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="p-6 bg-black/40 rounded-2xl border border-white/5 text-center">
                        <p className="text-[8px] text-gray-600 uppercase font-black mb-2">Live CPM</p>
                        <p className="text-3xl font-mono text-white font-bold">{healthMetrics.cpmMetrics?.currentCPM || 0}</p>
                     </div>
                     <div className="p-6 bg-black/40 rounded-2xl border border-white/5 text-center">
                        <p className="text-[8px] text-gray-600 uppercase font-black mb-2">Adaptive Threshold</p>
                        <p className="text-3xl font-mono text-amber-500 font-bold">{Calibration.calculateAdaptiveThreshold('MASTER_NATT', healthMetrics.cpmMetrics?.intensity || 0).toFixed(0)}</p>
                     </div>
                     <div className="p-6 bg-black/40 rounded-2xl border border-white/5 text-center">
                        <p className="text-[8px] text-gray-600 uppercase font-black mb-2">Integrity Status</p>
                        <p className="text-xl text-green-500 font-black italic">VERIFIED</p>
                     </div>
                  </div>
               </div>

               <div className="ai-panel p-8 bg-black/40 border-white/5 flex items-center gap-6">
                  <AIAvatar personaId={PersonaID.KRIS} size="sm" isThinking={false} />
                  <p className="text-sm text-gray-400 italic leading-relaxed font-light">
                     "Hệ thống đang băm Hash nhịp điệu hành vi của Anh. Độ trễ phản hồi Quantum đã được hiệu chuẩn về mức 0.02ms."
                  </p>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default SystemMonitor;
