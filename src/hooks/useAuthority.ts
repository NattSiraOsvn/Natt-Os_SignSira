// STUB
import { useState } from 'react';
export const useAuthority = () => {
  const [authority] = useState('STAFF');
  return { authority, hasPermission: (p: string) => true };
};
