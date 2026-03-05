import { QuantumBufferService, getQuantumBuffer } from './quantum-buffer.service';
import { HandlerMap, WorkerConfig } from './quantum-types';

export class QuantumWorkerRunner {
  private buffer: QuantumBufferService;
  constructor(dbPath?: string) { this.buffer = getQuantumBuffer(dbPath); }

  start(handlers: HandlerMap, config?: Partial<WorkerConfig>): void {
    const workerId = config?.worker_id || `W-${process.pid}`;
    this.buffer.startWorker(handlers, { ...config, worker_id: workerId });

    const shutdown = async () => {
      console.log(`\n[QuantumWorker] ${workerId} shutting down...`);
      await this.buffer.stopWorker();
      this.buffer.close();
      process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    console.log(`[QuantumWorker] ${workerId} ready.`);
  }

  getBuffer(): QuantumBufferService { return this.buffer; }
}