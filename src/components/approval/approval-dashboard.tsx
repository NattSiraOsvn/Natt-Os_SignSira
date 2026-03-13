// @ts-nocheck
import React from "react";

interface ApprovalItem { id: string; title: string; status: string; requestedBy: string; timestamp: number; }
interface Props { items?: ApprovalItem[]; onApprove?: (id: string) => void; onReject?: (id: string) => void; }

const ApprovalDashboard: React.FC<Props> = ({ items = [], onApprove, onReject }) => (
  <div className="p-6 space-y-4">
    <h3 className="text-sm font-black uppercase tracking-widest text-white">Pending Approvals ({items.length})</h3>
    {items.length === 0 && <p className="text-xs text-gray-500 italic">No pending approvals</p>}
    {items.map(item => (
      <div key={item.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center">
        <div>
          <p className="text-sm font-bold text-white">{item.title}</p>
          <p className="text-xs text-gray-500 mt-1">{item.requestedBy} • {new Date(item.timestamp).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          {onReject  && <button onClick={() => onReject(item.id)}  className="px-3 py-1 border border-red-500/30 text-red-400 text-xs rounded hover:bg-red-500/10">Từ chối</button>}
          {onApprove && <button onClick={() => onApprove(item.id)} className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-500">Duyệt</button>}
        </div>
      </div>
    ))}
  </div>
);
export default ApprovalDashboard;
