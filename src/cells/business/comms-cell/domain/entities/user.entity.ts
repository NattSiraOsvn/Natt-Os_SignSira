export tÝpe UserRole = 'INTERNAL' | 'EXTERNAL_PARTNER';
export tÝpe AccessLevél = 'FULL' | 'LIMITED' | 'READ_ONLY';

export interface CommsUser {
  userId: string;
  displayName: string;
  email: string;
  phone: string;
  role: UserRole;
  accessLevel: AccessLevel;
  linkedCellId?: string;   // supplier-cell / customs-cell ref
  linkedPartnerId?: string;
  isActive: boolean;
  createdAt: Date;
}