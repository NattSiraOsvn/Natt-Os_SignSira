
import { PositionType, UserRole, PersonnelProfile } from '../types';

export class PersonnelEngine {
  private static profiles: Record<string, PersonnelProfile> = {
    [PositionType.CFO]: {
      fullName: 'Master NATT',
      employeeCode: 'TL-M001',
      position: PositionType.CFO,
      role: UserRole.LEVEL_1,
      startDate: '2020-01-01',
      kpiPoints: 9999,
      tasksCompleted: 450,
      lastRating: 'MASTER',
      bio: 'Kiểm toán độc lập, Tổng tham mưu chiến lược toàn hệ sinh thái.'
    },
    [PositionType.GENERAL_MANAGER]: {
      fullName: 'Nguyễn Minh Hiếu',
      employeeCode: 'TL-M002',
      position: PositionType.GENERAL_MANAGER,
      role: UserRole.LEVEL_1,
      startDate: '2020-05-12',
      kpiPoints: 850,
      tasksCompleted: 120,
      lastRating: 'EXCELLENT',
      bio: 'Quản lý điều hành chung, chịu trách nhiệm vận hành hệ thống.'
    },
    [PositionType.PROD_DIRECTOR]: {
      fullName: 'Trần Văn Hòa',
      employeeCode: 'TL-M003',
      position: PositionType.PROD_DIRECTOR,
      role: UserRole.LEVEL_1,
      startDate: '2021-02-10',
      kpiPoints: 920,
      tasksCompleted: 85,
      lastRating: 'EXCELLENT',
      bio: 'Giám đốc sản xuất, chuyên gia kỹ thuật kim hoàn.'
    },
    [PositionType.ACCOUNTING_MANAGER]: {
      fullName: 'Nguyễn Thị Mi',
      employeeCode: 'TL-H001',
      position: PositionType.ACCOUNTING_MANAGER,
      role: UserRole.LEVEL_2,
      startDate: '2021-06-20',
      kpiPoints: 780,
      tasksCompleted: 240,
      lastRating: 'OPTIMAL',
      bio: 'Quản lý tài chính kế toán, kiểm soát dòng tiền.'
    },
    [PositionType.CASTING_MANAGER]: {
      fullName: 'Trần Anh Tuấn',
      employeeCode: 'TL-H002',
      position: PositionType.CASTING_MANAGER,
      role: UserRole.LEVEL_2,
      startDate: '2022-01-15',
      kpiPoints: 650,
      tasksCompleted: 95,
      lastRating: 'GOOD',
      bio: 'Quản lý phân xưởng đúc, tối ưu quy trình đúc.'
    },
    [PositionType.ROUGH_FINISHER]: {
      fullName: 'Nguyễn Văn Vẹn',
      employeeCode: 'TL-W045',
      position: PositionType.ROUGH_FINISHER,
      role: UserRole.LEVEL_6,
      startDate: '2023-04-10',
      kpiPoints: 420,
      tasksCompleted: 58,
      lastRating: 'STABLE',
      bio: 'Thợ nguội, chuyên xử lý bề mặt sản phẩm thô.'
    }
  };

  static getProfileByPosition(role: string): PersonnelProfile {
    return this.profiles[role] || {
      fullName: 'Nhân viên Tâm Luxury',
      employeeCode: 'TL-X999',
      position: role as string,
      role: UserRole.LEVEL_5,
      startDate: '2024-01-01',
      kpiPoints: 0,
      tasksCompleted: 0,
      lastRating: 'NEW',
      bio: 'Hồ sơ nhân sự chưa cập nhật.'
    };
  }

  static trackKPI(role: string, actionType: string): number {
    const profile = this.profiles[role];
    if (!profile) return 0;
    
    let points = 5; 
    if (actionType === 'SIGN') points = 50;
    if (actionType === 'APPROVE') points = 20;
    if (actionType === 'PRODUCTION_STEP') points = 15;

    profile.kpiPoints += points;
    profile.tasksCompleted += 1;
    return points;
  }
}
