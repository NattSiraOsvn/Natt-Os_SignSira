import { phoGuard } from '../cells/business/dust-recovery-cell/domain/services/pho-guard.engine';
import { EventBus } from '../core/events/event-bus';
import fs from 'fs';
import path from 'path';

// Mock EventBus
jest.mock('../core/events/event-bus', () => ({
  EventBus: {
    publish: jest.fn(),
    subscribe: jest.fn(),
  }
}));

describe('PhoGuardEngine with real April 2025 data', () => {
  let testData: any[];

  beforeAll(() => {
    const filePath = path.join(__dirname, '../../test/fixtures/pho-data/april-2025.json');
    testData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should detect LOW_PHO_DETECTED for SC records with pho < 70', () => {
    const scLow = testData.filter(d => d.luong === 'SC' && d.pho < 70);
    scLow.forEach(d => {
      phoGuard.recordPho(d.worker, d.luong, 0, d.pho);
    });
    // Mỗi bản ghi SC <70 phát sinh 1 event LOW_PHO_DETECTED
    expect(EventBus.publish).toHaveBeenCalledTimes(scLow.length);
    // Kiểm tra cụ thể Trần Hoài Phúc SC 49.88
    expect(EventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'LOW_PHO_DETECTED' }),
      'dust-recovery-cell',
      expect.any(String)
    );
  });

  it('should detect PHO_CRITICAL for pho < 60 (Trần Hoài Phúc SC)', () => {
    const critical = testData.find(d => d.worker === 'Trần Hoài Phúc' && d.luong === 'SC');
    phoGuard.recordPho(critical.worker, critical.luong, 0, critical.pho);
    expect(EventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'PHO_CRITICAL' }),
      'dust-recovery-cell',
      expect.any(String)
    );
  });

  it('should detect PHO_DROP_ALERT when pho drops >5% from personal average', () => {
    // Giả lập 5 mẫu SX trước đó cho Nguyễn Văn Vẹn
    for (let i = 0; i < 5; i++) {
      phoGuard.recordPho('Nguyễn Văn Vẹn', 'SX', 0, 74.5);
    }
    // Bây giờ thêm mẫu SC thấp hơn
    phoGuard.recordPho('Nguyễn Văn Vẹn', 'SC', 0, 69.40);
    // Phải có ít nhất một PHO_DROP_ALERT
    const calls = (EventBus.publish as jest.Mock).mock.calls;
    const dropAlerts = calls.filter(call => call[0].type === 'PHO_DROP_ALERT');
    expect(dropAlerts.length).toBeGreaterThan(0);
  });

  it('should detect SX_SC_PHO_GAP when SX avg > SC avg by >10%', () => {
    // Giả lập nhiều mẫu cho Trần Hoài Phúc
    for (let i = 0; i < 3; i++) {
      phoGuard.recordPho('Trần Hoài Phúc', 'SX', 0, 74);
    }
    for (let i = 0; i < 3; i++) {
      phoGuard.recordPho('Trần Hoài Phúc', 'SC', 0, 50);
    }
    const calls = (EventBus.publish as jest.Mock).mock.calls;
    const gapAlerts = calls.filter(call => call[0].type === 'SX_SC_PHO_GAP');
    expect(gapAlerts.length).toBeGreaterThan(0);
  });
});
