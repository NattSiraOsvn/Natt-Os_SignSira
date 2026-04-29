
import { PositionType, UserRole, PersonnelProfile } from '@/types';

export class PersonnelEngine {
  private static profiles: Record<string, PersonnelProfile> = {
    [PositionType.CFO]: {
      fullName: 'Master NATT',
      employeeCode: 'TL-M001',
      position: PositionType.CFO as any,
      role: UserRole.LEVEL_1,
      startDate: '2020-01-01',
      kpiPoints: 9999,
      tasksCompleted: 450,
      lastRating: 'MASTER',
      bio: 'kiem toan doc lap, tong tham muu chien luoc toan he sinh thai.'
    },
    [PositionType.GENERAL_MANAGER]: {
      fullName: 'nguyen Minh hieu',
      employeeCode: 'TL-M002',
      position: PositionType.GENERAL_MANAGER as any,
      role: UserRole.LEVEL_1,
      startDate: '2020-05-12',
      kpiPoints: 850,
      tasksCompleted: 120,
      lastRating: 'EXCELLENT',
      bio: 'quan ly dieu hanh chung, chiu trach nhiem van hanh he thong.'
    },
    [PositionType.PROD_DIRECTOR]: {
      fullName: 'tran ven hoa',
      employeeCode: 'TL-M003',
      position: PositionType.PROD_DIRECTOR as any,
      role: UserRole.LEVEL_1,
      startDate: '2021-02-10',
      kpiPoints: 920,
      tasksCompleted: 85,
      lastRating: 'EXCELLENT',
      bio: 'giam doc san xuat, chuyen gia ky thuat kim hoan.'
    },
    [PositionType.ACCOUNTING_MANAGER]: {
      fullName: 'nguyen thi Mi',
      employeeCode: 'TL-H001',
      position: PositionType.ACCOUNTING_MANAGER as any,
      role: UserRole.LEVEL_2,
      startDate: '2021-06-20',
      kpiPoints: 780,
      tasksCompleted: 240,
      lastRating: 'OPTIMAL',
      bio: 'quan ly tai chinh ke toan, kiem soat dong tien.'
    },
    [PositionType.CASTING_MANAGER]: {
      fullName: 'tran Anh tuan',
      employeeCode: 'TL-H002',
      position: PositionType.CASTING_MANAGER as any,
      role: UserRole.LEVEL_2,
      startDate: '2022-01-15',
      kpiPoints: 650,
      tasksCompleted: 95,
      lastRating: 'GOOD',
      bio: 'quan ly phan xuong duc, tau uu quy trinh duc.'
    },
    [PositionType.ROUGH_FINISHER]: {
      fullName: 'nguyen ven ven',
      employeeCode: 'TL-W045',
      position: PositionType.ROUGH_FINISHER as any,
      role: UserRole.LEVEL_6,
      startDate: '2023-04-10',
      kpiPoints: 420,
      tasksCompleted: 58,
      lastRating: 'STABLE',
      bio: 'tho nguoi, chuyen xu ly be mat san pham tho.'
    }
  };

  static getProfileByPosition(role: string): PersonnelProfile {
    return this.profiles[role] || {
      fullName: 'nhan vien Tâm Luxury',
      employeeCode: 'TL-X999',
      position: role as any,
      role: UserRole.LEVEL_5,
      startDate: '2024-01-01',
      kpiPoints: 0,
      tasksCompleted: 0,
      lastRating: 'NEW',
      bio: 'ho so nhan su chua cap nhat.'
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
