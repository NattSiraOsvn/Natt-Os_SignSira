import React, { useState, useEffect } from 'react';

export interface NattMedalProps {
  label: string;
  value: string | number;
  icon: string;
  colorClass?: string;
  domain?: string; // Ví dụ: 'sales', 'finance' để nhận diện xung
}

/**
 * NATT-CELL MEDAL (Worker Layer - Z:20)
 * Tuân thủ Kim Chỉ Nam & SPEC v2.4 (OPT-01R)
 */
export const NattMedal: React.FC<NattMedalProps> = ({
  label,
  value,
  icon,
  colorClass = 'text-amber-500',
  domain
}) => {
  // Trạng thái cộng hưởng: IDLE (ngủ) -> ACTIVE (thức) -> BURST (bùng nổ)
  const [resonance, setResonance] = useState<'IDLE' | 'ACTIVE' | 'BURST'>('IDLE');

  useEffect(() => {
    // lang Nahere: Lắng nghe nhịp đập từ Quả Tim (NauionEngine)
    const handlePulse = (e: any) => {
      const payload = e.detail;
      const eventType = payload?.type || '';

      if (domain && eventType.toLowerCase().includes(domain.toLowerCase())) {
         // Trúng domain -> Phản ứng mạnh (BURST)
         setResonance('BURST');
         setTimeout(() => setResonance('IDLE'), 2500);
      } else {
         // Xung hệ thống chung -> Phản ứng nhẹ (ACTIVE)
         setResonance('ACTIVE');
         setTimeout(() => setResonance('IDLE'), 1000);
      }
    };

    window.addEventListener('NAUION_PULSE', handlePulse);
    return () => window.removeEventListener('NAUION_PULSE', handlePulse);
  }, [domain]);

  // Z-index: Tầng Worker (z-20) theo SPEC
  const baseClass = "relative group overflow-hidden rounded-3xl p-6 backdrop-blur-xl border transition-all duration-700 z-20";

  const resonanceClass = resonance === 'BURST'
    ? "bg-white/10 border-amber-500/50 shadow-[0_0_30px_rgba(255,191,0,0.3)] scale-[1.02]"
    : resonance === 'ACTIVE'
    ? "bg-white/[0.05] border-white/20 shadow-[0_8px_32px_rgba(255,255,255,0.05)]"
    : "bg-white/[0.02] border-white/10 shadow-lg";

  return (
    <div className={`${baseClass} ${resonanceClass}`}>
      {/* Caustic Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Interactive Border */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:via-amber-500/50 transition-all duration-700"></div>

      <div className="relative z-10 flex justify-between items-start mb-4">
         <div className="text-[10px] uppercase font-black tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors">{label}</div>
         <div className={`text-2xl opacity-70 group-hover:opacity-100 transition-all ${resonance === 'BURST' ? 'animate-bounce text-amber-500' : ''}`}>
           {icon}
         </div>
      </div>
      <div className={`text-2xl font-serif italic tracking-tighter relative z-10 ${colorClass}`}>
         {value}
      </div>
    </div>
  );
};
