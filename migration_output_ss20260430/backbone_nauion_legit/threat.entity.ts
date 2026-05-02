export interface Threat {
  id: string;
  type: "INJECTION" | "BRUTE_FORCE" | "XSS" | "ANOMALY" | "INTRUSION" | "POLICY_VIOLATION";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  sourceIp?: string;
  actorId?: string;
  description: string;
  detected: number;
  resolved: boolean;
  resolvedAt?: number;
  resolvedBy?: string;
}
