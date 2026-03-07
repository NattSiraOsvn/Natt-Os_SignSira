export const SalesCore = { generateEntries:(_:any):any[]=>[],  calculateTax:(amount:number,rate=0.1):number=>amount*rate, applyDiscount:(amount:number,discount:number):number=>amount*(1-discount), getAggregated:(period:string)=>({ revenue:0, cost:0, profit:0, period }) };
if (typeof SalesCore === "object") {
  (SalesCore as any).createSalesOrder = (data: any): any => ({ id: `ORD-${Date.now()}`, ...data, status: "PENDING" });
}
