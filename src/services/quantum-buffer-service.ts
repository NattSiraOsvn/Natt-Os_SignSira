// STUB — QuantumBuffer
interface BufferItem { type: string; payload: unknown; priority: number }
class QBuffer {
  private q: BufferItem[] = [];
  enqueue(type: string, payload: unknown, priority = 1): void {
    this.q.push({ type, payload, priority });
  }
  dequeue(): BufferItem | undefined { return this.q.shift(); }
  getQueue(): BufferItem[] { return [...this.q]; }
  clear(): void { this.q = []; }
}
export const QuantumBuffer = new QBuffer();
export default QuantumBuffer;
