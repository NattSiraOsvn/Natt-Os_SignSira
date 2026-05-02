// src/scenes/Showroom.tsx
import React, { useState, useEffect } from 'react'
import { Medal } from '../components/Medal'
import { CELLS } from '../registry/cells'
import { visionEngine } from '../vision-engine/core/vision-engine.core'

export const Showroom: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const h = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', h)
    return () => window.removeEventListener('mousemove', h)
  }, [])

  const businessCells = CELLS.filter(c => c.category === 'Business')

  return (
    <div className="min-h-screen bg-[#010204] px-8 py-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">🏢 Showroom</h1>
        <p className="text-slate-500 text-sm mb-12">Business cells · 38 cells vận hành Tâm Luxury</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-8">
          {businessCells.map(cell => (
            <Medal key={cell.id} cell={cell} onClick={() => visionEngine.selectCell(cell.id)} mousePosition={mousePos} />
          ))}
        </div>
      </div>
    </div>
  )
}
