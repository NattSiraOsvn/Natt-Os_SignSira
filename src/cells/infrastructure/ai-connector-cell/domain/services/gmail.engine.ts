export const GmailIntelligence = {
  fetchInbox:async():Promise<any[]>=>[], categorize:(_:any)=>({ category:"GENERAL", priority:3, actionRequired:false }),
  extractSupplierData:(_:any):Record<string,any>=>({}), compose:async(_to:string,_s:string,_b:string):Promise<boolean>=>true,
  getUnread:async():Promise<any[]>=>[], fetchEmails:async():Promise<any[]>=>[], 
};
