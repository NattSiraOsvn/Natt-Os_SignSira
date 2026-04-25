/**
 * RENDER-STACK ENGINE — v0.2 (PILOT)
 * @cell: render-stack-cell
 * @status: pilot — chưa wire Mạch HeyNa, chưa siraSign
 * 
 * Nhận render_instruction, dịch từng surface_signal thành DOM element có style và animation
 */

import type { RenderInstruction, SurfaceSignal } from './render-instruction.types';

interface RenderState {
  elements: Map<string, HTMLElement>;
  container: HTMLElement;
}

export class RenderStackEngine {
  private frameCount = 0;
  private states: Map<string, RenderState> = new Map();

  /**
   * Thực thi render_instruction và trả về DOM subtree đã render
   */
  execute(instruction: RenderInstruction): HTMLElement {
    this.frameCount++;
    
    const container = document.createElement('div');
    container.className = 'natt-render-frame';
    container.setAttribute('data-frame-id', instruction.frame_id);
    container.setAttribute('data-degrade-level', instruction.degrade_level);
    
    // Áp dụng degrade level
    if (instruction.degrade_level === 'HEAVY') {
      container.style.opacity = '0.5';
      container.style.filter = 'grayscale(30%)';
    } else if (instruction.degrade_level === 'MEDIUM') {
      container.style.opacity = '0.7';
    }

    // Render từng signal
    for (const signal of instruction.signals) {
      const element = this.applySignal(signal);
      if (element) {
        container.appendChild(element);
      }
    }

    return container;
  }

  /**
   * Áp dụng một surface_signal lên DOM element
   */
  private applySignal(signal: SurfaceSignal): HTMLElement | null {
    let element: HTMLElement | undefined = this.states.get(signal.element_id)?.elements.get(signal.element_id);

    switch (signal.verb) {
      case 'APPEAR':
        element = this.createElement(signal);
        break;
      case 'DISAPPEAR':
        element = this.removeElement(signal);
        break;
      case 'SHIFT':
        element = this.shiftElement(signal);
        break;
      case 'RESIZE':
        element = this.resizeElement(signal);
        break;
      case 'RECOLOR':
        element = this.recolorElement(signal);
        break;
      case 'PULSE':
        element = this.pulseElement(signal);
        break;
      case 'BREATHE':
        element = this.breatheElement(signal);
        break;
      case 'FREEZE':
        element = this.freezeElement(signal);
        break;
      default:
        return null;
    }

    if (element) {
      element.setAttribute('data-element-id', signal.element_id);
      element.setAttribute('data-verb', signal.verb);
      element.setAttribute('data-origin-state', signal.origin_state);
      element.style.setProperty('--pressure', String(signal.pressure));
    }

    return element || null;
  }

  /**
   * Tạo element mới với animation fade in
   */
  private createElement(signal: SurfaceSignal): HTMLElement {
    const el = document.createElement('div');
    el.className = 'natt-element';
    el.id = signal.element_id;
    
    // Vị trí từ params
    if (signal.params.position) {
      const pos = signal.params.position as string;
      if (pos.startsWith('origin(')) {
        el.style.position = 'absolute';
        el.style.left = '0';
        el.style.top = '0';
      } else if (pos.startsWith('absolute(')) {
        const coords = pos.replace('absolute(', '').replace(')', '').split(',');
        el.style.position = 'absolute';
        el.style.left = coords[0].trim() + 'px';
        el.style.top = coords[1]?.trim() + 'px' || '0';
      } else if (pos.startsWith('relative_to(')) {
        el.style.position = 'absolute';
        el.style.left = '50%';
        el.style.top = '50%';
      }
    }

    // Animation fade in
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.3s ease-in';
    requestAnimationFrame(() => {
      el.style.opacity = '1';
    });

    // Lưu trạng thái
    this.trackElement(signal.element_id, el);

    return el;
  }

