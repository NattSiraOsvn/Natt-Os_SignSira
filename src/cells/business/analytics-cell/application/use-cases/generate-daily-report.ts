// @ts-nocheck
import{AnalyticsEngine}from"../../domain/services/analytics.engine";
export interface GenerateDailyReportInput{date:string;branchCode?:string;metrics:{totalRevenue:number;totalOrders:number;totalCost:number;newCustomers:number;returnCustomers:number;averageOrderValue:number;topProducts:Array<{sku:string;name:string;qty:number;revenue:number}>};}
export interface GenerateDailyReportResult{success:boolean;report?:any;grossMargin:number;grossMarginRate:number;conversionInsight:string;}
export function generateDailyReport(input:GenerateDailyReportInput):GenerateDailyReportResult{
  const report=AnalyticsEngine.buildReport(input.metrics,input.date);
  const grossMargin=input.metrics.totalRevenue-input.metrics.totalCost;
  const grossMarginRate=input.metrics.totalRevenue>0?grossMargin/input.metrics.totalRevenue:0;
  const ratio=input.metrics.returnCustomers/Math.max(1,input.metrics.totalOrders);
  return{success:true,report,grossMargin,grossMarginRate,conversionInsight:ratio>0.5?"Khách quen chiếm đa số — tập trung upsell":"Cần tăng khách mới — review marketing"};
}
