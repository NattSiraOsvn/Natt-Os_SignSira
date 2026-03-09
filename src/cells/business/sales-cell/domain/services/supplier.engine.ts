export type SupplierTier="GOLD"|"SILVER"|"BRONZE"|"TRIAL";
export type SupplierStatus="ACTIVE"|"SUSPENDED"|"BLACKLISTED"|"PENDING";
export interface Supplier{id:string;name:string;taxCode:string;address:string;contactName:string;phone:string;email?:string;tier:SupplierTier;status:SupplierStatus;paymentTermDays:number;creditLimit:number;currentDebt:number;categories:string[];createdAt:number;}
const _suppliers=new Map<string,Supplier>();
export const SupplierEngine={
  register:(data:Omit<Supplier,"id"|"status"|"currentDebt"|"createdAt">):Supplier=>{
    const s:Supplier={...data,id:`SUP-${Date.now()}`,status:"PENDING",currentDebt:0,createdAt:Date.now()};
    _suppliers.set(s.id,s);return s;
  },
  approve:(id:string):void=>{const s=_suppliers.get(id);if(s){s.status="ACTIVE";_suppliers.set(id,s);}},
  suspend:(id:string):void=>{const s=_suppliers.get(id);if(s){s.status="SUSPENDED";_suppliers.set(id,s);}},
  getAll:():Supplier[]=>[..._suppliers.values()],
  getActive:():Supplier[]=>[..._suppliers.values()].filter(s=>s.status==="ACTIVE"),
  getByTier:(tier:SupplierTier):Supplier[]=>[..._suppliers.values()].filter(s=>s.tier===tier),
  updateDebt:(id:string,amount:number):void=>{const s=_suppliers.get(id);if(s){s.currentDebt+=amount;_suppliers.set(id,s);}},
  checkCreditAvailable:(id:string,amount:number):boolean=>{const s=_suppliers.get(id);return s?(s.currentDebt+amount)<=s.creditLimit:false;},
  classifyTier:(total:number):SupplierTier=>total>=5_000_000_000?"GOLD":total>=1_000_000_000?"SILVER":total>=200_000_000?"BRONZE":"TRIAL",
};
