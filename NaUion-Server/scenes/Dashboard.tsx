// src/scenes/Dashboard.tsx
import React, { useState, useEffect } from 'react'
import { Medal } from '../components/Medal'
import { CELLS } from '../registry/cells'
import { visionEngine } from '../vision-engine/core/vision-engine.core'
import { TrendingUp, Activity, Zap } from 'lucide-react'

const KPI = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
  <div className="glass-panel p-5">
    <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-black text-white">{value}</p>
    {sub && <p className="text-slate-600 text-xs mt-1">{sub}</p>}
  </div>
)

export const Dashboard: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const h = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', h)
    return () => window.removeEventListener('mousemove', h)
  }, [])

  const intelCells = CELLS.filter(c => c.category === 'Intelligence')
  const aiCells = CELLS.filter(c => c.category === 'AI Entities')
  const avgConf = Math.round(CELLS.reduce((a, c) => a + (c.confidence || 0), 0) / CELLS.length)

  return (
    <div className="min-h-screen bg-[#010204] px-8 py-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter">📊 Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Intelligence · AI Entities · System KPI</p>
          </div>
          <div className="flex gap-3 text-amber-500/60">
            <TrendingUp size={24} />
            <Activity size={24} />
            <Zap size={24} />
          </div>
        </div>

        {/* KPI Bar — data thật từ natt-os audit */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <KPI label="Total Cells" value={String(CELLS.length)} sub="38 business + kernel" />
          <KPI label="Avg Confidence" value={`${avgConf}%`} sub="across all cells" />
          <KPI label="Active Cells" value={String(CELLS.filter(c => c.status === 'Active').length)} sub="live in EventBus" />
          <KPI label="Tồn kho 2024" value="121.4 tỷ" sub="TK152+155+156" />
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-2 rounded-full bg-purple-400" />
          <span className="text-xs font-black uppercase tracking-[0.3em] text-purple-400">Intelligence</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-8 mb-16">
          {intelCells.map(cell => (
            <Medal key={cell.id} cell={cell} onClick={() => visionEngine.selectCell(cell.id)} mousePosition={mousePos} />
          ))}
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-xs font-black uppercase tracking-[0.3em] text-red-400">AI Entities</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-8">
          {aiCells.map(cell => (
            <Medal key={cell.id} cell={cell} onClick={() => visionEngine.selectCell(cell.id)} mousePosition={mousePos} />
          ))}
        </div>
      </div>
    </div>
  )
}
