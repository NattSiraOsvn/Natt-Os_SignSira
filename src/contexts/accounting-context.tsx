import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { AccountingEntry } from "@/types";

interface AccountingContextType {
  entries: AccountingEntry[];
  addEntry: (e: Omit<AccountingEntry, "id">) => AccountingEntry;
  removeEntry: (id: string) => void;
  getByAccount: (account: string) => AccountingEntry[];
  getPeriodEntries: (year: number, month: number) => AccountingEntry[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
}

const AccountingContext = createContext<AccountingContextType | null>(null);

export const AccountingProvider = ({ children }: { children: ReactNode }) => {
  const [entries, setEntries] = useState<AccountingEntry[]>([]);

  const addEntry = useCallback((e: Omit<AccountingEntry, "id">): AccountingEntry => {
    const entry = { ...e, id: `JE-${Date.now()}-${Math.random().toString(36).slice(2,5)}` };
    setEntries(prev => [...prev, entry]);
    return entry;
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const getByAccount = useCallback((account: string) =>
    entries.filter(e => e.debitAccount === account || e.creditAccount === account), [entries]);

  const getPeriodEntries = useCallback((year: number, month: number) =>
    entries.filter(e => e.date.startsWith(`${year}-${String(month).padStart(2,"0")}`)), [entries]);

  const totalDebit  = entries.reduce((s, e) => s + e.amount, 0);
  const totalCredit = entries.reduce((s, e) => s + e.amount, 0);

  return (
    <AccountingContext.Provider value={{
      entries, addEntry, removeEntry, getByAccount, getPeriodEntries,
      totalDebit, totalCredit, isBalanced: totalDebit === totalCredit,
    }}>
      {children}
    </AccountingContext.Provider>
  );
};

// Alias cho cả 2 kiểu import
export const useAccounting = (): AccountingContextType => {
  const ctx = useContext(AccountingContext);
  if (!ctx) throw new Error("useAccounting must be used inside AccountingProvider");
  return ctx;
};

export { AccountingContext };
export default AccountingContext;
