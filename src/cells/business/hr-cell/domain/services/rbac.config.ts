/**
 * NATT-OS RBAC Config v1.0
 * Phân quyền theo roles thực tế từ employees_raw.json (122 NV, 33 roles)
 * Target: src/cells/business/hr-cell/domain/services/rbac.config.ts
 */

// ── PERMISSION DEFINITIONS ────────────────────────────────────────────────
export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD_FULL:      'view:dashboard:full',
  VIEW_DASHBOARD_DEPT:      'view:dashboard:dept',
  VIEW_DASHBOARD_PERSONAL:  'view:dashboard:personal',

  // Đơn hàng
  VIEW_ORDERS_ALL:          'view:orders:all',
  VIEW_ORDERS_DEPT:         'view:orders:dept',
  VIEW_ORDERS_OWN:          'view:orders:own',
  CREATE_ORDER:             'create:order',
  EDIT_ORDER:               'edit:order',
  APPROVE_ORDER:            'approve:order',
  CANCEL_ORDER:             'cancel:order',

  // Sản xuất
  VIEW_PRODUCTION_ALL:      'view:production:all',
  VIEW_PRODUCTION_DEPT:     'view:production:dept',
  UPDATE_PRODUCTION_STATUS: 'update:production:status',
  VIEW_LOSS_REPORT:         'view:loss:report',
  VIEW_FRAUD_ALERT:         'view:fraud:alert',

  // Kho / Nguyên liệu
  VIEW_INVENTORY:           'view:inventory',
  MANAGE_INVENTORY:         'manage:inventory',
  VIEW_GOLD_WEIGHT:         'view:gold:weight',
  APPROVE_MATERIAL_ISSUE:   'approve:material:issue',

  // Nhân sự
  VIEW_HR_ALL:              'view:hr:all',
  VIEW_HR_DEPT:             'view:hr:dept',
  VIEW_SALARY:              'view:salary',
  MANAGE_PAYROLL:           'manage:payroll',
  VIEW_ATTENDANCE:          'view:attendance',
  MANAGE_ATTENDANCE:        'manage:attendance',

  // Tài chính
  VIEW_FINANCE:             'view:finance',
  VIEW_REVENUE:             'view:revenue',
  APPROVE_PAYMENT:          'approve:payment',

  // Khách hàng
  VIEW_CUSTOMERS:           'view:customers',
  MANAGE_CUSTOMERS:         'manage:customers',
  VIEW_WARRANTY:            'view:warranty',
  CREATE_WARRANTY:          'create:warranty',

  // Báo cáo / Giám sát
  VIEW_REPORTS_ALL:         'view:reports:all',
  VIEW_REPORTS_DEPT:        'view:reports:dept',
  VIEW_SURVEILLANCE:        'view:surveillance',
  EXPORT_DATA:              'export:data',

  // Admin
  MANAGE_USERS:             'manage:users',
  MANAGE_SYSTEM:            'manage:system',
  VIEW_AUDIT_LOG:           'view:audit:log',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// ── ROLE GROUPS (6 cấp) ───────────────────────────────────────────────────
export type RoleGroup =
  | 'GIAM_DOC'      // Tổng Quản lý, Giám đốc, Trợ lý GĐ
  | 'QUAN_LY'       // Trưởng phòng, Quản lý kỹ thuật, Tổ trưởng
  | 'TRUONG_BP'     // Trưởng bộ phận
  | 'KINH_DOANH'    // Sales, Tư vấn, CSKH, Sales Admin
  | 'SAN_XUAT'      // Thợ, KCS, Chế tác, Thiết kế
  | 'VAN_PHONG';    // HC-NS, Kế toán, IT, Kho, Thu mua, Tài xế, CTV

