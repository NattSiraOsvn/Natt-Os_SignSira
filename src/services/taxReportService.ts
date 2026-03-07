export const TaxReportService = {
  generateVAT:(metrics:any,period:string)=>({ period, totalSales:metrics?.totalRevenue??0, vatCollected:(metrics?.totalRevenue??0)*0.1, vatPaid:0, vatDue:0, filingDeadline:new Date().toISOString().split("T")[0] }),
  generatePIT:(employeeId:string,year:number)=>({ employeeId, year, grossIncome:0, taxableIncome:0, taxDue:0, taxPaid:0 }),
  getDeadlines:()=>[{ type:"VAT_MONTHLY", deadline:"20th of each month", penalty:"0.05%/day" }],
  validate:(_:any)=>({ valid:true, errors:[] }),
  generateVATReport:(_data:any[],period:string):any=>TaxReportService.generateVAT({},period),
  generatePITReport:(_employees:any[],_period?:string):any=>({ employees:_employees, total:0 }),
};
