
import React, { useState } from 'react';

const EnterpriseArchitecture: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'flow' | 'tech' | 'factory'>('flow');

  const modules = [
    { id: 'DESIGN', title: 'Thiết kế 3D', icon: '💻', desc: 'Zbrush / Matrix Gold' },
    { id: 'CAST', title: 'Phôi đúc', icon: '🔥', desc: 'Đúc áp lực cao' },
    { id: 'TECH', title: 'Kỹ thuật nguội', icon: '⚒️', desc: 'Ráp / NB / Chỉnh ni' },
    { id: 'GEMS', title: 'Hột / Đá chủ', icon: '💎', desc: 'Đính đá / Kiểm định' },
    { id: 'FINISH', title: 'Xi / Hoàn thiện', icon: '✨', desc: 'Bạch kim / Vàng 18K' }
  ];

  return (
    <div className="p-8 max-w-[1600px] mx-auto h-full overflow-y-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-5xl font-serif gold-gradient mb-2 tracking-tighter italic">natt-os: Factory Architecture</h2>
          <p className="text-gray-400 font-light text-lg">Hệ sinh thái Quản trị Sản xuất & Thu hồi Định mức Kim hoàn.</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          {['flow', 'tech', 'factory'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as string)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                activeTab === tab ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-gray-500 hover:text-white'
              }`}
            >
              {tab === 'flow' ? 'Luồng Dữ liệu' : tab === 'tech' ? 'Technical' : 'Xưởng Sản Xuất'}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'flow' && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3 space-y-8">
            <div className="glass p-10 rounded-[3rem] border border-white/5 bg-gradient-to-br from-amber-500/5 to-transparent relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 bg-amber-500/10 text-amber-500 text-[10px] font-black border-l border-b border-white/5">OMEGA CORE V5.0</div>
              <h3 className="text-2xl font-bold mb-10 flex items-center">
                <span className="mr-3">🧬</span> Pipeline Sản xuất & Thu hồi (Closed-Loop)
              </h3>
              <div className="flex justify-between items-start min-w-[800px] pb-10 relative">
                  {modules.map((m, i) => (
                    <div key={m.id} className="flex flex-col items-center group relative z-10">
                      <div className="w-16 h-16 rounded-3xl glass border border-amber-500/20 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 group-hover:border-amber-500 transition-all duration-500">
                        {m.icon}
                      </div>
                      <p className="font-bold text-white text-[10px] uppercase tracking-widest text-center">{m.title}</p>
                      <p className="text-[10px] text-gray-500 text-center mt-2 w-24 leading-tight font-light">{m.desc}</p>
                      {i < modules.length - 1 && (
                        <div className="absolute top-8 left-16 w-32 h-0.5 bg-gradient-to-r from-amber-500/30 via-amber-500/10 to-transparent"></div>
                      )}
                    </div>
                  ))}
                  {/* Gold Dust Recovery Path */}
                  <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-3/4 h-12 border-b-2 border-dashed border-amber-500/20 rounded-full flex items-center justify-center">
                    <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest bg-black px-4">🔄 Thu hồi bụi vàng & Phân kim</span>
                  </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass p-8 rounded-[2.5rem] border border-blue-500/20">
                <h4 className="font-bold text-blue-400 mb-6 flex items-center text-xs uppercase tracking-widest">
                  <span className="mr-2">⚖️</span> Logic Kiểm soát Định mức
                </h4>
                <div className="space-y-4 text-[11px] text-gray-400">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all">
                    <p className="text-white font-bold mb-1 underline">Hao hụt sản xuất:</p>
                    <p>Tự động tính toán hao hụt qua từng khâu: Nguội (3-5%), Xi (1-2%). Cảnh báo nếu vượt ngưỡng BOM đề ra.</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all">
                    <p className="text-white font-bold mb-1 underline">Kho Bán Dạng Dở (BTP):</p>
                    <p>Dữ liệu được isolate giữa các nhóm thợ. Quản lý chính xác số lượng AU25 đang nằm tại bàn thợ nào.</p>
                  </div>
                </div>
              </div>
              <div className="glass p-8 rounded-[2.5rem] border border-amber-500/20">
                <h4 className="font-bold text-amber-500 mb-6 flex items-center text-xs uppercase tracking-widest">
                  <span className="mr-2">💰</span> Quy trình Cấn trừ Hoa hồng
                </h4>
                <div className="space-y-4 text-[11px] text-gray-400">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all">
                    <p className="text-white font-bold mb-1 underline">Case B - Thu đổi lỗ:</p>
                    <p>Tự động bảo vệ quyền lợi Seller khi khách thu đổi có lỗ (Tỉ lệ thu âm). Ghi nhận Full Hoa hồng gốc.</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all">
                    <p className="text-white font-bold mb-1 underline">Báo cáo BCHH:</p>
                    <p>Đối soát tự động với BCDT kế toán. Tự động gắn tag "Hợp lệ" hoặc "Check Mã Seller".</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-[3rem] border border-white/10 bg-black/40 h-fit">
            <h4 className="text-lg font-bold mb-8 flex items-center text-amber-500 italic">
              <span className="mr-2">📈</span> Real-time Efficiency
            </h4>
            <div className="space-y-6">
              <div className="p-5 bg-white/5 rounded-2xl border-l-4 border-amber-500">
                <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">BOM Precision</p>
                <p className="text-sm text-white mt-1 font-mono">99.9% Accuracy</p>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border-l-4 border-blue-500">
                <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Worker KPI</p>
                <p className="text-sm text-white mt-1 font-mono">Salary * (Perf / 100)</p>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border-l-4 border-green-500">
                <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Isolation Level</p>
                <p className="text-sm text-white mt-1 font-mono">Blockchain Sharding V5</p>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border-l-4 border-pink-500">
                <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Brand Lab Sync</p>
                <p className="text-sm text-white mt-1 font-mono">I LIKE IT Optimized</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'factory' && (
        <div className="glass p-12 rounded-[4rem] border border-white/5 animate-in slide-in-from-bottom-10 duration-700">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h3 className="text-3xl font-bold mb-2">Trung tâm Chỉ huy Xưởng</h3>
              <p className="text-gray-500">Giám sát luồng nguyên liệu và tiến độ thợ trực tuyến.</p>
            </div>
            <div className="flex gap-4">
              <span className="bg-green-500/20 text-green-400 px-4 py-1.5 rounded-full text-[10px] font-black border border-green-500/30">MISA_SYNC_ON</span>
              <span className="bg-amber-500/20 text-amber-400 px-4 py-1.5 rounded-full text-[10px] font-black border border-amber-500/30">KIOTVIET_LEGACY_BRIDGE</span>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="p-8 glass rounded-[3rem] border border-white/5">
              <h4 className="text-white font-black text-[10px] uppercase tracking-[0.2em] mb-6">Kho Phôi Đúc (Dạng dở)</h4>
              <div className="space-y-4">
                <div className="flex justify-between text-xs text-gray-400"><span>AU2504:</span> <span className="text-amber-500 font-mono">12.5 chỉ</span></div>
                <div className="flex justify-between text-xs text-gray-400"><span>PK2505:</span> <span className="text-amber-500 font-mono">8.3 chỉ</span></div>
                <div className="w-full h-1.5 bg-white/5 rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-amber-500 w-3/4"></div>
                </div>
              </div>
            </div>
            <div className="p-8 glass rounded-[3rem] border border-white/5">
              <h4 className="text-white font-black text-[10px] uppercase tracking-[0.2em] mb-6">Trạng thái Nguội / Hột</h4>
              <div className="space-y-4">
                <div className="flex justify-between text-xs text-gray-400"><span>Bùi Cao Sơn:</span> <span className="text-green-500">Đang ráp</span></div>
                <div className="flex justify-between text-xs text-gray-400"><span>Trần Hoài Phúc:</span> <span className="text-blue-400">Móc máy</span></div>
                <div className="flex justify-between text-xs text-gray-400"><span>Nguyễn Văn Vẹn:</span> <span className="text-gray-500 italic">Chờ phôi</span></div>
              </div>
            </div>
            <div className="p-8 glass rounded-[3rem] border border-white/5">
              <h4 className="text-white font-black text-[10px] uppercase tracking-[0.2em] mb-6">Thu hồi Vàng bụi</h4>
              <div className="space-y-4 text-center">
                <p className="text-4xl font-serif gold-gradient">3,796 <span className="text-xs text-gray-500">chỉ</span></p>
                <p className="text-[10px] text-gray-500 uppercase mt-2">Đã phân kim trong tháng</p>
                <button className="mt-4 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[9px] font-black hover:bg-white/10 transition-all">CHI TIẾT PHÂN KIM</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterpriseArchitecture;
