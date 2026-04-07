import { EventBus } from '@/core/events/event-bus';
import{CustomsSmartLinkPort}from"../../ports/customs-smartlink.port";
export type HSCodeCategory="PRECIOUS_METAL"|"GEMSTONE"|"JEWELRY"|"EQUIPMENT"|"CHEMICAL"|"OTHER";
export type DutyRateScheme="ASEAN"|"MFN"|"FTA_EU"|"FTA_US";
export interface CustomsGood{hsCode:string;description:string;quantity:number;unit:string;cif_USD:number;category?:HSCodeCategory;}
export interface DutyCalculation{hsCode:string;cif_VND:number;dutyRate:number;dutyAmount:number;vatAmount:number;totalPayable:number;}
const DUTY_RATES:Record<string,number>={"7113":0.00,"7114":0.00,"7102":0.00,"7103":0.00,"7106":0.00,"7108":0.00,"8413":0.05,"8467":0.15};
function getDutyRate(hs:string,scheme:DutyRateScheme):number{
  const base=DUTY_RATES[hs.substring(0,4)]??0.10;
  if(scheme==="ASEAN")return Math.max(0,base-0.05);
  if(scheme==="FTA_EU"||scheme==="FTA_US")return 0;
  EventBus.emit('cell.metric', { cell: 'customs-cell', metric: 'engine.executed', value: 1, ts: Date.now() });

  return base;
}
export const CustomsRobotEngine={
  submitToAuthority:async(_:any):Promise<{status:string;trackingId:string}>=>{
    const r={status:"SUBMITTED",trackingId:`TRACK-${Date.now()}`};
    CustomsSmartLinkPort.notifyDeclarationSubmitted(r.trackingId);
    return r;
  },
  calculateDuty:(good:CustomsGood,exchangeRate:number,scheme:DutyRateScheme="ASEAN"):DutyCalculation=>{
    const cif_VND=Math.round(good.cif_USD*exchangeRate);
    const dutyRate=getDutyRate(good.hsCode,scheme);
    const dutyAmount=Math.round(cif_VND*dutyRate);
    const vatAmount=Math.round((cif_VND+dutyAmount)*0.10);
    return{hsCode:good.hsCode,cif_VND,dutyRate,dutyAmount,vatAmount,totalPayable:dutyAmount+vatAmount};
  },
  calculateBatch:(goods:CustomsGood[],rate:number,scheme:DutyRateScheme="ASEAN"):DutyCalculation[]=>
    goods.map(g=>CustomsRobotEngine.calculateDuty(g,rate,scheme)),
  classifyHS:(desc:string):HSCodeCategory=>{
    const d=desc.toUpperCase();
    if(/VÀNG|BẠCH KIM|GOLD|SILVER/.test(d))return"PRECIOUS_METAL";
    if(/KIM CƯƠNG|DIAMOND|SAPPHIRE|RUBY|EMERALD|ĐÁ QUÝ/.test(d))return"GEMSTONE";
    if(/NHẪN|DÂY CHUYỀN|VÒNG|LẮC|BÔNG TAI|TRANG SỨC/.test(d))return"JEWELRY";
    if(/MÁY|THIẾT BỊ|EQUIPMENT/.test(d))return"EQUIPMENT";
    if(/HÓA CHẤT|ACID|CHEMICAL/.test(d))return"CHEMICAL";
    return"OTHER";
  },
  getExchangeRate:async():Promise<number>=>25_400,
  batchProcess:async(files:any[],rate=25_400):Promise<any[]>=>{
    const goods:CustomsGood[]=files.map((f:any)=>({hsCode:f.hsCode??"7113",description:f.description??"",quantity:f.quantity??1,unit:f.unit??"PCS",cif_USD:f.cif_USD??0}));
    const calcs=CustomsRobotEngine.calculateBatch(goods,rate);
    return calcs.map((c,i)=>({
      ...c,
      id:`DECL-${Date.now()}-${i}`,
      status:"SUBMITTED",
      declarationType:"IMPORT" as const,
      importerId:files[i]?.importerId??"",
      totalCIF_VND:c.cif_VND,
      totalDuty:c.dutyAmount,
      totalVAT:c.vatAmount,
      totalPayable:c.totalPayable,
      createdAt:Date.now(),
      actionPlans:c.totalPayable>50_000_000?[{priority:"URGENT",description:"Kiểm tra lại HS Code"}]:[],
    }));
  },
};

// ── Legacy compat ──
;(CustomsRobotEngine as any).batchProcess=(goods:any[],rate:number)=>CustomsRobotEngine.calculateBatch(goods,rate);
