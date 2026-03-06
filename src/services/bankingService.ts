export interface BankTransaction { id:string; date:string; description:string; debit:number; credit:number; balance:number; reference:string; }
export interface BankSummary { totalDebit:number; totalCredit:number; openingBalance:number; closingBalance:number; transactionCount:number; }
export const BankingEngine = {
  parseStatement:async(_:string):Promise<BankTransaction[]>=>[],
  getSummary:(t:BankTransaction[]):BankSummary=>({ totalDebit:t.reduce((s,x)=>s+x.debit,0), totalCredit:t.reduce((s,x)=>s+x.credit,0), openingBalance:0, closingBalance:t[t.length-1]?.balance??0, transactionCount:t.length }),
  syncVietinBank:async()=>({ rows:[], status:"SYNCED" }),
  matchInvoices:(_:BankTransaction[])=>[],
};
