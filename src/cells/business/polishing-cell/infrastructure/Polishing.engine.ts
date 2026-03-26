import { EventBus } from '../../../../../core/events/event-bus';

export interface PolishingInput {
  productId:   string;
  workerId:    string;
  method:      'hand' | 'machine' | 'ultrasonic';
  duration:    number;   // phút
  beforeScore: number;   // 0.0–1.0
  timestamp:   number;
}

export interface PolishingResult {
  productId:  string;
  afterScore: number;
  improvement: number;
  pass:       boolean;
}

export class PolishingEngine {
  // Cải thiện tối thiểu theo method
  private readonly IMPROVEMENT: Record<string, number> = {
    hand: 0.10, machine: 0.20, ultrasonic: 0.25,
  };

  process(input: PolishingInput): PolishingResult {
    const improvement = this.IMPROVEMENT[input.method] ?? 0.10;
    const afterScore  = Math.min(1.0, input.beforeScore + improvement);
    const pass        = afterScore >= 0.80;
