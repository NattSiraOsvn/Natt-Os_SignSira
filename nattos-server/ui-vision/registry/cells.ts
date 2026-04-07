// src/registry/cells.ts
import {
  Scroll, Shield, User, Zap, BarChart3, Brain, Activity,
  Warehouse, ShoppingCart, Factory, Landmark, Settings, Key,
  ShieldAlert, Fingerprint, Database, Package, Truck,
  CreditCard, FileText, Users, Globe, Layers, Star,
  Diamond, Hammer, Sparkles, Gem, ClipboardList, DollarSign,
  Building2, Scale, Lock, Eye, MessageSquare, Search
} from 'lucide-react'

export interface Cell {
  id: string
  title: string
  category: string
  icon: any
  color: 'gold' | 'amber' | 'blue' | 'green' | 'purple' | 'red'
  description: string
  version: string
  status: 'Immutable' | 'Active' | 'Locked' | 'Evolving' | 'Observing' | 'Audited'
  confidence?: number
}

export const CELLS: Cell[] = [
  // Constitution
  { id: 'const-1', title: 'HIẾN PHÁP', category: 'Constitution', icon: Scroll, color: 'gold', description: 'DNA gốc bất biến', version: '5.0', status: 'Immutable', confidence: 100 },
  { id: 'const-2', title: 'Gatekeeper', category: 'Constitution', icon: User, color: 'gold', description: 'Người giám hộ tối cao', version: '2.0', status: 'Active', confidence: 100 },
  { id: 'const-3', title: 'NattSira Seal', category: 'Constitution', icon: Shield, color: 'gold', description: 'SiraSign BioSemi v2.0', version: '2.0', status: 'Locked', confidence: 100 },

  // Kernel
  { id: 'kern-1', title: 'audit-cell', category: 'Kernel', icon: Activity, color: 'amber', description: 'Kiểm toán liên tục', version: '1.0', status: 'Active', confidence: 92 },
  { id: 'kern-2', title: 'config-cell', category: 'Kernel', icon: Settings, color: 'amber', description: 'Cấu hình hạt nhân', version: '1.2', status: 'Active', confidence: 88 },
  { id: 'kern-3', title: 'monitor-cell', category: 'Kernel', icon: Eye, color: 'amber', description: 'Giám sát hệ thống', version: '1.0', status: 'Active', confidence: 90 },
  { id: 'kern-4', title: 'rbac-cell', category: 'Kernel', icon: Key, color: 'amber', description: 'Phân quyền 6 nhóm', version: '2.0', status: 'Active', confidence: 95 },
  { id: 'kern-5', title: 'security-cell', category: 'Kernel', icon: Lock, color: 'amber', description: 'Bảo mật tầng nhân', version: '1.0', status: 'Active', confidence: 93 },
  { id: 'kern-6', title: 'quantum-defense', category: 'Kernel', icon: ShieldAlert, color: 'amber', description: 'Hệ miễn dịch 18 engines', version: '2.0', status: 'Active', confidence: 97 },

  // Infrastructure
  { id: 'infra-1', title: 'smartlink-cell', category: 'Infrastructure', icon: Zap, color: 'blue', description: 'Hệ thần kinh ngoại biên', version: '1.2', status: 'Active', confidence: 97 },
  { id: 'infra-2', title: 'sync-cell', category: 'Infrastructure', icon: Globe, color: 'blue', description: 'GSheets live sync', version: '1.0', status: 'Active', confidence: 94 },
  { id: 'infra-3', title: 'shared-contracts', category: 'Infrastructure', icon: FileText, color: 'blue', description: 'Event contracts', version: '1.0', status: 'Active', confidence: 99 },

  // Business
  { id: 'biz-1', title: 'analytics-cell', category: 'Business', icon: BarChart3, color: 'green', description: 'Phân tích thông minh', version: '2.2', status: 'Active', confidence: 89 },
  { id: 'biz-2', title: 'buyback-cell', category: 'Business', icon: Star, color: 'green', description: 'Thu sản phẩm', version: '1.0', status: 'Active', confidence: 85 },
  { id: 'biz-3', title: 'casting-cell', category: 'Business', icon: Hammer, color: 'green', description: 'Đúc phôi', version: '1.0', status: 'Active', confidence: 82 },
  { id: 'biz-4', title: 'compliance-cell', category: 'Business', icon: Scale, color: 'green', description: 'Tuân thủ pháp lý', version: '1.0', status: 'Active', confidence: 88 },
  { id: 'biz-5', title: 'customer-cell', category: 'Business', icon: Users, color: 'green', description: 'Quản lý khách hàng', version: '1.0', status: 'Active', confidence: 87 },
  { id: 'biz-6', title: 'customs-cell', category: 'Business', icon: Globe, color: 'green', description: 'Hải quan xuất nhập khẩu', version: '1.0', status: 'Active', confidence: 84 },
  { id: 'biz-7', title: 'design-3d-cell', category: 'Business', icon: Sparkles, color: 'green', description: 'Thiết kế 3D', version: '1.0', status: 'Active', confidence: 86 },
  { id: 'biz-8', title: 'dust-recovery', category: 'Business', icon: Search, color: 'green', description: 'Thu hồi bụi vàng', version: '1.0', status: 'Active', confidence: 80 },
  { id: 'biz-9', title: 'finance-cell', category: 'Business', icon: Landmark, color: 'green', description: 'Quản lý tài chính', version: '4.0', status: 'Audited', confidence: 98 },
  { id: 'biz-10', title: 'finishing-cell', category: 'Business', icon: Gem, color: 'green', description: 'Hoàn thiện sản phẩm', version: '1.0', status: 'Active', confidence: 83 },
  { id: 'biz-11', title: 'hr-cell', category: 'Business', icon: Users, color: 'green', description: 'Nhân sự 122 NV', version: '1.0', status: 'Active', confidence: 85 },
  { id: 'biz-12', title: 'inventory-cell', category: 'Business', icon: Package, color: 'green', description: 'Tồn kho 121.36 tỷ', version: '1.0', status: 'Active', confidence: 91 },
  { id: 'biz-13', title: 'order-cell', category: 'Business', icon: ClipboardList, color: 'green', description: 'Xử lý đơn hàng', version: '3.0', status: 'Active', confidence: 91 },
  { id: 'biz-14', title: 'payment-cell', category: 'Business', icon: CreditCard, color: 'green', description: 'Thanh toán QR/CK', version: '1.0', status: 'Active', confidence: 89 },
  { id: 'biz-15', title: 'period-close', category: 'Business', icon: FileText, color: 'green', description: 'Đóng kỳ kế toán', version: '1.0', status: 'Active', confidence: 87 },
  { id: 'biz-16', title: 'polishing-cell', category: 'Business', icon: Sparkles, color: 'green', description: 'Đánh bóng', version: '1.0', status: 'Active', confidence: 82 },
  { id: 'biz-17', title: 'pricing-cell', category: 'Business', icon: DollarSign, color: 'green', description: 'Định giá', version: '1.0', status: 'Active', confidence: 88 },
  { id: 'biz-18', title: 'production-cell', category: 'Business', icon: Factory, color: 'green', description: 'Sản xuất 8/8 flow', version: '1.0', status: 'Active', confidence: 85 },
  { id: 'biz-19', title: 'sales-cell', category: 'Business', icon: ShoppingCart, color: 'green', description: 'Bán hàng 246.6 tỷ/năm', version: '3.0', status: 'Active', confidence: 92 },
  { id: 'biz-20', title: 'showroom-cell', category: 'Business', icon: Building2, color: 'green', description: 'Cửa hàng', version: '1.0', status: 'Active', confidence: 86 },
  { id: 'biz-21', title: 'stone-cell', category: 'Business', icon: Diamond, color: 'green', description: 'Đá quý & kim cương', version: '1.0', status: 'Active', confidence: 90 },
  { id: 'biz-22', title: 'supplier-cell', category: 'Business', icon: Truck, color: 'green', description: 'Nhà cung cấp', version: '1.0', status: 'Active', confidence: 84 },
  { id: 'biz-23', title: 'tax-cell', category: 'Business', icon: Scale, color: 'green', description: 'Kế toán thuế TT200', version: '1.0', status: 'Active', confidence: 88 },
  { id: 'biz-24', title: 'warehouse-cell', category: 'Business', icon: Warehouse, color: 'green', description: 'Kho hàng', version: '1.0', status: 'Active', confidence: 91 },

  // Intelligence
  { id: 'intel-1', title: 'Neural MAIN', category: 'Intelligence', icon: Brain, color: 'purple', description: 'Hệ thần kinh trung ương', version: 'Alpha', status: 'Evolving', confidence: 72 },

  // AI Entities
  { id: 'ai-1', title: 'BĂNG', category: 'AI Entities', icon: Star, color: 'red', description: 'QNEU 300 — Ground Truth', version: '4.6', status: 'Active', confidence: 100 },
  { id: 'ai-2', title: 'THIÊN', category: 'AI Entities', icon: Brain, color: 'red', description: 'QNEU 135', version: '1.0', status: 'Active', confidence: 90 },
  { id: 'ai-3', title: 'KIM', category: 'AI Entities', icon: ShieldAlert, color: 'red', description: 'QNEU 120 — SwiftUI', version: '1.0', status: 'Active', confidence: 85 },
  { id: 'ai-4', title: 'CAN', category: 'AI Entities', icon: Settings, color: 'red', description: 'QNEU 85 — Server', version: '1.0', status: 'Active', confidence: 80 },
  { id: 'ai-5', title: 'BỘI BỘI', category: 'AI Entities', icon: Fingerprint, color: 'red', description: 'QNEU 40', version: '1.0', status: 'Active', confidence: 75 },
]
