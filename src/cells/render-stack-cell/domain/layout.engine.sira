/**
 * LAYOUT ENGINE — v0.1 (PILOT)
 * @cell: render-stack-cell
 * @status: pilot — sắp xếp nhiều element vào một màn hình
 * 
 * Nhận danh sách render_instruction, sắp xếp các element vào container
 * theo layout mode (absolute, grid, flex)
 */

import type { RenderInstruction } from './render-instruction.types';
import { RenderStackEngine } from './render-stack.engine';

export type LayoutMode = 'absolute' | 'grid' | 'flex';

export interface LayoutConfig {
  mode: LayoutMode;
  containerWidth?: number;
  containerHeight?: number;
  columns?: number;
  gap?: number;
}

export class LayoutEngine {
  private renderEngine: RenderStackEngine;

  constructor() {
    this.renderEngine = new RenderStackEngine();
  }

  /**
   * Sắp xếp nhiều render instruction vào một container
   */
  layout(instructions: RenderInstruction[], config: LayoutConfig = { mode: 'absolute' }): HTMLElement {
    const container = document.createElement('div');
    container.className = 'natt-layout-container';
    container.style.position = 'relative';
    container.style.width = (config.containerWidth || 800) + 'px';
    container.style.height = (config.containerHeight || 600) + 'px';
    container.style.overflow = 'hidden';

    // Render từng instruction thành element
    const elements = instructions.map(instruction => 
      this.renderEngine.execute(instruction)
    );

    // Áp dụng layout mode
    switch (config.mode) {
      case 'absolute':
        this.applyAbsoluteLayout(elements, container);
        break;
      case 'grid':
        this.applyGridLayout(elements, container, config.columns || 3, config.gap || 20);
        break;
      case 'flex':
        this.applyFlexLayout(elements, container, config.gap || 20);
        break;
    }

    return container;
  }

  /**
   * Absolute positioning — giữ nguyên vị trí của từng element
   */
  private applyAbsoluteLayout(elements: HTMLElement[], container: HTMLElement): void {
    for (const el of elements) {
      // Đảm bảo element con có position absolute
      const children = el.querySelectorAll('.natt-element');
      children.forEach((child: any) => {
        if (child.style.position === 'absolute') {
          container.appendChild(child.cloneNode(true));
        }
      });
      // Nếu không có .natt-element, append trực tiếp
      if (el.querySelectorAll('.natt-element').length === 0) {
        container.appendChild(el.cloneNode(true));
      }
    }
  }

  /**
   * Grid layout — sắp xếp element vào lưới
   */
  private applyGridLayout(elements: HTMLElement[], container: HTMLElement, columns: number, gap: number): void {
    container.style.display = 'grid';
    container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    container.style.gap = gap + 'px';
    container.style.padding = gap + 'px';

    for (const el of elements) {
      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.alignItems = 'center';
      wrapper.style.justifyContent = 'center';
      
      const children = el.querySelectorAll('.natt-element');
      if (children.length > 0) {
        children.forEach((child: any) => wrapper.appendChild(child.cloneNode(true)));
      } else {
        wrapper.appendChild(el.cloneNode(true));
      }
      
      container.appendChild(wrapper);
    }
  }

  /**
   * Flex layout — sắp xếp element theo hàng ngang
   */
  private applyFlexLayout(elements: HTMLElement[], container: HTMLElement, gap: number): void {
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.gap = gap + 'px';
    container.style.padding = gap + 'px';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';

    for (const el of elements) {
      const wrapper = document.createElement('div');
      wrapper.style.flex = '0 0 auto';
      
      const children = el.querySelectorAll('.natt-element');
      if (children.length > 0) {
        children.forEach((child: any) => wrapper.appendChild(child.cloneNode(true)));
      } else {
        wrapper.appendChild(el.cloneNode(true));
      }
      
      container.appendChild(wrapper);
    }
  }
}
