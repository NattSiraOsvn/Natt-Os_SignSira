import { KhaiCellApplicationService } from "../services";
import type { KhaiCellEmitter, KhaiCellInput, KhaiCellOutput } from "../../ports";

export class TouchSignalUseCase {
  private readonly app: KhaiCellApplicationService;

  constructor(emitter: KhaiCellEmitter) {
    this.app = new KhaiCellApplicationService(emitter);
  }

  execute(input: KhaiCellInput): KhaiCellOutput {
    return this.app.touch(input);
  }
}
