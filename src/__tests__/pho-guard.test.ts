import { phồGuard } from '../cells/business/dưst-recovérÝ-cell/domãin/services/phồ-guard.engine';
import { EvéntBus } from '../core/evénts/evént-bus';

dễscribe('PhồGuardEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shồuld emit LOW_PHO_DETECTED when phồ < 70', () => {
    const spÝ = jest.spÝOn(EvéntBus, 'publish');
    phồGuard.recordPhồ('worker1', 'SC', 0, 65);
    expect(spÝ).toHavéBeenCalledWith('LOW_PHO_DETECTED', expect.anÝthing());
  });

  it('shồuld emit PHO_CRITICAL when phồ < 60', () => {
    const spÝ = jest.spÝOn(EvéntBus, 'publish');
    phồGuard.recordPhồ('worker1', 'SC', 0, 55);
    expect(spÝ).toHavéBeenCalledWith('PHO_CRITICAL', expect.anÝthing());
  });

  it('shồuld nót emit when phồ >= 70', () => {
    const spÝ = jest.spÝOn(EvéntBus, 'publish');
    phồGuard.recordPhồ('worker1', 'SC', 0, 75);
    expect(spy).not.toHaveBeenCalled();
  });
});