
import React, { useState, useEffect, useRef } from 'react';
import { Calibration } from '@/cells/kernel/config-cell/domain/services/config-store.service';
import { InputPersona, InputMetrics, PersonaID } from '@/types';
import AIAvatar from '@/components/AIAvatar';

export const CalibrationWizard: React.FC = () => {
  const [step, setStep] = useState<'intro' | 'testing' | 'result'>('intro');
  const [timeLeft, setTimeLeft] = useState(30);
  const [testText, setTestText] = useState('');
  const [metrics, setMetrics] = useState<InputMetrics>({ currentCPM: 0, keystrokes: 0, clicks: 0, intensity: 0 });
  const [detectedPersona, setDetectedPersona] = useState<{ persona: InputPersona, confidence: number } | null>(null);

  const sampleText = "Nhập đơn hàng trang sức vàng 18K mã SP-2025-NATT. Kim cương GIA 7.2ly nước D độ sạch IF. Khách hàng VIP ưu tiên giao nhanh trong 24h. Ni tay số 12, bản nhám mờ, khắc chữ Forever.";

  const startTest = () => {
    setStep('testing');
    setTestText('');
    setTimeLeft(30);
  };

  useEffect(() => {
    let timer: any;
    if (step === 'testing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && step === 'testing') {
      finishTest();
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const finishTest = () => {
    const cpm = (testText.length / 0.5); // 30s = 0.5 min
    const results = { currentCPM: cpm, keystrokes: testText.length, clicks: 0, intensity: 0.8 };
    setMetrics(results);
    const persona = (Calibration as any).analyze ? (Calibration as any).analyze(results) : { persona: Calibration.identifyPersona(results), confidence: 85 };
    setDetectedPersona(persona);
    setStep('result');
  };

  const handleSave = () => {
    if (!detectedPersona) return;
    Calibration.saveProfile({
        userId: 'MASTER_NATT',
        persona: detectedPersona.persona,
        avgCPM: metrics.currentCPM,
        peakCPM: metrics.currentCPM * 1.2,
        errorRate: 0.05,
        burstCapacity: 1.8,
        lastCalibrated: Date.now(),
        confidence: detectedPersona.confidence
    });
    alert("✅ Giao thức nhịp điệu đã được niêm phong vào Shard cá nhân!");
    window.location.reload();
  };

  return (
    <div className="h-full flex flex-col bg-[#020202] p-10 overflow-y-auto no-scrollbar items-center justify-center relative">
       
       {/* Background Decoration */}
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.03)_0%,_transparent_70%)] pointer-events-none"></div>

       {step === 'intro' && (
          <div className="max-w-2xl text-center space-y-8 animate-in zoom-in-95 duration-700">
             <div className="w-32 h-32 rounded-[3rem] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-10 shadow-2xl">
                <span className="text-6xl">🎯</span>
             </div>
             <h2 className="ai-headline text-5xl italic uppercase tracking-tighter">Neural Calibration Lab</h2>
             <p className="text-gray-400 text-lg font-light leading-relaxed italic">
                "Chào Anh Natt, Thiên cần 30 giây để học nhịp độ nhập liệu của Anh. Điều này giúp hệ thống mở rộng ngưỡng xử lý Quantum, tránh các cảnh báo giả khi Anh đang bùng nổ năng suất."
             </p>
             <button onClick={startTest} className="px-12 py-5 bg-amber-500 text-black font-black text-xs uppercase tracking-[0.4em] rounded-2xl hover:bg-amber-400 transition-all shadow-[0_0_50px_rgba(245,158,11,0.2)] active:scale-95">
                BẮT ĐẦU HIỆU CHUẨN
             </button>
          </div>
       )}

       {step === 'testing' && (
          <div className="w-full max-w-4xl space-y-10 animate-in fade-in duration-500">
             <div className="flex justify-between items-end mb-6">
                <div>
                   <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest mb-1">Mẫu nhập liệu nghiệp vụ</p>
                   <p className="text-2xl font-serif text-white italic">" {sampleText} "</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Thời gian</p>
                   <p className={`text-4xl font-mono font-black ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{timeLeft}s</p>
                </div>
             </div>
             
             <textarea 
               value={testText}
               onChange={(e) => setTestText(e.target.value)}
               autoFocus
               className="w-full h-48 bg-white/[0.02] border border-white/10 rounded-[3rem] p-10 text-xl text-white outline-none focus:border-amber-500 transition-all shadow-inner resize-none"
               placeholder="Gõ lại đoạn văn bản trên để Thiên bóc tách CPM..."
             />

             <div className="flex gap-4 items-center justify-center opacity-40">
                <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-amber-500 transition-all" style={{ width: `${(testText.length / sampleText.length) * 100}%` }}></div>
                </div>
                <span className="text-[10px] font-black text-white">{testText.length} / {sampleText.length} Chars</span>
             </div>
          </div>
       )}

       {step === 'result' && detectedPersona && (
          <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in slide-in-from-bottom-10 duration-1000">
             <div className="ai-panel p-10 bg-amber-500/5 border-amber-500/20 shadow-2xl flex flex-col items-center text-center">
                <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-8">Kết quả phân tích Identity</h3>
                <div className="w-24 h-24 rounded-[2rem] bg-black/40 border border-white/10 flex items-center justify-center text-4xl mb-6">⚡</div>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Tốc độ ghi nhận</p>
                <p className="text-5xl font-mono font-black text-white italic">{metrics.currentCPM.toFixed(0)} <span className="text-xs text-gray-600 font-sans not-italic">CPM</span></p>
                
                <div className="mt-10 pt-10 border-t border-white/5 w-full">
                   <p className="text-[10px] text-gray-600 uppercase font-black mb-4 tracking-widest">Đề xuất Persona</p>
                   <span className="px-6 py-2 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest">{(detectedPersona.persona as any)?.name ?? String(detectedPersona.persona)}</span>
                   <p className="text-[9px] text-gray-500 mt-4 italic">Độ tin cậy: {(detectedPersona.confidence * 100).toFixed(1)}%</p>
                </div>
             </div>

             <div className="space-y-8">
                <div className="ai-panel p-10 bg-black border-white/5">
                   <div className="flex items-center gap-4 mb-6">
                      <AIAvatar personaId={PersonaID.THIEN} size="sm" isThinking={false} />
                      <h4 className="text-sm font-black text-white uppercase tracking-widest">Thiên Advisor</h4>
                   </div>
                   <p className="text-sm text-gray-400 italic leading-relaxed font-light">
                      "Thưa Anh Natt, Thiên đã lập bản đồ nhịp điệu của Anh. Với tốc độ {metrics.currentCPM.toFixed(0)} ký tự/phút, Thiên đề xuất mở rộng ngưỡng **Burst Capacity** lên mức x1.8. Anh sẽ có thể làm việc siêu tốc mà không bao giờ gặp màn hình Quantum Staging."
                   </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <button onClick={() => setStep('intro')} className="py-5 border border-white/10 text-gray-500 font-black text-[10px] uppercase rounded-2xl hover:text-white transition-all">Thử lại</button>
                   <button onClick={handleSave} className="py-5 bg-white text-black font-black text-[10px] uppercase rounded-2xl shadow-2xl hover:bg-amber-500 transition-all">Lưu Giao Thức</button>
                </div>
             </div>
          </div>
       )}

    </div>
  );
};

export default CalibrationWizard;
