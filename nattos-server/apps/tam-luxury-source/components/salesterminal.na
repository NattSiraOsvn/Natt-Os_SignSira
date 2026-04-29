
import React, { useState, useMemo, useRef } from 'react';
import { Product, ExchangeItem, BusinessMetrics, UserRole, PersonaID, GuarantyCertificate, AlertLevel, IdentityData } from '../types';
import { SAMPLE_PRODUCTS } from '../constants';
import { NotifyBus } from '../services/notificationservice';
import { PaymentEngine, PaymentResponse } from '../services/paymentservice';
import { FraudGuard } from '../services/fraudguard'; 
import AIAvatar from './aiavatar';
import { SellerEngine } from '../services/sellerengine';
import { UserPosition, SellerReport, SellerIdentity, CustomerLead } from '../types';

interface SalesTerminalProps {
  metrics: BusinessMetrics;
  updateFinance: (data: Partial<BusinessMetrics>) => void;
  logAction: (action: string, details: string) => void;
  currentRole: UserRole;
  currentPosition: unknown; 
}

const SalesTerminal: React.FC<SalesTerminalProps> = ({ metrics, updateFinance, logAction, currentRole, currentPosition }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'order_engine' | 'manager_hub' | 'hidebox'>('dashboard');
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [exchangeItems, setExchangeItems] = useState<ExchangeItem[]>([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'idle' | 'qr' | 'success'>('idle');
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  
  // KYC State
  const [verifyingItemId, setVerifyingItemId] = useState<string | null>(null);
  const [isProcessingKYC, setIsProcessingKYC] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const kycInputRef = useRef<HTMLInputElement>(null); // Dùng chung cho cả CCCD và Face (Upload)
  const [kycType, setKycType] = useState<'FACE' | 'CCCD'>('FACE');

  const [showBuybackReport, setShowBuybackReport] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredProducts = useMemo(() => {
    return SAMPLE_PRODUCTS.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter === 'ALL' || p.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [searchTerm, categoryFilter]);

  const subTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0), [cart]);
  const exchangeTotal = useMemo(() => exchangeItems.reduce((sum, item) => sum + item.estimatedValue, 0), [exchangeItems]);
  const finalTotal = Math.max(0, subTotal - exchangeTotal);

  const DEFAULT_RULES = { BUYBACK: 0.8, EXCHANGE: 0.9 }; 

  const handleGDBScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanning(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      
      const data: GuarantyCertificate = // [LỆNH #001] AI API bị chặn
    await Promise.resolve({base64, fileType: file.type});
      
      // FRAUD GUARD: Initial check (chưa có identity) để xem SP có trong blacklist không
      const extractedSKU = data.productName.split(' ')[0] || 'UNKNOWN'; 
      const extractedCert = data.stoneSpec.includes('VC') ? data.stoneSpec : ''; 
      
      const fraudCheck = FraudGuard.checkFraud(extractedSKU, extractedCert, currentPosition);

      if (fraudCheck.level === AlertLevel.FATAL) {
          alert(`❌ TÀI KHOẢN BỊ KHÓA: ${fraudCheck.message}`);
          window.location.reload(); return;
      }
      
      const buybackDeduction = data.policy?.buybackDeduction || 20; 
      const exchangeDeduction = data.policy?.exchangeDeduction || 10; 
      const buybackRate = (100 - buybackDeduction) / 100;
      const exchangeRate = (100 - exchangeDeduction) / 100;
      const estimatedVal = data.originalPrice * exchangeRate;

      const newItem: ExchangeItem = {
        id: `EX-${Date.now()}`,
        description: `GĐB ${data.id} - ${data.productName}`,
        originalValue: data.originalPrice,
        estimatedValue: estimatedVal,
        percentApplied: exchangeRate * 100,
        type: 'GDB_RETURN',
        actionType: 'EXCHANGE',
        gdbRef: data.id,
        weight: data.weight,
        lockedPolicy: { buyback: buybackRate, exchange: exchangeRate }
        // Identity starts undefined
      };

      setExchangeItems([...exchangeItems, newItem]);
      setCustomer({ name: data.customerName, phone: data.phone || '' });
      
      // Nếu FraudGuard cảnh báo (warnING/CRITICAL), yêu cầu định danh ngay
      if (fraudCheck.level === AlertLevel.warnING || fraudCheck.level === AlertLevel.CRITICAL) {
          NotifyBus.push({ 
              type: 'RISK', 
              title: 'CẢNH BÁO THU ĐỔI', 
              content: `${fraudCheck.message} - BẮT BUỘC ĐỊNH DANH ĐỂ TIẾP TỤC.`, 
              persona: PersonaID.KRIS 
          });
      } else {
          NotifyBus.push({ 
              type: 'SUCCESS', 
              title: 'thiên: GĐB Hợp lệ', 
              content: `Đã khoá chính sách: Thu -${buybackDeduction}% | Đổi -${exchangeDeduction}%.`, 
              persona: PersonaID.THIEN 
          });
      }

    } catch (err) {
      console.error(err);
      alert("Lỗi quét GĐB. Vui lòng thử lại ảnh rõ nét hơn.");
    } finally {
      setIsScanning(false);
      if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerKYC = (itemId: string, type: 'FACE' | 'CCCD') => {
      setVerifyingItemId(itemId);
      setKycType(type);
      // Trên mobile/tablet, input file với capture='user' sẽ mở camera selfie
      if (kycInputRef.current) {
          if (type === 'FACE') {
              kycInputRef.current.setAttribute('capture', 'user'); 
              kycInputRef.current.setAttribute('accept', 'image/*');
          } else {
              kycInputRef.current.removeAttribute('capture');
              kycInputRef.current.setAttribute('accept', 'image/*');
          }
          kycInputRef.current.click();
      }
  };

  const handleKYCScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !verifyingItemId) return;
      
      setIsProcessingKYC(true);
      try {
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });

          let identity: IdentityData;

          if (kycType === 'CCCD') {
               // Dùng AI bóc tách CCCD (High Confidence)
               identity = // [LỆNH #001] AI API bị chặn
    await Promise.resolve({base64, fileType: file.type});
          } else {
               // Dùng Hash ảnh mặt (Face Hash - Light Auth)
               // Trong thực tế sẽ gọi FaceAPI, ở đây ta dùng hàm hash ảnh giả lập
               const faceHash = await generateIdentityHash(base64);
               identity = {
                   type: 'FACE',
                   hash: faceHash,
                   timestamp: Date.now(),
                   confidence: 0.95,
                   maskedId: 'FACE_ID_VERIFIED'
               };
          }
          
          if (identity.hash === 'UNKNOWN') {
              alert("Không thể nhận diện. Vui lòng thử lại.");
              setIsProcessingKYC(false);
              return;
          }

          // 2. Perform DEEP Fraud Check (Identity Binding)
          const targetItem = exchangeItems.find(i => i.id === verifyingItemId);
          if (targetItem) {
              const sku = targetItem.description.split('-')[1]?.trim() || '';
              // Gửi Hash định danh vào để check binding
              const fraudCheck = FraudGuard.checkFraud(sku, '', currentPosition, identity.hash);
              
              if (fraudCheck.level === AlertLevel.FATAL) {
                  alert(`❌ GIAN LẬN NGHIÊM TRỌNG: ${fraudCheck.message}`);
                  window.location.reload(); // Force logout simulation
                  return;
              }
              if (fraudCheck.level === AlertLevel.CRITICAL) {
                  alert(`⛔ CHẶN: ${fraudCheck.message}`);
                  // Không cho phép bind identity này
                  setIsProcessingKYC(false);
                  return;
              }
          }

          // 3. Update Item with Identity
          setExchangeItems(prev => prev.map(item => {
              if (item.id === verifyingItemId) {
                  return { ...item, identity: identity };
              }
              return item;
          }));

          NotifyBus.push({ 
              type: 'SUCCESS', 
              title: 'Định Danh Thành Công', 
              content: kycType === 'FACE' ? 'Đã lưu Face Hash (Không lưu ảnh thô).' : `Đã xác thực CCCD: ${identity.maskedId}`, 
              persona: PersonaID.KRIS 
          });

      } catch (e) {
          console.error(e);
          alert("Lỗi xử lý định danh.");
      } finally {
          setIsProcessingKYC(false);
          setVerifyingItemId(null);
          if (kycInputRef.current) kycInputRef.current.value = '';
      }
  };

  const toggleActionType = (id: string) => {
    setExchangeItems(prev => prev.map(item => {
      if (item.id === id && item.originalValue) {
        const newType = item.actionType === 'EXCHANGE' ? 'BUYBACK' : 'EXCHANGE';
        const lockedRate = item.lockedPolicy 
            ? (newType === 'EXCHANGE' ? item.lockedPolicy.exchange : item.lockedPolicy.buyback)
            : (newType === 'EXCHANGE' ? DEFAULT_RULES.EXCHANGE : DEFAULT_RULES.BUYBACK);

        return { 
            ...item, 
            actionType: newType, 
            percentApplied: lockedRate * 100, 
            estimatedValue: item.originalValue * lockedRate 
        };
      }
      return item;
    }));
  };

  const handleCheckout = async () => {
    window.dispatchEvent(new CustomEvent('NAUION_PULSE', { detail: { type: 'sales.intent', source: 'SalesTerminal' } }));
    if (cart.length === 0 && exchangeItems.length === 0) return alert("Giỏ hàng trống.");
    
    // Validate KYC for Exchange Items
    const unverifiedItems = exchangeItems.filter(i => !i.identity);
    if (unverifiedItems.length > 0) {
        alert(`⚠️ CẢNH BÁO: Còn ${unverifiedItems.length} sản phẩm thu đổi chưa xác thực (KYC). Vui lòng chụp mặt hoặc CCCD.`);
        return;
    }

    if (!customer.name) return alert("Vui lòng nhập tên khách hàng.");
    
    setIsCheckingOut(true);
    setPaymentStep('qr');
    try {
      const res = await PaymentEngine.createPayment({ orderId: `ORD-${Date.now()}`, amount: finalTotal, provider: 'VNPAY', customerName: customer.name });
      setPaymentData(res);
      logAction('SALES_CHECKOUT', `thiên: Khởi tạo thanh toán. Khách: ${customer.name}. Net: ${finalTotal.toLocaleString()}`);
    } finally { setIsCheckingOut(false); }
  };

  return (
    <div className="flex h-full bg-transparent overflow-hidden animate-in fade-in duration-700 relative">
      
      {/* LEFT SIDEBAR: MASTER COMMAND BOX */}
      <aside className="w-80 border-r border-white/5 bg-black/40 p-8 flex flex-col gap-8 hidden xl:flex">
         <div className="flex flex-col items-center p-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem]">
            <AIAvatar personaId={PersonaID.THIEN} size="md" isThinking={isScanning || isProcessingKYC} />
            <h4 className="mt-4 text-[10px] font-black text-white uppercase tracking-[0.4em]">Master Control Hub</h4>
            <p className="mt-4 text-[10px] text-gray-500 italic text-center leading-relaxed font-light">
               "Hệ thống Identity Binding đã kích hoạt. Mọi giao dịch thu đổi bắt buộc phải gắn với định danh (Face/CCCD) để đảm bảo tính pháp lý."
            </p>
         </div>

         <button 
           onClick={() => fileInputRef.current?.click()}
           disabled={isScanning}
           className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 transition-all active:scale-95"
         >
            {isScanning ? '⌛ ĐANG PHÂN TÍCH GĐB...' : '📸 QUÉT GIẤY ĐẢM BẢO'}
         </button>
         <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleGDBScan} />
         
         {/* Hidden Input for KYC (Shared) */}
         <input type="file" ref={kycInputRef} className="hidden" accept="image/*" onChange={handleKYCScan} />

         <button
            onClick={() => setShowBuybackReport(true)}
            className="w-full py-4 border border-white/10 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-white hover:border-white/20 transition-all"
         >
            📊 Báo Cáo Thu Đổi
         </button>

         <div>
            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mb-4">Danh mục</h3>
            <div className="space-y-2">
               {['ALL', 'Nhẫn Nam', 'Nhẫn Nữ', 'Bông Tai', 'Vòng Tay'].map(cat => (
                 <button key={cat} onClick={() => setCategoryFilter(cat)} className={`w-full text-left px-5 py-3 rounded-xl text-[11px] font-bold transition-all ${categoryFilter === cat ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-gray-500 hover:text-white'}`}>
                    {cat === 'ALL' ? 'Tất cả sản phẩm' : cat}
                 </button>
               ))}
            </div>
         </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
         <header className="h-20 border-b border-white/5 flex items-center px-10 bg-black/20 backdrop-blur-xl shrink-0">
            <div className="flex-1 relative max-w-2xl">
               <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600">🔍</span>
               <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="SKU Master Search..." className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-12 pr-6 text-[11px] text-amber-500 outline-none font-black uppercase tracking-widest" />
            </div>
         </header>

         <div className="flex-1 overflow-y-auto p-10 no-scrollbar pb-32">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {filteredProducts.map(product => (
                 <div key={product.id} className="natt-cell-medal bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(255,255,255,0.03)] rounded-3xl overflow-hidden border-white/5 hover:border-amber-500/30 group transition-all flex flex-col bg-black/40">
                    <div className="relative aspect-[4/3] overflow-hidden bg-black">
                       <img src={product.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" alt="p" />
                    </div>
                    <div className="p-6 flex flex-col flex-1 gap-4">
                       <h4 className="text-white font-bold text-sm uppercase tracking-tight truncate group-hover:text-amber-500 transition-colors">{product.name}</h4>
                       <div className="mt-auto flex justify-between items-end">
                          <p className="text-lg font-mono font-black text-white">{product.price.toLocaleString()} <span className="text-[10px] text-indigo-500">đ</span></p>
                          <button onClick={() => setCart([...cart, { product, quantity: 1 }])} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl hover:bg-amber-500 transition-all shadow-xl">+</button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </main>

      <aside className="w-[500px] border-l border-white/5 bg-black/60 backdrop-blur-3xl flex flex-col relative z-20">
         <header className="p-10 border-b border-white/5 bg-white/[0.02]">
            <h3 className="text-2xl font-serif gold-gradient italic uppercase tracking-widest mb-8">Omega Ledger</h3>
            <div className="space-y-4">
               <input type="text" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value.toUpperCase()})} placeholder="HỌ TÊN KHÁCH HÀNG" className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-[12px] text-white font-bold outline-none focus:border-cyan-500 uppercase" />
               <input type="text" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} placeholder="SỐ ĐIỆN THOẠI" className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-[12px] text-white font-mono outline-none focus:border-cyan-500" />
            </div>
         </header>

         <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
            <section>
               <h5 className="text-[10px] font-black text-gray-500 uppercase mb-4 flex justify-between">
                  <span>Giỏ hàng ({cart.length})</span>
                  <button onClick={() => setCart([])} className="text-red-500/50 hover:text-red-500 text-[9px] uppercase font-black">Xóa</button>
               </h5>
               <div className="space-y-3">
                  {cart.map((item, idx) => (
                    <div key={idx} className="p-5 bg-white/[0.03] border border-white/5 rounded-3xl flex gap-5 group">
                       <img src={item.product.image} className="w-12 h-12 rounded-2xl object-cover" alt="p" />
                       <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-white truncate uppercase">{item.product.name}</p>
                          <p className="text-[10px] text-amber-500 font-mono mt-1">{item.product.price.toLocaleString()} đ</p>
                       </div>
                    </div>
                  ))}
               </div>
            </section>

            <section>
               <h5 className="text-[10px] font-black text-indigo-400 uppercase mb-4 flex justify-between">
                  <span>Cấn trừ GĐB ({exchangeItems.length})</span>
                  <button onClick={() => fileInputRef.current?.click()} className="text-indigo-400 hover:underline text-[9px] font-black">+ Quét GĐB</button>
               </h5>
               <div className="space-y-4">
                  {exchangeItems.map(item => (
                    <div key={item.id} className={`p-6 border rounded-[2rem] flex flex-col gap-4 relative transition-all ${item.identity ? 'bg-green-500/5 border-green-500/20' : 'bg-indigo-500/5 border-indigo-500/20'}`}>
                       {item.lockedPolicy && (
                          <div className="absolute -top-2 -right-2 bg-green-600 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg">POLICY LOCKED</div>
                       )}
                       <div className="flex justify-between items-start">
                          <div>
                             <p className="text-[11px] font-bold text-indigo-300 uppercase leading-relaxed max-w-[200px]">{item.description}</p>
                             <p className="text-[9px] text-gray-500 mt-1 font-mono italic">Ref: {item.gdbRef}</p>
                          </div>
                          <button onClick={() => setExchangeItems(exchangeItems.filter(i => i.id !== item.id))} className="text-red-900 hover:text-red-500">✕</button>
                       </div>
                       
                       {/* KYC SECTION - UPDATED FOR DUAL TIER */}
                       <div className="flex flex-col gap-3 p-3 bg-black/40 rounded-xl border border-white/5">
                          {item.identity ? (
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-500 text-black flex items-center justify-center font-black">✓</div>
                                <div className="flex-1">
                                    <p className="text-[9px] font-black text-green-400 uppercase">{item.identity.type === 'FACE' ? 'FACE ID (Light)' : 'CCCD (Strong)'}</p>
                                    <p className="text-[9px] text-white truncate w-32">{item.identity.maskedId}</p>
                                </div>
                              </div>
                          ) : (
                              <>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-red-500 animate-pulse text-xs">⚠️</span>
                                    <p className="text-[9px] font-black text-red-400 uppercase">Yêu cầu định danh</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => triggerKYC(item.id, 'FACE')}
                                        className="py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-[8px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all"
                                    >
                                        📸 Chụp Mặt (Nhanh)
                                    </button>
                                    <button 
                                        onClick={() => triggerKYC(item.id, 'CCCD')}
                                        className="py-2 bg-amber-600/20 text-amber-400 border border-amber-500/30 rounded-lg text-[8px] font-black uppercase hover:bg-amber-600 hover:text-white transition-all"
                                    >
                                        🆔 Quét CCCD
                                    </button>
                                </div>
                                <p className="text-[7px] text-gray-500 italic text-center mt-1">"Hình ảnh chỉ dùng để đối soát nội bộ"</p>
                              </>
                          )}
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                             <p className="text-[8px] text-gray-600 font-black uppercase mb-1">Gốc</p>
                             <p className="text-xs font-mono text-gray-400">{item.originalValue?.toLocaleString()} đ</p>
                          </div>
                          <div className="p-3 bg-black/40 rounded-xl border border-indigo-500/30">
                             <p className="text-[8px] text-indigo-400 font-black uppercase mb-1">Định giá ({item.percentApplied}%)</p>
                             <p className="text-xs font-mono font-bold text-white">{item.estimatedValue.toLocaleString()} đ</p>
                          </div>
                       </div>
                       <div className="flex justify-between items-center bg-black/60 rounded-xl p-2 px-4">
                          <span className="text-[9px] font-black uppercase text-gray-500">Loại: {item.actionType === 'EXCHANGE' ? 'Đổi Lớn' : 'Thu Lại'}</span>
                          <button onClick={() => toggleActionType(item.id)} className="text-[8px] font-black text-indigo-400 underline">Switch Policy</button>
                       </div>
                    </div>
                  ))}
               </div>
            </section>
         </div>

         <footer className="p-10 border-t border-white/10 bg-black shadow-[0_-20px_60px_rgba(0,0,0,1)]">
            <div className="space-y-4 mb-8">
               <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-500 font-black uppercase">Tạm tính mua</span>
                  <span className="text-white font-mono">{subTotal.toLocaleString()} đ</span>
               </div>
               {exchangeTotal > 0 && (
                 <div className="flex justify-between items-center text-[11px]">
                    <span className="text-indigo-400 font-black uppercase">Cấn trừ GĐB</span>
                    <span className="text-indigo-400 font-mono">-{exchangeTotal.toLocaleString()} đ</span>
                 </div>
               )}
               <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                  <span className="text-[10px] text-amber-500 font-black uppercase tracking-[0.2em]">Tổng Net</span>
                  <span className="text-4xl font-mono font-black text-white italic">{finalTotal.toLocaleString()} <span className="text-xs text-amber-500">đ</span></span>
               </div>
            </div>

            <button 
               onClick={handleCheckout}
               disabled={cart.length === 0 && exchangeItems.length === 0}
               className="w-full py-6 bg-amber-500 text-black font-black uppercase tracking-[0.4em] rounded-[2rem] hover:bg-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.2)] active:scale-95 disabled:opacity-20"
            >
               {isCheckingOut ? 'ĐANG BĂM SHARD...' : 'XÁC THỰC THANH TOÁN →'}
            </button>
         </footer>
         
         {/* ... (Existing Payment Modal Logic - Unchanged) ... */}
         {paymentStep !== 'idle' && (
            <div className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center animate-in zoom-in-95 duration-500">
               <button onClick={() => setPaymentStep('idle')} className="absolute top-10 right-10 text-3xl text-gray-600 hover:text-white">✕</button>
               {paymentStep === 'qr' && (
                 <div className="space-y-10 w-full max-w-sm">
                    <AIAvatar personaId={PersonaID.THIEN} size="sm" isThinking={true} />
                    <div className="bg-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
                       {paymentData ? <img src={paymentData.qrCodeUrl} className="w-full" alt="qr" /> : <div className="h-64 flex items-center justify-center text-black font-black animate-pulse">GENERATING NODE...</div>}
                    </div>
                    <div className="space-y-2">
                       <p className="text-4xl font-mono font-black text-white italic">{finalTotal.toLocaleString()} đ</p>
                       <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.4em]">thiên: Chờ Shard ngân hàng xác thực...</p>
                    </div>
                    <button onClick={() => {  setPaymentStep('success')
    window.dispatchEvent(new CustomEvent('NAUION_PULSE', { detail: { type: 'sales.confirm', source: 'SalesTerminal' } }));
    NotifyBus.push({ type: 'ORDER', title: 'Chốt Đơn Thành Công', content: 'Phân hệ Sales vừa ghi nhận doanh thu mới.', priority: 'HIGH' } as any); }} className="w-full py-5 bg-white text-black font-black text-[11px] uppercase tracking-[0.4em] rounded-2xl hover:bg-green-400">XÁC THỰC XONG</button>
                 </div>
               )}
               {paymentStep === 'success' && (
                 <div className="space-y-12 animate-in fade-in duration-1000">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-7xl shadow-2xl border-4 border-black mx-auto">✓</div>
                    <h3 className="text-5xl font-serif gold-gradient italic uppercase tracking-tighter leading-none">Success</h3>
                    <p className="text-[10px] text-gray-500 max-w-xs mx-auto leading-relaxed italic uppercase font-black tracking-widest">Đơn hàng đã được băm vào sổ cái. Cảm ơn Anh Natt!</p>
                    <button onClick={() => { setPaymentStep('idle'); setCart([]); setExchangeItems([]); setCustomer({ name: '', phone: '' }); }} className="px-12 py-5 bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase rounded-2xl">Return Terminal</button>
                 </div>
               )}
            </div>
         )}
      </aside>

      {/* BUYBACK REPORT MODAL (unchanged) */}
      {showBuybackReport && (
         <div className="fixed inset-0 z-[500] flex items-center justify-center p-8 bg-black/90 backdrop-blur-xl animate-in zoom-in-95 duration-300">
            <div className="bg-[#0a0a0a] w-full max-w-4xl p-12 rounded-[4rem] border border-indigo-500/30 relative overflow-hidden shadow-2xl flex flex-col">
               <button onClick={() => setShowBuybackReport(false)} className="absolute top-10 right-10 text-3xl text-gray-500 hover:text-white transition-colors">✕</button>
               <h3 className="text-4xl font-serif gold-gradient italic uppercase tracking-tighter mb-12 text-center">Báo Cáo Thu Đổi GĐB</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="p-8 bg-indigo-500/10 border border-indigo-500/30 rounded-[2.5rem] text-center">
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Tổng Giá Trị Thu Hồi (80%)</p>
                     <p className="text-3xl font-mono font-black text-white">450,000,000 <span className="text-sm text-gray-500">đ</span></p>
                  </div>
                  <div className="p-8 bg-green-500/10 border border-green-500/30 rounded-[2.5rem] text-center">
                     <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-4">Tổng Giá Trị Đổi Mới (90%)</p>
                     <p className="text-3xl font-mono font-black text-white">120,000,000 <span className="text-sm text-gray-500">đ</span></p>
                  </div>
               </div>

               <div className="flex-1 bg-black/40 border border-white/5 rounded-3xl p-8 overflow-y-auto no-scrollbar">
                  <table className="w-full text-left text-[11px]">
                     <thead>
                        <tr className="text-gray-500 font-black uppercase tracking-widest border-b border-white/10">
                           <th className="pb-4">Mã GĐB</th>
                           <th className="pb-4">Khách Hàng</th>
                           <th className="pb-4 text-center">Loại</th>
                           <th className="pb-4 text-right">Giá Gốc</th>
                           <th className="pb-4 text-right text-amber-500">Giá Trị Cấn Trừ</th>
                        </tr>
                     </thead>
                     <tbody className="text-gray-300">
                        <tr className="border-b border-white/5">
                           <td className="py-3 font-mono text-cyan-400">TL-2023-001</td>
                           <td className="py-3 font-bold text-white uppercase">NGUYỄN VĂN A</td>
                           <td className="py-3 text-center"><span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-[8px] font-black">THU HỒI</span></td>
                           <td className="py-3 text-right font-mono">100,000,000</td>
                           <td className="py-3 text-right font-mono font-black text-white">80,000,000</td>
                        </tr>
                        <tr className="border-b border-white/5">
                           <td className="py-3 font-mono text-cyan-400">TL-2023-045</td>
                           <td className="py-3 font-bold text-white uppercase">TRẦN THỊ B</td>
                           <td className="py-3 text-center"><span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-[8px] font-black">ĐỔI MỚI</span></td>
                           <td className="py-3 text-right font-mono">50,000,000</td>
                           <td className="py-3 text-right font-mono font-black text-white">45,000,000</td>
                        </tr>
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default SalesTerminal;
