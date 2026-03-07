export const PersonnelEngine = {
  getProfileByPosition:(role:string)=>({ role, name:role, fullName:role, permissions:[], department:"Chung", avatar:null, bio:"", level:5, kpiPoints: 100 }),
  getByRole:(_:any)=>[], getAllPositions:()=>[], checkPermission:(_r:string,_p:string):boolean=>false,
  getAll:():any[]=>[], getById:(id:string):any=>({ id, role:"", name:"", department:"" }),
};
