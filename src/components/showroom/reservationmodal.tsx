import React from "react";
interface Props { productId: string; onClose: () => void; }
export const ReservationModal: React.FC<Props> = ({ productId, onClose }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="bg-gray-900 p-8 rounded-xl max-w-md w-full">
      <h3 className="text-white font-bold mb-4">Đặt chỗ sản phẩm</h3>
      <p className="text-gray-400 text-sm mb-6">Mã: {productId}</p>
      <button onClick={onClose} className="bg-amber-500 text-black px-6 py-2 rounded font-bold">Đóng</button>
    </div>
  </div>
);
