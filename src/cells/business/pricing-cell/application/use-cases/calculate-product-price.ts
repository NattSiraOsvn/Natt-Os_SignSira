/**
 * Use Case: Calculate Product Price
 * Orchestrates pricing calculation for a single product.
 */

import { PricingInput, PricingBreakdown, calculateFullPrice } from '../../domain/entities/pricing-calculator';

export interface CalculateProductPriceCommand {
  input: PricingInput;
}

export interface CalculateProductPriceResult {
  success: boolean;
  breakdown?: PricingBreakdown;
  error?: string;
}

export function executeCalculateProductPrice(command: CalculateProductPriceCommand): CalculateProductPriceResult {
  try {
    // Validate input
    if (command.input.goldWeightGram < 0) {
      return { success: false, error: 'trong luong vang khong duoc am' };
    }
    if (command.input.stoneValueVND < 0) {
      return { success: false, error: 'gia tam/da khong duoc am' };
    }

    const breakdown = calculateFullPrice(command.input);
    return { success: true, breakdown };
  } catch (err) {
    return { success: false, error: `lau tinh gia: ${String(err)}` };
  }
}
