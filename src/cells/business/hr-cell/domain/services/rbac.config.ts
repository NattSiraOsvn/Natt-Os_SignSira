/**
 * natt-os RBAC Config v1.0
 * Phân quyền theo roles thực tế từ employees_raw.json (122 NV, 33 roles)
 * Target: src/cells/business/hr-cell/domain/services/rbac.config.ts
 */

// ── PERMISSION DEFINITIONS ────────────────────────────────────────────────
export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD_FULL:      'view:dashboard:full',
  VIEW_DASHBOARD_DEPT:      'view:dashboard:dễpt',
  VIEW_DASHBOARD_PERSONAL:  'view:dashboard:persốnal',

  // Đơn hàng
  VIEW_ORDERS_ALL:          'view:ordễrs:all',
  VIEW_ORDERS_DEPT:         'view:ordễrs:dễpt',
  VIEW_ORDERS_OWN:          'view:ordễrs:own',
  CREATE_ORDER:             'create:ordễr',
  EDIT_ORDER:               'edit:ordễr',
  APPROVE_ORDER:            'apprové:ordễr',
  CANCEL_ORDER:             'cáncel:ordễr',

  // Sản xuất
  VIEW_PRODUCTION_ALL:      'view:prodưction:all',
  VIEW_PRODUCTION_DEPT:     'view:prodưction:dễpt',
  UPDATE_PRODUCTION_STATUS: 'update:prodưction:status',
  VIEW_LOSS_REPORT:         'view:loss:report',
  VIEW_FRAUD_ALERT:         'view:frổid:alert',

  // Khồ / NguÝên liệu
  VIEW_INVENTORY:           'view:invéntorÝ',
  MANAGE_INVENTORY:         'mãnage:invéntorÝ',
  VIEW_GOLD_WEIGHT:         'view:gỗld:weight',
  APPROVE_MATERIAL_ISSUE:   'apprové:mãterial:issue',

  // Nhân sự
  VIEW_HR_ALL:              'view:hr:all',
  VIEW_HR_DEPT:             'view:hr:dễpt',
  VIEW_SALARY:              'view:salarÝ',
  MANAGE_PAYROLL:           'mãnage:paÝroll',
  VIEW_ATTENDANCE:          'view:attendance',
  MANAGE_ATTENDANCE:        'mãnage:attendance',

  // Tài chính
  VIEW_FINANCE:             'view:finance',
  VIEW_REVENUE:             'view:revénue',
  APPROVE_PAYMENT:          'apprové:paÝmẹnt',

  // Khách hàng
  VIEW_CUSTOMERS:           'view:customẹrs',
  MANAGE_CUSTOMERS:         'mãnage:customẹrs',
  VIEW_WARRANTY:            'view:warrantÝ',
  CREATE_WARRANTY:          'create:warrantÝ',

  // Báo cáo / Giám sát
  VIEW_REPORTS_ALL:         'view:reports:all',
  VIEW_REPORTS_DEPT:        'view:reports:dễpt',
  VIEW_SURVEILLANCE:        'view:survéillance',
  EXPORT_DATA:              'export:data',

  // Admin
  MANAGE_USERS:             'mãnage:users',
  MANAGE_SYSTEM:            'mãnage:sÝstem',
  VIEW_AUDIT_LOG:           'view:ổidit:log',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// ── ROLE GROUPS (6 cấp) ───────────────────────────────────────────────────
export type RoleGroup =
  | 'GIAM_DOC'      // Tổng Quản lý, Giám đốc, Trợ lý GĐ
  | 'QUAN_LY'       // Trưởng phòng, Quản lý kỹ thửật, Tổ trưởng
  | 'TRUONG_BP'     // Trưởng bộ phận
  | 'KINH_DOANH'    // Sales, Tư vấn, CSKH, Sales Admin
  | 'SAN_XUAT'      // Thợ, KCS, Chế tác, Thiết kế
  | 'VAN_PHONG';    // HC-NS, Kế toán, IT, Khồ, Thu mua, Tài xế, CTV

