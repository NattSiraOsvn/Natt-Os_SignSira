// @ts-nocheck

import React, { useState } from 'react';
import { generateBlueprint } from '@/cells/infrastructure/ai-connector-cell/domain/services/gemini.engine';

const BlueprintWizard: React.FC = () => {
  const [desc, setDesc] = useState('');
  const [blueprint, setBlueprint] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState(0);

  const deploymentSteps = [
    "Khởi tạo lõi Shard độc lập...",
    "Thiết lập ma trận phân quyền RBAC...",
    "Kích hoạt Neural Link AI...",
    "Mã hóa dữ liệu chuẩn AES-256...",
    "Đồng bộ giao thức Blockchain...",
    "HOÀN TẤT TRIỂN KHAI HỆ THỐNG."
  ];

  const handleGenerate = async () => {
    if (!desc.trim()) return;
    setIsGenerating(true);
    try {
      const res = await generateBlueprint(desc);
      setBlueprint(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeploy = () => {
    setIsDeploying(true);
    setDeployStep(0);
    
    // Simulate deployment steps
    deploymentSteps.forEach((_, index) => {
      setTimeout(() => {
        setDeployStep(index + 1);
        if (index === deploymentSteps.length - 1) {
           setTimeout(() => {
             alert("Hệ thống đã được khởi tạo thành công trên môi trường Sandbox!");
             setIsDeploying(false);
           }, 1000);
        }
      }, (index + 1) * 1200);
    });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto no-scrollbar pb-32">
      <div className="mb-12 text-center">
        <div className="inline-block p-4 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
           <span className="text-4xl">🧬</span>
        </div>
        <h2 className="text-4xl font-serif gold-gradient mb-4 italic uppercase tracking-tighter">AI Blueprint Wizard</h2>
        <p className="text-gray-400 font-light text-sm max-w-2xl mx-auto leading-relaxed">
          "Từ ý tưởng thô đến hệ thống vận hành hoàn chỉnh. Thiên sẽ tự động thiết kế kiến trúc module, luồng dữ liệu và cơ chế bảo mật phù hợp 100% với DNA doanh nghiệp của khách hàng."
        </p>
      </div>

      {!isDeploying ? (
        <>
          <div className="glass p-10 rounded-[3rem] border border-white/10 mb-10 bg-white/[0.02] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-5 text-9xl group-hover:scale-110 transition-transform duration-1000">📝</div>
            <label className="block text-xs font-black text-amber-500 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
               <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
               Mô tả nhu cầu nghiệp vụ
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Ví dụ: Tôi cần một hệ thống quản lý chuỗi F&B với 10 chi nhánh. Yêu cầu: Kiểm soát định lượng nguyên liệu (BOM) theo thời gian thực, tích hợp máy POS, tự động đặt hàng khi kho thấp, và báo cáo lãi lỗ P&L hằng ngày cho cổ đông..."
              className="w-full bg-black/40 border border-white/10 rounded-[2rem] px-8 py-6 text-white h-48 focus:outline-none focus:border-amber-500/50 transition-all font-light italic leading-relaxed text-sm shadow-inner resize-none"
            />
            <div className="mt-8 flex justify-end">
               <button
                onClick={handleGenerate}
                disabled={isGenerating || !desc.trim()}
                className="py-4 px-10 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 text-black font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(245,158,11,0.3)] active:scale-95 text-xs"
              >
                {isGenerating ? '⏳ ĐANG PHÂN TÍCH...' : 'KHỞI TẠO BẢN THẢO →'}
              </button>
            </div>
          </div>

          {blueprint && (
            <div className="glass p-10 rounded-[3.5rem] border border-green-500/20 animate-in slide-in-from-bottom-10 duration-700 bg-green-500/[0.02] shadow-2xl">
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                <h3 className="text-2xl font-serif italic text-green-400">Kiến Trúc Hệ Thống Đề Xuất</h3>
                <span className="bg-green-500/10 text-green-500 text-[9px] px-3 py-1.5 rounded-full border border-green-500/20 font-black uppercase tracking-widest animate-pulse">Ready to Deploy</span>
              </div>
              
              <div className="prose prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-gray-300 font-light text-sm bg-black/40 p-8 rounded-3xl border border-white/5 shadow-inner">
                {blueprint}
              </div>
              
              <div className="mt-10 flex flex-col md:flex-row gap-6">
                <button className="flex-1 py-5 border border-white/10 rounded-2xl hover:bg-white/5 transition-colors text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white">
                   📥 Xuất File PDF Kỹ Thuật
                </button>
                <button onClick={handleDeploy} className="flex-1 py-5 bg-white text-black rounded-2xl hover:bg-gray-200 transition-colors text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                   <span>🚀</span> Kích Hoạt Môi Trường Thử Nghiệm
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="glass p-20 rounded-[4rem] border border-amber-500/30 bg-black flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500 min-h-[600px]">
           <div className="relative mb-12">
              <div className="w-48 h-48 rounded-full border-4 border-white/5 border-t-amber-500 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-5xl">🏗️</div>
           </div>
           <h3 className="text-3xl font-bold text-white mb-8 uppercase tracking-widest">Đang Triển Khai Hệ Thống</h3>
           <div className="space-y-4 w-full max-w-lg">
              {deploymentSteps.map((step, i) => (
                 <div key={i} className={`flex items-center gap-4 transition-all duration-500 ${i < deployStep ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] border ${i < deployStep ? 'bg-green-500 border-green-500 text-black' : 'border-white/20 text-transparent'}`}>
                       {i < deployStep && '✓'}
                    </div>
                    <p className={`text-sm font-mono ${i < deployStep ? 'text-green-400' : 'text-gray-500'}`}>{step}</p>
                 </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default BlueprintWizard;
