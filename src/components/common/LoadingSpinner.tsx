
import React from "react";
const LoadingSpinner: React.FC<{ message?: string; size?: "sm"|"md"|"lg"; label?: string }> = ({ size="md", label }) => {
  const s = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" }[size];
  return (
    <div className="flex items-center justify-center gap-3">
      <div className={`${s} border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin`} />
      {label && <span className="text-xs text-gray-500 font-mono uppercase">{label}</span>}
    </div>
  );
};
export default LoadingSpinner;