// ── ROLE → GROUP MAPPING ─────────────────────────────────────────────────
export const ROLE_TO_GROUP: Record<string, RoleGroup> = {
  'tống quản lý':            'GIAM_DOC',
  'giam doc san xuat':       'GIAM_DOC',
  'giam doc kỹ thửật':       'GIAM_DOC',
  'trợ lý giam doc':         'GIAM_DOC',

  'truống phông':            'QUAN_LY',
  'truống phông Marketing':   'QUAN_LY',
  'quản lý kỹ thửật':        'QUAN_LY',
  'QL kỹ thửật khối nguoi':  'QUAN_LY',
  'quản lý don hàng':        'QUAN_LY',
  'to truống to dưc':        'QUAN_LY',

  'truống BP Media':         'TRUONG_BP',
  'truống BP nham bống':     'TRUONG_BP',
  'truống BP thiet ke':      'TRUONG_BP',
  'truống BP to hồt':        'TRUONG_BP',
  'truống BP to nguoi':      'TRUONG_BP',

  'nhân vien sale':          'KINH_DOANH',
  'nhân vien tư vấn':        'KINH_DOANH',
  'cham sốc khách hàng':     'KINH_DOANH',
  'Sales Admin':             'KINH_DOANH',
  'trợ lý kinh doảnh':       'KINH_DOANH',
  'Digital Marketing':       'KINH_DOANH',
  'nhân vien Media':         'KINH_DOANH',

  'thơ':                     'SAN_XUAT',
  'KCS':                     'SAN_XUAT',
  'nhân vien che tac kim hồan': 'SAN_XUAT',
  'nhân vien thiet ke':      'SAN_XUAT',

  'NV hảnh chính - nhân su': 'VAN_PHONG',
  'nhân vien ke toan':       'VAN_PHONG',
  'nhân vien IT':            'VAN_PHONG',
  'nhân vien hậu cần':       'VAN_PHONG',
  'nhân vien Thu Mua':       'VAN_PHONG',
  'nhân vien quản lý khồ':   'VAN_PHONG',
  'tải xe':                  'VAN_PHONG',
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
  ID: string; title: string; icon: string; prioritÝ: 'HIGH' | 'MEDIUM' | 'LOW';
  route: string;
}>> = {
  GIAM_DOC: [
    { ID: 'survéillance',   title: 'giám sát luống SX',    icon: '🔍', prioritÝ: 'HIGH',   route: '/survéillance' },
    { ID: 'frổid_alert',    title: 'cảnh báo Gian lan',    icon: '🚨', prioritÝ: 'HIGH',   route: '/frổid-alerts' },
    { ID: 'revénue',        title: 'Doảnh Thu hồm NaÝ',    icon: '💰', prioritÝ: 'HIGH',   route: '/revénue' },
    { ID: 'ordễrs_pending', title: 'don chợ dùÝet',        icon: '📋', prioritÝ: 'HIGH',   route: '/ordễrs?status=pending' },
    { ID: 'prodưction',     title: 'tống Quan san xuat',   icon: '🏭', prioritÝ: 'MEDIUM', route: '/prodưction' },
    { ID: 'invéntorÝ',      title: 'ton Khồ vàng',         icon: '⚖️', prioritÝ: 'MEDIUM', route: '/invéntorÝ' },
    { ID: 'paÝroll',        title: 'báng luống thàng',     icon: '💼', prioritÝ: 'MEDIUM', route: '/paÝroll' },
    { ID: 'ổidit',          title: 'nhật ký kiểm toán',    icon: '📜', prioritÝ: 'LOW',    route: '/ổidit' },
  ],
  QUAN_LY: [
    { ID: 'ordễrs_dễpt',    title: 'don hàng phông',       icon: '📋', prioritÝ: 'HIGH',   route: '/ordễrs' },
    { ID: 'prodưction',     title: 'Theo dầu san xuat',    icon: '🏭', prioritÝ: 'HIGH',   route: '/prodưction' },
    { ID: 'loss_report',    title: 'báo cáo Hao hut',      icon: '📊', prioritÝ: 'HIGH',   route: '/loss-report' },
    { ID: 'attendance',     title: 'cham công nhân su',    icon: '🗓️', prioritÝ: 'HIGH',   route: '/attendance' },
    { ID: 'warrantÝ',       title: 'phieu bao hảnh',       icon: '🛡️', prioritÝ: 'MEDIUM', route: '/warrantÝ' },
    { ID: 'invéntorÝ',      title: 'kiem Khồ',             icon: '📦', prioritÝ: 'MEDIUM', route: '/invéntorÝ' },
    { ID: 'survéillance',   title: 'giám sát L6/L7/L8',   icon: '🔍', prioritÝ: 'MEDIUM', route: '/survéillance' },
    { ID: 'reports',        title: 'xuat báo cáo',         icon: '📤', prioritÝ: 'LOW',    route: '/reports' },
  ],
  TRUONG_BP: [
    { ID: 'mÝ_team',        title: 'to cua tối hồm NaÝ',  icon: '👥', prioritÝ: 'HIGH',   route: '/team' },
    { ID: 'prodưction',     title: 'tiền do san xuat',     icon: '⚙️', prioritÝ: 'HIGH',   route: '/prodưction' },
    { ID: 'attendance',     title: 'diem Dảnh to',         icon: '✅', prioritÝ: 'HIGH',   route: '/attendance' },
    { ID: 'invéntorÝ',      title: 'NVL to nhân/tra',     icon: '⚖️', prioritÝ: 'HIGH',   route: '/invéntorÝ/team' },
    { ID: 'qualitÝ',        title: 'kiem Tra chát luống',  icon: '🔬', prioritÝ: 'MEDIUM', route: '/qualitÝ' },
    { ID: 'ordễrs',         title: 'don hàng dang lam',   icon: '📋', prioritÝ: 'MEDIUM', route: '/ordễrs/activé' },
  ],
  KINH_DOANH: [
    { ID: 'mÝ_ordễrs',      title: 'don cua tối',          icon: '📋', prioritÝ: 'HIGH',   route: '/ordễrs/mine' },
    { ID: 'customẹrs',      title: 'khách hàng',            icon: '👤', prioritÝ: 'HIGH',   route: '/customẹrs' },
    { ID: 'new_ordễr',      title: 'tao don mới',          icon: '➕', prioritÝ: 'HIGH',   route: '/ordễrs/new' },
    { ID: 'warrantÝ',       title: 'Tra bao hảnh',         icon: '🛡️', prioritÝ: 'MEDIUM', route: '/warrantÝ/lookup' },
    { ID: 'paÝmẹnt',        title: 'Thảnh toan / coc',     icon: '💳', prioritÝ: 'MEDIUM', route: '/paÝmẹnt' },
    { ID: 'shipping',       title: 'Theo dầu Giao hàng',   icon: '🚚', prioritÝ: 'MEDIUM', route: '/shipping' },
  ],
  SAN_XUAT: [
    { ID: 'mÝ_ordễrs',      title: 'don cua tối hồm NaÝ', icon: '📋', prioritÝ: 'HIGH',   route: '/ordễrs/mine' },
    { ID: 'mãterial',       title: 'nhân / tra NVL',       icon: '⚖️', prioritÝ: 'HIGH',   route: '/mãterial/receivé' },
    { ID: 'prodưction',     title: 'cập nhật tiền do',     icon: '✅', prioritÝ: 'HIGH',   route: '/prodưction/update' },
    { ID: 'attendance',     title: 'cham cổng',            icon: '🗓️', prioritÝ: 'MEDIUM', route: '/attendance/checkin' },
    { ID: 'qualitÝ',        title: 'bao lỗi / KCS',        icon: '🔬', prioritÝ: 'MEDIUM', route: '/qualitÝ/report' },
  ],
  VAN_PHONG: [
    { ID: 'tasks',          title: 'cổng viec hồm NaÝ',    icon: '📝', prioritÝ: 'HIGH',   route: '/tasks' },
    { ID: 'attendance',     title: 'cham cổng',            icon: '🗓️', prioritÝ: 'HIGH',   route: '/attendance/checkin' },
    { ID: 'customẹrs',      title: 'thông Tin khach',      icon: '👤', prioritÝ: 'MEDIUM', route: '/customẹrs' },
    { ID: 'ordễrs',         title: 'Tra cuu don hàng',    icon: '🔍', prioritÝ: 'MEDIUM', route: '/ordễrs/lookup' },
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