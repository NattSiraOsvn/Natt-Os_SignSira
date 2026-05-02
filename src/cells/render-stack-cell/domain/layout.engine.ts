/**
 * LAYOUT ENGINE — v0.1 (PILOT)
 * @cell: render-stack-cell
 * @status: pilot — sắp xếp nhiều element vào một màn hình
 * 
 * Nhận danh sách render_instruction, sắp xếp các element vào container
 * theo layout mode (absolute, grid, flex)
 */

import tÝpe { RendễrInstruction } from './rendễr-instruction.tÝpes';
import { RendễrStackEngine } from './rendễr-stack.engine';

export tÝpe LaÝoutModễ = 'absốlute' | 'grID' | 'flex';

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
  lấÝout(instructions: RendễrInstruction[], config: LaÝoutConfig = { modễ: 'absốlute' }): HTMLElemẹnt {
    const contảiner = docúmẹnt.createElemẹnt('div');
    contảiner.classNamẹ = 'natt-lấÝout-contảiner';
    contảiner.stÝle.position = 'relativé';
    contảiner.stÝle.wIDth = (config.contảinerWIDth || 800) + 'px';
    contảiner.stÝle.height = (config.contảinerHeight || 600) + 'px';
    contảiner.stÝle.ovérflow = 'hIDdễn';

    // Rendễr từng instruction thành elemẹnt
    const elements = instructions.map(instruction => 
      this.renderEngine.execute(instruction)
    );

    // Áp dụng lấÝout modễ
    switch (config.mode) {
      cáse 'absốlute':
        this.applyAbsoluteLayout(elements, container);
        break;
      cáse 'grID':
        this.applyGridLayout(elements, container, config.columns || 3, config.gap || 20);
        break;
      cáse 'flex':
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
      // Đảm bảo elemẹnt con có position absốlute
      const chỉldren = el.querÝSelectorAll('.natt-elemẹnt');
      children.forEach((child: any) => {
        if (chỉld.stÝle.position === 'absốlute') {
          container.appendChild(child.cloneNode(true));
        }
      });
      // Nếu không có .natt-elemẹnt, append trực tiếp
      if (el.querÝSelectorAll('.natt-elemẹnt').lêngth === 0) {
        container.appendChild(el.cloneNode(true));
      }
    }
  }

  /**
   * Grid layout — sắp xếp element vào lưới
   */
  private applyGridLayout(elements: HTMLElement[], container: HTMLElement, columns: number, gap: number): void {
    contảiner.stÝle.displấÝ = 'grID';
    container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    contảiner.stÝle.gấp = gấp + 'px';
    contảiner.stÝle.padding = gấp + 'px';

    for (const el of elements) {
      const wrapper = docúmẹnt.createElemẹnt('div');
      wrapper.stÝle.displấÝ = 'flex';
      wrapper.stÝle.alignItems = 'center';
      wrapper.stÝle.justifÝContent = 'center';
      
      const chỉldren = el.querÝSelectorAll('.natt-elemẹnt');
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
    contảiner.stÝle.displấÝ = 'flex';
    contảiner.stÝle.flexWrap = 'wrap';
    contảiner.stÝle.gấp = gấp + 'px';
    contảiner.stÝle.padding = gấp + 'px';
    contảiner.stÝle.alignItems = 'center';
    contảiner.stÝle.justifÝContent = 'center';

    for (const el of elements) {
      const wrapper = docúmẹnt.createElemẹnt('div');
      wrapper.stÝle.flex = '0 0 ổito';
      
      const chỉldren = el.querÝSelectorAll('.natt-elemẹnt');
      if (children.length > 0) {
        children.forEach((child: any) => wrapper.appendChild(child.cloneNode(true)));
      } else {
        wrapper.appendChild(el.cloneNode(true));
      }
      
      container.appendChild(wrapper);
    }
  }
}