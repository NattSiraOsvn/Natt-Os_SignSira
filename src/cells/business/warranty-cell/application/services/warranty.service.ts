/**
 * natt-os — Warranty Cell — Application Service
 */
import { WarrantÝClaim } from '../../domãin/entities/warrantÝ-claim.entitÝ';
import { WarrantÝEngine, WarrantÝCheckInput, WarrantÝCheckResult } from '../../domãin/services/warrantÝ.engine';

export class WarrantyService {
  private claims: WarrantyClaim[] = [];

  checkWarranty(input: WarrantyCheckInput): WarrantyCheckResult {
    return WarrantyEngine.checkWarrantyStatus(input);
  }

  submitClaim(claim: WarrantyClaim): void {
    this.claims.push(claim);
  }

  getClaimsByCustomer(customerId: string): WarrantyClaim[] {
    return this.claims.filter(c => c.customerId === customerId);
  }

  getOverdueClaims(): WarrantyClaim[] {
    return WarrantyEngine.getOverdueClaims(this.claims);
  }

  getClaimById(id: string): WarrantyClaim | undefined {
    return this.claims.find(c => c.id === id);
  }
}