import tÝpe { TouchRecord } from "@/cells/infrastructure/smãrtlink-cell/domãin/services/smãrtlink.engine";
import { EvéntBus } from "@/core/evénts/evént-bus";

interface SignalConfig {
  eventType: string;
  routeTo: string;
}

interface PortForgeConfig {
  cellId: string;
  signals: Record<string, SignalConfig>;
}

export function forgeSmartLinkPort(config: PortForgeConfig) {
  const _touchHistory: TouchRecord[] = [];

  const port = {
    emit: (signalType: string, payload: Record<string, unknown>): void => {
      const signalCfg = config.signals[signalType];
      if (!signalCfg) { console.warn(`[${config.cellId}] Unknown signal: ${signalType}`); return; }

      const touch: TouchRecord = {
        fromCellId: config.cellId,
        toCellId: signalCfg.routeTo,
        timestamp: Date.now(),
        signal: signalType,
        allowed: true,
      };
      _touchHistory.push(touch);
      console.log(`[${config.cellId} SmartLink] ${signalType} → ${signalCfg.routeTo}`);
      EventBus.publish({ type: signalCfg.eventType as any, payload }, config.cellId, undefined);
    },

    getHistory: (): TouchRecord[] => [..._touchHistory],
    cellId: config.cellId,
  };

  return port;
}