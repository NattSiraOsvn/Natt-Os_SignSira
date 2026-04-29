 — TODO: fix type errors, remove this pragma


import React from 'react';
import { ViewType, UserRole, UserPosition, BusinessMetrics, ActionLog } from '../types';
import { MODULE_REGISTRY } from '@/core/registry/moduleRegistry';

// Components
import Dashboard from './dashboard';
import MasterDashboard from './masterdashboard';
import SalesTerminal from './salesterminal';
import ProductCatalog from './productcatalog';
import SellerTerminal from './sellerterminal';
import OperationsTerminal from './operationsterminal';
import ProductionManager from './productionmanager';
import ProductionWallboard from './productionwallboard';
import DailyReportModule from './dailyreportmodule';
import WarehouseManagement from './warehousemanagement';
import { SupplierClassificationPanel } from './supplierclassificationpanel';
import SalesTaxModule from './salestaxmodule';
import TaxReportingHub from './taxreportinghub';
import BankingProcessor from './bankingprocessor';
import GovernanceWorkspace from './governanceworkspace';
import AdvancedAnalytics from './advancedanalytics';
import RFMAnalysis from './rfmanalysis';
import CompliancePortal from './complianceportal';
import OmegaProcessor from './omegaprocessor';
import LearningHub from './learninghub';
import SystemMonitor from './systemmonitor';
import DevPortal from './devportal';
import RBACManager from './rbacmanager';
import ThienCommandCenter from './thiencommandcenter';
import ChatConsultant from './chatconsultant';
import CollaborationRooms from './collaborationrooms';
import KrisEmailHub from './krisemailhub';
import AuditTrailModule from './audittrailmodule';
import PaymentHub from './paymenthub';
import UnifiedReportingHub from './unifiedreportinghub';
import SalesArchitectureView from './salesarchitectureview';
import ProductionSalesFlowView from './productionsalesflowview';
import SystemNavigator from './systemnavigator';
import DataArchiveVault from './dataarchivevault';
import QuantumFlowOrchestrator from './quantumfloworchestrator';
import AdminConfigHub from './adminconfighub';
import FinancialDashboard from './financial/financialdashboard'; 
import PersonalSphere from './personalsphere'; 
import CalibrationWizard from './calibration/calibrationwizard';

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
