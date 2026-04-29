/**
 * natt-os RBAC Config v1.0
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
  'tong quan ly':            'GIAM_DOC',
  'giam doc san xuat':       'GIAM_DOC',
  'giam doc ky thuat':       'GIAM_DOC',
  'tro ly giam doc':         'GIAM_DOC',

  'truong phong':            'QUAN_LY',
  'truong phong Marketing':   'QUAN_LY',
  'quan ly ky thuat':        'QUAN_LY',
  'QL ky thuat khau nguoi':  'QUAN_LY',
  'quan ly don hang':        'QUAN_LY',
  'to truong to duc':        'QUAN_LY',

  'truong BP Media':         'TRUONG_BP',
  'truong BP nham bong':     'TRUONG_BP',
  'truong BP thiet ke':      'TRUONG_BP',
  'truong BP to hot':        'TRUONG_BP',
  'truong BP to nguoi':      'TRUONG_BP',

  'nhan vien sale':          'KINH_DOANH',
  'nhan vien tu van':        'KINH_DOANH',
  'cham soc khach hang':     'KINH_DOANH',
  'Sales Admin':             'KINH_DOANH',
  'tro ly kinh doanh':       'KINH_DOANH',
  'Digital Marketing':       'KINH_DOANH',
  'nhan vien Media':         'KINH_DOANH',

  'tho':                     'SAN_XUAT',
  'KCS':                     'SAN_XUAT',
  'nhan vien che tac kim hoan': 'SAN_XUAT',
  'nhan vien thiet ke':      'SAN_XUAT',

  'NV hanh chinh - nhan su': 'VAN_PHONG',
  'nhan vien ke toan':       'VAN_PHONG',
  'nhan vien IT':            'VAN_PHONG',
  'nhan vien hau can':       'VAN_PHONG',
  'nhan vien Thu Mua':       'VAN_PHONG',
  'nhan vien quan ly kho':   'VAN_PHONG',
  'tai xe':                  'VAN_PHONG',
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
    { id: 'surveillance',   title: 'giam sat luong SX',    icon: '🔍', priority: 'HIGH',   route: '/surveillance' },
    { id: 'fraud_alert',    title: 'canh bao Gian lan',    icon: '🚨', priority: 'HIGH',   route: '/fraud-alerts' },
    { id: 'revenue',        title: 'Doanh Thu hom Nay',    icon: '💰', priority: 'HIGH',   route: '/revenue' },
    { id: 'orders_pending', title: 'don cho duyet',        icon: '📋', priority: 'HIGH',   route: '/orders?status=pending' },
    { id: 'production',     title: 'tong Quan san xuat',   icon: '🏭', priority: 'MEDIUM', route: '/production' },
    { id: 'inventory',      title: 'ton Kho vang',         icon: '⚖️', priority: 'MEDIUM', route: '/inventory' },
    { id: 'payroll',        title: 'bang luong thang',     icon: '💼', priority: 'MEDIUM', route: '/payroll' },
    { id: 'audit',          title: 'nhat ky kiem toan',    icon: '📜', priority: 'LOW',    route: '/audit' },
  ],
  QUAN_LY: [
    { id: 'orders_dept',    title: 'don hang phong',       icon: '📋', priority: 'HIGH',   route: '/orders' },
    { id: 'production',     title: 'Theo dau san xuat',    icon: '🏭', priority: 'HIGH',   route: '/production' },
    { id: 'loss_report',    title: 'bao cao Hao hut',      icon: '📊', priority: 'HIGH',   route: '/loss-report' },
    { id: 'attendance',     title: 'cham cong nhan su',    icon: '🗓️', priority: 'HIGH',   route: '/attendance' },
    { id: 'warranty',       title: 'phieu bao hanh',       icon: '🛡️', priority: 'MEDIUM', route: '/warranty' },
    { id: 'inventory',      title: 'kiem Kho',             icon: '📦', priority: 'MEDIUM', route: '/inventory' },
    { id: 'surveillance',   title: 'giam sat L6/L7/L8',   icon: '🔍', priority: 'MEDIUM', route: '/surveillance' },
    { id: 'reports',        title: 'xuat bao cao',         icon: '📤', priority: 'LOW',    route: '/reports' },
  ],
  TRUONG_BP: [
    { id: 'my_team',        title: 'to cua tau hom Nay',  icon: '👥', priority: 'HIGH',   route: '/team' },
    { id: 'production',     title: 'tien do san xuat',     icon: '⚙️', priority: 'HIGH',   route: '/production' },
    { id: 'attendance',     title: 'diem Danh to',         icon: '✅', priority: 'HIGH',   route: '/attendance' },
    { id: 'inventory',      title: 'NVL to nhan/tra',     icon: '⚖️', priority: 'HIGH',   route: '/inventory/team' },
    { id: 'quality',        title: 'kiem Tra chat luong',  icon: '🔬', priority: 'MEDIUM', route: '/quality' },
    { id: 'orders',         title: 'don hang dang lam',   icon: '📋', priority: 'MEDIUM', route: '/orders/active' },
  ],
  KINH_DOANH: [
    { id: 'my_orders',      title: 'don cua tau',          icon: '📋', priority: 'HIGH',   route: '/orders/mine' },
    { id: 'customers',      title: 'khach hang',            icon: '👤', priority: 'HIGH',   route: '/customers' },
    { id: 'new_order',      title: 'tao don moi',          icon: '➕', priority: 'HIGH',   route: '/orders/new' },
    { id: 'warranty',       title: 'Tra bao hanh',         icon: '🛡️', priority: 'MEDIUM', route: '/warranty/lookup' },
    { id: 'payment',        title: 'Thanh toan / coc',     icon: '💳', priority: 'MEDIUM', route: '/payment' },
    { id: 'shipping',       title: 'Theo dau Giao hang',   icon: '🚚', priority: 'MEDIUM', route: '/shipping' },
  ],
  SAN_XUAT: [
    { id: 'my_orders',      title: 'don cua tau hom Nay', icon: '📋', priority: 'HIGH',   route: '/orders/mine' },
    { id: 'material',       title: 'nhan / tra NVL',       icon: '⚖️', priority: 'HIGH',   route: '/material/receive' },
    { id: 'production',     title: 'cap nhat tien do',     icon: '✅', priority: 'HIGH',   route: '/production/update' },
    { id: 'attendance',     title: 'cham cong',            icon: '🗓️', priority: 'MEDIUM', route: '/attendance/checkin' },
    { id: 'quality',        title: 'bao lau / KCS',        icon: '🔬', priority: 'MEDIUM', route: '/quality/report' },
  ],
  VAN_PHONG: [
    { id: 'tasks',          title: 'cong viec hom Nay',    icon: '📝', priority: 'HIGH',   route: '/tasks' },
    { id: 'attendance',     title: 'cham cong',            icon: '🗓️', priority: 'HIGH',   route: '/attendance/checkin' },
    { id: 'customers',      title: 'thong Tin khach',      icon: '👤', priority: 'MEDIUM', route: '/customers' },
    { id: 'orders',         title: 'Tra cuu don hang',    icon: '🔍', priority: 'MEDIUM', route: '/orders/lookup' },
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
