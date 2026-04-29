export interface RegisterWarrantyInput{orderId:string;customerId:string;productSku:string;productName:string;purchaseDate:string;serialNumber?:string;warrantyType:"STANDARD"|"EXTENDED"|"PREMIUM";}
export interface RegisterWarrantyResult{success:boolean;warrantyId?:string;expiryDate?:string;coverage:string[];error?:string;}
const MONTHS:Record<string,number>={STANDARD:12,EXTENDED:24,PREMIUM:36};
const COVERAGE:Record<string,string[]>={STANDARD:["lau san xuat","dut gay khoa"],EXTENDED:["lau san xuat","dut gay khoa","mai bong 1 lan","chinh size 1 lan"],PREMIUM:["lau san xuat","dut gay khoa","mai bong khong gioi han","chinh size 3 lan","Thay da roi (1 lan)"]};
export function registerWarranty(input:RegisterWarrantyInput):RegisterWarrantyResult{
  const expiry=new Date(input.purchaseDate);expiry.setMonth(expiry.getMonth()+(MONTHS[input.warrantyType]??12));
  return{success:true,warrantyId:`WR-${Date.now()}`,expiryDate:expiry.toISOString().split("T")[0],coverage:COVERAGE[input.warrantyType]??[]};
}
