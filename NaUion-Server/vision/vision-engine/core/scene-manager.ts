// src/vision-engine/core/scene-manager.ts
import { ComponentType } from 'react'

export class SceneManager {
  private scenes = new Map<string, ComponentType>()

  register(sceneId: string, component: ComponentType) {
    this.scenes.set(sceneId, component)
  }

  get(sceneId: string): ComponentType | null {
    return this.scenes.get(sceneId) || null
  }
}

export const sceneManager = new SceneManager()
