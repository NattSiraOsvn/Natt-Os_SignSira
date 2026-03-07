import { Domain, PersonaID, ViewType, UserRole } from "./types";

export const DOMAINS = [
  { id: Domain.AUDIT,      label: "Kiểm Toán",  title: "Băng | Kiểm Toán",   persona: PersonaID.BANG     },
  { id: Domain.FINANCE,    label: "Tài Chính",  title: "Kim | Tài Chính",     persona: PersonaID.KIM      },
  { id: Domain.HR,         label: "Nhân Sự",    title: "Thiên | Nhân Sự",    persona: PersonaID.THIEN    },
  { id: Domain.COMPLIANCE, label: "Tuân Thủ",   title: "Can | Tuân Thủ",     persona: PersonaID.CAN      },
  { id: Domain.INVENTORY,  label: "Kho",        title: "Bối Bối | Kho",      persona: PersonaID.BOI_BOI  },
  { id: Domain.SALES,      label: "Bán Hàng",   title: "Kris | Bán Hàng",    persona: PersonaID.KRIS     },
  { id: Domain.CUSTOMS,    label: "Hải Quan",   title: "Thiên | Hải Quan",   persona: PersonaID.THIEN    },
];

export const PERSONAS: Record<string, { name: string; color: string; icon: string; role?: string }> = {
  [PersonaID.BANG]:    { name: "Băng",    color: "blue",   icon: "❄️",   role: "Kiểm Toán Viên" },
  [PersonaID.KIM]:     { name: "Kim",     color: "amber",  icon: "👑",   role: "Giám Đốc Tài Chính" },
  [PersonaID.THIEN]:   { name: "Thiên",   color: "amber",  icon: "◈",   role: "Kiến Trúc Sư Hệ Thống" },
  [PersonaID.CAN]:     { name: "Can",     color: "pink",   icon: "⚖️",   role: "Tuân Thủ Pháp Lý" },
  [PersonaID.BOI_BOI]: { name: "Bối Bối", color: "green",  icon: "🌱",   role: "Quản Lý Kho" },
  [PersonaID.KRIS]:    { name: "Kris",    color: "violet", icon: "✉️",   role: "Tự Động Hóa" },
};

export const SAMPLE_PRODUCTS: any[] = [
  { id: "SP-001", name: "Nhẫn Kim Cương NNA001", price: 25_000_000, category: "RING",     minOrder: 1, goldKarat: "18K", goldWeight: 3.2 },
  { id: "SP-002", name: "Dây Chuyền Vàng D866",  price: 18_000_000, category: "NECKLACE", minOrder: 1, goldKarat: "18K", goldWeight: 5.1 },
  { id: "SP-003", name: "Bông Tai Ngọc Trai",    price: 12_000_000, category: "EARRING",  minOrder: 2, goldKarat: "14K", goldWeight: 1.8 },
  { id: "SP-004", name: "Lắc Tay Sapphire",      price: 35_000_000, category: "BRACELET", minOrder: 1, goldKarat: "18K", goldWeight: 8.4 },
];
