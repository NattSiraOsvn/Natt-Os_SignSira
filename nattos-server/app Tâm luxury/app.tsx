
import React, { useState, useEffect, useCallback } from 'react';
import AppShell from './components/AppShell';
import DynamicModuleRenderer from './components/DynamicModuleRenderer';
import SecurityOverlay from './components/SecurityOverlay';
import NotificationHub, { AppNotification } from './components/NotificationHub';
import NotificationPortal from './components/NotificationPortal';
import { ViewType, ActionLog, BusinessMetrics, UserRole, UserPosition, PositionType, PersonaID } from './types';
import { RBACEngine } from './services/rbacEngine';
import { NotifyBus } from './services/notificationService';
import { ShardingService } from './services/blockchainService';
import OfflineService from './services/offlineService';
import { useQuantumUI } from './neuro-link/context/QuantumUIContext';
import QuantumContainer from './manifestations/overlays/QuantumContainer';

const App: React.FC = () => {
  // Lấy dữ liệu từ Context đã được bọc tại index.tsx
  const { overlayConfig, collapseWave } = useQuantumUI();
  
  // State Management
  const [activeView, setActiveView] = useState<ViewType>(ViewType.dashboard);
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.MASTER);
  /* Fix: Initialize currentPosition as an object matching UserPosition interface, not enum value */
  const [currentPosition, setCurrentPosition] = useState<UserPosition>({
    id: 'TL-CFO-001',
    role: PositionType.CFO,
    scope: ['ALL']
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

    RBACEngine.registerUser({
      fullName: 'Master Natt',
      email: 'natt@luxurytam.com',
      department: 'Hội đồng Quản trị',
      roleId: UserRole.MASTER,
      /* Fix: Use currentPosition object for registration */
      position: currentPosition
    });

    setTimeout(() => {
       NotifyBus.push({
          type: 'NEWS',
          title: 'Hệ thống đã Sẵn Sàng',
          content: 'Chào Anh Natt, Thiên đã đồng bộ hóa 100% các Shard dữ liệu. Hệ thống đang ở trạng thái bảo mật OMEGA.',
          persona: PersonaID.THIEN
       });
    }, 1500);
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
    /* Fix: currentPosition is an object, use role for hashing */
    const hash = ShardingService.generateShardHash({ action, details, timestamp, user: currentPosition.role });
    
    const newLog: ActionLog = {
      id: actionId,
      timestamp,
      module: activeView,
      action,
      details,
      /* Fix: currentPosition is an object, access id and role properties */
      userId: `USR-${currentPosition.id.substring(0, 3)}`,
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
               currentPosition={currentPosition}
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

export default App;
