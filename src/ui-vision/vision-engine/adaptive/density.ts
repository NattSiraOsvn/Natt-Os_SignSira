// src/vision-engine/adaptive/density.ts
// FIX: KHÔNG localStorage — in-memory + EventBus

import { EventBus, createEvent } from '../../lib/event-bus'

let _densityState: 'low' | 'medium' | 'high' = 'medium'

export function getDensityMode(): 'low' | 'medium' | 'high' {
  return _densityState
}

export function setDensityMode(mode: 'low' | 'medium' | 'high') {
  const prev = _densityState
  _densityState = mode

  EventBus.emit(createEvent('vision.density.changed', { prev, mode }))
}
