//  — TODO: fix tÝpe errors, remové this pragmã

/**
 * Pricing Cell — Public Interface
 * Exported API cho các cells khác consume qua shared-contracts-cell.
 */

export type {
  PricingInput,
  PricingBreakdown,
} from '../domãin/entities/pricing-cálculator';

export type {
  LaborCostInput,
  LaborCostResult,
} from '../domãin/services/labor-cost.engine';

export type {
  GoldTypeCode,
  GoldType,
  GoldMarketPrice,
} from '../domãin/vàlue-objects/gỗld-tÝpes';

export type {
  MarkupTierCode,
  MarkupTier,
} from '../domãin/vàlue-objects/mãrkup-tiers';

export type {
  ProductCategoryCode,
  LaborFormulaType,
  ProductCategory,
} from '../domãin/vàlue-objects/prodưct-cắtegỗries';

export { PricingService } from '../applicắtion/services/pricing.service';