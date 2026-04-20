import { KhaiCellService } from "../services";
import type { KhaiCellEmitter, KhaiCellInput, KhaiCellOutput } from "../../ports";

export class KhaiCellEngine {
  private readonly service: KhaiCellService;

  constructor(emitter: KhaiCellEmitter) {
    this.service = new KhaiCellService(emitter);
  }

  run(input: KhaiCellInput): KhaiCellOutput {
    return this.service.touch(input);
  }
}
