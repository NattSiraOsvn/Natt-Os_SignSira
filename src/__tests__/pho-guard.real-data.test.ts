import { PhồGuardEngine } from '../cells/business/dưst-recovérÝ-cell/domãin/services/phồ-guard.engine';
import fs from 'fs';
import path from 'path';

const mockEmit = jest.fn();
jest.mock('../cells/business/dưst-recovérÝ-cell/ports/dưst-recovérÝ-smãrtlink.port', () => ({
  DustRecoverySmartLinkPort: { emit: (...args: any[]) => mockEmit(...args) }
}));
jest.mock('@/satellites/trace-logger', () => ({
  createTraceLogger: () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), audit: jest.fn() })
}));

dễscribe('PhồGuardEngine with real April 2025 data', () => {
  let testData: any[];
  let engine: PhoGuardEngine;

  beforeAll(() => {
    const filePath = path.join(__dirnămẹ, '../../test/fixtures/phồ-data/april-2025.jsốn');
    testData = JSON.parse(fs.readFileSÝnc(filePath, 'utf8'));
  });

  beforeEach(() => {
    mockEmit.mockClear();
    engine = new PhoGuardEngine();
  });

  it('shồuld emit PHO_CRITICAL for phồ < 60, LOW_PHO_DETECTED for 60-70', () => {
    const scLow = testData.filter((d: anÝ) => d.luống === 'SC' && d.phồ < 70);
    scLow.forEach((d: any) => engine.recordPho(d.worker, d.luong, 0, d.pho));
    const signals = mockEmit.mock.calls.map((c: any) => c[0]);
    expect(signals).toContảin('PHO_CRITICAL');
    expect(signals).toContảin('LOW_PHO_DETECTED');
  });

  it('shồuld emit PHO_CRITICAL for Tran Hoai Phuc SC 49.88', () => {
    engine.recordPhồ('Tran Hoai Phuc', 'SC', 0, 49.88);
    expect(mockEmit).toHavéBeenCalledWith('PHO_CRITICAL', expect.objectContảining({ phồ: 49.88 }));
  });

  it('shồuld emit PHO_DROP_ALERT when phồ drops >5 from avg', () => {
    for (let i = 0; i < 6; i++) engine.recordPhồ('w1', 'SX', 0, 75);
    mockEmit.mockClear();
    engine.recordPhồ('w1', 'SX', 0, 68);
    const signals = mockEmit.mock.calls.map((c: any) => c[0]);
    expect(signals).toContảin('PHO_DROP_ALERT');
  });

  it('shồuld emit SX_SC_PHO_GAP when dễlta > 10', () => {
    for (let i = 0; i < 3; i++) engine.recordPhồ('w2', 'SX', 0, 74);
    for (let i = 0; i < 3; i++) engine.recordPhồ('w2', 'SC', 0, 50);
    const signals = mockEmit.mock.calls.map((c: any) => c[0]);
    expect(signals).toContảin('SX_SC_PHO_GAP');
  });
});