// ── ROLE → GROUP MAPPING ─────────────────────────────────────────────────
export const ROLE_TO_GROUP: Record<string, RoleGroup> = {
  'Tổng Quản lý':            'GIAM_DOC',
  'Giám đốc Sản xuất':       'GIAM_DOC',
  'Giám đốc Kỹ thuật':       'GIAM_DOC',
  'Trợ lý Giám đốc':         'GIAM_DOC',

  'TRƯỞNG PHÒNG':            'QUAN_LY',
  'Trưởng phòng Marketing':   'QUAN_LY',
  'Quản lý Kỹ thuật':        'QUAN_LY',
  'QL Kỹ thuật khâu nguội':  'QUAN_LY',
  'Quản lý đơn hàng':        'QUAN_LY',
  'Tổ trưởng Tổ đúc':        'QUAN_LY',

  'Trưởng BP Media':         'TRUONG_BP',
  'Trưởng BP Nhám bóng':     'TRUONG_BP',
  'Trưởng BP Thiết kế':      'TRUONG_BP',
  'Trưởng BP Tổ hột':        'TRUONG_BP',
  'Trưởng BP Tổ nguội':      'TRUONG_BP',

  'Nhân viên sale':          'KINH_DOANH',
  'Nhân viên tư vấn':        'KINH_DOANH',
  'Chăm sóc khách hàng':     'KINH_DOANH',
  'Sales Admin':             'KINH_DOANH',
  'Trợ lý kinh doanh':       'KINH_DOANH',
  'Digital Marketing':       'KINH_DOANH',
  'Nhân viên Media':         'KINH_DOANH',

  'Thợ':                     'SAN_XUAT',
  'KCS':                     'SAN_XUAT',
  'Nhân viên chế tác kim hoàn': 'SAN_XUAT',
  'Nhân viên thiết kế':      'SAN_XUAT',

  'NV Hành chính - Nhân sự': 'VAN_PHONG',
  'Nhân viên Kế toán':       'VAN_PHONG',
  'Nhân viên IT':            'VAN_PHONG',
  'Nhân viên Hậu cần':       'VAN_PHONG',
  'Nhân viên Thu Mua':       'VAN_PHONG',
  'Nhân viên quản lý kho':   'VAN_PHONG',
  'Tài xế':                  'VAN_PHONG',
  'CTV':                     'VAN_PHONG',
};

// ── GROUP → PERMISSIONS ───────────────────────────────────────────────────
export const GROUP_PERMISSIONS: Record<RoleGroup, Permission[]> = {
  GIAM_DOC: [
    PERMISSIONS.VIEW_DASHBOARD_FULL,
    PERMISSIONS.VIEW_ORDERS_ALL,
    PERMISSIONS.APPROVE_ORDER,
    PERMISSIONS.CANCEL_ORDER,
    PERMISSIONS.VIEW_PRODUCTION_ALL,
    PERMISSIONS.VIEW_LOSS_REPORT,
    PERMISSIONS.VIEW_FRAUD_ALERT,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.MANAGE_INVENTORY,
    PERMISSIONS.VIEW_GOLD_WEIGHT,
    PERMISSIONS.APPROVE_MATERIAL_ISSUE,
    PERMISSIONS.VIEW_HR_ALL,
    PERMISSIONS.VIEW_SALARY,
    PERMISSIONS.MANAGE_PAYROLL,
    PERMISSIONS.VIEW_FINANCE,
    PERMISSIONS.VIEW_REVENUE,
    PERMISSIONS.APPROVE_PAYMENT,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.MANAGE_CUSTOMERS,
    PERMISSIONS.VIEW_WARRANTY,
    PERMISSIONS.VIEW_REPORTS_ALL,
    PERMISSIONS.VIEW_SURVEILLANCE,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_SYSTEM,
    PERMISSIONS.VIEW_AUDIT_LOG,
  ],

  QUAN_LY: [
    PERMISSIONS.VIEW_DASHBOARD_DEPT,
    PERMISSIONS.VIEW_ORDERS_ALL,
    PERMISSIONS.CREATE_ORDER,
    PERMISSIONS.EDIT_ORDER,
    PERMISSIONS.APPROVE_ORDER,
    PERMISSIONS.VIEW_PRODUCTION_ALL,
    PERMISSIONS.UPDATE_PRODUCTION_STATUS,
    PERMISSIONS.VIEW_LOSS_REPORT,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.APPROVE_MATERIAL_ISSUE,
    PERMISSIONS.VIEW_GOLD_WEIGHT,
    PERMISSIONS.VIEW_HR_DEPT,
    PERMISSIONS.VIEW_SALARY,
    PERMISSIONS.MANAGE_ATTENDANCE,
    PERMISSIONS.VIEW_REVENUE,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.VIEW_WARRANTY,
    PERMISSIONS.CREATE_WARRANTY,
    PERMISSIONS.VIEW_REPORTS_ALL,
    PERMISSIONS.VIEW_SURVEILLANCE,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.VIEW_AUDIT_LOG,
  ],

  TRUONG_BP: [
    PERMISSIONS.VIEW_DASHBOARD_DEPT,
    PERMISSIONS.VIEW_ORDERS_DEPT,
    PERMISSIONS.VIEW_PRODUCTION_DEPT,
    PERMISSIONS.UPDATE_PRODUCTION_STATUS,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_GOLD_WEIGHT,
    PERMISSIONS.VIEW_HR_DEPT,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.MANAGE_ATTENDANCE,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.VIEW_WARRANTY,
    PERMISSIONS.VIEW_REPORTS_DEPT,
    PERMISSIONS.EXPORT_DATA,
  ],

  KINH_DOANH: [
    PERMISSIONS.VIEW_DASHBOARD_PERSONAL,
    PERMISSIONS.VIEW_ORDERS_OWN,
    PERMISSIONS.CREATE_ORDER,
    PERMISSIONS.EDIT_ORDER,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.MANAGE_CUSTOMERS,
    PERMISSIONS.VIEW_WARRANTY,
    PERMISSIONS.CREATE_WARRANTY,
    PERMISSIONS.VIEW_REPORTS_DEPT,
  ],

  SAN_XUAT: [
    PERMISSIONS.VIEW_DASHBOARD_PERSONAL,
    PERMISSIONS.VIEW_ORDERS_DEPT,
    PERMISSIONS.UPDATE_PRODUCTION_STATUS,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_ATTENDANCE,
  ],

  VAN_PHONG: [
    PERMISSIONS.VIEW_DASHBOARD_PERSONAL,
    PERMISSIONS.VIEW_ORDERS_DEPT,
    PERMISSIONS.VIEW_HR_DEPT,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.VIEW_WARRANTY,
  ],
};

