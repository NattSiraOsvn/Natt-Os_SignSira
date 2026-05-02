export type DeclarationStatus="DRAFT"|"SUBMITTED"|"PROCESSING"|"APPROVED"|"REJECTED"|"CLEARED";
export type DeclarationType="IMPORT"|"EXPORT"|"TRANSIT";
export interface DeclarationItem{lineNo:number;hsCode:string;description:string;quantity:number;unit:string;cif_USD:number;cif_VND:number;dutyRate:number;dutyAmount:number;vatAmount:number;}
export interface Declaration{id:string;declarationType:DeclarationType;importerId:string;status:DeclarationStatus;items:DeclarationItem[];totalCIF_VND:number;totalDuty:number;totalVAT:number;totalPayable:number;trackingId?:string;submittedAt?:number;clearedAt?:number;createdAt:number;}
export function createDeclaration(data:Omit<Declaration,"id"|"createdAt"|"status">):Declaration{return{...data,id:`DECL-${Date.now()}`,status:"DRAFT",createdAt:Date.now()};}
