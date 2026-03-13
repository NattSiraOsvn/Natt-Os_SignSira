// @ts-nocheck
export interface CreateProductionOrderInput{sku:string;productName:string;quantity:number;targetCompletionDate:string;materialList:Array<{materialCode:string;quantity:number;unit:string}>;assignedWorkerId?:string;priority:"LOW"|"NORMAL"|"HIGH"|"URGENT";}
export interface CreateProductionOrderResult{success:boolean;orderId?:string;estimatedDays:number;errors:string[];}
const DAYS:Record<string,number>={BONG_TAI:3,DAY_CHUYEN:7,MAT_DAY:5,VONG_TAY:4,LAC_TAY:5,NHAN_CUOI:3,NHAN_KET:4,NHAN_NAM:4,NHAN_NU:4,PHU_KIEN:2};
export function createProductionOrder(input:CreateProductionOrderInput):CreateProductionOrderResult{
  const errors:string[]=[];
  if(!input.sku?.trim())errors.push("SKU không được để trống");
  if(input.quantity<=0)errors.push("Số lượng phải > 0");
  if(!input.materialList?.length)errors.push("Cần danh sách nguyên liệu");
  if(errors.length>0)return{success:false,estimatedDays:0,errors};
  const cat=input.sku.split("-")[0]??"NHAN_NU";
  const days=Math.ceil((DAYS[cat]??5)*input.quantity*(input.priority==="URGENT"?0.7:1));
  return{success:true,orderId:`PO-${Date.now()}`,estimatedDays:days,errors:[]};
}
