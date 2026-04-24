
import React, { useState, useEffect, useCallback } from 'react';
import AppShell from './AppShell';
import DynamicModuleRenderer from './DynamicModuleRenderer';
import SecurityOverlay from './SecurityOverlay';
import NotificationHub, { AppNotification } from './NotificationHub';
import NotificationPortal from './NotificationPortal';
import { ViewType, ActionLog, BusinessMetrics, UserRole, UserPosition, PositionType, PersonaID } from '../types';
import { RBACEngine } from '@/cells/kernel/rbac-cell/domain/engines/rbac-authority.engine';
import { NotifyBus } from '@/cells/infrastructure/notification-cell/domain/services/notification.service';
import { ShardingService } from '@/cells/kernel/audit-cell/domain/engines/blockchain-shard.engine';
import OfflineService from '@/cells/infrastructure/sync-cell/domain/engines/offline.engine';
import { RealTimeService } from '@/cells/infrastructure/notification-cell/domain/engines/realtime-notify.engine';

// --- QUANTUM ARCHITECTURE IMPORTS ---
import { QuantumUIProvider, useQuantumUI } from '../contexts/QuantumUIContext';
import QuantumContainer from './QuantumContainer';

// Wrapper component to access Context
const QuantumAppWrapper: React.FC = () => {
  const { overlayConfig, collapseWave } = useQuantumUI();
  
  // State Management
  const [activeView, setActiveView] = useState<ViewType>(ViewType.dashboard);
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.MASTER);
  
  // 1️⃣ Fix: Khởi tạo currentPosition như một Object Interface thay vì Enum string
  const [currentPosition, setCurrentPosition] = useState<UserPosition>({
    id: 'TL-CFO-001',
    role: PositionType.CFO,
    scope: ['ALL_ACCESS']
  });

  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotiHub, setShowNotiHub] = useState(false);
  
  const [metrics, setMetrics] = useState<BusinessMetrics>({
    revenue: 449120000000,
    revenue_pending: 1200000000,
    goldInventory: 850.2,
    productionProgress: 96,
    invoicesIssued: 156,
    riskScore: 0,
    lastUpdate: Date.now(),
    totalTaxDue: 852000000,
    totalPayroll: 1245000000,
    currentOperatingCost: 520000000,
    importVolume: 12,
    pendingApprovals: 8,
    cadPending: 5,
    totalCogs: 300000000, 
    totalOperating: 150000000
  });

  useEffect(() => {
    OfflineService.init().catch(err => console.error("OfflineService init failed:", err));
    RealTimeService.connect();

    RBACEngine.registerUser({
      fullName: 'Master Natt',
      email: 'natt@luxurytam.com',
      department: 'Hội đồng Quản trị',
      roleId: UserRole.MASTER,
      position: currentPosition.role // Sử dụng role từ object
    });

    setTimeout(() => {
       NotifyBus.push({
          type: 'NEWS',
          title: 'Hệ thống đã Sẵn Sàng',
          content: 'Chào Anh Natt, thiên đã đồng bộ hóa 100% các Shard dữ liệu. Hệ thống đang ở trạng thái bảo mật OMEGA.',
          persona: PersonaID.THIEN
       });
    }, 1500);

    return () => {
      RealTimeService.disconnect();
    };
  }, []);

  const pushNotification = useCallback((noti: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNoti: AppNotification = {
       ...noti,
       id: Math.random().toString(36).substring(7),
       timestamp: Date.now(),
       isRead: false
    };
    setNotifications(prev => [newNoti, ...prev].slice(0, 50));
    if (noti.priority === 'HIGH') setShowNotiHub(true);
  }, []);

  const logAction = (action: string, details: string) => {
    const timestamp = Date.now();
    const actionId = Math.random().toString(36).substring(7).toUpperCase();
    const hash = ShardingService.generateShardHash({ action, details, timestamp, user: currentPosition.role });
    
    const newLog: ActionLog = {
      id: actionId,
      timestamp,
      module: activeView,
      action,
      details,
      userId: `USR-${currentPosition.id}`,
      userPosition: currentPosition.role,
      hash: hash
    };
    setActionLogs(prev => [newLog, ...prev].slice(0, 500));
  };

  const updateFinance = (data: Partial<BusinessMetrics>) => {
    setMetrics(prev => ({ ...prev, ...data }));
    if (data.revenue_pending) {
       NotifyBus.push({
          type: 'ORDER',
          title: 'Đơn Hàng Mới Xuất Hiện',
          content: 'Hệ thống vừa bóc tách một yêu cầu báo giá giá trị cao từ Showroom Hub.',
          metadata: { value: data.revenue_pending.toLocaleString() + ' đ', source: 'Showroom' }
       });
    }
  };

  return (
    <>
      <SecurityOverlay autoLockDelay={600000} blurSensitiveData={true}>
        <AppShell 
          activeView={activeView} 
          setActiveView={setActiveView} 
          currentRole={currentRole} 
          setCurrentRole={setCurrentRole}
          currentPosition={currentPosition}
          setCurrentPosition={setCurrentPosition}
          notificationCount={notifications.filter(n => !n.isRead).length}
          onOpenNotifications={() => setShowNotiHub(true)}
        >
          <NotificationPortal />
          
          {showNotiHub && (
            <NotificationHub 
              notifications={notifications}
              onClose={() => setShowNotiHub(false)}
              onMarkAsRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? {...n, isRead: true} : n))}
            />
          )}

          <div className="h-full relative overflow-hidden">
            <DynamicModuleRenderer 
               view={activeView}
               setActiveView={setActiveView}
               currentRole={currentRole}
               currentPosition={currentPosition} // Truyền object hoàn chỉnh
               metrics={metrics}
               actionLogs={actionLogs}
               logAction={logAction}
               updateFinance={updateFinance}
            />
          </div>
        </AppShell>
      </SecurityOverlay>

      <QuantumContainer 
        mode={overlayConfig.mode} 
        isOpen={overlayConfig.mode !== 'NONE'} 
        onClose={collapseWave}
        title={overlayConfig.title}
      >
        {overlayConfig.component}
      </QuantumContainer>
    </>
  );
};

const App: React.FC = () => {
  return (
    <QuantumUIProvider>
      <QuantumAppWrapper />
    </QuantumUIProvider>
  );
};

export default App;
