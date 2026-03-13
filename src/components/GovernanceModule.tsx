// @ts-nocheck

import React, { useState } from 'react';
import { UserRole, GovernanceRecord, AuditTrailEntry } from '../types';

interface GovernanceModuleProps {
  currentRole: UserRole;
  logAction: (action: string, details: string) => void;
}

const GovernanceModule: React.FC<GovernanceModuleProps> = ({ currentRole, logAction }) => {
  const [records, setRecords] = useState<GovernanceRecord[]>([
    {
      id: 'REC-001',
      timestamp: Date.now(),
      type: 'NHẬP KHO NGUYÊN LIỆU',
      status: 'BẢN NHÁP',
      data: { amount: 150000000, vendor: 'Gia Công A', note: 'Lô vàng 18K' },
      operatorId: 'NATT_01',
      auditTrail: []
    }
  ]);

  const isMaster = currentRole === UserRole.MASTER;

  const handleAction = (id: string, newStatus: GovernanceRecord['status'], note: string = '') => {
    setRecords(prev => prev.map(r => {
      if (r.id === id) {
        const audit: AuditTrailEntry[] = [...r.auditTrail, { 
          id: Math.random().toString(36).substring(7),
          userId: `AUTH_${currentRole}`,
          role: currentRole, 
          action: newStatus, 
          timestamp: Date.now(), 
          note, 
          hash: 'sha256:immutable' 
        }];
        return { ...r, status: newStatus, auditTrail: audit };
      }
      return r;
    }));
    logAction(`GOVERNANCE_${newStatus}`, `Bản ghi ${id} được cập nhật bởi ${currentRole}`);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* 1. ACTION PANEL (Theo vai trò) */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Action Panel - {currentRole}</h3>
        
        {currentRole === UserRole.LEVEL_5 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <label className="block text-xs font-bold text-gray-700">Loại nghiệp vụ</label>
               <select className="w-full bg-gray-50 border border-gray-200 rounded p-3 text-sm focus:ring-1 focus:ring-blue-900 outline-none">
                  <option>NHẬP KHO NGUYÊN LIỆU</option>
                  <option>XUẤT KHO SẢN XUẤT</option>
                  <option>THU CHI NỘI BỘ</option>
               </select>
            </div>
            <div className="space-y-4">
               <label className="block text-xs font-bold text-gray-700">Số tiền (Giao dịch)</label>
               <input type="number" placeholder="0 VND" className="w-full bg-gray-50 border border-gray-200 rounded p-3 text-sm focus:ring-1 focus:ring-blue-900 outline-none" />
            </div>
            <button className="md:col-span-2 py-3 bg-blue-900 text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-blue-950 transition-colors">
              Khởi tạo chứng từ số
            </button>
          </div>
        )}

        {currentRole === UserRole.LEVEL_2 && (
          <div className="flex items-center justify-between">
             <div className="flex gap-4">
                <div className="px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                   <p className="text-[10px] text-yellow-700 font-black uppercase">Chờ duyệt</p>
                   <p className="text-xl font-bold text-yellow-900">08</p>
                </div>
                <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                   <p className="text-[10px] text-red-700 font-black uppercase">Rủi ro mở</p>
                   <p className="text-xl font-bold text-red-900">02</p>
                </div>
             </div>
             <p className="text-xs text-gray-500 italic">Vui lòng chọn bản ghi bên dưới để so sánh & đối soát.</p>
          </div>
        )}

        {currentRole === UserRole.LEVEL_1 && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="space-y-1">
                <h4 className="font-bold text-lg text-blue-900">Xác nhận ký số & Khóa sổ</h4>
                <p className="text-xs text-gray-500">Phát hành hóa đơn điện tử Tâm Luxury định kỳ.</p>
             </div>
             <button className="w-full md:w-auto px-10 py-4 bg-red-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex items-center gap-3">
               <span>🔐</span> KÝ SỐ TOKEN SAFECA
             </button>
          </div>
        )}
      </section>

      {/* 2. CONTENT - THE TABLE / LEDGER */}
      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
           <h3 className="font-bold text-sm tracking-tight">NHẬT KÝ QUẢN TRỊ (AUDIT LOG)</h3>
           {isMaster && <button onClick={() => window.print()} className="text-[10px] font-black text-blue-900 uppercase underline">Xuất báo cáo PDF</button>}
        </div>
        
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50/30">
                <th className="p-5">ID / Thời gian</th>
                <th className="p-5">Loại nghiệp vụ</th>
                <th className="p-5">Giá trị</th>
                <th className="p-5">Trạng thái</th>
                <th className="p-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                  <td className="p-5">
                    <p className="text-xs font-bold text-gray-900">{r.id}</p>
                    <p className="text-[9px] text-gray-400 font-mono">{new Date(r.timestamp).toLocaleString()}</p>
                  </td>
                  <td className="p-5">
                    <p className="text-xs font-bold text-blue-900">{r.type}</p>
                    <p className="text-[9px] text-gray-400 italic">Bởi: {r.operatorId}</p>
                  </td>
                  <td className="p-5 font-mono text-sm text-gray-900">
                    {r.data.amount.toLocaleString()} đ
                  </td>
                  <td className="p-5">
                    {/* Fix: Strictly use normalized status strings from types.ts to avoid unintentional type narrowing errors */}
                    <span className={`px-2 py-1 rounded text-[8px] font-black uppercase border ${
                      r.status === 'BẢN NHÁP' ? 'bg-gray-50 border-gray-200 text-gray-500' :
                      r.status === 'ĐÃ DUYỆT' ? 'bg-blue-50 border-blue-200 text-blue-900' :
                      r.status === 'BỊ TỪ CHỐI' ? 'bg-red-50 border-red-200 text-red-600' :
                      'bg-green-50 border-green-200 text-green-700'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    {currentRole === UserRole.LEVEL_2 && r.status === 'BẢN NHÁP' && (
                      <div className="flex justify-end gap-2">
                         <button onClick={() => handleAction(r.id, 'BỊ TỪ CHỐI')} className="px-3 py-1.5 border border-red-200 text-red-600 text-[10px] font-black uppercase rounded hover:bg-red-50">TỪ CHỐI</button>
                         <button onClick={() => handleAction(r.id, 'ĐÃ DUYỆT')} className="px-3 py-1.5 bg-blue-900 text-white text-[10px] font-black uppercase rounded hover:bg-blue-950">Duyệt</button>
                      </div>
                    )}
                    {/* Fix: Normalized comparison for LEVEL_1 signature flow */}
                    {currentRole === UserRole.LEVEL_1 && r.status === 'ĐÃ DUYỆT' && (
                      <button onClick={() => handleAction(r.id, 'ĐÃ KÝ SỐ')} className="px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase rounded shadow-md">Ký số</button>
                    )}
                    {/* Fix: Normalized comparison for historical record view */}
                    {(r.status === 'ĐÃ KÝ SỐ' || r.status === 'BỊ TỪ CHỐI') && isMaster && (
                       <button className="text-gray-400 hover:text-gray-900 p-2">📄</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. LOGIC WARNING PANEL */}
      <section className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-200/20 blur-3xl rounded-full"></div>
         <h4 className="text-[10px] font-black text-yellow-800 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="text-lg">⚠️</span> Cảnh báo tuân thủ (Compliance Check)
         </h4>
         <p className="text-xs text-yellow-900 italic leading-relaxed">
            "Phát hiện chênh lệch dòng tiền: Tổng tiền hàng trên bill cao hơn giá trị chuyển khoản ngân hàng 2%. 
            Vui lòng đính kèm chứng từ giải trình trước khi chuyển sang bước **APPROVER**."
         </p>
      </section>

    </div>
  );
};

export default GovernanceModule;
