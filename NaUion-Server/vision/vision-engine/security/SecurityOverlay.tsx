// src/vision-engine/security/SecurityOverlay.tsx

import React, { useState, useEffect, useRef } from 'react'
import { EventBus, createEvent } from '../../lib/event-bus'
import { LayerType, getZIndex } from '../core/layer-controller'

const IDLE_TIMEOUT = 10 * 60 * 1000 // 10 phút

export const SecurityOverlay: React.FC = () => {
  const [locked, setLocked] = useState(false)
  const [breach, setBreach] = useState(false)
  const [pin, setPin] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined as any)

  const resetTimer = () => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setLocked(true), IDLE_TIMEOUT)
  }

  useEffect(() => {
    // Bắt đầu timer
    resetTimer()

    // Reset khi có tương tác
    const events = ['mousemove', 'keydown', 'click', 'touchstart']
    events.forEach(e => window.addEventListener(e, resetTimer))

    // Lắng Nahere quantum.kill
    const killHandler = () => {
      setLocked(true)
      EventBus.emit(createEvent('vision.overlay.locked', { reason: 'quantum.kill' }))
    }
    EventBus.on('quantum.kill', killHandler)

    // Lắng OMEGA_LOCKDOWN
    const lockdownHandler = (event: any) => {
      setLocked(true)
      setBreach(true)
      EventBus.emit(createEvent('vision.overlay.breach', { triggered_by: event.payload?.triggered_by }))
    }
    EventBus.on('OMEGA_LOCKDOWN', lockdownHandler)

    return () => {
      clearTimeout(timerRef.current)
      events.forEach(e => window.removeEventListener(e, resetTimer))
      EventBus.off('quantum.kill', killHandler)
      EventBus.off('OMEGA_LOCKDOWN', lockdownHandler)
    }
  }, [])

  const handleUnlock = () => {
    // TODO: gọi /api/auth/verify-pin khi có server thật
    // Hiện tại: mock PIN = 0000
    if (pin === '0000') {
      setLocked(false)
      setBreach(false)
      setPin('')
      resetTimer()
      EventBus.emit(createEvent('vision.overlay.unlocked', { method: 'pin' }))
    } else {
      setPin('')
    }
  }

  if (!locked) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black"
      style={{ zIndex: getZIndex(LayerType.SECURITY) }}
    >
      <div className="text-center">
        <div className="mb-8">
          {breach ? (
            <>
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-red-400 text-2xl font-black tracking-widest uppercase">
                Security Breach Detected
              </h2>
              <p className="text-red-600 text-sm mt-2">OMEGA LOCKDOWN ACTIVE</p>
            </>
          ) : (
            <>
              <div className="text-amber-500 text-6xl mb-4">🔐</div>
              <h2 className="text-white text-2xl font-black tracking-widest uppercase">
                System Locked
              </h2>
              <p className="text-slate-500 text-sm mt-2">Session idle timeout</p>
            </>
          )}
        </div>

        <div className="glass-panel p-8 w-72 mx-auto">
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleUnlock()}
            placeholder="PIN"
            maxLength={8}
            className="w-full bg-transparent border border-white/20 rounded-full px-4 py-3 text-white text-center tracking-widest outline-none focus:border-amber-500 mb-4"
            autoFocus
          />
          <button
            onClick={handleUnlock}
            className="w-full bg-white text-black px-6 py-3 rounded-full text-sm font-black uppercase tracking-wider hover:bg-amber-400 transition"
          >
            Unlock
          </button>
          <p className="text-slate-600 text-xs mt-4">
            SiraSign biometric verify — coming soon
          </p>
        </div>
      </div>
    </div>
  )
}
