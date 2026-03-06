// STUB
import { useContext, createContext } from 'react';
const AccountingContext = createContext<any>(null);
export const useAccounting = () => useContext(AccountingContext) ?? {
  entries: [],
  addEntry: (e: unknown) => {},
  summary: { totalRevenue: 0, totalExpenses: 0, netProfit: 0 },
};
export default AccountingContext;
