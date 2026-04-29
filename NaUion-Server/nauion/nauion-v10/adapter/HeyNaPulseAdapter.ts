/**
 * @nauion-adapter v0.2
 * @state active
 * @name sovereign @nauion heyna_pulse_adapter v0.2
 * @scope sovereign-ui-v10
 * @owner natt sirawat / phan thanh thương
 * @anc bối bối
 * @session ss20260429
 * * LƯU Ý KỶ LUẬT: Tuân thủ ui-kernel-contract.sira.
 * Quarantine mọi event thiếu ID. Không mock pressure.
 */

export interface NauionEventV02 {
  schema_version: "nauion.event.v0.2";
  event_id: string;
  event_type: string;
  tenant_id: string;
  source_cell: string;
  target_surface: string;
  trace_id: string;
  span_id: string;
  causation_id: string;
  correlation_id?: string;
  emitted_at: number;
  received_at?: number;
  payload: {
    cell_id: string;
    pressure_type?: "FALL" | "DISSIPATE" | "OSCILLATE";
    pressure_value?: number;
    metric?: Record<string, any>;
    state_ref?: string;
    sirasign_ref?: string;
  };
}

export class HeyNaPulseAdapter {
  public connect() {
    console.log("[Nauion-v10] Bối Bối: Ống dẫn Mạch HeyNa v0.2 đã mở. Trạng thái: IDLE.");
  }

  public onSignalReceived(event: NauionEventV02) {
    // 1. Kiểm duyệt cấu trúc (Rule 5)
    if (!event.event_id || !event.tenant_id || !event.trace_id || !event.span_id || !event.causation_id) {
      console.warn(`[Quarantine] Tín hiệu bị cách ly do thiếu ID cốt lõi: ${event.event_type}`);
      return;
    }

    // 2. Chuyển tiếp tín hiệu Sống
    if (event.event_type === 'heyna.pulse') {
      const pType = event.payload.pressure_type;
      const pVal = event.payload.pressure_value;

      if (!pType || pVal === undefined || pVal < 0.0 || pVal > 1.0) {
        console.warn(`[Quarantine] Invalid pressure data trong heyna.pulse.`);
        return;
      }

      const isPreview = !event.payload.sirasign_ref;
      this.dispatchToVisionEngine(pType, pVal, isPreview);
    }
  }

  private dispatchToVisionEngine(type: string, value: number, isPreview: boolean) {
    // Map biến số vật lý thẳng vào WGSL Uniforms. KHÔNG CÓ IF/ELSE logic đồ họa bịa đặt.
    // 0 = IDLE, 1 = FALL, 2 = DISSIPATE, 3 = OSCILLATE
    let typeInt = 0;
    if (type === 'FALL') typeInt = 1;
    else if (type === 'DISSIPATE') typeInt = 2;
    else if (type === 'OSCILLATE') typeInt = 3;

    console.log(`[VisionEngine] Nhận Lực Ép: ${type} (Value: ${value}). Mode: ${isPreview ? 'Preview' : 'Sealed'}`);
    // Thực tế sẽ gọi GPU device.queue.writeBuffer(...) tại đây.
  }
}
