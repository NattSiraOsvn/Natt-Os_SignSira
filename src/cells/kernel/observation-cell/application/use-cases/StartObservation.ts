import { ObservationCellApplicationService } from "../services";
import type { SignalStreamReader, SnapshotPublisher } from "../../ports";

export class StartObservationUseCase {
  private readonly app: ObservationCellApplicationService;

  constructor(
    reader: SignalStreamReader,
    publisher: SnapshotPublisher,
  ) {
    this.app = new ObservationCellApplicationService(reader, publisher);
  }

  execute(): ObservationCellApplicationService {
    this.app.start();
    return this.app;
  }
}
