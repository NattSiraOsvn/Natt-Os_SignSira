// src/vision-engine/core/vision-engine.core.ts
// FIX: EventBus thật, caused_by, secureAction với siraSign

import { EventBus, createEvent } from '../../lib/event-bus'
import { siraSignEngine } from '../security/sirasign-engine'

export type SceneId = 'controlTower' | 'showroom' | 'dashboard'
export type DensityMode = 'low' | 'medium' | 'high'

export interface VisionState {
  currentScene: SceneId
  selectedCellId?: string
  densityMode: DensityMode
  isModalOpen: boolean
  performanceProfile: { particleCount: number; enableBlur: boolean; enableCaustics: boolean }
  _lastEventId?: string
}

class VisionEngine {
  private state: VisionState = {
    currentScene: 'controlTower',
    densityMode: 'medium',
    isModalOpen: false,
    performanceProfile: { particleCount: 30, enableBlur: true, enableCaustics: false },
  }

  getState() { return { ...this.state } }

  setState(partial: Partial<VisionState>) {
    const prev = { ...this.state }
    const eventId = crypto.randomUUID()
    this.state = { ...this.state, ...partial, _lastEventId: eventId }

    EventBus.emit(createEvent(
      'vision.state.changed',
      { prev, next: this.state },
      prev._lastEventId
    ))
  }

  // Hành động cần bảo mật — yêu cầu siraSign
  secureAction(action: () => void, sirasign?: any) {
    if (!sirasign) {
      EventBus.emit(createEvent('security.failed', { reason: 'missing_sirasign' }))
      return
    }

    const result = siraSignEngine.verifyChain(sirasign)

    if (!result.valid) {
      EventBus.emit(createEvent('security.failed', { reason: 'invalid_chain', result }))
      EventBus.emit(createEvent('OMEGA_LOCKDOWN', { triggered_by: 'sirasign_fail' }))
      return
    }

    action()
  }

  navigate(scene: SceneId, sirasign?: any) {
    // Navigation công khai không cần siraSign
    // Chỉ các action nhạy cảm mới cần
    this.setState({ currentScene: scene })
  }

  navigateSecure(scene: SceneId, sirasign: any) {
    this.secureAction(() => this.setState({ currentScene: scene }), sirasign)
  }

  selectCell(cellId: string) {
    this.setState({ selectedCellId: cellId, isModalOpen: true })
  }

  closeModal() {
    this.setState({ isModalOpen: false, selectedCellId: undefined })
  }
}

export const visionEngine = new VisionEngine()
