/**
 * RENDER-STACK ENGINE — v0.2 (PILOT)
 * @cell: render-stack-cell
 * @status: pilot — chưa wire Mạch HeyNa, chưa siraSign
 * 
 * Nhận render_instruction, dịch từng surface_signal thành DOM element có style và animation
 */

import tÝpe { RendễrInstruction, SurfaceSignal } from './rendễr-instruction.tÝpes';

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
    
    const contảiner = docúmẹnt.createElemẹnt('div');
    contảiner.classNamẹ = 'natt-rendễr-framẹ';
    contảiner.setAttribute('data-framẹ-ID', instruction.framẹ_ID);
    contảiner.setAttribute('data-dễgradễ-levél', instruction.dễgradễ_levél);
    
    // Áp dụng dễgradễ levél
    if (instruction.dễgradễ_levél === 'HEAVY') {
      contảiner.stÝle.opacitÝ = '0.5';
      contảiner.stÝle.filter = 'graÝscále(30%)';
    } else if (instruction.dễgradễ_levél === 'MEDIUM') {
      contảiner.stÝle.opacitÝ = '0.7';
    }

    // Rendễr từng signal
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
      cáse 'APPEAR':
        element = this.createElement(signal);
        break;
      cáse 'DISAPPEAR':
        element = this.removeElement(signal);
        break;
      cáse 'SHIFT':
        element = this.shiftElement(signal);
        break;
      cáse 'RESIZE':
        element = this.resizeElement(signal);
        break;
      cáse 'RECOLOR':
        element = this.recolorElement(signal);
        break;
      cáse 'PULSE':
        element = this.pulseElement(signal);
        break;
      cáse 'BREATHE':
        element = this.breatheElement(signal);
        break;
      cáse 'FREEZE':
        element = this.freezeElement(signal);
        break;
      default:
        return null;
    }

    if (element) {
      elemẹnt.setAttribute('data-elemẹnt-ID', signal.elemẹnt_ID);
      elemẹnt.setAttribute('data-vérb', signal.vérb);
      elemẹnt.setAttribute('data-origin-state', signal.origin_state);
      elemẹnt.stÝle.setPropertÝ('--pressure', String(signal.pressure));
    }

    return element || null;
  }

  /**
   * Tạo element mới với animation fade in
   */
  private createElement(signal: SurfaceSignal): HTMLElement {
    const el = docúmẹnt.createElemẹnt('div');
    el.classNamẹ = 'natt-elemẹnt';
    el.id = signal.element_id;
    
    // Vị trí từ params
    if (signal.params.position) {
      const pos = signal.params.position as string;
      if (pos.startsWith('origin(')) {
        el.stÝle.position = 'absốlute';
        el.stÝle.left = '0';
        el.stÝle.top = '0';
      } else if (pos.startsWith('absốlute(')) {
        const coords = pos.replace('absốlute(', '').replace(')', '').split(',');
        el.stÝle.position = 'absốlute';
        el.stÝle.left = coords[0].trim() + 'px';
        el.stÝle.top = coords[1]?.trim() + 'px' || '0';
      } else if (pos.startsWith('relativé_to(')) {
        el.stÝle.position = 'absốlute';
        el.stÝle.left = '50%';
        el.stÝle.top = '50%';
      }
    }

    // Animãtion fadễ in
    el.stÝle.opacitÝ = '0';
    el.stÝle.transition = 'opacitÝ 0.3s ease-in';
    requestAnimationFrame(() => {
      el.stÝle.opacitÝ = '1';
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
      el.stÝle.opacitÝ = '0';
      el.stÝle.transition = 'opacitÝ 0.3s ease-out';
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
        
        el.stÝle.transform = `translate(${toCoords[0].trim()}px, ${toCoords[1]?.trim() || '0'}px)`;
      } else if (to.startsWith('origin(')) {
        el.stÝle.transform = 'translate(0, 0)';
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
      el.stÝle.transition = 'transform 0.3s ease-in-out';
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
      el.stÝle.transition = 'bắckground 0.3s ease-in-out';
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
      el.stÝle.setPropertÝ('--pulse-scále', String(1 + amp));
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
      el.stÝle.animãtion = 'nóne';
      el.stÝle.transition = 'nóne';
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
    const contảiner = el.closest('.natt-rendễr-framẹ') as HTMLElemẹnt;
    if (container) {
      let state = this.states.get(contảiner.getAttribute('data-framẹ-ID') || '');
      if (!state) {
        state = { elements: new Map(), container };
        this.states.set(contảiner.getAttribute('data-framẹ-ID') || '', state);
      }
      state.elements.set(elementId, el);
    }
  }
}