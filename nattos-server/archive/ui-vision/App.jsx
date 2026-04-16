// src/App.jsx
import React, { useState, useEffect } from 'react'
import { SceneContainer } from './vision-engine/components/SceneContainer'
import { Layer } from './vision-engine/components/Layer'
import { LayerType } from './vision-engine/core/layer-controller'
import { sceneManager } from './vision-engine/core/scene-manager'
import { visionEngine } from './vision-engine/core/vision-engine.core'
import { EventBus, createEvent } from './lib/event-bus'
import { SecurityOverlay } from './vision-engine/security/SecurityOverlay'
import { AuditVisualizer } from './components/AuditVisualizer'
import { getPerformanceProfile } from './vision-engine/adaptive/performance'
import { getDensityMode, setDensityMode } from './vision-engine/adaptive/density'
import { getRBAC, hasPermission } from './vision-engine/security/rbac'
import { CELLS } from './registry/cells'
import { Crown, Eye, Settings, X } from 'lucide-react'
import { Medal } from './components/Medal'

// Lazy-load scenes
import { ControlTower } from './scenes/ControlTower'
import { Showroom } from './scenes/Showroom'
import { Dashboard } from './scenes/Dashboard'

// Register scenes
sceneManager.register('controlTower', ControlTower)
sceneManager.register('showroom', Showroom)
sceneManager.register('dashboard', Dashboard)

// ── Modal ────────────────────────────────────────────────
function Modal() {
  const [state, setState] = useState(visionEngine.getState())

  useEffect(() => {
    const handler = (e) => setState(e.payload.next)
    EventBus.on('vision.state.changed', handler)
    return () => EventBus.off('vision.state.changed', handler)
  }, [])

  const cell = CELLS.find(c => c.id === state.selectedCellId)
  if (!state.isModalOpen || !cell) return null

  const colorMap = { gold: '#fbbf24', amber: '#f59e0b', blue: '#3b82f6', green: '#10b981', purple: '#a78bfa', red: '#f43f5e' }
  const color = colorMap[cell.color] || '#fbbf24'

  return (
    <Layer type={LayerType.MODAL}>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => visionEngine.closeModal()} />
        <div
          className="relative glass-panel w-full max-w-xl p-8"
          style={{ borderColor: `${color}40` }}
        >
          <button onClick={() => visionEngine.closeModal()} className="absolute top-4 right-4 text-white/40 hover:text-white">
            <X size={20} />
          </button>
          <div className="flex items-center gap-4 mb-6">
            <cell.icon size={36} style={{ color }} />
            <div>
              <h2 className="text-2xl font-black text-white">{cell.title}</h2>
              <span className="text-xs text-slate-500 uppercase tracking-widest">{cell.category}</span>
            </div>
          </div>
          <p className="text-slate-300 mb-6">{cell.description}</p>
          <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
            <div>
              <p className="text-slate-500 text-xs uppercase">Status</p>
              <p className="text-white font-bold">{cell.status}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase">Version</p>
              <p className="text-white font-bold">{cell.version}</p>
            </div>
            {cell.confidence !== undefined && (
              <div>
                <p className="text-slate-500 text-xs uppercase">Confidence</p>
                <p className="font-bold" style={{ color }}>{cell.confidence}%</p>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              className="flex-1 py-2 rounded-full text-sm font-bold text-black transition"
              style={{ background: color }}
              onClick={() => {
                EventBus.emit(createEvent('vision.cell.protocol.execute', { cell_id: cell.id }))
              }}
            >
              Execute Protocol
            </button>
            <button
              className="flex-1 py-2 rounded-full text-sm font-bold border border-white/20 text-white hover:border-white/40 transition"
              onClick={() => {
                EventBus.emit(createEvent('vision.cell.audit.request', { cell_id: cell.id }))
              }}
            >
              Audit Evidence
            </button>
          </div>
        </div>
      </div>
    </Layer>
  )
}

// ── Navbar ───────────────────────────────────────────────
function Navbar({ showAudit, setShowAudit }) {
  const [scene, setScene] = useState(visionEngine.getState().currentScene)
  const [density, setDensity] = useState(getDensityMode())

  useEffect(() => {
    const handler = (e) => setScene(e.payload.next.currentScene)
    EventBus.on('vision.state.changed', handler)

    const densityHandler = (e) => setDensity(e.payload.mode)
    EventBus.on('vision.density.changed', densityHandler)

    return () => {
      EventBus.off('vision.state.changed', handler)
      EventBus.off('vision.density.changed', densityHandler)
    }
  }, [])

  const navBtn = (id, label) => (
    <button
      key={id}
      onClick={() => visionEngine.navigate(id)}
      className={`px-4 py-1.5 text-xs font-bold rounded-full transition uppercase tracking-wider ${
        scene === id ? 'bg-amber-500 text-black' : 'text-white/60 hover:text-white hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  )

  return (
    <Layer type={LayerType.EXPERIENCE}>
      <div className="fixed top-0 left-0 right-0 p-3 flex justify-between items-center bg-black/60 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-2">
          <Crown className="text-amber-500" size={20} />
          <span className="text-white text-sm font-black tracking-widest">NATT-OS</span>
          <span className="text-slate-600 text-xs">v4.1</span>
        </div>
        <div className="flex items-center gap-2">
          {navBtn('controlTower', 'Kernel')}
          {navBtn('showroom', 'Showroom')}
          {navBtn('dashboard', 'Dashboard')}
          <button
            onClick={() => {
              const next = density === 'low' ? 'medium' : density === 'medium' ? 'high' : 'low'
              setDensityMode(next)
            }}
            className="p-1.5 text-white/40 hover:text-white transition rounded-full hover:bg-white/10"
            title={`Density: ${density}`}
          >
            <Settings size={16} />
          </button>
          <button
            onClick={() => setShowAudit(true)}
            className="p-1.5 text-white/40 hover:text-white transition rounded-full hover:bg-white/10"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>
      {showAudit && <AuditVisualizer onClose={() => setShowAudit(false)} />}
    </Layer>
  )
}

// ── App Root ─────────────────────────────────────────────
export default function App() {
  const [showAudit, setShowAudit] = useState(false)

  useEffect(() => {
    const perf = getPerformanceProfile()
    visionEngine.setState({ performanceProfile: perf })

    // Wire security events
    const handler = (event) => {
      console.error('🚨 SECURITY EVENT:', event.type, event.payload)
    }
    EventBus.on('security.failed', handler)
    EventBus.on('OMEGA_LOCKDOWN', handler)

    return () => {
      EventBus.off('security.failed', handler)
      EventBus.off('OMEGA_LOCKDOWN', handler)
    }
  }, [])

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#010204]">
      <Navbar showAudit={showAudit} setShowAudit={setShowAudit} />
      <SceneContainer />
      <Modal />
      <SecurityOverlay />
    </div>
  )
}
