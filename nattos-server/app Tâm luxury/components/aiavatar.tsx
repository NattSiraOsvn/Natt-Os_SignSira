import React from 'react';
import { PersonaID } from '../types';

interface AIAvatarProps {
  personaId: PersonaID;
  isThinking?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const AIAvatar: React.FC<AIAvatarProps> = ({ personaId, isThinking, size = 'md' }) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-32 h-32',
    xl: 'w-64 h-64'
  };

  const getCoreStyle = () => {
    switch (personaId) {
      case PersonaID.THIEN:
        return {
          color: 'from-amber-400 to-amber-600',
          glow: 'shadow-[0_0_30px_rgba(245,158,11,0.3)]',
          icon: '◈', 
          label: 'STRATEGIC CORE'
        };
      case PersonaID.CAN:
        return {
          color: 'from-pink-400 to-pink-600',
          glow: 'shadow-[0_0_30px_rgba(236,72,153,0.3)]',
          icon: '⟐', 
          label: 'COMMERCE CORE'
        };
      case PersonaID.KRIS:
        return {
          color: 'from-blue-400 to-blue-600',
          glow: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]',
          icon: '◬', 
          label: 'COMPLIANCE CORE'
        };
      case PersonaID.PHIEU:
        return {
          color: 'from-green-400 to-green-600',
          glow: 'shadow-[0_0_30px_rgba(34,197,94,0.3)]',
          icon: '✦', 
          label: 'SUPPORT CORE'
        };
      default:
        return {
          color: 'from-gray-400 to-gray-600',
          glow: 'shadow-[0_0_30px_rgba(156,163,175,0.3)]',
          icon: '⬩',
          label: 'SYSTEM CORE'
        };
    }
  };

  const style = getCoreStyle();

  return (
    <div className={`relative ${sizeMap[size]} flex items-center justify-center shrink-0`}>
      <div className={`absolute inset-0 border border-white/5 rounded-full animate-[spin_10s_linear_infinite] ${isThinking ? 'border-amber-500/30' : ''}`}></div>
      <div className={`absolute inset-2 border border-white/10 rounded-full animate-[spin_6s_linear_infinite_reverse] ${isThinking ? 'border-amber-500/20' : ''}`}></div>
      
      <div className={`relative w-[60%] h-[60%] rounded-xl bg-gradient-to-br ${style.color} ${style.glow} flex items-center justify-center transition-all duration-500 ${isThinking ? 'scale-110' : 'scale-100'}`}>
         <span className={`text-black font-black leading-none ${size === 'xl' ? 'text-6xl' : size === 'lg' ? 'text-3xl' : 'text-sm'}`}>
            {style.icon}
         </span>
         
         {isThinking && (
           <div className="absolute inset-0 rounded-xl animate-ping bg-white/30"></div>
         )}
      </div>

      {(size === 'lg' || size === 'xl') && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center whitespace-nowrap">
          <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">{style.label}</span>
          <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent mt-2"></div>
        </div>
      )}
    </div>
  );
};

export default AIAvatar;