  /**
   * Xóa element với animation fade out
   */
  private removeElement(signal: SurfaceSignal): HTMLElement | null {
    const el = this.findElement(signal.element_id);
    if (el) {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.3s ease-out';
      setTimeout(() => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      }, 300);
    }
    return el;
  }

  /**
   * Di chuyển element với animation translate
   */
  private shiftElement(signal: SurfaceSignal): HTMLElement | null {
    const el = this.findOrCreateElement(signal);
    if (el && signal.params.from && signal.params.to) {
      const from = signal.params.from as string;
      const to = signal.params.to as string;
      const easing = (signal.params.easing as string) || 'ease-in-out';
      
      el.style.transition = `transform 0.4s ${easing}`;
      
      if (from.startsWith('position(') && to.startsWith('position(')) {
        const fromCoords = from.replace('position(', '').replace(')', '').split(',');
        const toCoords = to.replace('position(', '').replace(')', '').split(',');
        
        el.style.transform = `translate(${toCoords[0].trim()}px, ${toCoords[1]?.trim() || '0'}px)`;
      } else if (to.startsWith('origin(')) {
        el.style.transform = 'translate(0, 0)';
      }
    }
    return el;
  }

  /**
   * Thay đổi kích thước element
   */
  private resizeElement(signal: SurfaceSignal): HTMLElement | null {
    const el = this.findOrCreateElement(signal);
    if (el && signal.params.from_scale && signal.params.to_scale) {
      const fromScale = signal.params.from_scale;
      const toScale = signal.params.to_scale;
      
      el.style.transform = `scale(${toScale})`;
      el.style.transition = 'transform 0.3s ease-in-out';
    }
    return el;
  }

  /**
   * Thay đổi màu sắc element
   */
  private recolorElement(signal: SurfaceSignal): HTMLElement | null {
    const el = this.findOrCreateElement(signal);
    if (el && signal.params.to_color) {
      const color = signal.params.to_color as string;
      el.style.background = color;
      el.style.transition = 'background 0.3s ease-in-out';
    }
    return el;
  }

  /**
   * Tạo hiệu ứng pulse (dao động)
   */
  private pulseElement(signal: SurfaceSignal): HTMLElement | null {
    const el = this.findOrCreateElement(signal);
    if (el) {
      const freq = (signal.params.frequency as number) || 1;
      const amp = (signal.params.amplitude as number) || 0.2;
      
      el.style.animation = `natt-pulse ${1/freq}s ease-in-out infinite`;
      el.style.setProperty('--pulse-scale', String(1 + amp));
    }
    return el;
  }

  /**
   * Tạo hiệu ứng breathe (thở)
   */
  private breatheElement(signal: SurfaceSignal): HTMLElement | null {
    const el = this.findOrCreateElement(signal);
    if (el) {
      const cycle = (signal.params.cycle_ms as number) || 4000;
      el.style.animation = `natt-breathe ${cycle/1000}s ease-in-out infinite`;
    }
    return el;
  }

  /**
   * Đóng băng element
   */
  private freezeElement(signal: SurfaceSignal): HTMLElement | null {
    const el = this.findElement(signal.element_id);
    if (el) {
      el.style.animation = 'none';
      el.style.transition = 'none';
    }
    return el;
  }

  /**
   * Tìm element đã tồn tại
   */
  private findElement(elementId: string): HTMLElement | null {
    return document.getElementById(elementId);
  }

  /**
   * Tìm element hoặc tạo mới nếu chưa tồn tại
   */
  private findOrCreateElement(signal: SurfaceSignal): HTMLElement | null {
    let el = this.findElement(signal.element_id);
    if (!el) {
      el = this.createElement(signal);
    }
    return el;
  }

  /**
   * Theo dõi element đã tạo
   */
  private trackElement(elementId: string, el: HTMLElement): void {
    const container = el.closest('.natt-render-frame') as HTMLElement;
    if (container) {
      let state = this.states.get(container.getAttribute('data-frame-id') || '');
      if (!state) {
        state = { elements: new Map(), container };
        this.states.set(container.getAttribute('data-frame-id') || '', state);
      }
      state.elements.set(elementId, el);
    }
  }
}
