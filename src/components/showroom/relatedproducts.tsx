import React from "react";
import type { ShowroomProduct } from "@/types/showroom";
export const RelatedProducts: React.FC<{ products: ShowroomProduct[] }> = ({ products }) => (
  <div className="grid grid-cols-2 gap-4">
    {products.map(p => (
      <div key={p.id} className="text-sm text-white">{p.name}</div>
    ))}
  </div>
);
