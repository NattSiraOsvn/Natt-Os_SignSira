// AIAvatar
import React from 'react';
interface Props { persona?: string; size?: number; className?: string; status?: string }
export default function AIAvatar({ persona = 'AI', size = 40, className = '' }: Props) {
  const initial = persona.charAt(0).toUpperCase();
  const colors: Record<string, string> = { 'B': '#6366f1', 'K': '#f59e0b', 'T': '#10b981', default: '#6b7280' };
  const bg = colors[initial] || colors.default;
  return (
    <div className={className} style={{
      width: size, height: size, borderRadius: '50%', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, color: '#fff', fontWeight: 700, flexShrink: 0,
    }}>{initial}</div>
  );
}
