export const generatePersonaResponse=async(p:string,q:string):Promise<string>=>`[${p}] ${q.slice(0,50)}`;
export const generateBlueprint=async(d:string):Promise<string>=>`# Blueprint\n${d}`;
export const speakText=async(t:string)=>{ if("speechSynthesis"in window){const u=new SpeechSynthesisUtterance(t);u.lang="vi";window.speechSynthesis.speak(u);} };
export const requestApiKey=():string|null=>null;
export const extractGuarantyData=async(_:string):Promise<Record<string,string>>=>({}); 
export const extractCCCDData=async(_:string):Promise<Record<string,string>>=>({}); 
export const generateIdentityHash=(d:Record<string,string>):string=>btoa(JSON.stringify(d)).slice(0,32);
export const generatePatentContent=async(c:string):Promise<string>=>`# Patent\n${c}`;
