import React from "react";
export const SpecificationBlock: React.FC<{ specs: Record<string, string> }> = ({ specs }) => (
  <div className="grid grid-cols-2 gap-2">
    {Object.entries(specs).map(([k, v]) => (
      <div key={k} className="text-xs"><span className="text-gray-500">{k}:</span> <span className="text-white">{v}</span></div>
    ))}
  </div>
);
