/**
 * dashboard.engine.ts
 * Nauion business engine companion cho component dashboard.tsx
 * Drafter: Băng — Chị Tư · Obikeeper · ss20260430
 *
 * NGUYÊN TẮC:
 *  - Engine KHÔNG import React, KHÔNG return JSX.
 *  - Engine giữ business logic + state machine + event publish.
 *  - Component .tsx chỉ render, gọi engine qua hook.
 *  - Mọi data flow qua Mạch HeyNa SSE / EventBus, KHÔNG fetch() trực tiếp.
 */

import { EventBus } from '@/core/events/event-bus';

export interface dashboardState {
  // TODO: định nghĩa state shape từ component .tsx gốc
}

export interface dashboardActions {
  // TODO: định nghĩa actions extract từ handler trong component
}

export class dashboardEngine {
  constructor(private bus: EventBus) {}

  // TODO: extract business logic từ dashboard.tsx
  // pattern: handler trong component → method trong engine
  // pattern: useState ngoài render → state trong engine
  // pattern: fetch/api → bus.subscribe(event) + bus.publish(action)
}
