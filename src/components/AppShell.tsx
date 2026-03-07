
import React, { useState, ReactNode, useMemo } from 'react';
import { ViewType, UserRole, ModuleConfig, HeatLevel, UserPosition, PositionType } from '../types';
import { PersonnelEngine } from '../services/personnelEngine';
import ModuleRegistry from '../services/moduleRegistry';
import SystemTicker from './SystemTicker';

interface AppShellProps {
  children: ReactNode;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentPosition: UserPosition;
  setCurrentPosition: (pos: UserPosition) => void;
  notificationCount?: number;
  onOpenNotifications?: () => void;
}

const AppShell: React.FC<AppShellProps> = ({ 
  children, activeView, setActiveView, 
  currentRole, setCurrentRole, 
  currentPosition, setCurrentPosition,
  notificationCount = 0,
  onOpenNotifications
}) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  // PersonnelEngine mong đợi một role string để bóc tách profile
  const userProfile = useMemo(() => PersonnelEngine.getProfileByPosition(currentPosition.role), [currentPosition]);

  const handlePositionChange = (role: PositionType) => {
    // Tạo object UserPosition mới theo Interface
    const newPos: UserPosition = {
      id: `USR-${role}-${Math.floor(Math.random() * 1000)}`,
      role: role,
      scope: role === PositionType.CFO ? ['ALL_ACCESS'] : ['DEPARTMENT_ONLY']
    };
    
    setCurrentPosition(newPos);
    
    if (role === PositionType.CFO) setCurrentRole(UserRole.MASTER);
    else if ([PositionType.CEO, PositionType.CHAIRMAN].includes(role)) setCurrentRole(UserRole.LEVEL_1);
    else if (role.includes('MANAGER') || role.includes('DIRECTOR')) setCurrentRole(UserRole.LEVEL_2);
    else if (role === PositionType.COLLABORATOR) setCurrentRole(UserRole.LEVEL_7);
    else if (role === PositionType.ROUGH_FINISHER) setCurrentRole(UserRole.LEVEL_6);
    else setCurrentRole(UserRole.LEVEL_5);
  };

  const navGroups = useMemo(() => {
    const allModules = ModuleRegistry.getAllModules();
    const accessibleModules = allModules.filter(m => 
      m.active && (currentRole === UserRole.MASTER || m.allowedRoles.includes(currentRole))
    );
    const grouped = accessibleModules.reduce((acc, module) => {
      const groupName = module.group;
      if (!acc[groupName]) acc[groupName] = [];
      acc[groupName].push(module);
      return acc;
    }, {} as Record<string, ModuleConfig[]>);
    return grouped;
  }, [currentRole]);

  return (
    <div className="flex h-screen w-screen bg-[#020202] overflow-hidden relative text-white">
      <aside className={`hidden md:flex flex-col transition-all duration-500 ease-in-out bg-black/95 backdrop-blur-3xl border-r border-white/5 z-50 ${isSidebarOpen ? 'w-80' : 'w-20'}`}>
        <div className="h-20 flex items-center justify-between px-6 shrink-0 border-b border-white/5 bg-gradient-to-r from-amber-500/5 to-transparent">
          <span className="ai-headline text-2xl tracking-tighter uppercase italic">{isSidebarOpen ? 'Natt-OS' : 'Ω'}</span>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-gray-600 hover:text-amber-500 transition-colors">{isSidebarOpen ? '«' : '»'}</button>
        </div>

        <nav className="flex-1 p-4 space-y-8 overflow-y-auto no-scrollbar pb-20">
          {(Object.entries(navGroups) as [string, ModuleConfig[]][]).map(([group, modules]) => modules.length > 0 && (
            <div key={group} className="space-y-1">
              {isSidebarOpen && <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.3em] mb-3 ml-3">{group}</p>}
              {modules.map(item => (
                <button 
                  key={item.id} 
                  onClick={() => setActiveView(item.view as any)} 
                  className={`w-full flex items-center p-3 rounded-xl transition-all relative group ${activeView === item.view ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                >
                  <span className="text-lg w-6 text-center shrink-0">{item.icon}</span>
                  {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest ml-4 truncate">{item.title}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 bg-white/[0.02] shrink-0">
           {isSidebarOpen && (
             <div className="mb-4">
                <p className="text-[8px] text-gray-500 uppercase font-black mb-3 tracking-widest">Identity Node</p>
                <select 
                  value={currentPosition.role} 
                  onChange={(e) => handlePositionChange(e.target.value as PositionType)} 
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-[9px] font-black uppercase text-amber-500 outline-none cursor-pointer"
                >
                   {(Object.keys(PositionType) as Array<keyof typeof PositionType>).map((key) => (
                     <option key={PositionType[key]} value={PositionType[key]}>{PositionType[key]}</option>
                   ))}
                </select>
             </div>
           )}
           <div className="flex items-center justify-between">
              <span className="text-[9px] text-gray-700 font-bold uppercase tracking-widest">V.2026.OMEGA</span>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
           </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <SystemTicker />
        <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-black/40 backdrop-blur-xl z-40">
           <div className="flex items-center gap-6">
              <div className={`w-3 h-3 rounded-full shadow-[0_0_20px] ${currentRole === UserRole.MASTER ? 'bg-amber-500 animate-pulse' : 'bg-blue-500'}`}></div>
              <div className="flex flex-col">
                 <span className="text-[11px] font-black uppercase tracking-widest text-white">{userProfile.fullName}</span>
                 <span className="text-[8px] text-gray-500 font-bold uppercase">{currentPosition.role} • {currentRole.split(' (')[0]}</span>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="flex bg-white/5 rounded-2xl border border-white/10 p-1">
                 <button onClick={onOpenNotifications} className="p-2.5 hover:bg-white/5 transition-colors relative">
                    <span className="text-xl">🔔</span>
                    {notificationCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[9px] flex items-center justify-center rounded-full font-black animate-bounce">{notificationCount}</span>}
                 </button>
                 <button onClick={() => setActiveView(ViewType.chat)} className="p-2.5 hover:bg-white/5 transition-colors text-xl">💬</button>
              </div>
              <button onClick={() => setActiveView(ViewType.command)} className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all shadow-xl ${currentRole === UserRole.MASTER ? 'bg-amber-500 text-black' : 'bg-white/5 text-gray-500'}`}>🔱</button>
           </div>
        </header>
        <div className="flex-1 overflow-hidden relative">
           {children}
        </div>
      </main>
    </div>
  );
};

export default AppShell;
