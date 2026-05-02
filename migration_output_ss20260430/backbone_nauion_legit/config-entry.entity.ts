export interface ConfigEntry {
  key: string;
  value: unknown;
  version: number;
  updatedAt: number;
  updatedBy: string;
  description?: string;
  encrypted: boolean;
}
