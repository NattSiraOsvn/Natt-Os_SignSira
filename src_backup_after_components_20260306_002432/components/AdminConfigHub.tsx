
import React, { useState, useEffect } from 'react';
import { Utilities, AIScoringConfig, DetectedContext } from '../services/documentAI';
import ModuleRegistry from '../services/moduleRegistry';
import { UserRole, ModuleConfig, PersonaID, UserPosition } from '../types';
import AIAvatar from './AIAvatar';
import { useAuthority } from '../hooks/useAuthority';
import ThreatDetection from '../services/threatDetectionService';

interface AdminConfigHubProps {
  currentRole: UserRole;
  currentPosition: UserPosition;
}

const AdminConfigHub: React.FC<AdminConfigHubProps> = ({ currentRole, currentPosition }) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'sensitivity' | 'core'>('matrix');
  const [scoringConfig, setScoringConfig] = useState<AIScoringConfig>(Utilities.documentAI.getConfig());
  const [securityConfig, setSecurityConfig] = useState(ThreatDetection.getConfig());

  // 1️⃣ Fix: Authority Source of Truth
  const auth = useAuthority(currentRole, currentPosition);

  const handleSensitivityChange = (val: 'LOW' | 'MEDIUM' | 'HIGH' | 'ADAPTIVE') => {
      if (!auth.canConfigureSystem) return alert("Cảnh báo: Bạn không có quyền thay đổi cấu hình an ninh.");
      setSecurityConfig(prev => ({ ...prev, sensitivity: val }));
      ThreatDetection.updateConfig({ sensitivity: val });
  };

  if (auth.level === 'OPERATIONAL') {
     return (
        <div className="h-full flex flex-col items-center justify-center opacity-40 text-center p-20">
           <span className="text-8xl mb-8 grayscale">⚙️</span>
           <h3 className="text-3xl font-serif gold-gradient italic uppercase">Access Denied</h3>
           <p className="text-sm text-gray-500 mt-4">Shard cấu hình bị phong tỏa. Cần quyền HIGH LEVEL trở lên.</p>
        </div>
     );
  }

  return (
    <div className="h-full bg-[#020202] flex flex-col overflow-hidden animate-in fade-in duration-700">
      <header className="p-8 border-b border-white/5 flex flex-col lg:flex-row justify-between items-end bg-black/40 backdrop-blur-xl shrink-0 gap-4">
        <div>
           <div className="flex items-center gap-4 mb-2">
              <AIAvatar personaId={PersonaID.THIEN} size="sm" />
              <h2 className="ai-headline text-4xl italic uppercase tracking-tighter">Admin Core Hub</h2>
           </div>
           <p className="ai-sub-headline text-gray-500 font-black tracking-[0.3em] ml-1">
             Authority Level: {auth.level} • Trust: {auth.trustScore}%
           </p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar max-w-full">
           {['matrix', 'sensitivity', 'core'].map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab as any)}
               className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                 activeTab === tab ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-gray-500 hover:text-white'
               }`}
             >
               {tab === 'matrix' ? 'Scoring Matrix' : tab === 'sensitivity' ? 'Pulse Sensitivity' : 'Core System'}
             </button>
           ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-10">
        {activeTab === 'sensitivity' && (
           <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-10">
              <div className="ai-panel p-10 bg-black/60 border-indigo-500/30 shadow-2xl relative overflow-hidden">
                 <h3 className="text-2xl font-serif gold-gradient italic uppercase tracking-widest mb-10">Pulse Protocol Tuning</h3>
                 
                 <div className="space-y-12">
                    <section>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { id: 'LOW', label: 'Sensitivity: LOW' },
                            { id: 'MEDIUM', label: 'Sensitivity: MEDIUM' },
                            { id: 'HIGH', label: 'Sensitivity: HIGH' },
                            { id: 'ADAPTIVE', label: 'Sensitivity: ADAPTIVE' }
                          ].map(opt => (
                             <button 
                                key={opt.id}
                                onClick={() => handleSensitivityChange(opt.id as any)}
                                className={`p-6 rounded-3xl border text-left transition-all relative overflow-hidden group ${
                                   securityConfig.sensitivity === opt.id 
                                   ? 'bg-amber-500/10 border-amber-500 shadow-xl' 
                                   : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                                }`}
                             >
                                <p className={`text-sm font-black uppercase mb-1 ${securityConfig.sensitivity === opt.id ? 'text-amber-500' : 'text-white'}`}>{opt.label}</p>
                             </button>
                          ))}
                       </div>
                    </section>

                    <div className="p-8 glass rounded-[3rem] border border-blue-500/20 bg-blue-500/5 flex items-center gap-8">
                       <AIAvatar personaId={PersonaID.THIEN} size="sm" />
                       <div>
                          <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Thiên Advisor</h4>
                          <p className="text-xs text-gray-400 italic font-light leading-relaxed">
                             "Thưa Anh Natt, Shard cấu hình hiện đã được niêm phong. Mọi thay đổi sẽ được đồng bộ hóa tức thì tới các Node **Quantum Buffer**."
                          </p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}
        
        {activeTab === 'matrix' && <div className="p-20 text-center opacity-20 italic">Matrix Tuning Locked by Authority...</div>}
        {activeTab === 'core' && <div className="p-20 text-center opacity-20 italic">System Core Standby...</div>}
      </main>
    </div>
  );
};

export default AdminConfigHub;
