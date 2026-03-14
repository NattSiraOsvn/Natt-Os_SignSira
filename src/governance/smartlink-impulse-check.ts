/**
 * SmartLink Impulse Runtime Check — Điều 8
 * Kiểm tra sức khỏe của sợi dẫn truyền thần kinh
 */
import { SmartLinkEngine } from "@/core/smartlink/smartlink-legacy.engine";

export interface ImpulseCheckResult {
  timestamp: number;
  totalNodes: number;
  activeLinks: number;
  avgAmplitude: number;
  latencyMs: number;
  status: "HEALTHY" | "DEGRADED" | "CRITICAL";
  violations: string[];
  recommendations: string[];
}

export const SmartLinkImpulseCheck = {
  /** Kiểm tra toàn bộ impulse network */
  runCheck: async (): Promise<ImpulseCheckResult> => {
    const start = Date.now();
    const violations: string[] = [];
    const recommendations: string[] = [];

    // Test signal propagation
    let activeLinks = 0;
    let totalAmplitude = 0;

    try {
      const links = (SmartLinkEngine as any).getAllLinks?.() ?? [];
      activeLinks = links.filter((l: any) => l.active).length;
      totalAmplitude = links.reduce((sum: number, l: any) => sum + (l.amplitude ?? 1), 0);

      if (activeLinks === 0) {
        violations.push("WARN: No active SmartLink connections detected");
        recommendations.push("Initialize SmartLink nodes before sending impulses");
      }
    } catch {
      violations.push("WARN: SmartLinkEngine not yet initialized");
      recommendations.push("Call SmartLinkEngine.init() at app startup");
      activeLinks = 0;
    }

    const latencyMs = Date.now() - start;
    const avgAmplitude = activeLinks > 0 ? totalAmplitude / activeLinks : 0;

    let status: ImpulseCheckResult["status"] = "HEALTHY";
    if (violations.length > 2) status = "CRITICAL";
    else if (violations.length > 0) status = "DEGRADED";

    return {
      timestamp: Date.now(),
      totalNodes: activeLinks,
      activeLinks,
      avgAmplitude,
      latencyMs,
      status,
      violations,
      recommendations,
    };
  },

  /** Quick health ping */
  ping: (): boolean => {
    try {
      return typeof SmartLinkEngine === "object" && SmartLinkEngine !== null;
    } catch { return false; }
  },

  /** Format kết quả */
  format: (result: ImpulseCheckResult): string => {
    const icon = result.status === "HEALTHY" ? "✅" : result.status === "DEGRADED" ? "⚠️" : "❌";
    return [
      `${icon} SmartLink Impulse: ${result.status}`,
      `   Nodes: ${result.activeLinks} | Latency: ${result.latencyMs}ms`,
      ...result.violations.map(v => `   ${v}`),
    ].join("\n");
  },
};
