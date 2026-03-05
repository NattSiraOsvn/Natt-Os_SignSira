
/**
 * 🔄 NATT-OS COMPONENT REDIRECT
 * Logic SalesCRM đã được hợp nhất vào SalesTerminal để đảm bảo tính nhất quán.
 */
import React from 'react';
// Fixed: Changed named import to default import to match the default export in src/cells/sales-cell/SalesTerminal.tsx
import SaleTerminal from '@/cells/business/sales-cell/salesterminal';
import { UserRole, UserPosition, BusinessMetrics, PositionType, Department } from '@/types';

interface SalesCRMProps {
  logAction: (action: string, details: string, undoData?: any) => void;
  metrics: BusinessMetrics;
  updateFinance: (data: Partial<BusinessMetrics>) => void;
  currentRole?: UserRole;
  currentPosition?: UserPosition;
}

const SalesCRM: React.FC<SalesCRMProps> = ({ logAction, metrics, updateFinance, currentRole, currentPosition }) => {
  // Fallback defaults for legacy usage
  const role = currentRole || UserRole.SALES_STAFF;
  const position = currentPosition || { id: 'LEGACY', role: PositionType.CONSULTANT, department: Department.SALES, scope: [] };

  return (
    <SaleTerminal 
        logAction={logAction}
        metrics={metrics}
        updateFinance={updateFinance}
        currentRole={role}
        currentPosition={position}
    />
  );
};

export default SalesCRM;
