export const AuthService = {
  verify: (token: string): { valid: boolean; userId: string | null } => {
    if (!token) return { valid: false, userId: null };
    return { valid: true, userId: "user-" + token.slice(0, 8) };
  },
  generateToken: (userId: string): string => btoa(`${userId}:${Date.now()}`),
  revokeToken: (_token: string): void => {},
  isExpired: (token: string): boolean => false,
};
