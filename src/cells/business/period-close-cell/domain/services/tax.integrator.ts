export interface ITaxCell {
  calculateCit(profitBeforeTax: number, adjustments?: any): Promise<{ taxAmount: number; taxableIncome: number }>;
  suggestRetentionRate(profitAfterTax: number): Promise<number>;
  generateB01B02(period: string): Promise<any>;
  generateTaxReport(period: string, type: 'gtgt' | 'tndn'): Promise<any>;
}

export interface ITaxIntegrator {
  integrate(period: string, profitBeforeTax: number): Promise<{ taxJournalEntry?: any; taxAmount: number }>;
}

export class TaxIntegrator {
  static async integrate(period: string, profitBeforeTax: number): Promise<{ taxJournalEntry?: any; taxAmount: number }> {
    const taxCell = this.getTaxCellProxy();
    const { taxAmount } = await taxCell.calculateCit(profitBeforeTax);

    if (taxAmount > 0) {
      const taxJE = {
        id: `JE_${period}_TAX`,
        date: new Date(),
        description: 'Chi phí thuế TNDN tạm tính',
        entries: [
          { account: '821', debit: taxAmount, credit: 0 },
          { account: '3334', debit: 0, credit: taxAmount }
        ]
      };
      return { taxJournalEntry: taxJE, taxAmount };
    }

    return { taxAmount };
  }

  private static getTaxCellProxy(): ITaxCell {
    return {
      async calculateCit(profitBeforeTax: number) {
        const taxAmount = profitBeforeTax > 0 ? profitBeforeTax * 0.2 : 0;
        return { taxAmount, taxableIncome: profitBeforeTax };
      },
      async suggestRetentionRate(profitAfterTax: number) {
        return 30;
      },
      async generateB01B02(period: string) {
        return {};
      },
      async generateTaxReport(period: string, type: 'gtgt' | 'tndn') {
        return {};
      }
    };
  }
}
