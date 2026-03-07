import React from "react";
export const OwnerVault: React.FC<{ productId?: string; location?: string }> = ({ productId }) => (
  <div className="text-xs text-amber-500 font-mono">OWNER VAULT: {productId}</div>
);
