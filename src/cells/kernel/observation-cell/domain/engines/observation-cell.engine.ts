import { ObservationCellService } from "../services";
import type { SignalStreamReader, SnapshotPublisher } from "../../ports";

export class ObservationCellEngine {
  private readonly service: ObservationCellService;

  constructor(
    reader: SignalStreamReader,
    publisher: SnapshotPublisher,
  ) {
    this.service = new ObservationCellService(reader, publisher);
  }

  run(): ObservationCellService {
    this.service.start();
    return this.service;
  }

  stop(): void {
    this.service.stop();
  }
}
