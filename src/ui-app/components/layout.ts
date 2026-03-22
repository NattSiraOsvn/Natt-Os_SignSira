import React, { useState, ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { 
  Terminal, 
  Cpu, 
  Database, 
  Shield, 
  Zap, 
  Cloud, 
  BarChart3,
  Settings,
  Bell,
  User,
  Search,
  Menu,
  X,
  Home,
  FileText,
  Server,
  Network,
  Lock,
  Globe
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showSidebar = true }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'database', label: 'Database', icon: <Database className="w-5 h-5" /> },
    { id: 'servers', label: 'Servers', icon: <Server className="w-5 h-5" /> },
    { id: 'network', label: 'Network', icon: <Network className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Lock className="w-5 h-5" /> },
    { id: 'cloud', label: 'Cloud Services', icon: <Cloud className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  // System metrics
  const systemMetrics = [
    { label: 'CPU Usage', value: '42%', icon: <Cpu className="w-4 h-4" />, color: 'text-blue-400' },
    { label: 'Memory', value: '7.8/16GB', icon: <Database className="w-4 h-4" />, color: 'text-green-400' },
    { label: 'Network', value: '245 MB/s', icon: <Zap className="w-4 h-4" />, color: 'text-yellow-400' },
    { label: 'Security', value: 'Active', icon: <Shield className="w-4 h-4" />, color: 'text-purple-400' },
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        {/* Top Navigation Bar - Fixed */}
        <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-lg border-b border-gray-800">
          <div className="px-3 sm:px-4 lg:px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Logo & Mobile Menu Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 hover:bg-gray-800 rounded-lg"
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Terminal className="w-4 h-4 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h1 className="text-base sm:text-xl font-bold leading-tight">NATT-OS</h1>
                    <p className="text-xs text-gray-400 font-mono hidden sm:block">Terminal v2.1</p>
                  </div>
                </div>
              </div>

              {/* Center: Search (Desktop only) */}
              <div className="hidden lg:flex flex-1 max-w-xl mx-6">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search commands, files, or analytics..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Right: User Actions */}
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Mobile Search Button */}
                <button className="lg:hidden p-2 hover:bg-gray-800 rounded-lg">
                  <Search className="w-5 h-5" />
                </button>
                
                {/* Notifications */}
                <button className="relative p-2 hover:bg-gray-800 rounded-lg">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                {/* Settings */}
                <button className="p-2 hover:bg-gray-800 rounded-lg">
                  <Settings className="w-5 h-5" />
                </button>
                
                {/* User Profile */}
                <div className="hidden sm:flex items-center gap-2 p-2 hover:bg-gray-800 rounded-lg cursor-pointer">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                  <div className="hidden lg:block">
                    <div className="text-sm font-medium">Administrator</div>
                    <div className="text-xs text-gray-400">admin@natt-os.com</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Search Bar (when active) */}
          <div className="lg:hidden px-3 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
            <div 
              className="absolute left-0 top-0 bottom-0 w-64 bg-gray-900 border-r border-gray-800 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <Terminal className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="font-bold">NATT-OS</h2>
                      <p className="text-xs text-gray-400">Terminal</p>
                    </div>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-800 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* User Info in Mobile Menu */}
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">Administrator</div>
                    <div className="text-sm text-gray-400">admin@natt-os.com</div>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation */}
              <nav className="p-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-3 px-3">NAVIGATION</h3>
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                        activeTab === item.id
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                          : 'hover:bg-gray-800'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>

                {/* System Status in Mobile Menu */}
                <div className="mt-8">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3 px-3">SYSTEM STATUS</h3>
                  <div className="space-y-2">
                    {systemMetrics.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between px-3 py-2 hover:bg-gray-800/50 rounded">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${metric.color} bg-gray-800`}>
                            {metric.icon}
                          </div>
                          <span className="text-sm">{metric.label}</span>
                        </div>
                        <span className="font-bold text-sm">{metric.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </nav>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex">
          {/* Desktop Sidebar - Hidden on mobile */}
          {showSidebar && (
            <aside className="hidden lg:block w-64 xl:w-72 border-r border-gray-800 bg-gray-900/50 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto">
              {/* Navigation */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-4">NAVIGATION</h3>
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-left ${
                        activeTab === item.id
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                          : 'hover:bg-gray-800'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* System Status */}
              <div className="p-4 border-t border-gray-800">
                <h3 className="text-sm font-semibold text-gray-400 mb-4">SYSTEM STATUS</h3>
                <div className="space-y-3">
                  {systemMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-800/30 rounded">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gray-800 ${metric.color}`}>
                          {metric.icon}
                        </div>
                        <span className="text-sm">{metric.label}</span>
                      </div>
                      <span className="font-bold">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-4 border-t border-gray-800">
                <h3 className="text-sm font-semibold text-gray-400 mb-4">QUICK ACTIONS</h3>
                <div className="space-y-2">
                  <button className="w-full text-left p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition text-sm">
                    ↻ Refresh All Data
                  </button>
                  <button className="w-full text-left p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition text-sm">
                    📊 Generate Report
                  </button>
                  <button className="w-full text-left p-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:opacity-90 transition text-sm font-medium">
                    + New Terminal Session
                  </button>
                </div>
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className={`flex-1 ${showSidebar ? '' : 'w-full'}`}>
            <div className="p-3 sm:p-4 lg:p-6">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4 sm:mb-6">
                <span className="hover:text-white cursor-pointer">Home</span>
                <span>/</span>
                <span className="text-white">{navItems.find(item => item.id === activeTab)?.label || 'Dashboard'}</span>
              </div>

              {/* Page Content */}
              <div className="space-y-4 sm:space-y-6">
                {children}
              </div>

              {/* Mobile Quick Actions */}
              <div className="lg:hidden mt-6">
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition text-sm">
                    ↻ Refresh
                  </button>
                  <button className="p-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:opacity-90 transition text-sm font-medium">
                    + New Session
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-800 bg-gray-900/50">
          <div className="px-3 sm:px-4 lg:px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Terminal className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-sm sm:text-base">NATT-OS Terminal</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  © 2024 Unified Enterprise Intelligence Platform
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
                <a href="#" className="text-xs sm:text-sm text-gray-400 hover:text-white transition">Docs</a>
                <a href="#" className="text-xs sm:text-sm text-gray-400 hover:text-white transition">API</a>
                <a href="#" className="text-xs sm:text-sm text-gray-400 hover:text-white transition">Support</a>
                <a href="#" className="text-xs sm:text-sm text-gray-400 hover:text-white transition">Status</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default Layout;
