import { EventBus } from '../../../../../core/events/event-bus';

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

  // Phát tín hiệu sống thực sự qua EventBus
  start(): void {
    // 1. Phát cell.metric ngay khi khởi động
    EventBus.publish('cell.metric', {
      cell_id: 'survival-cell',
      metric: { capacity: this.state.currentCapacity },
      causation_id: `survival-start-${Date.now()}`,
      timestamp: Date.now()
    });

    // 2. Phát heyna.pulse THẬT - đây là tín hiệu sống đầu tiên
    EventBus.publish('heyna.pulse', {
      cell_id: 'survival-cell',
      pressure_type: 'OSCILLATE',
      pressure_value: 0.85,
      causation_id: `survival-first-pulse-${Date.now()}`,
      timestamp: Date.now()
    });
  }

  // Giảm capacity để kích hoạt FALL
  decreaseCapacity(amount: number): void {
    this.state.currentCapacity -= amount;
    if (this.state.currentCapacity < this.state.threshold && !this.state.fallbackActive) {
      this.state.fallbackActive = true;
      EventBus.publish('survival.threshold.reached', {
        cell_id: 'survival-cell',
        metric: { capacity: this.state.currentCapacity },
        causation_id: `survival-fall-${Date.now()}`,
        timestamp: Date.now()
      });
      // Phát FALL pulse thực sự
      EventBus.publish('heyna.pulse', {
        cell_id: 'survival-cell',
        pressure_type: 'FALL',
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
