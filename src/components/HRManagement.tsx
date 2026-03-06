
import React, { useState, useMemo, useEffect } from 'react';
import { 
  UserRole, UserPosition, DetailedPersonnel, BusinessMetrics, PositionType 
} from '../types';
import { HREngine } from '../services/hrEngine';
import { ExportEngine } from '@/services/export-service';
import AIAvatar from './AIAvatar';
import { PersonaID } from '../types';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer 
} from 'recharts';

interface HRManagementProps {
  currentRole: UserRole;
  currentPosition: UserPosition;
  logAction: (action: string, details: string, undoData?: any) => void;
  metrics: BusinessMetrics;
}

const HRManagement: React.FC<HRManagementProps> = ({ currentRole, currentPosition, logAction }) => {
  const [activeTab, setActiveTab] = useState<'employee-list' | 'reports'>('employee-list');
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    // Chờ layout hoàn tất để tránh width/height -1
    const timer = setTimeout(() => setIsMounted(true), 250);
    return () => clearTimeout(timer);
  }, []);

  const [employees] = useState<DetailedPersonnel[]>([
    {
      id: 'TLXR047',
      employeeCode: 'TLXR047',
      fullName: 'VỔ QUỐC HUY',
      status: 'ACTIVE',
      approvalStatus: 'OFFICIAL',
      division: 'Khối Kinh Doanh',
      department: 'KINH_DOANH',
      position: { id: 'TL-CONS-047', role: PositionType.CONSULTANT, scope: ['GENERAL'] },
      role: UserRole.LEVEL_5,
      workPlace: 'Trụ sở chính',
      dob: '1996-05-25',
      gender: 'Nam',
      nationality: 'Việt Nam',
      ethnic: 'Kinh',
      idCard: '079096036503',
      dependentCount: 0,
      dependents: 0,
      email: 'huy.voquoc@lxrtam.net',
      phone: '0896943004',
      originAddress: 'Bình Thạnh, TP.HCM',
      permanentAddress: '21/C1 Lê Trực, P.07, Q.Bình Thạnh, TP.HCM',
      temporaryAddress: '21/C1 Lê Trực, P.07, Q.Bình Thạnh, TP.HCM',
      contactAddress: '21/C1 Lê Trực, P.07, Q.Bình Thạnh, TP.HCM',
      baseSalary: 15000000,
      actualWorkDays: 26,
      insuranceSalary: 5000000,
      salaryFactor: 1.0,
      allowanceLunch: 1150000,
      allowancePosition: 0,
      contractNo: 'HDLD-2024-001',
      contractDate: '2024-01-02',
      contractType: 'Không xác định thời hạn',
      insuranceCode: 'BHXH-0012345',
      bankAccountNo: '1234567890',
      bankName: 'Vietcombank',
      familyMembers: [],
      auditTrail: [],
      startDate: '2024-01-02',
      kpiPoints: 85,
      tasksCompleted: 42,
      lastRating: 'GOOD',
      bio: 'Chuyên viên tư vấn trang sức cao cấp.'
    }
  ]);

  const deptData = [
    { name: 'Kinh Doanh', value: 45, color: '#F59E0B' },
    { name: 'Sản Xuất', value: 85, color: '#EF4444' },
    { name: 'Vận Hành', value: 35, color: '#3B82F6' },
    { name: 'Media', value: 20, color: '#8B5CF6' }
  ];

  return (
    <div className="h-full flex flex-col p-8 md:p-12 overflow-hidden gap-10 animate-in fade-in duration-700 bg-[#020202]">
      <header className="flex justify-between items-end border-b border-white/5 pb-10 shrink-0">
        <div>
           <div className="flex items-center gap-4 mb-3">
              <span className="text-4xl">👥</span>
              <h2 className="ai-headline text-5xl italic uppercase tracking-tighter">Human Identity Node</h2>
           </div>
           <p className="ai-sub-headline text-cyan-300/40 ml-1 italic font-black uppercase tracking-[0.3em]">Quản trị Nhân sự & Ma trận Quyền hạn</p>
        </div>
        
        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10 shrink-0">
           {[{ id: 'employee-list', label: 'Danh Sách Identity' }, { id: 'reports', label: 'Báo Cáo Nhân Sự' }].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === tab.id ? 'bg-amber-500 text-black shadow-lg' : 'text-gray-500'}`}
             >
               {tab.label}
             </button>
           ))}
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col">
         {activeTab === 'employee-list' ? (
            <div className="flex-1 overflow-auto no-scrollbar bg-black/40 border border-white/10 rounded-[2rem] shadow-2xl">
               <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="sticky top-0 z-30 bg-[#0a0a0a] border-b border-white/10">
                    <tr className="text-gray-500 font-black uppercase tracking-widest">
                       <th className="p-6">Mã NV</th>
                       <th className="p-6">Họ Tên</th>
                       <th className="p-6">Vị Trí</th>
                       <th className="p-6">Tình Trạng</th>
                       <th className="p-6 text-right">Tác vụ</th>
                    </tr>
                  </thead>
                  <tbody className="text-white">
                    {employees.map(emp => (
                       <tr key={emp.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="p-6 font-mono text-amber-500">{emp.employeeCode}</td>
                          <td className="p-6 font-bold uppercase">{emp.fullName}</td>
                          <td className="p-6 italic text-gray-400">{emp.position.role}</td>
                          <td className="p-6"><span className="px-3 py-1 bg-green-500/20 text-green-500 border border-green-500/30 rounded-full text-[8px] font-black">{emp.status}</span></td>
                          <td className="p-6 text-right"><button className="px-4 py-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-[9px] font-black">HỒ SƠ</button></td>
                       </tr>
                    ))}
                  </tbody>
               </table>
            </div>
         ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
               <div className="ai-panel p-8 bg-black/40 border-white/10 flex flex-col min-h-[450px]">
                  <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">Cơ cấu nhân sự theo khối</h3>
                  <div className="flex-1 w-full min-h-[300px]">
                  {isMounted && (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={deptData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                              {deptData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                  )}
                  </div>
               </div>
            </div>
         )}
      </main>

      <div className="mt-8 p-8 glass rounded-[3rem] border border-blue-500/20 bg-blue-500/5 flex items-center gap-8 shrink-0">
         <AIAvatar personaId={PersonaID.KRIS} size="sm" />
         <p className="text-sm text-gray-400 italic font-light leading-relaxed">
            "Hệ thống định danh Identity Node đang được đồng bộ hóa. 100% hồ sơ nhân sự đã được băm Hash và niêm phong."
         </p>
      </div>
    </div>
  );
};

export default HRManagement;
