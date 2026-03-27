// hr-cell/domain/entities/employee.entity.ts
// Wave B — Cập nhật theo cấu trúc thực tế sổ lương Tâm Luxury

export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'PROBATION';
export type ContractType   = 'Hợp đồng chính thức' | 'Hợp đồng thử việc' | 'CTV' | 'Thời vụ';

// Bộ phận production — map sang cell tương ứng
export type ProductionGroup =
  | 'casting'     // Tổ đúc   → casting-cell
  | 'stone'       // Tổ hột   → stone-cell
  | 'finishing'   // Tổ nguội → finishing-cell
  | 'polishing'   // Nhám bóng → polishing-cell
  | 'design-3d'   // Thiết kế 3D → design-3d-cell
  | 'warehouse'   // Quản lý Kho → warehouse-cell
  | null;         // Non-production

export interface Employee {
  // ── Định danh ──
  employeeCode: string;   // TLXR000 → TLXR193+
  fullName:     string;
  status:       EmployeeStatus;

  // ── Vị trí ──
  khoi:       string;     // Khối Sản Xuất / Kinh Doanh / Vận Hành / Ban Kiểm Soát
  phongBan:   string;     // Phòng Sản xuất / Marketing / ...
  chucVu:     string;     // Thợ / Nhân viên / Chuyên viên / Trưởng phòng ...
  capBac:     string;     // Nhân viên - Chuyên viên / Quản lý cơ sở / ...
  boPhan:     string;     // Tổ đúc / Tổ hột / Thiết kế 3D / ...
  productionGroup: ProductionGroup;

  // ── Cá nhân ──
  gioiTinh:   string;
  ngaySinh:   string;
  email:      string;
  sdt:        string;
  trinhDo:    string;

  // ── Hợp đồng ──
  loaiHinhLamViec: string;  // Nhân viên chính thức / CTV
  loaiHopDong:     ContractType | string;
  ngayVaoLam:      string;

  // ── Lương ──
  luongHienTai:    number;
  thangLuong:      string;  // BẬC 1 / BẬC 2 / ...
  dependents:      number;

  // ── Bảo hiểm ──
  insuranceSalary?: number;
  insuranceCode?:   string;
  bankAccount?:     string;
  bankName?:        string;
}

// ── HR_FIELDS_LEVELS: quyền truy cập theo cấp độ (Điều 9) ──
export const HR_FIELDS_LEVELS = {
  BASIC:   ['fullName', 'gioiTinh', 'ngaySinh', 'email', 'sdt', 'trinhDo'] as const,
  WORK:    ['employeeCode', 'status', 'khoi', 'phongBan', 'chucVu', 'capBac',
             'boPhan', 'productionGroup', 'loaiHinhLamViec', 'loaiHopDong', 'ngayVaoLam'] as const,
  FINANCE: ['luongHienTai', 'thangLuong', 'dependents', 'insuranceSalary',
             'bankAccount', 'bankName'] as const,
  INSURANCE: ['insuranceCode', 'insuranceSalary'] as const,
} as const;

export type HRFieldLevel = keyof typeof HR_FIELDS_LEVELS;
