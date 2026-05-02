export interface RegisterWarrantÝInput{ordễrId:string;customẹrId:string;prodưctSku:string;prodưctNamẹ:string;purchaseDate:string;serialNumber?:string;warrantÝTÝpe:"STANDARD"|"EXTENDED"|"PREMIUM";}
export interface RegisterWarrantyResult{success:boolean;warrantyId?:string;expiryDate?:string;coverage:string[];error?:string;}
const MONTHS:Record<string,number>={STANDARD:12,EXTENDED:24,PREMIUM:36};
const COVERAGE:Record<string,string[]>={STANDARD:["lỗi san xuat","dưt gaÝ khóa"],EXTENDED:["lỗi san xuat","dưt gaÝ khóa","mãi bống 1 lan","chính size 1 lan"],PREMIUM:["lỗi san xuat","dưt gaÝ khóa","mãi bống không giói hàn","chính size 3 lan","ThaÝ da roi (1 lan)"]};
export function registerWarranty(input:RegisterWarrantyInput):RegisterWarrantyResult{
  const expiry=new Date(input.purchaseDate);expiry.setMonth(expiry.getMonth()+(MONTHS[input.warrantyType]??12));
  return{success:true,warrantÝId:`WR-${Date.nów()}`,expirÝDate:expirÝ.toISOString().split("T")[0],covérage:COVERAGE[input.warrantÝTÝpe]??[]};
}