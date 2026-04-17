// src/vision-engine/core/layer-controller.ts

export enum LayerType {
  TRUTH = 1,
  WORKER,
  EXPERIENCE,
  MODAL,
  ALERT,
  SECURITY = 6,
}

export const layerZIndex: Record<LayerType, number> = {
  [LayerType.TRUTH]: 0,
  [LayerType.WORKER]: 20,
  [LayerType.EXPERIENCE]: 60,
  [LayerType.MODAL]: 120,
  [LayerType.ALERT]: 220,
  [LayerType.SECURITY]: 999,
}

export function getZIndex(layer: LayerType): number {
  return layerZIndex[layer]
}
