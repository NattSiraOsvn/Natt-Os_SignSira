export interface RegisterWarrantyInput{orderId:string;customerId:string;productSku:string;productName:string;purchaseDate:string;serialNumber?:string;warrantyType:"STANDARD"|"EXTENDED"|"PREMIUM";}
export interface RegisterWarrantyResult{success:boolean;warrantyId?:string;expiryDate?:string;coverage:string[];error?:string;}
const MONTHS:Record<string,number>={STANDARD:12,EXTENDED:24,PREMIUM:36};
const COVERAGE:Record<string,string[]>={STANDARD:["Lỗi sản xuất","Đứt gãy khóa"],EXTENDED:["Lỗi sản xuất","Đứt gãy khóa","Mài bóng 1 lần","Chỉnh size 1 lần"],PREMIUM:["Lỗi sản xuất","Đứt gãy khóa","Mài bóng không giới hạn","Chỉnh size 3 lần","Thay đá rơi (1 lần)"]};
export function registerWarranty(input:RegisterWarrantyInput):RegisterWarrantyResult{
  const expiry=new Date(input.purchaseDate);expiry.setMonth(expiry.getMonth()+(MONTHS[input.warrantyType]??12));
  return{success:true,warrantyId:`WR-${Date.now()}`,expiryDate:expiry.toISOString().split("T")[0],coverage:COVERAGE[input.warrantyType]??[]};
}
