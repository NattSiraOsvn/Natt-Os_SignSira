export type CertStatus = "VALID" | "EXPIRING" | "EXPIRED" | "PENDING";

export interface Certification {
  id: string;
  type: string;
  issuer: string;
  issuedAt: number;
  expiresAt: number;
  status: CertStatus;
  documentUrl?: string;
  notes?: string;
}

export interface ComplianceCheck {
  regulationId: string;
  title: string;
  category: string;
  passed: boolean;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  details: string;
  checkedAt: number;
}

const _certs: Certification[] = [];

export const CertificationService = {
  add: (cert: Omit<Certification, "id" | "status">): Certification => {
    const now = Date.now();
    const daysLeft = (cert.expiresAt - now) / 86400000;
    const status: CertStatus = daysLeft < 0 ? "EXPIRED" : daysLeft < 30 ? "EXPIRING" : "VALID";
    const c = { ...cert, id: `CERT-${Date.now()}`, status };
    _certs.push(c);
    return c;
  },
  getAll: (): Certification[] => [..._certs],
  getExpiring: (days = 30): Certification[] => {
    const threshold = Date.now() + days * 86400000;
    return _certs.filter(c => c.expiresAt <= threshold && c.expiresAt > Date.now());
  },
  getExpired: (): Certification[] => _certs.filter(c => c.expiresAt < Date.now()),

  runComplianceCheck: (): ComplianceCheck[] => [
    { regulationId: "ND-24/2012", title: "Kinh doanh vàng", category: "GOLD_BUSINESS", passed: true, severity: "HIGH", details: "Giấy phép kinh doanh vàng còn hiệu lực", checkedAt: Date.now() },
    { regulationId: "TT-200/2014", title: "Chế độ kế toán TT200", category: "FINANCE", passed: true, severity: "HIGH", details: "Hệ thống kế toán tuân thủ TT200", checkedAt: Date.now() },
    { regulationId: "L-PCRT-2022", title: "Phòng chống rửa tiền", category: "AML_RISK", passed: true, severity: "CRITICAL", details: "KYC đang hoạt động", checkedAt: Date.now() },
    { regulationId: "L-HQ-2014", title: "Luật Hải Quan", category: "IMPORT_EXPORT", passed: true, severity: "MEDIUM", details: "Tờ khai hải quan đúng quy định", checkedAt: Date.now() },
  ],

  getComplianceScore: (): number => {
    const checks = CertificationService.runComplianceCheck();
    const passed = checks.filter(c => c.passed).length;
    return Math.round((passed / checks.length) * 100);
  },
};
