import React from "react";
export const BranchContextPanel: React.FC<{ branch?: string }> = ({ branch }) => (
  <div className="text-xs text-gray-500 font-mono">{branch ?? "Tâm Luxury — Chi nhánh chính"}</div>
);
