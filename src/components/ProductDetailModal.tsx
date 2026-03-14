
import React, { useState } from 'react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onRequestCustomization: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onAddToCart, onRequestCustomization }) => {
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(product.minOrder);
  const [showAppraisal, setShowAppraisal] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300 overflow-hidden">
      <div className="ai-panel w-full max-w-7xl max-h-[90vh] flex flex-col bg-black border-indigo-500/20 relative">
        <button onClick={onClose} className="absolute top-8 right-8 text-4xl text-gray-500 hover:text-white transition-colors z-[110]">✕</button>
        
        <div className="flex-1 overflow-y-auto no-scrollbar p-10 md:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* Gallery Section */}
            <div className="space-y-8">
               <div className="aspect-square rounded-[3rem] overflow-hidden border border-white/10 bg-black group relative shadow-2xl">
                  <img src={product.images[activeImg]} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="p" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
               </div>
               <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  {product.images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)} className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${activeImg === i ? 'border-amber-500 scale-105' : 'border-white/5 opacity-40'}`}>
                      <img src={img} className="w-full h-full object-cover" />
                    </button>
                  ))}
               </div>
            </div>

            {/* Info Section */}
            <div className="space-y-10">
               <div>
                  <div className="flex items-center gap-3 mb-4">
                     <span className="px-3 py-1 bg-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-amber-500/30">Mã SKU: {product.sku}</span>
                     <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-cyan-500/30">GIA Certified</span>
                  </div>
                  <h2 className="text-5xl font-serif gold-gradient italic uppercase tracking-tighter leading-none mb-6">{product.name}</h2>
                  <p className="text-gray-400 text-lg font-light leading-relaxed italic">"{product.description}"</p>
               </div>

               <div className="grid grid-cols-2 gap-10 border-y border-white/5 py-10">
                  <div>
                     <p className="ai-sub-headline opacity-40 mb-2">Giá niêm yết (Node Price)</p>
                     <p className="text-4xl font-mono font-black text-white">{product.price.toLocaleString()} đ</p>
                  </div>
                  <div>
                     <p className="ai-sub-headline opacity-40 mb-2">Lead-time Dự kiến</p>
                     <p className="text-4xl font-serif text-amber-500 italic">{product.leadTime} <span className="text-sm font-black uppercase">Ngày</span></p>
                  </div>
               </div>

               <div className="space-y-6">
                  <h4 className="ai-sub-headline text-indigo-400">Thông số Kỹ thuật (OMEGA SPECS)</h4>
                  <div className="grid grid-cols-2 gap-6">
                    {Object.entries(product.specifications).map(([k, v]) => (
                      <div key={k} className="flex flex-col gap-1">
                         <span className="text-[10px] text-gray-600 uppercase font-black">{k}</span>
                         {/* Fix: Casting v to any to avoid unknown type error in JSX */}
                         <span className="text-sm text-gray-200 italic">{(v as any)}</span>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="pt-10 flex flex-wrap gap-4">
                  <div className="flex items-center border border-white/10 rounded-2xl bg-white/5 p-1 h-14">
                     <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-full text-2xl text-gray-500 hover:text-white">-</button>
                     <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="w-16 bg-transparent text-center font-mono font-bold text-white focus:outline-none" />
                     <button onClick={() => setQty(qty+1)} className="w-12 h-full text-2xl text-gray-500 hover:text-white">+</button>
                  </div>
                  
                  <button onClick={() => { onAddToCart(product, qty); onClose(); }} className="flex-1 h-14 bg-white text-black font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl hover:bg-cyan-400 transition-all text-[10px] px-6">
                    Ủy nhiệm RFQ (Báo giá)
                  </button>
                  
                  {product.isCustomizable && (
                    <button onClick={onRequestCustomization} className="h-14 px-8 border border-amber-500 text-amber-500 font-black uppercase tracking-widest rounded-2xl hover:bg-amber-500/10 transition-all text-[10px]">
                      Customize
                    </button>
                  )}

                  <button 
                    onClick={() => setShowAppraisal(true)}
                    className="h-14 px-8 border border-white/10 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all text-[10px]"
                  >
                    Request Appraisal
                  </button>
               </div>
            </div>
          </div>
        </div>

        {/* Appraisal Modal Overlay */}
        {showAppraisal && (
          <div className="absolute inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in zoom-in-95 duration-300">
             <div className="bg-[#0a0a0a] w-full max-w-lg p-10 rounded-[3rem] border border-amber-500/30 relative shadow-[0_0_100px_rgba(245,158,11,0.1)] flex flex-col items-center text-center">
                <button 
                  onClick={() => setShowAppraisal(false)} 
                  className="absolute top-8 right-8 text-2xl text-gray-600 hover:text-white transition-colors"
                >✕</button>

                <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-4xl mb-6 shadow-xl">
                   📜
                </div>

                <h3 className="text-3xl font-serif gold-gradient italic uppercase tracking-tighter mb-2">Digital Appraisal</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mb-8">Chứng thư định giá Tài sản Master</p>

                <div className="w-full bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4 mb-8">
                   <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Sản phẩm</span>
                      <span className="text-xs text-white font-bold max-w-[200px] truncate text-right">{product.name}</span>
                   </div>
                   <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Trọng lượng Vàng</span>
                      <span className="text-xs text-amber-500 font-mono">{(product.weight || 1.25).toFixed(2)} chỉ (Est)</span>
                   </div>
                   <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Đá quý</span>
                      <span className="text-xs text-cyan-400 font-mono">{product.specifications['Đá chủ'] || 'N/A'}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Giá trị ước tính</span>
                      <span className="text-xl text-white font-mono font-black">{product.price.toLocaleString()} đ</span>
                   </div>
                </div>

                <div className="flex gap-2 items-center text-[9px] text-gray-600 font-mono italic mb-8">
                   <span>Signed by:</span>
                   <span className="text-amber-600 font-bold">MASTER NATT (GEMOLOGIST)</span>
                   <span>•</span>
                   <span>{new Date().toLocaleDateString()}</span>
                </div>

                <button 
                  onClick={() => setShowAppraisal(false)}
                  className="w-full py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-amber-400 transition-all shadow-xl"
                >
                   TẢI VỀ CHỨNG THƯ (PDF)
                </button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetailModal;
