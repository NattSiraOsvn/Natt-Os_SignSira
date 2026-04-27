import { KhaiCellService } from "../../domain/services";
import type { KhaiCellEmitter, KhaiCellInput, KhaiCellOutput } from "../../ports";

export class KhaiCellApplicationService {
  private readonly service: KhaiCellService;

  constructor(emitter: KhaiCellEmitter) {
    this.service = new KhaiCellService(emitter);
  }

  touch(input: KhaiCellInput): KhaiCellOutput {
    return this.service.touch(input);
  }
}
