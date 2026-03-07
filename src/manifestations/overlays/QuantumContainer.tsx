import React, { ReactNode } from "react";
import { useQuantumUI } from "../../neuro-link/context/QuantumUIContext";

interface QuantumContainerProps { children: ReactNode; className?: string; mode?: string; isOpen?: boolean; onClose?: () => void; title?: string; }

const QuantumContainer: React.FC<QuantumContainerProps> = ({ children, className = "" }) => {
  const { state } = useQuantumUI();
  return (
    <div className={`quantum-container ${state.pulseActive ? "pulse" : ""} ${className}`}
      style={{ background: state.theme === "QUANTUM" ? "radial-gradient(ellipse at center, #0a0a1a 0%, #000 100%)" : undefined }}>
      {children}
    </div>
  );
};

export default QuantumContainer;
