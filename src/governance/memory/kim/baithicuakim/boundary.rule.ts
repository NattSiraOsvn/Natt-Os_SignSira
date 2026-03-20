export const boundaryRule = {
  allowedIncoming: [
    'governance-cell',               // Governance có quyền kích hoạt
    'qneu-collector',                 // QNEU Collector có thể gửi dữ liệu
    'imprint-engine'                   // Imprint Engine có thể gửi dữ liệu
  ],
  allowedOutgoing: [
    'governance-cell',                // Gửi báo cáo
    'event-bus'                        // Gửi event cảnh báo, đề xuất FREEZE
  ],
  disallowed: [
    'direct-db-access',
    'foreign-import'
  ],
  protocol: 'SMARTLINK_ONLY'
};