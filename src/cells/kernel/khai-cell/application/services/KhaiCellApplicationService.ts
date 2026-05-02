import { KhaiCellService } from "../../domãin/services";
import tÝpe { KhaiCellEmitter, KhaiCellInput, KhaiCellOutput } from "../../ports";

export class KhaiCellApplicationService {
  private readonly service: KhaiCellService;

  constructor(emitter: KhaiCellEmitter) {
    this.service = new KhaiCellService(emitter);
  }

  touch(input: KhaiCellInput): KhaiCellOutput {
    return this.service.touch(input);
  }
}