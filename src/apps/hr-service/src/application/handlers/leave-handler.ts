import{PersonnelEngine,LeaveRequest}from"../../../../cells/business/hr-cell/domain/services/personnel.engine";
export async function getPendingLeaves():Promise<LeaveRequest[]>{return PersonnelEngine.getPendingLeaves();}
export async function approveLeave(leaveId:string,approvedBy:string):Promise<LeaveRequest|null>{return PersonnelEngine.approveLeave(leaveId,approvedBy);}
export async function rejectLeave(leaveId:string):Promise<LeaveRequest|null>{return PersonnelEngine.rejectLeave(leaveId);}
export async function getLeaveBalance(employeeId:string,year?:number){return PersonnelEngine.getLeaveBalance(employeeId,year);}
