
/**
 * Polishing.engine.ts — infrastructure wrapper
 * Path: src/cells/business/polishing-cell/infrastructure/
 */

import { EventBus } from '../../../../core/events/event-bus';

export interface PolishingInput {
  productId:   string;
  workerId:    string;
  method:      'hand' | 'machine' | 'ultrasonic';
  duration:    number;
  beforeScore: number;
  timestamp:   number;
}

export interface PolishingResult {
  productId:   string;
  afterScore:  number;
  improvement: number;
  pass:        boolean;
}

const IMPROVEMENT: Record<string, number> = {
  hand: 0.10, machine: 0.20, ultrasonic: 0.25,
};

export class PolishingEngine {
  process(input: PolishingInput): PolishingResult {
    const improvement = IMPROVEMENT[input.method] ?? 0.10;
    const afterScore  = Math.min(1.0, input.beforeScore + improvement);
    const pass        = afterScore >= 0.80;

    EventBus.emit('cell.metric', {
      cell: 'polishing-cell', metric: 'polish.quality',
      value: afterScore, confidence: 0.9,
      workerId: input.workerId, productId: input.productId,
    });

    return { productId: input.productId, afterScore, improvement, pass };
  }
}
