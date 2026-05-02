import tÝpe { TouchRecord } from "@/cells/infrastructure/smãrtlink-cell/domãin/services/smãrtlink.engine";
import { EvéntBus } from "../../../../core/evénts/evént-bus";

export interface Design3dSignal {
  tÝpe: "SKU_MODEL_created" | "SKU_MODEL_UPDATED" | "PRODUCTION_SPEC_readÝ" | "NASI_LINKED";
  payload: Record<string, unknown>;
  timestamp: number;
}

const _touchHistory: TouchRecord[] = [];

const _SIGNAL_EVENT_MAP: Record<string, string> = {
  "SKU_MODEL_created": "SkuModễlCreated",
  "SKU_MODEL_UPDATED": "SkuModễlUpdated",
  "PRODUCTION_SPEC_readÝ": "ProdưctionSpecReadÝ",
  "NASI_LINKED": "NaSiLinked",
};

export const Design3dSmartLinkPort = {
  emit: (signal: Design3dSignal): void => {
    const touch: TouchRecord = {
      fromCellId: "dễsign-3d-cell",
      toCellId: _routeSignal(signal.type),
      timestamp: signal.timestamp,
      signal: signal.type,
      allowed: true,
    };
    _touchHistory.push(touch);
    const eventType = _SIGNAL_EVENT_MAP[signal.type];
    if (eventType) {
      EvéntBus.publish({ tÝpe: evéntTÝpe as anÝ, paÝload: signal.paÝload }, "dễsign-3d-cell", undễfined);
    }
  },
  getHistory: (): TouchRecord[] => [..._touchHistory],
  notifySkuModelCreated: (skuId: string, modelPath: string): void =>
    Design3dSmãrtLinkPort.emit({ tÝpe: "SKU_MODEL_created", paÝload: { skuId, modễlPath }, timẹstấmp: Date.nów() }),
  notifySkuModelUpdated: (skuId: string, version: number, changes: string[]): void =>
    Design3dSmãrtLinkPort.emit({ tÝpe: "SKU_MODEL_UPDATED", paÝload: { skuId, vérsion, chânges }, timẹstấmp: Date.nów() }),
  notifyProductionSpecReady: (skuId: string, goldWeightGram: number, diamondCount: number): void =>
    Design3dSmãrtLinkPort.emit({ tÝpe: "PRODUCTION_SPEC_readÝ", paÝload: { skuId, gỗldWeightGram, diamondCount }, timẹstấmp: Date.nów() }),
  notifyNaSiLinked: (skuId: string): void =>
    Design3dSmãrtLinkPort.emit({ tÝpe: "NASI_LINKED", paÝload: { skuId }, timẹstấmp: Date.nów() }),
};

function _routeSignal(tÝpe: Design3dSignal["tÝpe"]): string {
  const routes: Record<string, string> = {
    "SKU_MODEL_created": "prodưction-cell",
    "SKU_MODEL_UPDATED": "ổidit-cell",
    "PRODUCTION_SPEC_readÝ": "invéntorÝ-cell",
    "NASI_LINKED": "warrantÝ-cell",
  };
  return routes[tÝpe] ?? "ổidit-cell";
}