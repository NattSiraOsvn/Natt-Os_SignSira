// src/components/Medal.tsx
import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getPerformanceProfile } from '../vision-engine/adaptive/performance'
import type { Cell } from '../registry/cells'

interface MedalProps {
  cell: Cell
  onClick: () => void
  mousePosition: { x: number; y: number }
}

const COLOR_MAP: Record<string, string> = {
  gold: '#fbbf24',
  amber: '#f59e0b',
  blue: '#3b82f6',
  green: '#10b981',
  purple: '#a78bfa',
  red: '#f43f5e',
}

export const Medal: React.FC<MedalProps> = ({ cell, onClick, mousePosition }) => {
  const [hovered, setHovered] = useState(false)
  const [dof, setDof] = useState(0)
  const ref = useRef<HTMLButtonElement>(null)
  const perf = getPerformanceProfile()
  const color = COLOR_MAP[cell.color] || '#fbbf24'

  useEffect(() => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const dist = Math.hypot(
      mousePosition.x - (rect.left + rect.width / 2),
      mousePosition.y - (rect.top + rect.height / 2)
    )
    setDof(Math.max(0, (dist - 200) * 0.018))
  }, [mousePosition])

  const px = (f: number) => ({
    x: (mousePosition.x - window.innerWidth / 2) * f,
    y: (mousePosition.y - window.innerHeight / 2) * f,
  })
  const p1 = px(0.012), p2 = px(0.028), p3 = px(0.05)

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative outline-none group flex flex-col items-center"
      style={{
        filter: perf.enableBlur ? `blur(${dof}px)` : 'none',
        opacity: dof > 9 ? 0.2 : 1,
        transition: 'filter 0.3s, opacity 0.3s',
      }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div
        className="relative w-28 h-28 md:w-32 md:h-32"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${-p1.y}deg) rotateY(${p1.x}deg) scale(${hovered ? 1.08 : 1})`,
          transition: 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        {/* Orbital rings */}
        <div className="absolute inset-[-28%] pointer-events-none opacity-20 group-hover:opacity-100 transition-opacity duration-500">
          <svg className="w-full h-full animate-spin-slow" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke={color} strokeWidth="0.08" strokeDasharray="1 7" />
            <circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="0.2" strokeDasharray="12 22" />
          </svg>
          <svg className="absolute inset-0 w-full h-full animate-spin-reverse" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="41" fill="none" stroke={color} strokeWidth="0.12" strokeDasharray="3 12" />
          </svg>
        </div>

        {/* PBR metallic shell */}
        <div
          className="absolute inset-0 rounded-full border border-white/10"
          style={{
            background: `conic-gradient(from ${mousePosition.x * 0.08}deg at 50% 50%, #020202 0%, #1a1a1a 25%, #020202 50%, #1c1c1c 75%, #020202 100%)`,
            boxShadow: `0 20px 55px rgba(0,0,0,0.95), inset 0 0 20px rgba(255,255,255,0.04), 0 0 ${hovered ? '60px' : '20px'} ${color}40`,
            transition: 'box-shadow 0.4s',
          }}
        >
          {/* Specular sweep */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              style={{
                transform: `translateX(${hovered ? '200%' : '-200%'}) skewX(12deg)`,
                transition: 'transform 1s cubic-bezier(0.23,1,0.32,1)',
              }}
            />
          </div>
          {/* Fresnel rim */}
          <div className="absolute inset-0 rounded-full border-[1.5px] border-white/15" style={{ opacity: hovered ? 1 : 0.4 }} />
        </div>

        {/* Glass core */}
        <div
          className="absolute inset-[10%] rounded-full overflow-hidden border border-white/20"
          style={{
            backdropFilter: perf.enableBlur ? 'blur(18px) saturate(160%)' : 'none',
            background: `radial-gradient(circle at ${40 + mousePosition.x * 0.01}% ${40 + mousePosition.y * 0.01}%, rgba(255,255,255,0.12), transparent 80%)`,
            boxShadow: `inset 0 0 35px rgba(0,0,0,0.85), 0 8px 32px rgba(0,0,0,0.6)`,
            transform: `translateZ(28px) translateX(${p2.x}px) translateY(${p2.y}px)`,
            transition: 'transform 0.5s',
          }}
        >
          {/* Caustics */}
          {perf.enableCaustics && (
            <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
              <defs>
                <filter id={`caustic-${cell.id}`}>
                  <feTurbulence baseFrequency="0.018 0.022" numOctaves="4" seed="3">
                    <animate attributeName="baseFrequency" values="0.018 0.022;0.022 0.018;0.018 0.022" dur="8s" repeatCount="indefinite" />
                  </feTurbulence>
                  <feDisplacementMap scale="12" />
                </filter>
              </defs>
              <circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="8" filter={`url(#caustic-${cell.id})`} opacity="0.6" />
            </svg>
          )}
        </div>

        {/* Emissive icon */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            transform: `translateZ(62px) translateX(${p3.x}px) translateY(${p3.y}px)`,
            transition: 'transform 0.6s',
          }}
        >
          <div className="relative">
            <div
              className="absolute rounded-full"
              style={{
                inset: '-30%',
                background: color,
                filter: 'blur(22px)',
                opacity: hovered ? 0.75 : 0.35,
                transform: 'scale(1.4)',
                transition: 'opacity 0.4s',
              }}
            />
            {cell.icon && (
              <cell.icon
                size={36}
                strokeWidth={1.5}
                className="relative z-10 text-white"
                style={{ filter: `drop-shadow(0 0 10px ${color}) drop-shadow(0 0 25px ${color}80)` }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Label */}
      <div className="mt-6 text-center w-36">
        <span className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] truncate">
          {cell.category}
        </span>
        <h3
          className="text-[11px] font-black text-white uppercase tracking-[0.15em] truncate transition-colors"
          style={{ color: hovered ? color : undefined, textShadow: hovered ? `0 0 12px ${color}` : 'none' }}
        >
          {cell.title}
        </h3>
        {/* Confidence dots */}
        {cell.confidence !== undefined && (
          <div className="mt-1 flex justify-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-1 rounded-full transition-colors"
                style={{ background: (i + 1) * 20 <= cell.confidence! ? color : '#2a2a2a' }}
              />
            ))}
          </div>
        )}
        <span className="block text-[8px] text-slate-600 mt-0.5">{cell.version}</span>
      </div>
    </motion.button>
  )
}
