import { forgeSmartLinkPort } from '@/satellites/port-forge/port.factory';

export const PeriodCloseSmartLinkPort = forgeSmartLinkPort({
  cellId: 'period-close-cell',
  signals: {
    subscribes: { DUST_CLOSE_REPORT: 'dust:close:report' },
    emits: { PERIOD_CLOSE: 'period:close:completed' }
  }
});
