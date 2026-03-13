// @ts-nocheck
export const VAT_RATES={STANDARD:0.10,REDUCED:0.08,ZERO:0.00,EXEMPT:-1}as const;
export type VATRate=typeof VAT_RATES[keyof typeof VAT_RATES];
export function formatVATRate(rate:number):string{if(rate===VAT_RATES.EXEMPT)return"Miễn thuế";return`${(rate*100).toFixed(0)}%`;}
export function calculateVAT(amount:number,rate:number):number{if(rate<=0)return 0;return Math.round(amount*rate);}
export function calculateVATInclusive(total:number,rate:number):{netAmount:number;vatAmount:number}{if(rate<=0)return{netAmount:total,vatAmount:0};const net=Math.round(total/(1+rate));return{netAmount:net,vatAmount:total-net};}
