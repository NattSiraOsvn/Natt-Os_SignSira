/**
 * hero-media-block.engine.ts
 * Nauion business engine companion cho component hero-media-block.tsx
 * Drafter: Băng — Chị Tư · Obikeeper · ss20260430
 *
 * NGUYÊN TẮC:
 *  - Engine KHÔNG import React, KHÔNG return JSX.
 *  - Engine giữ business logic + state machine + event publish.
 *  - Component .tsx chỉ render, gọi engine qua hook.
 *  - Mọi data flow qua Mạch HeyNa SSE / EventBus, KHÔNG fetch() trực tiếp.
 */

import { EventBus } from '@/core/events/event-bus';

export interface hero-media-blockState {
  // TODO: định nghĩa state shape từ component .tsx gốc
}

export interface hero-media-blockActions {
  // TODO: định nghĩa actions extract từ handler trong component
}

export class hero-media-blockEngine {
  constructor(private bus: EventBus) {}

  // TODO: extract business logic từ hero-media-block.tsx
  // pattern: handler trong component → method trong engine
  // pattern: useState ngoài render → state trong engine
  // pattern: fetch/api → bus.subscribe(event) + bus.publish(action)
}
