import { Domain, PersonaID, ViewType, UserRole } from "./types";

export const DOMAINS = [
  { id: Domain.AUDIT,      label: "Kiểm Toán",  persona: PersonaID.BANG     },
  { id: Domain.FINANCE,    label: "Tài Chính",  persona: PersonaID.KIM      },
  { id: Domain.HR,         label: "Nhân Sự",    persona: PersonaID.THIEN    },
  { id: Domain.COMPLIANCE, label: "Tuân Thủ",   persona: PersonaID.CAN      },
  { id: Domain.INVENTORY,  label: "Kho",        persona: PersonaID.BOI_BOI  },
  { id: Domain.SALES,      label: "Bán Hàng",   persona: PersonaID.KRIS     },
  { id: Domain.CUSTOMS,    label: "Hải Quan",   persona: PersonaID.THIEN    },
];

export const PERSONAS: Record<string, { name: string; color: string; icon: string }> = {
  [PersonaID.BANG]:    { name: "Băng",    color: "blue",   icon: "❄️"  },
  [PersonaID.KIM]:     { name: "Kim",     color: "amber",  icon: "👑"  },
  [PersonaID.THIEN]:   { name: "Thiên",   color: "amber",  icon: "◈"   },
  [PersonaID.CAN]:     { name: "Can",     color: "pink",   icon: "⚖️"  },
  [PersonaID.BOI_BOI]: { name: "Bối Bối", color: "green",  icon: "🌱"  },
  [PersonaID.KRIS]:    { name: "Kris",    color: "violet", icon: "✉️"  },
};

export const SAMPLE_PRODUCTS: any[] = [
  { id: "SP-001", name: "Nhẫn Kim Cương NNA001", price: 25_000_000, category: "RING",     minOrder: 1, goldKarat: "18K", goldWeight: 3.2 },
  { id: "SP-002", name: "Dây Chuyền Vàng D866",  price: 18_000_000, category: "NECKLACE", minOrder: 1, goldKarat: "18K", goldWeight: 5.1 },
  { id: "SP-003", name: "Bông Tai Ngọc Trai",    price: 12_000_000, category: "EARRING",  minOrder: 2, goldKarat: "14K", goldWeight: 1.8 },
  { id: "SP-004", name: "Lắc Tay Sapphire",      price: 35_000_000, category: "BRACELET", minOrder: 1, goldKarat: "18K", goldWeight: 8.4 },
];
