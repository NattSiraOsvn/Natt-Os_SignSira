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
