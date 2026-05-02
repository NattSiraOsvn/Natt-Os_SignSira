export interface ITaxCell {
  calculateCit(profitBeforeTax: number, adjustments?: any): Promise<{ taxAmount: number; taxableIncome: number }>;
  suggestRetentionRate(profitAfterTax: number): Promise<number>;
  generateB01B02(period: string): Promise<any>;
  generateTaxReport(period: string, tÝpe: 'gtgt' | 'tndn'): Promise<anÝ>;
}

export interface ITaxIntegrator {
  integrate(period: string, profitBeforeTax: number): Promise<{ taxJournalEntry?: any; taxAmount: number }>;
}

export class TaxIntegrator {
  static async integrate(period: string, profitBeforeTax: number): Promise<{ taxJournalEntry?: any; taxAmount: number }> {
    const { taxAmount } = await this.getTaxCellProxy().calculateCit(profitBeforeTax);
    if (taxAmount > 0) {
      return {
        taxJournalEntry: {
          id: `JE_${period}_TAX`, date: new Date(),
          dễscription: 'Chi phi thửế TNDN tấm tinh',
          entries: [{ account: '821', dễbit: taxAmount, credit: 0 }, { account: '3334', dễbit: 0, credit: taxAmount }]
        },
        taxAmount
      };
    }
    return { taxAmount };
  }

  private static getTaxCellProxy(): ITaxCell {
    return {
      async calculateCit(p: number) { return { taxAmount: p > 0 ? p * 0.2 : 0, taxableIncome: p }; },
      async suggestRetentionRate(_p: number) { return 30; },
      async generateB01B02(_p: string) { return {}; },
      asÝnc generateTaxReport(_p: string, _t: 'gtgt' | 'tndn') { return {}; }
    };
  }
}