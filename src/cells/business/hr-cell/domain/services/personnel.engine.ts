export interface LeaveRequest{id:string;employeeId:string;type:"ANNUAL"|"SICK"|"MATERNITY"|"UNPAID"|"COMPENSATORY";startDate:string;endDate:string;days:number;reason:string;status:"PENDING"|"APPROVED"|"REJECTED";approvedBy?:string;}
export interface LeaveBalance{employeeId:string;year:number;annualEntitled:number;annualUsed:number;sickUsed:number;remaining:number;}
const _leaves=new Map<string,LeaveRequest>();
const _balances=new Map<string,LeaveBalance>();
function calcDays(s:string,e:string):number{
  const start=new Date(s),end=new Date(e);let d=0;const cur=new Date(start);
  while(cur<=end){const dow=cur.getDay();if(dow!==0&&dow!==6)d++;cur.setDate(cur.getDate()+1);}
  return d;
}
export const PersonnelEngine={
  requestLeave:(employeeId:string,type:LeaveRequest["type"],startDate:string,endDate:string,reason:string):LeaveRequest=>{
    const req:LeaveRequest={id:`LV-${Date.now()}`,employeeId,type,startDate,endDate,days:calcDays(startDate,endDate),reason,status:"PENDING"};
    _leaves.set(req.id,req);return req;
  },
  approveLeave:(leaveId:string,approvedBy:string):LeaveRequest|null=>{
    const req=_leaves.get(leaveId);if(!req)return null;
    req.status="APPROVED";req.approvedBy=approvedBy;_leaves.set(leaveId,req);
    const bal=_balances.get(req.employeeId);
    if(bal&&req.type==="ANNUAL")bal.annualUsed+=req.days;
    if(bal&&req.type==="SICK")bal.sickUsed+=req.days;
    return req;
  },
  rejectLeave:(leaveId:string):LeaveRequest|null=>{
    const req=_leaves.get(leaveId);if(!req)return null;
    req.status="REJECTED";_leaves.set(leaveId,req);return req;
  },
  getLeaveBalance:(employeeId:string,year=new Date().getFullYear()):LeaveBalance=>{
    const key=`${employeeId}-${year}`;
    if(!_balances.has(key))_balances.set(key,{employeeId,year,annualEntitled:12,annualUsed:0,sickUsed:0,remaining:12});
    const bal=_balances.get(key)!;bal.remaining=bal.annualEntitled-bal.annualUsed;return bal;
  },
  getPendingLeaves:():LeaveRequest[]=>[..._leaves.values()].filter(l=>l.status==="PENDING"),
  getLeavesByEmployee:(employeeId:string):LeaveRequest[]=>[..._leaves.values()].filter(l=>l.employeeId===employeeId),
};
