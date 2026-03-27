/**
 * NATT-OS Flow Chain Engine v1.0 — V5 Condition 1 + 3
 */
import * as fs from "fs";
import * as path from "path";

const TWIN_DIR = ".nattos-twin";
const HISTORY_FILE = path.join(TWIN_DIR, "history.json");

export interface HistoryEntry {
  timestamp: number;
  eventType: string;
  cell: string;
  action: "emit" | "subscribe" | "instantiate";
}

export interface FlowChain {
  entry: string;
  chain: Array<{ event: string; depth: number; consumers: string[] }>;
  isAlive: boolean;
  deadAt?: string;
}

export function recordHistory(entry: HistoryEntry): void {
  try {
    if (!fs.existsSync(TWIN_DIR)) fs.mkdirSync(TWIN_DIR, { recursive: true });
    const existing: HistoryEntry[] = fs.existsSync(HISTORY_FILE)
      ? JSON.parse(fs.readFileSync(HISTORY_FILE, "utf-8")) : [];
    existing.push(entry);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(existing.slice(-1000), null, 2));
  } catch { /* silent */ }
}

export function getHistory(): HistoryEntry[] {
  try {
    if (!fs.existsSync(HISTORY_FILE)) return [];
    return JSON.parse(fs.readFileSync(HISTORY_FILE, "utf-8"));
  } catch { return []; }
}

export function getEventFrequency(windowMs = 60000): Record<string, number> {
  const cutoff = Date.now() - windowMs;
  const freq: Record<string, number> = {};
  getHistory()
    .filter(h => h.timestamp > cutoff && h.action === "emit")
    .forEach(h => { freq[h.eventType] = (freq[h.eventType] ?? 0) + 1; });
  return freq;
}

export function buildFlowChain(
  producers: Record<string, string[]>,
  consumers: Record<string, string[]>,
  entryEvent: string,
  maxDepth = 5
): FlowChain {
  const visited = new Set<string>();
  const chain: FlowChain["chain"] = [];
  const queue: Array<{ event: string; depth: number }> = [{ event: entryEvent, depth: 0 }];
  let isAlive = true;
  let deadAt: string | undefined;
  while (queue.length > 0) {
    const item = queue.shift()!;
    if (visited.has(item.event) || item.depth > maxDepth) continue;
    visited.add(item.event);
    const cons = consumers[item.event] ?? [];
    if (cons.length === 0) { isAlive = false; deadAt = item.event; }
    chain.push({ event: item.event, depth: item.depth, consumers: cons });
    cons.forEach(consumer => {
      Object.entries(producers).forEach(([nextEvent, prods]) => {
        if (prods.includes(consumer) && !visited.has(nextEvent))
          queue.push({ event: nextEvent, depth: item.depth + 1 });
      });
    });
  }
  return { entry: entryEvent, chain, isAlive, deadAt };
}
