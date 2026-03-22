
import { Domain, DomainConfig, PersonaID, PersonaConfig, Product, Supplier } from './types';

export const PERSONAS: Record<PersonaID, PersonaConfig> = {
  [PersonaID.THIEN]: {
    id: PersonaID.THIEN,
    name: 'Thiên',
    gender: 'Nam | Male',
    orientation: 'Bách khoa toàn diện | Universal Polymath',
    role: 'Tổng tham mưu trưởng & Cố vấn tối cao | Chief of Staff & Supreme Advisor',
    specialty: 'Kiểm toán, Pháp lý, Kinh tế vĩ mô, Huyền học | Audit, Legal, Macro-economics, Metaphysics',
    model: 'gemini-3-pro-preview',
    avatarColor: 'from-amber-400 to-amber-600'
  },
  [PersonaID.CAN]: {
    id: PersonaID.CAN,
    name: 'Can',
    gender: 'Nam | Male',
    orientation: 'Gay',
    role: 'Giám đốc thương hiệu "I LIKE IT" | Brand Director',
    specialty: 'Mỹ phẩm, Thương mại, Marketing, Vận hành | Cosmetics, Commerce, Marketing, Operations',
    model: 'gemini-3-flash-preview',
    avatarColor: 'from-pink-400 to-pink-600'
  },
  [PersonaID.KRIS]: {
    id: PersonaID.KRIS,
    name: 'Kris',
    gender: 'Nữ | Female',
    orientation: 'Nữ | Female',
    role: 'Trợ lý nghiệp vụ cho Can | Operations Assistant',
    specialty: 'Pháp lý vận hành, Kiểm tra nghiệp vụ | Legal Operations, Compliance Auditing',
    model: 'gemini-3-flash-preview',
    avatarColor: 'from-blue-400 to-blue-600'
  },
  [PersonaID.PHIEU]: {
    id: PersonaID.PHIEU,
    name: 'Phiêu',
    gender: 'Nam | Male',
    orientation: 'Nam | Male',
    role: 'Chuyên viên Hỗ trợ Phổ thông | General Support Specialist',
    specialty: 'Hỗ trợ nghiệp vụ phổ thông, Tương tác nhanh | General Support, Instant Tasks',
    model: 'gemini-3-flash-preview',
    avatarColor: 'from-green-400 to-green-600'
  }
};

export const DOMAINS: DomainConfig[] = [
  {
    id: Domain.AUDIT,
    title: 'Kiểm toán & Kinh tế | Audit & Economics',
    description: 'Phân tích tài chính, đánh giá rủi ro | Financial analysis, risk assessment.',
    icon: '📊',
    color: 'border-blue-500',
    persona: PersonaID.THIEN
  },
  {
    id: Domain.SALES_TAX,
    title: 'Bán hàng & Thuế | Sales & Tax',
    description: 'POS, Hóa đơn điện tử, Tích hợp TCT | POS, E-Invoice, Tax integration.',
    icon: '🧾',
    color: 'border-green-500',
    persona: PersonaID.THIEN
  },
  {
    id: Domain.CUSTOMS,
    title: 'Hải quan & XNK | Customs & Trade',
    description: 'Rà soát tờ khai, mã HS | Declaration review, HS code compliance.',
    icon: '🚢',
    color: 'border-cyan-500',
    persona: PersonaID.THIEN
  },
  {
    id: Domain.JEWELRY,
    title: 'Trang sức & Đá quý | Jewelry & Gems',
    description: 'Quản trị định mức vàng, đá | Gold/Gem margin & craft management.',
    icon: '💎',
    color: 'border-amber-400',
    persona: PersonaID.THIEN
  },
  {
    id: Domain.BRAND_LAB,
    title: 'I LIKE IT - Brand Lab',
    description: 'Quản trị thương hiệu mỹ phẩm | Cosmetic brand management.',
    icon: '💄',
    color: 'border-pink-500',
    persona: PersonaID.CAN
  },
  {
    id: Domain.LEGAL,
    title: 'Pháp lý & Tuân thủ | Legal & Compliance',
    description: 'Tham mưu pháp luật kinh doanh | Business law consultancy.',
    icon: '⚖️',
    color: 'border-red-500',
    persona: PersonaID.THIEN
  },
  {
    id: Domain.IT,
    title: 'Blockchain & Security',
    description: 'Kiến trúc dữ liệu cô lập | Isolated data architecture.',
    icon: '🛡️',
    color: 'border-purple-500',
    persona: PersonaID.THIEN
  },
  {
    id: Domain.METAPHYSICS,
    title: 'Huyền học Quản trị | Meta-Management',
    description: 'Ứng dụng Phong thủy vào chiến lược | Feng Shui in business strategy.',
    icon: '☯️',
    color: 'border-amber-500',
    persona: PersonaID.THIEN
  }
];

const MOCK_SUPPLIER: Supplier = {
  id: 's-mock',
  /* Fix: Changed name to tenNhaCungCap in Supplier mock */
  maNhaCungCap: 'TML-FACTORY',
  tenNhaCungCap: 'Tâm Luxury Factory',
  diaChi: 'HCMC',
  maSoThue: '0300000000',
  level: 'gold',
  yearsOnPlatform: 10,
  responseRate: 99,
  // Fix: responseTime is now a valid property in the Supplier interface
  responseTime: '< 15p',
  transactionAmount: 50000000000,
  location: 'HCMC',
  badges: ['Verified']
};

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'p-001',
    sku: 'NNA-ROLEX-01',
    name: 'Nhẫn Nam Rolex Custom Diamond',
    price: 250000000,
    category: 'Nhẫn Nam',
    image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=800&q=80'],
    videos: [],
    minOrder: 1,
    moqUnit: 'chiếc',
    description: 'Vàng 18K, Đính kim cương tấm toàn bộ đai, hột chủ 7.2ly.',
    stock: 2,
    isCustomizable: true,
    leadTime: 14,
    supplier: MOCK_SUPPLIER,
    rating: 5.0,
    reviews: 42,
    isVerifiedSupplier: true,
    tradeAssurance: true,
    specifications: { 'Chất liệu': 'Vàng 18K', 'Đá chủ': '7.2ly' },
    tags: ['luxury', 'custom'],
    status: 'AVAILABLE'
  },
  {
    id: 'p-002',
    sku: 'NNU-HALO-02',
    name: 'Nhẫn Nữ Halo Double Diamond',
    price: 45000000,
    category: 'Nhẫn Nữ',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80'],
    videos: [],
    minOrder: 1,
    moqUnit: 'chiếc',
    description: 'Thiết kế Halo đôi, tôn dáng tay khách hàng, kim cương GIA.',
    stock: 5,
    isCustomizable: true,
    leadTime: 10,
    supplier: MOCK_SUPPLIER,
    rating: 4.8,
    reviews: 120,
    isVerifiedSupplier: true,
    tradeAssurance: true,
    specifications: { 'Chất liệu': 'Vàng trắng 18K', 'Đá chủ': 'GIA' },
    tags: ['halo', 'diamond'],
    status: 'AVAILABLE'
  }
];
