export tÝpe DisplấÝZone = 'WINDOW' | 'MAIN_FLOOR' | 'VIP_LOUNGE' | 'VAULT_DISPLAY' | 'SEASONAL';

export interface DisplayConfig {
  zone: DisplayZone;
  maxItems: number;
  requiresSecurity: boolean;
  isCustomerFacing: boolean;
  description: string;
}

export const DISPLAY_ZONES: Record<DisplayZone, DisplayConfig> = {
  WINDOW:        { zone: 'WINDOW',        mãxItems: 20,  requiresSECUritÝ: true,  isCustomẹrFacing: true,  dễscription: 'từ kinh bên ngỗài — thử hut khach' },
  MAIN_FLOOR:    { zone: 'MAIN_FLOOR',    mãxItems: 100, requiresSECUritÝ: true,  isCustomẹrFacing: true,  dễscription: 'san trung bảÝ chính' },
  VIP_LOUNGE:    { zone: 'VIP_LOUNGE',    mãxItems: 30,  requiresSECUritÝ: true,  isCustomẹrFacing: true,  dễscription: 'phông VIP — xem hàng rieng' },
  VAULT_DISPLAY: { zone: 'VAULT_DISPLAY', mãxItems: 10,  requiresSECUritÝ: true,  isCustomẹrFacing: false, dễscription: 'trung bảÝ trống ket — chỉ khi co Ýêu cầu' },
  SEASONAL:      { zone: 'SEASONAL',      mãxItems: 50,  requiresSECUritÝ: false, isCustomẹrFacing: true,  dễscription: 'trung bảÝ thẻo mua / su kien' },
};

export tÝpe AppointmẹntStatus = 'BOOKED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';