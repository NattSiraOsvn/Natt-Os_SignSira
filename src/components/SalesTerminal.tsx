
import React, { useState, useMemo, useRef } from 'react';
import { Product, ExchangeItem, BusinessMetrics, UserRole, PersonaID, GuarantyCertificate, AlertLevel, IdentityData } from '../types';
import { SAMPLE_PRODUCTS } from '../constants';
import { NotifyBus } from '@/cells/infrastructure/notification-cell/domain/services/notify-bus';
import { PaymentEngine, PaymentResponse } from '@/cells/business/payment-cell/domain/services/payment.engine';
import { extractGuarantyData, extractCCCDData, generateIdentityHash } from '@/cells/infrastructure/ai-connector-cell/domain/services/gemini.engine';
import { FraudGuard } from '@/cells/business/compliance-cell/domain/services/fraud-guard.engine'; 
import AIAvatar from './AIAvatar';

interface SalesTerminalProps {
  metrics: BusinessMetrics;
  updateFinance: (data: Partial<BusinessMetrics>) => void;
  logAction: (action: string, details: string) => void;
  currentRole: UserRole;
  currentPosition: any; 
}

const SalesTerminal: React.FC<SalesTerminalProps> = ({ metrics, updateFinance, logAction, currentRole, currentPosition }) => {
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [exchangeItems, setExchangeItems] = useState<ExchangeItem[]>([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'idle' | 'qr' | 'success'>('idle');
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessingKYC, setIsProcessingKYC] = useState(false);
  const [verifyingItemId, setVerifyingItemId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const kycInputRef = useRef<HTMLInputElement>(null);

  const subTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0), [cart]);
  const exchangeTotal = useMemo(() => exchangeItems.reduce((sum, item) => sum + item.estimatedValue, 0), [exchangeItems]);
  const finalTotal = Math.max(0, subTotal - exchangeTotal);

  const handleAddToCart = (product: Product) => {
    setCart([...cart, { product, quantity: 1 }]);
    NotifyBus.push({ type: 'SUCCESS', title: 'Giỏ hàng updated', content: `Đã thêm ${product.name}`, persona: PersonaID.PHIEU });
  };

  const handleCheckout = async () => {
    if (cart.length === 0 && exchangeItems.length === 0) return;
    setIsCheckingOut(true);
    setPaymentStep('qr');
    const res = await PaymentEngine.createPayment({ orderId: `ORD-${Date.now()}`, amount: finalTotal, provider: 'VNPAY', customerName: customer.name || 'KHACH_HANG' });
    setPaymentData(res);
    setIsCheckingOut(false);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row bg-[#020202] overflow-hidden animate-in fade-in duration-700 relative">
      
      {/* LEFT: PRODUCT GRID & SEARCH (ADAPTIVE) */}
      <main className="flex-1 flex flex-col min-w-0 h-full">
         <header className="p-6 lg:p-8 border-b border-white/5 bg-black/20 backdrop-blur-xl flex flex-col md:flex-row gap-6 shrink-0">
            <div className="flex-1 relative">
               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
               <input 
                  type="text" 
                  placeholder="Mã SKU / Tên sản phẩm Master..." 
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs text-amber-500 font-bold uppercase outline-none focus:border-amber-500/50 transition-all"
               />
            </div>
            <div className="flex gap-3">
               <button onClick={() => fileInputRef.current?.click()} className="px-6 py-4 heat-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                  <span>📸</span> <span className="hidden sm:inline">QUÉT GĐB</span>
               </button>
               <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
            </div>
         </header>

         <div className="flex-1 overflow-y-auto p-6 lg:p-10 no-scrollbar pb-40">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
               {SAMPLE_PRODUCTS.map(product => (
                 <div key={product.id} className="ai-panel overflow-hidden border-white/5 heat-0 hover:heat-1 group transition-all flex flex-col bg-black/40">
                    <div className="relative aspect-[4/3] overflow-hidden bg-black">
                       <img src={product.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" alt="p" />
                    </div>
                    <div className="p-6 flex flex-col flex-1 gap-4">
                       <h4 className="text-white font-bold text-xs uppercase tracking-tight truncate group-hover:text-amber-500 transition-colors">{product.name}</h4>
                       <div className="mt-auto flex justify-between items-end">
                          <p className="text-lg font-mono font-black text-white italic">{product.price.toLocaleString()} <span className="text-[10px] text-amber-600">đ</span></p>
                          <button onClick={() => handleAddToCart(product)} className="w-12 h-12 rounded-2xl heat-1 flex items-center justify-center text-2xl hover:heat-2 transition-all shadow-xl">+</button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </main>

      {/* RIGHT: LEDGER / CART PANEL (ADAPTIVE DRAWERS) */}
      <aside className="w-full lg:w-[480px] xl:w-[550px] border-t lg:border-t-0 lg:border-l border-white/10 bg-black/60 backdrop-blur-3xl flex flex-col shrink-0 relative z-20 h-[60vh] lg:h-full">
         <header className="p-6 lg:p-10 border-b border-white/5 bg-white/[0.01]">
            <h3 className="text-2xl font-serif gold-gradient italic uppercase tracking-widest mb-6">Omega Ledger</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <input type="text" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value.toUpperCase()})} placeholder="TÊN KHÁCH HÀNG" className="bg-black/60 border border-white/10 p-4 rounded-xl text-xs text-white font-bold outline-none focus:border-amber-500 uppercase" />
               <input type="text" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} placeholder="SĐT" className="bg-black/60 border border-white/10 p-4 rounded-xl text-xs text-white font-mono outline-none focus:border-amber-500" />
            </div>
         </header>

         <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 no-scrollbar">
            <section>
               <h5 className="text-[9px] font-black text-gray-500 uppercase mb-4 tracking-widest">Giỏ hàng ({cart.length})</h5>
               <div className="space-y-3">
                  {cart.map((item, idx) => (
                    <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex gap-4 items-center group animate-in slide-in-from-right-2">
                       <img src={item.product.image} className="w-12 h-12 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all" alt="p" />
                       <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-white truncate uppercase">{item.product.name}</p>
                          <p className="text-[10px] text-amber-500 font-mono mt-1">{item.product.price.toLocaleString()} đ</p>
                       </div>
                       <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-gray-700 hover:text-red-500 p-2">✕</button>
                    </div>
                  ))}
               </div>
            </section>

            {exchangeItems.length > 0 && (
               <section className="animate-in slide-in-from-bottom-4">
                  <h5 className="text-[9px] font-black text-amber-600 uppercase mb-4 tracking-widest">Cấn trừ GĐB ({exchangeItems.length})</h5>
                  <div className="space-y-3">
                     {exchangeItems.map(item => (
                        <div key={item.id} className="p-5 heat-1 rounded-2xl border-amber-500/20 flex flex-col gap-4">
                           <div className="flex justify-between items-start">
                              <p className="text-[11px] font-bold text-amber-100 uppercase italic">GĐB: {item.description}</p>
                              <button onClick={() => setExchangeItems(exchangeItems.filter(i => i.id !== item.id))} className="text-red-900 hover:text-red-500">✕</button>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                                 <p className="text-[8px] text-gray-600 uppercase font-black">Giá trị GĐB</p>
                                 <p className="text-xs font-mono text-white">{item.estimatedValue.toLocaleString()} đ</p>
                              </div>
                              <div className="flex flex-col justify-center items-end">
                                 <span className="text-[8px] font-black text-green-500 uppercase italic">Identity Linked</span>
                                 <span className="text-[9px] font-mono text-white/40">NODE_VERIFIED</span>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </section>
            )}
         </div>

         <footer className="p-8 lg:p-12 border-t border-white/10 bg-black/80 shadow-[0_-20px_60px_rgba(0,0,0,1)]">
            <div className="space-y-4 mb-8">
               <div className="flex justify-between items-end">
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">Total Net Protocol</span>
                  <span className="text-4xl font-mono font-black text-white italic tracking-tighter">
                     {finalTotal.toLocaleString()} <span className="text-xs text-amber-500">VND</span>
                  </span>
               </div>
            </div>

            <button 
               onClick={handleCheckout}
               disabled={cart.length === 0 && exchangeItems.length === 0}
               className="w-full py-6 heat-3 text-white font-black uppercase tracking-[0.5em] rounded-[2.5rem] shadow-2xl hover:scale-[1.01] transition-all active:scale-95 disabled:opacity-20 disabled:grayscale"
            >
               {isCheckingOut ? 'BĂM SHARD...' : 'AUTHORIZE SETTLEMENT'}
            </button>
         </footer>

         {/* QR MODAL (OVERLAY) */}
         {paymentStep === 'qr' && (
            <div className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center animate-in zoom-in-95 duration-500">
               <button onClick={() => setPaymentStep('idle')} className="absolute top-10 right-10 text-3xl text-gray-600 hover:text-white">✕</button>
               <div className="space-y-10 w-full max-w-sm">
                  <div className="bg-white p-8 rounded-[3.5rem] shadow-2xl relative overflow-hidden border-[10px] border-black">
                     {paymentData ? <img src={paymentData.qrCodeUrl} className="w-full" alt="qr" /> : <div className="h-64 flex items-center justify-center text-black font-black animate-pulse">GENERATING NODE...</div>}
                  </div>
                  <div className="space-y-2">
                     <p className="text-4xl font-mono font-black text-white italic">{finalTotal.toLocaleString()} đ</p>
                     <p className="ai-sub-headline opacity-60">Chờ xác thực luồng tiền...</p>
                  </div>
                  <button onClick={() => setPaymentStep('success')} className="w-full py-5 bg-amber-500 text-black font-black text-[11px] uppercase tracking-[0.4em] rounded-2xl shadow-xl hover:bg-amber-400">TÔI ĐÃ THANH TOÁN</button>
               </div>
            </div>
         )}
         
         {paymentStep === 'success' && (
            <div className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-700">
               <div className="w-32 h-32 rounded-[3rem] heat-3 flex items-center justify-center text-7xl shadow-2xl border-4 border-black mb-10">✓</div>
               <h3 className="ai-headline text-5xl italic uppercase tracking-tighter mb-4 leading-none">Transmission Success</h3>
               <p className="ai-sub-headline opacity-40">Đơn hàng đã được băm vào sổ cái.</p>
               <button onClick={() => { setPaymentStep('idle'); setCart([]); setExchangeItems([]); }} className="mt-12 px-12 py-5 border border-white/10 text-gray-500 font-black text-[10px] uppercase rounded-2xl hover:text-white transition-all">Quay lại Terminal</button>
            </div>
         )}
      </aside>
    </div>
  );
};

export default SalesTerminal;
