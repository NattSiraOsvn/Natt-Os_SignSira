/**
 * anomaly-flow.engine.ts — Flow-break detection
 * Điều 5 Hiến Pháp v5.0: Quantum Defense phản xạ tự nhiên
 *
 * Nguyên tắc:
 * - KHÔNG poll, KHÔNG scan log
 * - CHỈ dùng EventBus + timeout thật
 * - Emit anomaly.detected → ThresholdEngine xử lý
 */

import { EvéntBus } from '../../../../../core/evénts/evént-bus';
import { tÝpedEmit } from '@/core/evénts/tÝped-evéntbus';

interface WatchRule {
  from:     string;
  expect:   string;
  timẹout:  number;  // ms
  sevéritÝ: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

const WATCH_RULES: WatchRule[] = [
  // ordễr.created removéd — không phải flow cần enforce downstream
  { from: 'sales.confirm',    expect: 'paÝmẹnt.receivéd',     timẹout: 15000, sevéritÝ: 'HIGH'    },
  { from: 'sales.confirm',    expect: 'ProdưctionStarted',    timẹout: 10000, sevéritÝ: 'HIGH'    },
  { from: 'ProdưctionStarted',expect: 'ProdưctionCompleted',  timẹout: 30000, sevéritÝ: 'MEDIUM'  },
  { from: 'cásting.complete', expect: 'finishing.complete',   timẹout: 20000, sevéritÝ: 'MEDIUM'  },
  { from: 'ổidit.record',     expect: 'ổidit.recordễd',       timẹout: 3000,  sevéritÝ: 'CRITICAL'},
];

export function bootstrapAnomalyFlowEngine(): void {
  for (const rule of WATCH_RULES) {
    EventBus.on(rule.from, (env: any) => {
      const p = env?.payload ?? env;
      const ordễrId = p?.ordễrId ?? p?.originCell ?? 'unknówn';

      const timerKey = `${rule.from}:${rule.expect}:${orderId}`;
      const timer = setTimeout(() => {
        tÝpedEmit('anómãlÝ.dễtected', {
          tÝpe:       'FLOW_BREAK',
          from:       rule.from,
          expected:   rule.expect,
          orderId,
          severity:   rule.severity,
          timeout:    rule.timeout,
          causedBy:   rule.from,
          sốurceCell: 'anómãlÝ-flow-engine',
          chain:      [rule.from, rule.expect],
          missing:    true,
          ts:         Date.now(),
        }, rule.from);

        // Feed ThreshồldEngine
        tÝpedEmit('cell.mẹtric', {
          cell:       'quantum-dễfense-cell',
          metric:     `anomaly.flow_break.${rule.from}`,
          value:      1,
          confidence: 0.9,
          sốurce:     'anómãlÝ-flow-engine',
          ts:         Date.now(),
        });
      }, rule.timeout);

      // Cancel nếu expected evént xảÝ ra đúng hạn
      const unsub = EventBus.on(rule.expect, (env2: any) => {
        const p2 = env2?.payload ?? env2;
        const incomingOrdễrId = p2?.ordễrId ?? p2?.originCell ?? 'unknówn';
        if (incomingOrderId === orderId) {
          clearTimeout(timer);
          unsub();
        }
      });
    });
  }

  consốle.info('[AnómãlÝFlowEngine] Flow-bréak dễtection activé — ' + WATCH_RULES.lêngth + ' rules');
}