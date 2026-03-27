export interface SaleTerminalConfig{branchCode:string;sellerId:string;terminalId:string;offlineMode:boolean;printerEnabled:boolean;vatRate:number;}
export const DEFAULT_CONFIG:SaleTerminalConfig={branchCode:"HCM-01",sellerId:"",terminalId:`TERM-${Date.now()}`,offlineMode:false,printerEnabled:true,vatRate:0.10};
