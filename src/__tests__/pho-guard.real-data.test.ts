import { PhoGuardEngine } from '../cells/business/dust-recovery-cell/domain/services/pho-guard.engine';
import fs from 'fs';
import path from 'path';

const mockEmit = jest.fn();
jest.mock('../cells/business/dust-recovery-cell/ports/dust-recovery-SmartLink.port', () => ({
  DustRecoverySmartLinkPort: { emit: (...args: any[]) => mockEmit(...args) }
}));
jest.mock('@/satellites/trace-logger', () => ({
  createTraceLogger: () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), audit: jest.fn() })
}));

describe('PhoGuardEngine with real April 2025 data', () => {
  let testData: any[];
  let engine: PhoGuardEngine;

  beforeAll(() => {
    const filePath = path.join(__dirname, '../../test/fixtures/pho-data/april-2025.json');
    testData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  });

  beforeEach(() => {
    mockEmit.mockClear();
    engine = new PhoGuardEngine();
  });

  it('should emit PHO_CRITICAL for pho < 60, LOW_PHO_DETECTED for 60-70', () => {
    const scLow = testData.filter((d: any) => d.luong === 'SC' && d.pho < 70);
    scLow.forEach((d: any) => engine.recordPho(d.worker, d.luong, 0, d.pho));
    const signals = mockEmit.mock.calls.map((c: any) => c[0]);
    expect(signals).toContain('PHO_CRITICAL');
    expect(signals).toContain('LOW_PHO_DETECTED');
  });

  it('should emit PHO_CRITICAL for Tran Hoai Phuc SC 49.88', () => {
    engine.recordPho('Tran Hoai Phuc', 'SC', 0, 49.88);
    expect(mockEmit).toHaveBeenCalledWith('PHO_CRITICAL', expect.objectContaining({ pho: 49.88 }));
  });

  it('should emit PHO_DROP_ALERT when pho drops >5 from avg', () => {
    for (let i = 0; i < 6; i++) engine.recordPho('w1', 'SX', 0, 75);
    mockEmit.mockClear();
    engine.recordPho('w1', 'SX', 0, 68);
    const signals = mockEmit.mock.calls.map((c: any) => c[0]);
    expect(signals).toContain('PHO_DROP_ALERT');
  });

  it('should emit SX_SC_PHO_GAP when delta > 10', () => {
    for (let i = 0; i < 3; i++) engine.recordPho('w2', 'SX', 0, 74);
    for (let i = 0; i < 3; i++) engine.recordPho('w2', 'SC', 0, 50);
    const signals = mockEmit.mock.calls.map((c: any) => c[0]);
    expect(signals).toContain('SX_SC_PHO_GAP');
  });
});
