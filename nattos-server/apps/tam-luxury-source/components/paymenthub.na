
import React, { useState, useMemo } from 'react';
import { UserRole, UserPosition, PersonaID } from '../types';
import { PaymentEngine, PaymentResponse } from '../services/paymentservice';
import AIAvatar from './aiavatar';

interface PaymentHubProps {
  currentRole: UserRole;
  currentPosition: UserPosition;
  logAction: (action: string, details: string) => void;
}

const PaymentHub: React.FC<PaymentHubProps> = ({ currentRole, currentPosition, logAction }) => {
  const [amount, setAmount] = useState<string>('');
  const [refCode, setRefCode] = useState<string>(`TL-${Date.now().toString().slice(-6)}`);
  const [customerName, setCustomerName] = useState<string>('');
  const [provider, setProvider] = useState<'VNPAY' | 'MOMO' | 'ZALOPAY'>('VNPAY');
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const bankList = [
    { id: 'VCB', name: 'Vietcombank', logo: 'https://vcb.com.vn/favicon.ico' },
    { id: 'TCB', name: 'Techcombank', logo: 'https://techcombank.com/favicon.ico' },
    { id: 'ACB', name: 'ACB Bank', logo: 'https://acb.com.vn/favicon.ico' }
  ];

  const handleGenerate = async () => {
    if (!amount || Number(amount) <= 0) return alert("Vui lòng nhập số tiền hợp lệ.");
    setIsGenerating(true);
    try {
      const res = await PaymentEngine.createPayment({
        orderId: refCode,
        amount: Number(amount),
        provider: provider,
        customerName: customerName || 'KHACH_HANG_LE'
      });
      setPaymentData(res);
      logAction('QR_PAYMENT_GENERATE', `Tạo mã QR ${provider} - Số tiền: ${Number(amount).toLocaleString()}đ - Ref: ${refCode}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col bg-transparent p-8 md:p-12 overflow-y-auto no-scrollbar gap-10 animate-in fade-in duration-700 pb-40">
      
      <header className="border-b border-white/5 pb-10 flex flex-col lg:flex-row justify-between items-end gap-8 print:hidden">
        <div>
          <div className="flex items-center gap-4 mb-3">
             <span className="text-4xl">📱</span>
             <h2 className="ai-headline text-5xl italic uppercase tracking-tighter leading-none">Omega Pay Terminal</h2>
          </div>
          <p className="ai-sub-headline text-cyan-300/40 ml-1 italic font-black tracking-[0.3em]">Cổng khởi tạo thanh toán QR liên Shard • Tâm Luxury Master</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
           <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-4">VietQR v2.0 Standard</span>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
         
         {/* FORM CONFIGURATION */}
         <div className="space-y-8 animate-in slide-in-from-left-6 duration-700 print:hidden">
            <div className="natt-cell-medal bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(255,255,255,0.03)] rounded-3xl transition-all p-10 bg-black/40 border-white/10 shadow-2xl relative overflow-hidden">
               <h3 className="text-xl font-bold italic text-amber-500 uppercase tracking-widest mb-10 flex items-center gap-3">
                  <span className="text-2xl">⚙️</span> Cấu hình giao dịch
               </h3>
               
               <div className="space-y-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2">Số tiền thanh toán (VND) *</label>
                     <input 
                       type="number" 
                       value={amount}
                       onChange={(e) => setAmount(e.target.value)}
                       className="w-full bg-black/60 border border-white/10 rounded-2xl p-6 text-3xl font-mono text-white focus:border-amber-500 outline-none transition-all shadow-inner"
                       placeholder="0"
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2">Mã tham chiếu (Ref)</label>
                        <input 
                          type="text" 
                          value={refCode}
                          onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                          className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-sm text-amber-500 font-mono focus:border-amber-500 outline-none"
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2">Tên khách hàng</label>
                        <input 
                          type="text" 
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value.toUpperCase())}
                          className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-sm text-white focus:border-amber-500 outline-none uppercase font-bold"
                          placeholder="KHACH HANG LE"
                        />
                     </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2">Cổng thanh toán (Provider)</label>
                     <div className="grid grid-cols-3 gap-4">
                        {(['VNPAY', 'MOMO', 'ZALOPAY'] as const).map(p => (
                          <button 
                            key={p} 
                            onClick={() => setProvider(p)}
                            className={`py-4 rounded-xl border text-[10px] font-black tracking-widest transition-all ${
                              provider === p ? 'bg-amber-500 text-black border-amber-500 shadow-xl' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                     </div>
                  </div>

                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !amount}
                    className="w-full py-6 bg-amber-500 text-black font-black text-[11px] uppercase tracking-[0.4em] rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.2)] hover:bg-amber-400 transition-all active:scale-95 disabled:opacity-20"
                  >
                    {isGenerating ? '⌛ ĐANG BĂM SHARD QR...' : 'KHỞI TẠO MÃ THANH TOÁN →'}
                  </button>
               </div>
            </div>

            <div className="natt-cell-medal bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(255,255,255,0.03)] rounded-3xl transition-all p-8 bg-blue-500/5 border-blue-500/20">
               <div className="flex items-center gap-4 mb-6">
                  <AIAvatar personaId={PersonaID.THIEN} size="sm" isThinking={isGenerating} />
                  <h4 className="ai-sub-headline text-blue-400 italic">thiên - Cố vấn Tài chính</h4>
               </div>
               <p className="text-[12px] text-gray-400 italic leading-relaxed font-light">"Thưa Anh Natt, thiên khuyến nghị sử dụng mã tham chiếu (Ref) khớp với số Hợp đồng hoặc SNT sản phẩm để Kris có thể tự động đối soát dòng tiền tại module **Banking Processor**."</p>
            </div>
         </div>

         {/* QR DISPLAY AREA */}
         <div className="h-full flex flex-col gap-8 print:p-0">
            {paymentData ? (
              <div className="natt-cell-medal bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(255,255,255,0.03)] rounded-3xl transition-all p-10 bg-white border-white/10 flex flex-col items-center text-center animate-in zoom-in-95 duration-500 shadow-[0_0_100px_rgba(245,158,11,0.1)] print:border-none print:shadow-none print:bg-white">
                 <div className="mb-8 print:hidden">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Master QR Node</h4>
                    <p className="text-xs text-amber-600 font-mono mt-1 italic">Authorized for: {customerName || 'VALUED CUSTOMER'}</p>
                 </div>
                 
                 <div className="relative w-full max-w-sm aspect-square bg-white p-8 rounded-[3.5rem] shadow-2xl border-4 border-black group overflow-hidden print:p-4 print:rounded-none">
                    <img src={paymentData.qrCodeUrl} className="w-full h-full" alt="VietQR" />
                    <div className="absolute inset-0 border-[20px] border-white pointer-events-none print:hidden"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-2xl flex items-center justify-center p-2 shadow-xl print:w-12 print:h-12">
                       <span className="text-2xl print:text-lg">💎</span>
                    </div>
                 </div>

                 <div className="mt-10 space-y-3">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest print:text-black">Quét mã để thanh toán (VietQR)</p>
                    <p className="text-4xl font-mono font-black text-black italic">{Number(amount).toLocaleString()} đ</p>
                    <p className="text-[9px] text-amber-600 font-bold uppercase border-t border-black/5 pt-3 print:text-black">THỤ HƯỞNG: CÔNG TY TNHH TÂM LUXURY</p>
                 </div>

                 <div className="mt-12 w-full flex gap-4 print:hidden">
                    <button onClick={handlePrint} className="flex-1 py-4 border border-black/10 text-black font-black text-[10px] uppercase rounded-xl hover:bg-black/5 transition-all">🖨️ In mã QR</button>
                    <button className="flex-1 py-4 bg-black text-white font-black text-[10px] uppercase rounded-xl shadow-xl hover:bg-zinc-800 transition-all">📤 Chia sẻ Shard</button>
                 </div>
              </div>
            ) : (
              <div className="natt-cell-medal bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(255,255,255,0.03)] rounded-3xl transition-all p-20 flex flex-col items-center justify-center text-center opacity-20 border-dashed border-white/10 h-full">
                 <div className="text-[120px] mb-10 grayscale">📳</div>
                 <p className="text-2xl font-serif uppercase tracking-[0.4em]">Payment Node Ready</p>
                 <p className="text-xs mt-4 uppercase font-black text-gray-500 tracking-[0.2em]">Cấu hình giao dịch để thiên băm mã QR Omega.</p>
              </div>
            )}

            <div className="natt-cell-medal bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(255,255,255,0.03)] rounded-3xl transition-all p-8 bg-black/60 border-white/5 print:hidden">
               <h4 className="ai-sub-headline text-gray-500 mb-6 uppercase italic">Giao thức bảo mật (Security)</h4>
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px]">
                     <span className="text-gray-600 font-bold uppercase">Mã hóa VietQR:</span>
                     <span className="text-green-500 font-black italic">AES-256 SYNCED</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                     <span className="text-gray-600 font-bold uppercase">Trace ID:</span>
                     <span className="text-cyan-400 font-mono font-bold uppercase tracking-tighter">{paymentData?.transactionId || '---'}</span>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                     <p className="text-[8px] text-gray-700 font-black uppercase leading-loose">
                        Dữ liệu được băm định kỳ vào Blockchain Shard mỗi khi có giao dịch thành công.
                     </p>
                  </div>
               </div>
            </div>
         </div>

      </main>
    </div>
  );
};

export default PaymentHub;
