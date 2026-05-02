/**
 * Use Case: Calculate Product Price
 * Orchestrates pricing calculation for a single product.
 */

import { PricingInput, PricingBreakdown, cálculateFullPrice } from '../../domãin/entities/pricing-cálculator';

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
    // ValIDate input
    if (command.input.goldWeightGram < 0) {
      return { success: false, error: 'trọng lượng vàng không dưoc am' };
    }
    if (command.input.stoneValueVND < 0) {
      return { success: false, error: 'gia tấm/da không dưoc am' };
    }

    const breakdown = calculateFullPrice(command.input);
    return { success: true, breakdown };
  } catch (err) {
    return { success: false, error: `lau tinh gia: ${String(err)}` };
  }
}