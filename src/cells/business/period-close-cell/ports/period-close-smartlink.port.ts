// @ts-nocheck
import { forgeSmartLinkPort } from '@/satellites/port-forge';

export const PeriodCloseSmartLinkPort = forgeSmartLinkPort({
  cellId: 'period-close-cell',
  signals: {
    DUST_CLOSE_REPORT: { eventType: 'dust:close:report', routeTo: 'dust-recovery-cell' },
    PERIOD_CLOSE: { eventType: 'period:close', routeTo: 'finance-cell' },
  }
});