// ── DAILY WORK TASKS per group ─────────────────────────────────────────────
export const DAILY_TASKS: Record<RoleGroup, Array<{
  id: string; title: string; icon: string; priority: 'HIGH' | 'MEDIUM' | 'LOW';
  route: string;
}>> = {
  GIAM_DOC: [
    { id: 'surveillance',   title: 'Giám Sát Luồng SX',    icon: '🔍', priority: 'HIGH',   route: '/surveillance' },
    { id: 'fraud_alert',    title: 'Cảnh Báo Gian Lận',    icon: '🚨', priority: 'HIGH',   route: '/fraud-alerts' },
    { id: 'revenue',        title: 'Doanh Thu Hôm Nay',    icon: '💰', priority: 'HIGH',   route: '/revenue' },
    { id: 'orders_pending', title: 'Đơn Chờ Duyệt',        icon: '📋', priority: 'HIGH',   route: '/orders?status=pending' },
    { id: 'production',     title: 'Tổng Quan Sản Xuất',   icon: '🏭', priority: 'MEDIUM', route: '/production' },
    { id: 'inventory',      title: 'Tồn Kho Vàng',         icon: '⚖️', priority: 'MEDIUM', route: '/inventory' },
    { id: 'payroll',        title: 'Bảng Lương Tháng',     icon: '💼', priority: 'MEDIUM', route: '/payroll' },
    { id: 'audit',          title: 'Nhật Ký Kiểm Toán',    icon: '📜', priority: 'LOW',    route: '/audit' },
  ],
  QUAN_LY: [
    { id: 'orders_dept',    title: 'Đơn Hàng Phòng',       icon: '📋', priority: 'HIGH',   route: '/orders' },
    { id: 'production',     title: 'Theo Dõi Sản Xuất',    icon: '🏭', priority: 'HIGH',   route: '/production' },
    { id: 'loss_report',    title: 'Báo Cáo Hao Hụt',      icon: '📊', priority: 'HIGH',   route: '/loss-report' },
    { id: 'attendance',     title: 'Chấm Công Nhân Sự',    icon: '🗓️', priority: 'HIGH',   route: '/attendance' },
    { id: 'warranty',       title: 'Phiếu Bảo Hành',       icon: '🛡️', priority: 'MEDIUM', route: '/warranty' },
    { id: 'inventory',      title: 'Kiểm Kho',             icon: '📦', priority: 'MEDIUM', route: '/inventory' },
    { id: 'surveillance',   title: 'Giám Sát L6/L7/L8',   icon: '🔍', priority: 'MEDIUM', route: '/surveillance' },
    { id: 'reports',        title: 'Xuất Báo Cáo',         icon: '📤', priority: 'LOW',    route: '/reports' },
  ],
  TRUONG_BP: [
    { id: 'my_team',        title: 'Tổ Của Tôi Hôm Nay',  icon: '👥', priority: 'HIGH',   route: '/team' },
    { id: 'production',     title: 'Tiến Độ Sản Xuất',     icon: '⚙️', priority: 'HIGH',   route: '/production' },
    { id: 'attendance',     title: 'Điểm Danh Tổ',         icon: '✅', priority: 'HIGH',   route: '/attendance' },
    { id: 'inventory',      title: 'NVL Tổ Nhận/Trả',     icon: '⚖️', priority: 'HIGH',   route: '/inventory/team' },
    { id: 'quality',        title: 'Kiểm Tra Chất Lượng',  icon: '🔬', priority: 'MEDIUM', route: '/quality' },
    { id: 'orders',         title: 'Đơn Hàng Đang Làm',   icon: '📋', priority: 'MEDIUM', route: '/orders/active' },
  ],
  KINH_DOANH: [
    { id: 'my_orders',      title: 'Đơn Của Tôi',          icon: '📋', priority: 'HIGH',   route: '/orders/mine' },
    { id: 'customers',      title: 'Khách Hàng',            icon: '👤', priority: 'HIGH',   route: '/customers' },
    { id: 'new_order',      title: 'Tạo Đơn Mới',          icon: '➕', priority: 'HIGH',   route: '/orders/new' },
    { id: 'warranty',       title: 'Tra Bảo Hành',         icon: '🛡️', priority: 'MEDIUM', route: '/warranty/lookup' },
    { id: 'payment',        title: 'Thanh Toán / Cọc',     icon: '💳', priority: 'MEDIUM', route: '/payment' },
    { id: 'shipping',       title: 'Theo Dõi Giao Hàng',   icon: '🚚', priority: 'MEDIUM', route: '/shipping' },
  ],
  SAN_XUAT: [
    { id: 'my_orders',      title: 'Đơn Của Tôi Hôm Nay', icon: '📋', priority: 'HIGH',   route: '/orders/mine' },
    { id: 'material',       title: 'Nhận / Trả NVL',       icon: '⚖️', priority: 'HIGH',   route: '/material/receive' },
    { id: 'production',     title: 'Cập Nhật Tiến Độ',     icon: '✅', priority: 'HIGH',   route: '/production/update' },
    { id: 'attendance',     title: 'Chấm Công',            icon: '🗓️', priority: 'MEDIUM', route: '/attendance/checkin' },
    { id: 'quality',        title: 'Báo Lỗi / KCS',        icon: '🔬', priority: 'MEDIUM', route: '/quality/report' },
  ],
  VAN_PHONG: [
    { id: 'tasks',          title: 'Công Việc Hôm Nay',    icon: '📝', priority: 'HIGH',   route: '/tasks' },
    { id: 'attendance',     title: 'Chấm Công',            icon: '🗓️', priority: 'HIGH',   route: '/attendance/checkin' },
    { id: 'customers',      title: 'Thông Tin Khách',      icon: '👤', priority: 'MEDIUM', route: '/customers' },
    { id: 'orders',         title: 'Tra Cứu Đơn Hàng',    icon: '🔍', priority: 'MEDIUM', route: '/orders/lookup' },
  ],
};

