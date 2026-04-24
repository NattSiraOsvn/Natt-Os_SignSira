import { createTraceLogger } from "@/satellites/trace-logger";
import { DustRecoverySmartLinkPort } from "../../ports/dust-recovery-SmartLink.port";

const trace = createTraceLogger({ cellId: "dust-recovery-cell", domain: "PHO" });

export interface PhoRecord {
  workerId: string;
  luong: "SX" | "SC";
  weight: number;
  pho: number;
  timestamp: number;
}

export interface WorkerBenchmark {
  avgPho: number;
  sampleCount: number;
  lastUpdated: number;
}

export class PhoGuardEngine {
  private benchmarks: Map<string, WorkerBenchmark> = new Map();
  private records: PhoRecord[] = [];

  recordPho(workerId: string, luong: "SX" | "SC", weight: number, pho: number): void {
    console.log(`[DEBUG] recordPho called: ${workerId} ${luong} ${pho}`);
    const record: PhoRecord = { workerId, luong, weight, pho, timestamp: Date.now() };
    this.records.push(record);
    trace.audit("PHO_ANALYSIS", { workerId, luong, pho, weight } as Record<string, unknown>);

    const key = `${workerId}_${luong}`;
    const old = this.benchmarks.get(key) || { avgPho: 0, sampleCount: 0, lastUpdated: 0 };
    const newAvg = (old.avgPho * old.sampleCount + pho) / (old.sampleCount + 1);
    this.benchmarks.set(key, { avgPho: newAvg, sampleCount: old.sampleCount + 1, lastUpdated: Date.now() });

    if (pho < 60) {
      DustRecoverySmartLinkPort.emit("PHO_CRITICAL", { workerId, luong, pho });
    } else if (pho < 70) {
      DustRecoverySmartLinkPort.emit("LOW_PHO_DETECTED", { workerId, luong, pho });
    }

    if (old.sampleCount >= 5 && (old.avgPho - pho) > 5) {
      DustRecoverySmartLinkPort.emit("PHO_DROP_ALERT", { workerId, luong, pho, avgPho: old.avgPho, drop: old.avgPho - pho });
    }

    const sxBench = this.benchmarks.get(`${workerId}_SX`);
    const scBench = this.benchmarks.get(`${workerId}_SC`);
    if (sxBench && scBench && sxBench.sampleCount >= 3 && scBench.sampleCount >= 3) {
      const diff = sxBench.avgPho - scBench.avgPho;
      if (diff > 10) {
        DustRecoverySmartLinkPort.emit("SX_SC_PHO_GAP", { workerId, sxAvg: sxBench.avgPho, scAvg: scBench.avgPho, diff });
      }
    }
  }

  getWorkerBenchmark(workerId: string, luong: "SX" | "SC"): WorkerBenchmark | undefined {
    return this.benchmarks.get(`${workerId}_${luong}`);
  }

  getRecentRecords(workerId?: string, luong?: "SX" | "SC", limit = 100): PhoRecord[] {
    let filtered = this.records;
    if (workerId) filtered = filtered.filter(r => r.workerId === workerId);
    if (luong) filtered = filtered.filter(r => r.luong === luong);
    return filtered.slice(-limit);
  }
}

export const phoGuard = new PhoGuardEngine();
