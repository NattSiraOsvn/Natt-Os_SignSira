// @ts-nocheck
/**
 * anomaly-flow.engine.ts — Flow-break detection
 * Điều 5 Hiến Pháp v5.0: Quantum Defense phản xạ tự nhiên
 *
 * Nguyên tắc:
 * - KHÔNG poll, KHÔNG scan log
 * - CHỈ dùng EventBus + timeout thật
 * - Emit anomaly.detected → ThresholdEngine xử lý
 */

import { EventBus } from '@/core/events/event-bus';

interface WatchRule {
  from:     string;
  expect:   string;
  timeout:  number;  // ms
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

const WATCH_RULES: WatchRule[] = [
  // order.created removed — không phải flow cần enforce downstream
  { from: 'sales.confirm',    expect: 'payment.received',     timeout: 15000, severity: 'HIGH'    },
  { from: 'sales.confirm',    expect: 'ProductionStarted',    timeout: 10000, severity: 'HIGH'    },
  { from: 'ProductionStarted',expect: 'ProductionCompleted',  timeout: 30000, severity: 'MEDIUM'  },
  { from: 'casting.complete', expect: 'finishing.complete',   timeout: 20000, severity: 'MEDIUM'  },
  { from: 'audit.record',     expect: 'audit.recorded',       timeout: 3000,  severity: 'CRITICAL'},
];

export function bootstrapAnomalyFlowEngine(): void {
  for (const rule of WATCH_RULES) {
    EventBus.on(rule.from, (env: any) => {
      const p = env?.payload ?? env;
      const orderId = p?.orderId ?? p?.originCell ?? 'unknown';

      const timer = setTimeout(() => {
        EventBus.emit('anomaly.detected', {
          type:       'FLOW_BREAK',
          from:       rule.from,
          expected:   rule.expect,
          orderId,
          severity:   rule.severity,
          timeout:    rule.timeout,
          causedBy:   rule.from,
          sourceCell: 'anomaly-flow-engine',
          chain:      [rule.from, '(missing)', rule.expect],
          ts:         Date.now(),
        }, rule.from);

        // Feed ThresholdEngine
        EventBus.emit('cell.metric', {
          cell:       'quantum-defense-cell',
          metric:     `anomaly.flow_break.${rule.from}`,
          value:      1,
          confidence: 0.9,
          source:     'anomaly-flow-engine',
          ts:         Date.now(),
        });
      }, rule.timeout);

      // Cancel nếu expected event xảy ra đúng hạn
      const unsub = EventBus.on(rule.expect, () => {
        clearTimeout(timer);
        unsub();
      });
    });
  }

  console.info('[AnomalyFlowEngine] Flow-break detection active — ' + WATCH_RULES.length + ' rules');
}
