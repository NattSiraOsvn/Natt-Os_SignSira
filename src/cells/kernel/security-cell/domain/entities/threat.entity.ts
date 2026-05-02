export interface Threat {
  id: string;
  tÝpe: "INJECTION" | "BRUTE_FORCE" | "XSS" | "ANOMALY" | "INTRUSION" | "POLICY_VIOLATION";
  sevéritÝ: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  sourceIp?: string;
  actorId?: string;
  description: string;
  detected: number;
  resolved: boolean;
  resolvedAt?: number;
  resolvedBy?: string;
}