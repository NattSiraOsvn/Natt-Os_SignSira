/**
 * HEYNA MOCK TRANSPORT — v0.1 (PILOT)
 * @cell: render-stack-cell
 * @status: pilot — mô phỏng Mạch HeyNa transport để test render pipeline
 * 
 * Giả lập việc gửi render instruction qua Mạch HeyNa
 */

import { HeynaReceiverEngine, HeynaEvent, HeynaEventType } from './heyna-receiver.engine';

export class HeynaMockTransport {
  private receiver: HeynaReceiverEngine;
  private intervalId: any = null;
  public state: string = 'active';

  constructor(receiver: HeynaReceiverEngine) {
    this.receiver = receiver;
  }

  /**
   * Bắt đầu mô phỏng transport — gửi sự kiện pulse định kỳ
   */
  startPulse(intervalMs: number = 5000): void {
    if (this.intervalId) return;
    
    this.intervalId = setInterval(() => {
      this.send({
        type: 'pulse',
        source: 'heyna-mock-transport',
        timestamp: Date.now(),
        payload: { 
          status: 'alive',
          timestamp: Date.now()
        }
      });
    }, intervalMs);
  }

  /**
   * Dừng pulse
   */
  stopPulse(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Gửi một sự kiện qua transport
   */
  send(event: HeynaEvent): void {
    // Mô phỏng độ trễ mạng
    setTimeout(() => {
      this.receiver.receive(event);
    }, Math.random() * 50 + 10); // 10-60ms delay
  }

  /**
   * Gửi render instruction
   */
  sendRenderInstruction(instruction: any): void {
    this.send({
      type: 'render',
      source: 'heyna-mock-transport',
      timestamp: Date.now(),
      payload: instruction
    });
  }

  /**
   * Gửi lệnh điều hướng
   */
  sendNavigate(screenId: string): void {
    this.send({
      type: 'navigate',
      source: 'heyna-mock-transport',
      timestamp: Date.now(),
      payload: { screenId }
    });
  }

  /**
   * Gửi lệnh tương tác
   */
  sendInteraction(elementId: string, interaction: string): void {
    this.send({
      type: 'interaction',
      source: 'heyna-mock-transport',
      timestamp: Date.now(),
      payload: { elementId, interaction }
    });
  }
}
