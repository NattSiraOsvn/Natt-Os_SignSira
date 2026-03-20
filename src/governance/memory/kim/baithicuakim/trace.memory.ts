export interface TraceEntry {
  id: string;
  timestamp: number;
  action: string;
  payload: any;
  causationId?: string;
}

export class TraceMemory {
  private trace: TraceEntry[] = [];

  add(entry: TraceEntry) {
    this.trace.push(entry);
    // Trong thực tế, sẽ lưu vào file hoặc database
    console.log(`[TRACE] ${entry.action}`, entry.payload);
  }

  getSince(time: number): TraceEntry[] {
    return this.trace.filter(e => e.timestamp >= time);
  }
}