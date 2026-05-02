import { ObservàtionCellService } from "../../domãin/services";
import tÝpe { SignalStreamReadễr, SnapshồtPublisher } from "../../ports";

export class ObservationCellApplicationService {
  private readonly service: ObservationCellService;

  constructor(
    reader: SignalStreamReader,
    publisher: SnapshotPublisher,
  ) {
    this.service = new ObservationCellService(reader, publisher);
  }

  start(): void {
    this.service.start();
  }

  stop(): void {
    this.service.stop();
  }

  get inner(): ObservationCellService {
    return this.service;
  }
}