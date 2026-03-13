// @ts-nocheck

import React from 'react';
import { ViewType, UserRole, UserPosition, BusinessMetrics, ActionLog } from '../types';
import { MODULE_REGISTRY } from '@/core/registry/moduleRegistry';

// Components
import Dashboard from './Dashboard';
import MasterDashboard from './MasterDashboard';
import SalesTerminal from './SalesTerminal';
import ProductCatalog from './ProductCatalog';
import SellerTerminal from './SellerTerminal';
import OperationsTerminal from './OperationsTerminal';
import ProductionManager from './ProductionManager';
import ProductionWallboard from './ProductionWallboard';
import DailyReportModule from './DailyReportModule';
import WarehouseManagement from './WarehouseManagement';
import { SupplierClassificationPanel } from './SupplierClassificationPanel';
import SalesTaxModule from './SalesTaxModule';
import TaxReportingHub from './TaxReportingHub';
import BankingProcessor from './BankingProcessor';
import GovernanceWorkspace from './GovernanceWorkspace';
import AdvancedAnalytics from './AdvancedAnalytics';
import RFMAnalysis from './RFMAnalysis';
import CompliancePortal from './CompliancePortal';
import OmegaProcessor from './OmegaProcessor';
import LearningHub from './LearningHub';
import SystemMonitor from './SystemMonitor';
import DevPortal from './DevPortal';
import RBACManager from './RBACManager';
import ThienCommandCenter from './ThienCommandCenter';
import ChatConsultant from './ChatConsultant';
import CollaborationRooms from './CollaborationRooms';
import KrisEmailHub from './KrisEmailHub';
import AuditTrailModule from './AuditTrailModule';
import PaymentHub from './PaymentHub';
import UnifiedReportingHub from './UnifiedReportingHub';
import SalesArchitectureView from './SalesArchitectureView';
import ProductionSalesFlowView from './ProductionSalesFlowView';
import SystemNavigator from './SystemNavigator';
import DataArchiveVault from './DataArchiveVault';
import QuantumFlowOrchestrator from './QuantumFlowOrchestrator';
import AdminConfigHub from './AdminConfigHub';
import FinancialDashboard from './financial/FinancialDashboard'; 
import PersonalSphere from './PersonalSphere'; 
import CalibrationWizard from './CalibrationWizard';

interface DynamicModuleRendererProps {
  view: ViewType;
  currentRole: UserRole;
  currentPosition: UserPosition;
  metrics: BusinessMetrics;
  actionLogs: ActionLog[];
  logAction: (action: string, details: string) => void;
  updateFinance: (data: Partial<BusinessMetrics>) => void;
  setActiveView: (view: ViewType) => void; 
}

const DynamicModuleRenderer: React.FC<DynamicModuleRendererProps> = (props) => {
  const { view, currentRole, currentPosition, metrics, actionLogs, logAction, updateFinance, setActiveView } = props;
  const isMaster = currentRole === UserRole.MASTER;
  const commonProps = { logAction, metrics, updateFinance, currentRole, currentPosition, actionLogs };

  const ComponentMap: Record<string, React.FC<any>> = {
    Dashboard, MasterDashboard, SalesTerminal, ProductCatalog, SellerTerminal,
    OperationsTerminal, ProductionManager, ProductionWallboard, DailyReportModule,
    WarehouseManagement, SupplierClassificationPanel, SalesTaxModule, TaxReportingHub, 
    BankingProcessor, GovernanceWorkspace, AdvancedAnalytics, RFMAnalysis, CompliancePortal,
    OmegaProcessor, LearningHub, SystemMonitor, DevPortal, RBACManager,
    ThienCommandCenter, ChatConsultant, CollaborationRooms, KrisEmailHub,
    AuditTrailModule, PaymentHub, UnifiedReportingHub, SalesArchitectureView,
    ProductionSalesFlowView, SystemNavigator, DataArchiveVault, QuantumFlowOrchestrator,
    AdminConfigHub, FinancialDashboard, PersonalSphere, CalibrationWizard
  };

  if ((view as any) === 'dashboard' || view === ViewType.MASTER_DASHBOARD && isMaster) return <MasterDashboard {...commonProps} />;
  
  const config = MODULE_REGISTRY[view] ?? MODULE_REGISTRY[String(view).toUpperCase()];
  const SelectedComponent = config ? ComponentMap[config.componentName] : null;

  if (!SelectedComponent) {
    return (
      <div className="h-full flex flex-col items-center justify-center opacity-20">
        <div className="text-9xl mb-10 animate-pulse">⚙️</div>
        <p className="text-2xl font-serif italic uppercase tracking-widest">Shard {view} đang đồng bộ...</p>
      </div>
    );
  }

  if (config.componentName === 'SystemNavigator') {
      return (
        <div className="h-full animate-in fade-in duration-500 overflow-hidden">
          <SystemNavigator setActiveView={setActiveView} />
        </div>
      );
  }

  return (
    <div className="h-full animate-in fade-in duration-500 overflow-hidden">
      <SelectedComponent {...commonProps} />
    </div>
  );
};

export default DynamicModuleRenderer;
