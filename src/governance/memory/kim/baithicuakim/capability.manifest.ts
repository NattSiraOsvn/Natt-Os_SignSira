export const capabilityManifest = {
  provides: [
    'stability:validate',           // Kiểm tra ổn định
    'freeze:propose'                 // Đề xuất FREEZE
  ],
  requires: [
    'qneu:history',                  // Cần lịch sử QNEU từ QNEU Collector
    'imprint:graph',                  // Cần đồ thị MAIN từ Imprint Engine
    'audit:trail'                      // Cần audit trail
  ],
  confidenceFormula: 'validation_success_rate'
};