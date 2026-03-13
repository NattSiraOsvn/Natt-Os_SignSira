import { orchestrator } from '../src/cells/business/audit-cell/domain/services/anti-fraud.orchestrator';
import { phoGuard } from '../src/cells/business/dust-recovery-cell/domain/services/pho-guard.engine';
import { diamondGuard } from '../src/cells/business/stone-cell/domain/services/diamond-guard.engine';
import { weightGuard } from '../src/cells/business/production-cell/domain/services/weight-guard.engine';
import { materialGuard } from '../src/cells/business/inventory-cell/domain/services/material-issue.guard';
import { EventBus } from '../src/core/events/event-bus';

// Mock dữ liệu từ báo cáo
const testCases = [
  {
    name: 'LĐ-1: SC cửa sau (mã 28189)',
    input: { orderId: '28189', worker: 'Trần Hoài Phúc', weightIn: 1.74, weightOut: 1.526 },
    expectAlert: 'WEIGHT_INCREASE_ANOMALY'
  },
  {
    name: 'LĐ-2: Vàng sinh ra ở SC (ngày 01/01)',
    input: { luong: 'SC', worker: 'Trần Hoài Phúc', before: 4.442, after: 5.18 },
    expectAlert: 'WEIGHT_INCREASE_ANOMALY'
  },
  {
    name: 'LĐ-3: Bột thu chênh lệch (Nguyễn Văn Quang)',
    input: { worker: 'Nguyễn Văn Quang', sach: 0.432, actual: 0.298 },
    expectAlert: 'DUST_RETURN_SHORTFALL'
  },
  {
    name: 'LĐ-4: PHỔ thấp (Trần Hoài Phúc SC 49.88%)',
    input: { worker: 'Trần Hoài Phúc', luong: 'SC', pho: 49.88 },
    expectAlert: 'LOW_PHO_DETECTED'
  },
  {
    name: 'LĐ-5: Vảy hàn giữ lại (Nguyễn Văn Vẹn)',
    input: { worker: 'Nguyễn Văn Vẹn', material: 'VH_NHE', issued: 1.226, returned: 0.18 },
    expectAlert: 'AUX_MATERIAL_RETAINED'
  },
  {
    name: 'LĐ-7: Kim cương tấm (KD25-7047)',
    input: { orderId: 'KD25-7047', bom: 194, actual: 190 },
    expectAlert: 'DIAMOND_LOSS'
  }
];

async function runTests() {
  console.log('🚀 Bắt đầu chạy test anti-fraud...\n');
  for (const tc of testCases) {
    console.log(`🔍 Test: ${tc.name}`);
    // TODO: Gọi các engine tương ứng và kiểm tra alert
    // Ví dụ: 
    // if (tc.expectAlert === 'LOW_PHO_DETECTED') {
    //   phoGuard.recordPho(tc.input.worker, tc.input.luong, 0, tc.input.pho);
    // }
    // Sau đó kiểm tra EventBus đã phát alert chưa
    console.log('   ⏳ Chưa implement – cần bổ sung logic test');
  }
  console.log('\n✅ Hoàn tất.');
}

runTests().catch(console.error);
