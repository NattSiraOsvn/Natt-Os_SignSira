import React, { useEffect, useState } from 'react';

export const ButterflyProtocol = () => {
  const [ripples, setRipples] = useState<{id: number, x: number, y: number}[]>([]);

  useEffect(() => {
    const handlePulse = (e: any) => {
      const type = e.detail?.type || '';
      // Kích hoạt cánh bướm với các sự kiện cốt lõi
      if (type.includes('confirm') || type.includes('heal') || type.includes('approve') || type.includes('start') || type.includes('sign')) {
        const x = window.innerWidth / 2;
        const y = window.innerHeight / 2;
        setRipples(prev => [...prev, { id: Date.now(), x, y }]);
      }
    };
    window.addEventListener('NAUION_PULSE', handlePulse);
    return () => window.removeEventListener('NAUION_PULSE', handlePulse);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {ripples.map(r => (
        <div
          key={r.id}
          className="absolute border border-amber-500 rounded-full animate-butterfly-ripple"
          style={{ left: r.x, top: r.y, transform: 'translate(-50%, -50%)' }}
          onAnimationEnd={() => setRipples(prev => prev.filter(item => item.id !== r.id))}
        ></div>
      ))}
    </div>
  );
};
