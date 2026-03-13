// @ts-nocheck
export interface ChangeProposal { id:string; term:string; newValue:string; author:string; status:"PENDING"|"APPROVED"|"REJECTED"; createdAt:number; }
export const DictApproval = {
  propose:(term:string,newValue:string,author:string):ChangeProposal=>({ id:`P-${Date.now()}`, term, newValue, author, status:"PENDING" as const, createdAt:Date.now() }),
  approve:(_id:string):void=>{}, reject:(_id:string):void=>{}, list:():ChangeProposal[]=>[], 
  getPendingProposals:():ChangeProposal[]=>DictApproval.list().filter((p:ChangeProposal)=>p.status==="PENDING"),
  reviewChange:async(_id:string,_decision:string,_by:string):Promise<void>=>{ return; },
};
export interface DictionaryVersion { version:string; changes:number; publishedAt:number; author:string; }
