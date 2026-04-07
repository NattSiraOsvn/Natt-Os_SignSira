// src/scenes/ControlTower.tsx
import React, { useState, useEffect } from 'react'
import { Medal } from '../components/Medal'
import { CELLS } from '../registry/cells'
import { visionEngine } from '../vision-engine/core/vision-engine.core'

export const ControlTower: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const h = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', h)
    return () => window.removeEventListener('mousemove', h)
  }, [])

  const categories = [
    { label: 'Constitution', color: '#fbbf24' },
    { label: 'Kernel', color: '#f59e0b' },
    { label: 'Infrastructure', color: '#3b82f6' },
  ]

  return (
    <div className="min-h-screen bg-[#010204] px-8 py-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">⚡ Control Tower</h1>
        <p className="text-slate-500 text-sm mb-12">Kernel · Hệ thần kinh trung ương của sinh thể</p>
        {categories.map(({ label, color }) => {
          const cells = CELLS.filter(c => c.category === label)
          if (!cells.length) return null
          return (
            <div key={label} className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="text-xs font-black uppercase tracking-[0.3em]" style={{ color }}>
                  {label}
                </span>
                <span className="text-slate-600 text-xs">{cells.length} cells</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-8">
                {cells.map(cell => (
                  <Medal key={cell.id} cell={cell} onClick={() => visionEngine.selectCell(cell.id)} mousePosition={mousePos} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
