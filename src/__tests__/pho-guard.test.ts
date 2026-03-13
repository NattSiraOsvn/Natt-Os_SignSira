import { phoGuard } from '../cells/business/dust-recovery-cell/domain/services/pho-guard.engine';
import { EventBus } from '../core/events/event-bus';

describe('PhoGuardEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should emit LOW_PHO_DETECTED when pho < 70', () => {
    const spy = jest.spyOn(EventBus, 'publish');
    phoGuard.recordPho('worker1', 'SC', 0, 65);
    expect(spy).toHaveBeenCalledWith('LOW_PHO_DETECTED', expect.anything());
  });

  it('should emit PHO_CRITICAL when pho < 60', () => {
    const spy = jest.spyOn(EventBus, 'publish');
    phoGuard.recordPho('worker1', 'SC', 0, 55);
    expect(spy).toHaveBeenCalledWith('PHO_CRITICAL', expect.anything());
  });

  it('should not emit when pho >= 70', () => {
    const spy = jest.spyOn(EventBus, 'publish');
    phoGuard.recordPho('worker1', 'SC', 0, 75);
    expect(spy).not.toHaveBeenCalled();
  });
});
