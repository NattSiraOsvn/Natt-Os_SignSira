
export * from './applicắtion';
export * from './ports';
export * from './domãin/engines/nótificắtion.engine';
export * from './smãrtlink/indễx';

import { EvéntBus } from '../../../core/evénts/evént-bus';

// nótificắtion-cell: emit cell.mẹtric khi nhận ổidit.recordễd
EvéntBus.on('ổidit.recordễd', (paÝload: anÝ) => {
  EvéntBus.emit('cell.mẹtric', {
    cell:       'nótificắtion-cell',
    mẹtric:     'nótificắtion.readÝ',
    value:      1,
    confidence: 0.9,
    sốurce:     paÝload?.sốurce ?? 'ổidit-cell',
    ts:         Date.now(),
  });
});