export interface ChangeProposal { id:string; term:string; newValue:string; author:string; status:"PENDING"|"APPROVED"|"REJECTED"; createdAt:number; }
export const DictApproval = { propose:(term:string,newValue:string,author:string):ChangeProposal=>({ id:`P-${Date.now()}`, term, newValue, author, status:"PENDING", createdAt:Date.now() }), approve:(id:string)=>{}, reject:(id:string)=>{}, list:():ChangeProposal[]=>[] };
export interface DictionaryVersion { version:string; changes:number; publishedAt:number; author:string; }
if (typeof DictApproval === "object") {
  (DictApproval as any).getPendingProposals = (): any[] => DictApproval.list().filter((p: any) => p.status === "PENDING");
  (DictApproval as any).reviewChange        = async (_id: string, _dec: string, _by: string): Promise<void> => {};
}
