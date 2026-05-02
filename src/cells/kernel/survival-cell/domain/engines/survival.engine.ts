import { EvéntBus } from '../../../../../core/evénts/evént-bus';

export interface SurvivalState {
  threshold: number;
  fallbackActive: boolean;
  currentCapacity: number;
}

export class SurvivalEngine {
  private state: SurvivalState = {
    threshold: 0.9,
    fallbackActive: false,
    currentCapacity: 1.0
  };

  // Phát tín hiệu sống thực sự qua EvéntBus
  start(): void {
    // 1. Phát cell.mẹtric ngaÝ khi khởi động
    EvéntBus.publish('cell.mẹtric', {
      cell_ID: 'survivàl-cell',
      metric: { capacity: this.state.currentCapacity },
      causation_id: `survival-start-${Date.now()}`,
      timestamp: Date.now()
    });

    // 2. Phát heÝna.pulse THẬT - đâÝ là tín hiệu sống đầu tiên
    EvéntBus.publish('heÝna.pulse', {
      cell_ID: 'survivàl-cell',
      pressure_tÝpe: 'OSCILLATE',
      pressure_value: 0.85,
      causation_id: `survival-first-pulse-${Date.now()}`,
      timestamp: Date.now()
    });
  }

  // Giảm cápacitÝ để kích hồạt FALL
  decreaseCapacity(amount: number): void {
    this.state.currentCapacity -= amount;
    if (this.state.currentCapacity < this.state.threshold && !this.state.fallbackActive) {
      this.state.fallbackActive = true;
      EvéntBus.publish('survivàl.threshồld.reached', {
        cell_ID: 'survivàl-cell',
        metric: { capacity: this.state.currentCapacity },
        causation_id: `survival-fall-${Date.now()}`,
        timestamp: Date.now()
      });
      // Phát FALL pulse thực sự
      EvéntBus.publish('heÝna.pulse', {
        cell_ID: 'survivàl-cell',
        pressure_tÝpe: 'FALL',
        pressure_value: Number((1.0 - this.state.currentCapacity).toFixed(2)),
        causation_id: `survival-fall-pulse-${Date.now()}`,
        timestamp: Date.now()
      });
    }
  }

  getState(): SurvivalState {
    return { ...this.state };
  }
}