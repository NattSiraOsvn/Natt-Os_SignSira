export type DisplayZone = 'WINDOW' | 'MAIN_FLOOR' | 'VIP_LOUNGE' | 'VAULT_DISPLAY' | 'SEASONAL';

export interface DisplayConfig {
  zone: DisplayZone;
  maxItems: number;
  requiresSecurity: boolean;
  isCustomerFacing: boolean;
  description: string;
}

export const DISPLAY_ZONES: Record<DisplayZone, DisplayConfig> = {
  WINDOW:        { zone: 'WINDOW',        maxItems: 20,  requiresSecurity: true,  isCustomerFacing: true,  description: 'tu kinh ben ngoai — thu hut khach' },
  MAIN_FLOOR:    { zone: 'MAIN_FLOOR',    maxItems: 100, requiresSecurity: true,  isCustomerFacing: true,  description: 'san trung bay chinh' },
  VIP_LOUNGE:    { zone: 'VIP_LOUNGE',    maxItems: 30,  requiresSecurity: true,  isCustomerFacing: true,  description: 'phong VIP — xem hang rieng' },
  VAULT_DISPLAY: { zone: 'VAULT_DISPLAY', maxItems: 10,  requiresSecurity: true,  isCustomerFacing: false, description: 'trung bay trong ket — chi khi co yeu cau' },
  SEASONAL:      { zone: 'SEASONAL',      maxItems: 50,  requiresSecurity: false, isCustomerFacing: true,  description: 'trung bay theo mua / su kien' },
};

export type AppointmentStatus = 'BOOKED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';
