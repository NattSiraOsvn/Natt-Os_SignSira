export const ExportEngine = {
  toCSV:(data:any[],filename:string):void=>{ if(!data.length)return; const h=Object.keys(data[0]).join(","); const r=data.map((x:any)=>Object.values(x).join(",")).join("\n"); const b=new Blob([`${h}\n${r}`],{type:"text/csv"}); const a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download=`${filename}.csv`; a.click(); },
  toJSON:(data:any,filename:string):void=>{ const b=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download=`${filename}.json`; a.click(); },
  toPDF:async(_c:string,_f:string):Promise<void>=>{ return; },
  toPdf:async(_c?:string,_f?:string):Promise<void>=>{ return; },
  toXLSX:(data:any[],filename:string):void=>{ if(!data.length)return; const b=new Blob([JSON.stringify(data)],{type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download=`${filename}.xlsx`; a.click(); },
  toExcel:(data:any[],filename:string):void=>ExportEngine.toXLSX(data,filename),
  toXml:async(_data:any,_f:string,_root?:string):Promise<void>=>{ return; },
};
