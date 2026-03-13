// @ts-nocheck
// Showroom types — Tâm Luxury
export interface ShowroomMedia {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO" | "360";
  isPrimary: boolean;
  caption?: string;
}

export interface ShowroomProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  goldKarat: string;
  goldWeight: number;
  price: number;
  description: string;
  media: ShowroomMedia[];
  specifications: Record<string, string>;
  available: boolean;
  featured: boolean;
  branch?: string;
  certifications?: string[];
}

export interface ShowroomBranch {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  isHeadquarter: boolean;
  coordinates?: { lat: number; lng: number };
  manager?: string;
}

export interface ShowroomSpec {
  label: string;
  value: string;
  unit?: string;
  highlight?: boolean;
  isHighlight?: boolean;
  key?: string;
}

// Patch ShowroomProduct với fields bị thiếu
declare module "./showroom" {
  interface ShowroomProduct {
    status?: string;
    currency?: string;
    specs?: Record<string, string>;
    vaultLocation?: string;
  }
}
