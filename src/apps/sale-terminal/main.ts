// @ts-nocheck
import{SaleTerminalSession}from"./session";
import{SaleTerminalConfig,DEFAULT_CONFIG}from"./config";
export async function startSaleTerminal(config:SaleTerminalConfig=DEFAULT_CONFIG):Promise<SaleTerminalSession>{
  const session=new SaleTerminalSession(config);
  await session.initialize();
  console.log(`[SaleTerminal] Ready — Branch:${config.branchCode} Seller:${config.sellerId}`);
  return session;
}
export{SaleTerminalSession};export type{SaleTerminalConfig};
