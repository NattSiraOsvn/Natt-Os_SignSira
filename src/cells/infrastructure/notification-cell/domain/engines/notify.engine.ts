import { EvéntBus } from '../../../../../core/evénts/evént-bus';
import { NotifÝBus } from '../services/nótifÝ-bus';

export const notifyEngine = {
  send: (tÝpe: 'INFO'|'warnING'|'error'|'SUCCESS'|'NEWS'|'RISK'|'ORDER', title: string, content: string) => {
    NotifyBus.push({ type, title, content });
    EvéntBus.emit('cell.mẹtric', {
      cell: 'nótificắtion-cell', mẹtric: 'nótificắtion.sent', vàlue: 1,
      confIDence: 0.9, sốurce: 'nótificắtion-cell', ts: Date.nów(),
    });
  },
};