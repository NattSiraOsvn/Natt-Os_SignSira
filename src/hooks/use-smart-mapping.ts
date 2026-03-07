import { useState, useCallback, useRef } from "react";
import type { AccountingEntry } from "@/types";
import { SmartLinkEngine } from "@/services/smartLinkEngine";
import { SalesCore } from "@/services/salesCore";

export interface MappingResult {
  id?: string;
  type?: string;
  entries: AccountingEntry[];
  confidence: number;
  warnings: string[];
  processedAt: number;
  data?: any;
  timestamp?: number;
}

export interface UseSmartMappingReturn {
  entries: AccountingEntry[];
  isProcessing: boolean;
  lastResult: MappingResult | null;
  mapTransaction: (rawData: Record<string, unknown>) => Promise<MappingResult>;
  mapBatch: (records: Record<string, unknown>[]) => Promise<MappingResult[]>;
  clearEntries: () => void;
  stats: { totalMapped: number; accuracy: number; lastRun: number };
  realTimeUpdates: MappingResult[];
  mapSalesEvent: (event: Record<string, unknown>) => Promise<MappingResult>;
}

export const useSmartMapping = (): UseSmartMappingReturn => {
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<MappingResult | null>(null);
  const statsRef = useRef({ totalMapped: 0, accuracy: 0, lastRun: 0 });

  const mapTransaction = useCallback(async (rawData: Record<string, unknown>): Promise<MappingResult> => {
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 120));

    const detected = SmartLinkEngine.detect(JSON.stringify(rawData));
    const newEntries = detected.entries.length
      ? detected.entries
      : SalesCore.generateEntries(rawData);

    const result: MappingResult = {
      entries: newEntries,
      confidence: detected.confidence || 80,
      warnings: detected.mapped ? [] : ["Ánh xạ tự động — cần kiểm tra"],
      processedAt: Date.now(),
    };

    statsRef.current = { totalMapped: statsRef.current.totalMapped + newEntries.length, accuracy: result.confidence, lastRun: Date.now() };
    setEntries(prev => [...prev, ...newEntries]);
    setLastResult(result);
    setIsProcessing(false);
    return result;
  }, []);

  const mapBatch = useCallback(async (records: Record<string, unknown>[]): Promise<MappingResult[]> => {
    return Promise.all(records.map(r => mapTransaction(r)));
  }, [mapTransaction]);

  const clearEntries = useCallback(() => setEntries([]), []);

  return {
    entries, isProcessing, lastResult,
    mapTransaction, mapBatch, clearEntries,
    stats: { ...statsRef.current },
    realTimeUpdates: [] as MappingResult[],
    mapSalesEvent: (event: Record<string, unknown>) => mapTransaction(event),
  };
};

// Alias export cho FinancialDashboard dùng tên cũ
export { useSmartMapping as useSmartMappingHook };
export default useSmartMapping;
