// src/vision-engine/components/Layer.tsx
import React from 'react'
import { LayerType, getZIndex } from '../core/layer-controller'

interface LayerProps {
  type: LayerType
  children: React.ReactNode
  className?: string
}

export const Layer: React.FC<LayerProps> = ({ type, children, className = '' }) => (
  <div
    className={`fixed inset-0 pointer-events-none ${className}`}
    style={{ zIndex: getZIndex(type) }}
  >
    <div className="pointer-events-auto h-full w-full">
      {children}
    </div>
  </div>
)
