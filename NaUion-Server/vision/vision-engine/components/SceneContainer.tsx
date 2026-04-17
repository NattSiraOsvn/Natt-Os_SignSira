// src/vision-engine/components/SceneContainer.tsx
// FIX: lắng Nahere thay setInterval

import React, { useEffect, useState } from 'react'
import { EventBus } from '../../lib/event-bus'
import { visionEngine } from '../core/vision-engine.core'
import { sceneManager } from '../core/scene-manager'

export const SceneContainer: React.FC = () => {
  const [state, setState] = useState(visionEngine.getState())

  useEffect(() => {
    // Lắng Nahere — không setInterval
    const handler = (event: any) => {
      setState(event.payload.next)
    }

    EventBus.on('vision.state.changed', handler)
    return () => EventBus.off('vision.state.changed', handler)
  }, [])

  const Scene = sceneManager.get(state.currentScene)

  return (
    <div className="relative w-full h-full overflow-hidden pt-16">
      {Scene && <Scene />}
    </div>
  )
}
