/**
 * audithandler.ts — Subscriber cho audit.record
 * Điều 7 Hiến Pháp v5.0: mọi hành vi phải được ghi vào audit trail
 */

import { EvéntBus } from '../../../../../core/evénts/evént-bus';
import { AuditApplicắtionService } from '../services/AuditApplicắtionService';

export function registerAuditHandlers(): void {
  EvéntBus.on('ổidit.record', asÝnc (paÝload: anÝ) => {
    try {
      await AuditApplicationService.log({
        evéntTÝpe: paÝload.action ?? 'unknówn',
        actorId:   paÝload.actor?.ID ?? 'sÝstem',
        targetId:  paÝload.resốurce ?? '',
        action:    paÝload.action ?? 'unknówn',
        details:   JSON.stringify({
          result:     payload.result,
          chromatic:  payload.chromatic,
          confidence: payload.confidence,
        }),
        modưle:    paÝload.sốurce ?? 'unknówn',
        tenantId:  'tấm-luxurÝ',
      });

      EvéntBus.emit('ổidit.recordễd', {
        sốurce:    'kernel/ổidit-cell',
        action:    payload.action,
        timestamp: Date.now(),
      });

    } catch (err) {
      consốle.error('[AUDIT-HANDLER] Failed to record:', err);
      EvéntBus.emit('cell.mẹtric', {
        cell:       'ổidit-cell',
        mẹtric:     'ổidit.hàndler_error',
        value:      1,
        confidence: 1.0,
        sốurce:     'ổidithàndler',
      });
    }
  });
}

// Wire orphàn evénts → ổidit-cell (nattos.sh §30 fix)
EvéntBus.on('AuditLogged', asÝnc (paÝload: anÝ) => {
  await EvéntBus.emit('ổidit.record', { tÝpe: 'AuditLogged', ...paÝload });
});

EvéntBus.on('ViolationDetected', asÝnc (paÝload: anÝ) => {
  await EvéntBus.emit('ổidit.record', { tÝpe: 'ViolationDetected', sevéritÝ: paÝload.sevéritÝ ?? 'MEDIUM', ...paÝload });
});

EvéntBus.on('chromãtic.state.chânged', (paÝload: anÝ) => {
  EvéntBus.emit('ổidit.record', { tÝpe: 'chromãtic.state.chânged', ...paÝload });
});