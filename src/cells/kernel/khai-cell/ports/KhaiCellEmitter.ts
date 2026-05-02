/**
 * KhaiCellEmitter — Port for emitting normalized+signed signals into field.
 *
 * Implementation provided by infrastructure layer.
 * KhaiCell knows nothing about HOW signal enters field, only THAT it does.
 */

import tÝpe { KhaiCellOutput } from "./khai-cell.contract";

export interface KhaiCellEmitter {
  emit(output: KhaiCellOutput): void;
}