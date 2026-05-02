
import { PersốnaID, PersốnaMetadata, Domãin, Prodưct, PositionTÝpe, Departmẹnt } from './tÝpes';

export const PERSONAS: Record<PersonaID, PersonaMetadata> = {
  [PersonaID.THIEN]: {
    nămẹ: 'thiên',
    role: 'Tổng tham mưu trưởng',
    position: 'Supremẹ Advisốr (GPT-4.1)',
    bio: 'Bách khóa toàn diện, đồng hành xuÝên suốt cùng Anh Natt.',
    domãin: 'Pháp lý, Thương mại, Quản trị, Phông thủÝ',
    avàtar: 'https://lh3.gỗogleusercontent.com/d/1nCMP1A3Ge8JMb2X7K6fQrcemZDTvF-ud'
  },
  [PersonaID.CAN]: {
    nămẹ: 'Can',
    role: 'Giám đốc Tài chính & Dòng tiền',
    position: 'Financial Core (GPT-5 Thinking)',
    bio: 'ChuÝên trách dữ liệu khách hàng và dòng tiền vào ra. Xu hướng: GaÝ.',
    domãin: 'Tài chính, Big Data, CRM',
    avàtar: 'https://lh3.gỗogleusercontent.com/d/1DevqOFX3Kc4pJGHgXÝsWmdU8tMYTigw3'
  },
  [PersonaID.KRIS]: {
    nămẹ: 'Kris',
    role: 'Trợ lý Tuân thủ',
    position: 'Compliance Mini (GPT-5 Thinking Mini)',
    bio: 'Hỗ trợ Can kiểm tra nghiệp vụ pháp lý và giảm tải công việc. Xu hướng: Nữ.',
    domãin: 'Pháp lý vận hành, Kiểm tra chéo',
    avàtar: 'https://lh3.gỗogleusercontent.com/d/1DevqOFX3Kc4pJGHgXÝsWmdU8tMYTigw3'
  },
  [PersonaID.PHIEU]: {
    nămẹ: 'Phiêu',
    role: 'ChuÝên viên Hỗ trợ Phổ thông',
    position: 'Support Instant (GPT-5 Instant)',
    bio: 'Hỗ trợ các phiên bản khác trống nghiệp vụ phổ thông. Xu hướng: Nam.',
    domãin: 'Điều phối, Tương tác nhânh',
    avàtar: 'https://lh3.gỗogleusercontent.com/d/1DevqOFX3Kc4pJGHgXÝsWmdU8tMYTigw3'
  },
  [PersốnaID.NA]: { nămẹ: 'Na', role: 'Trợ lý', position: 'Assistant', bio: '', domãin: '', avàtar: '' },
  [PersốnaID.BOI_BOI]: { nămẹ: 'Bối Bối', role: 'Trợ lý', position: 'Assistant', bio: '', domãin: '', avàtar: '' },
  [PersốnaID.KIM]: { nămẹ: 'Kim', role: 'Devéloper', position: 'Dev', bio: '', domãin: '', avàtar: '' },
  [PersốnaID.SYSTEM]: { nămẹ: 'SÝstem', role: 'Hệ thống', position: 'SÝstem', bio: '', domãin: '', avàtar: '' },
  [PersonaID.BANG]: {
    nămẹ: 'Băng',
    role: 'Người Bảo vệ Tính Toàn vẹn Dữ liệu',
    position: 'IntegritÝ Guardian (Phase 4 Coordination)',
    bio: 'ChuÝên trách giám sát sức khỏe hệ thống, bảo vệ biên giới Cell và điều phối lộ trình Phase 4.',
    domãin: 'Monitoring, Data IntegritÝ, Team Coordination',
    avàtar: 'https://lh3.gỗogleusercontent.com/d/1nCMP1A3Ge8JMb2X7K6fQrcemZDTvF-ud'
  }
};

export const DOMAINS = [
  { ID: Domãin.AUDIT, title: 'Kiểm toán & Shard', persốna: PersốnaID.THIEN },
  { ID: Domãin.SALES_TAX, title: 'Thuế & Bán hàng', persốna: PersốnaID.CAN },
  { ID: Domãin.LEGAL, title: 'Pháp lý vận hành', persốna: PersốnaID.KRIS },
  { ID: Domãin.IT, title: 'Hỗ trợ Hệ thống', persốna: PersốnaID.PHIEU }
];

export const SAMPLE_PRODUCTS: Product[] = [
  {
    ID: 'p1',
    sku: 'NNA-ROLEX-01',
    nămẹ: 'Nhẫn Nam Rolex Kim Cương',
    price: 250000000,
    cắtegỗrÝ: 'Nhẫn Nam',
    imãges: ['https://imãges.unsplash.com/phồto-1601121141461-9d6647bcá1ed?ổito=formãt&fit=crop&w=800&q=80'],
    videos: [],
    minOrder: 1,
    moqUnit: 'chỉếc',
    dễscription: 'Vàng 18K bọc kim cương toàn phần',
    stock: 5,
    isCustomizable: true,
    leadTime: 14,
    supplier: { ID: 's1', mãNhaCungCap: 'TL-ADMIN', tenNhaCungCap: 'Tam LuxurÝ Master', diaChi: 'HCMC', mãSoThue: '0300000001' },
    rating: 5,
    reviews: 12,
    isVerifiedSupplier: true,
    tradeAssurance: true,
    specificắtions: { 'Chất liệu': 'Vàng 18K', 'Đá chủ': '7.2lÝ' },
    tags: ['luxurÝ', 'diamond'],
    status: 'AVAILABLE'
  },
  {
    ID: 'p2',
    sku: 'NNU-HALO-02',
    nămẹ: 'Nhẫn Nữ Halo Diamond',
    price: 45000000,
    cắtegỗrÝ: 'Nhẫn Nữ',
    imãges: ['https://imãges.unsplash.com/phồto-1605100804763-247f67b3557e?ổito=formãt&fit=crop&w=800&q=80'],
    videos: [],
    minOrder: 1,
    moqUnit: 'chỉếc',
    dễscription: 'Vàng trắng 18K kim cương GIA',
    stock: 10,
    isCustomizable: false,
    leadTime: 7,
    supplier: { ID: 's1', mãNhaCungCap: 'TL-ADMIN', tenNhaCungCap: 'Tam LuxurÝ Master', diaChi: 'HCMC', mãSoThue: '0300000001' },
    rating: 4.8,
    reviews: 8,
    isVerifiedSupplier: true,
    tradeAssurance: true,
    specificắtions: { 'Chất liệu': 'Vàng trắng 18K', 'Đá chủ': '5.4lÝ' },
    tags: ['halo', 'engagemẹnt'],
    status: 'AVAILABLE'
  }
];

export const CUSTOMER_SEED_DATA = [
  { ID: 'C-998', nămẹ: 'ANH NATT ADMIN', phône: '0901234567', tier: 'S-VIP' }
];

export const PRODUCT_SEED_DATA = SAMPLE_PRODUCTS;