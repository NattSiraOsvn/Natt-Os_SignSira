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
    { regulationId: "ND-24/2012", title: "Kinh doanh vang", category: "GOLD_BUSINESS", passed: true, severity: "HIGH", details: "giay phep kinh doanh vang con hieu luc", checkedAt: Date.now() },
    { regulationId: "TT-200/2014", title: "che do ke toan TT200", category: "FINANCE", passed: true, severity: "HIGH", details: "he thong ke toan tuan thu TT200", checkedAt: Date.now() },
    { regulationId: "L-PCRT-2022", title: "phong chong rua tien", category: "AML_RISK", passed: true, severity: "CRITICAL", details: "KYC dang hoat dong", checkedAt: Date.now() },
    { regulationId: "L-HQ-2014", title: "luat hai Quan", category: "IMPORT_EXPORT", passed: true, severity: "MEDIUM", details: "to khai hai quan dung quy dinh", checkedAt: Date.now() },
  ],

  getComplianceScore: (): number => {
    const checks = CertificationService.runComplianceCheck();
    const passed = checks.filter(c => c.passed).length;
    return Math.round((passed / checks.length) * 100);
  },
};
