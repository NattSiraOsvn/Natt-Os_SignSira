// src/components/AuditVisualizer.tsx
import React, { useState, useEffect } from 'react'
import { EventBus } from '../lib/event-bus'
import { X } from 'lucide-react'

interface AuditEntry {
  id: string
  type: string
  action?: string
  timestamp: number
  payload: any
  caused_by?: string
}

export const AuditVisualizer: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [entries, setEntries] = useState<AuditEntry[]>([])

  useEffect(() => {
    const handler = (event: any) => {
      setEntries(prev => [{
        id: event.event_id || crypto.randomUUID(),
        type: event.type,
        action: event.action,
        timestamp: event.created_at || Date.now(),
        payload: event.payload,
        caused_by: event.caused_by,
      }, ...prev].slice(0, 50))
    }

    // Lắng tất cả events liên quan
    EventBus.on('audit', handler)
    EventBus.on('vision.state.changed', handler)
    EventBus.on('vision.density.changed', handler)
    EventBus.on('security.failed', handler)
    EventBus.on('OMEGA_LOCKDOWN', handler)

    return () => {
      EventBus.off('audit', handler)
      EventBus.off('vision.state.changed', handler)
      EventBus.off('vision.density.changed', handler)
      EventBus.off('security.failed', handler)
      EventBus.off('OMEGA_LOCKDOWN', handler)
    }
  }, [])

  const getTypeColor = (type: string) => {
    if (type.includes('security') || type.includes('OMEGA')) return '#f43f5e'
    if (type.includes('vision')) return '#fbbf24'
    if (type.includes('audit')) return '#10b981'
    return '#94a3b8'
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl font-black text-white">📜 Audit Trail</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-auto p-4 space-y-2 flex-1">
          {entries.map(e => (
            <div key={e.id} className="border-b border-white/5 pb-2">
              <div className="flex justify-between items-center text-xs mb-1">
                <span style={{ color: getTypeColor(e.type) }} className="font-mono font-bold">
                  {e.type}
                </span>
                <span className="text-slate-600">
                  {new Date(e.timestamp).toLocaleTimeString('vi')}
                </span>
              </div>
              {e.caused_by && (
                <div className="text-[10px] text-slate-600 mb-1">
                  ↳ caused_by: {e.caused_by.slice(0, 8)}...
                </div>
              )}
              <pre className="text-[10px] text-slate-400 overflow-x-auto">
                {JSON.stringify(e.payload, null, 2).slice(0, 200)}
              </pre>
            </div>
          ))}
          {entries.length === 0 && (
            <p className="text-slate-600 text-sm text-center py-8">Chưa có events...</p>
          )}
        </div>
      </div>
    </div>
  )
}