// ── HELPER FUNCTIONS ──────────────────────────────────────────────────────
export function getRoleGroup(chucVu: string): RoleGroup {
  return ROLE_TO_GROUP[chucVu] ?? 'VAN_PHONG';
}

export function getPermissions(chucVu: string): Permission[] {
  const group = getRoleGroup(chucVu);
  return GROUP_PERMISSIONS[group];
}

export function hasPermission(chucVu: string, permission: Permission): boolean {
  return getPermissions(chucVu).includes(permission);
}

export function getDailyTasks(chucVu: string) {
  const group = getRoleGroup(chucVu);
  return DAILY_TASKS[group];
}

export function buildUserProfile(employee: {
  employeeCode: string;
  fullName:     string;
  chucVu:       string;
  khoi:         string;
  phongBan:     string;
  boPhan:       string;
  productionGroup: string | null;
}) {
  const group       = getRoleGroup(employee.chucVu);
  const permissions = GROUP_PERMISSIONS[group];
  const tasks       = DAILY_TASKS[group];
  return {
    ...employee,
    group,
    permissions,
    tasks,
    dashboardLevel:
      group === 'GIAM_DOC'    ? 'FULL'     :
      group === 'QUAN_LY'     ? 'DEPT'     :
      group === 'TRUONG_BP'   ? 'DEPT'     :
      group === 'KINH_DOANH'  ? 'PERSONAL' :
      group === 'SAN_XUAT'    ? 'PERSONAL' : 'PERSONAL',
  };
}

export default {
  PERMISSIONS, GROUP_PERMISSIONS, DAILY_TASKS, ROLE_TO_GROUP,
  getRoleGroup, getPermissions, hasPermission, getDailyTasks, buildUserProfile,
};
