/**
 * RENDER-STACK ENGINE — STUB v0.1
 * @cell: render-stack-cell
 * @status: scaffold — chưa wire Mạch HeyNa, chưa siraSign
 */

import type { RenderInstruction } from './render-instruction.types';

export class RenderStackEngine {
  private frameCount = 0;

  /**
   * Nhận render_instruction, dịch từng surface_signal thành DOM action
   * @returns DOM subtree đã render
   */
  execute(instruction: RenderInstruction): HTMLElement {
    this.frameCount++;
    const container = document.createElement('div');
    container.setAttribute('data-frame-id', instruction.frame_id);
    container.setAttribute('data-degrade-level', instruction.degrade_level);

    for (const signal of instruction.signals) {
      const element = this.applySignal(signal);
      if (element) container.appendChild(element);
    }

    return container;
  }

  private applySignal(signal: RenderInstruction['signals'][0]): HTMLElement | null {
    const el = document.createElement('div');
    el.setAttribute('data-element-id', signal.element_id);
    el.setAttribute('data-verb', signal.verb);
    el.setAttribute('data-origin-state', signal.origin_state);
    el.style.setProperty('--pressure', String(signal.pressure));
    return el;
  }
}
