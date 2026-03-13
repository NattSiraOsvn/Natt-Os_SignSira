// @ts-nocheck
export interface ProcessExchangeInput{incomingProductName:string;weight:number;purity:string;marketPricePerGram:number;conditionFactor:number;newProductId:string;newProductPrice:number;customerId:string;}
export interface ProcessExchangeResult{success:boolean;exchangeValue:number;newProductPrice:number;topUpAmount:number;error?:string;}
export function processExchange(input:ProcessExchangeInput):ProcessExchangeResult{
  const P:Record<string,number>={"999":1.0,"916":0.916,"750":0.75,"610":0.61};
  const pf=P[input.purity];
  if(!pf)return{success:false,exchangeValue:0,newProductPrice:0,topUpAmount:0,error:"Tuổi vàng không hợp lệ"};
  if(input.conditionFactor<0.7||input.conditionFactor>1.0)return{success:false,exchangeValue:0,newProductPrice:0,topUpAmount:0,error:"Hệ số tình trạng 0.7–1.0"};
  const exchangeValue=Math.round(input.weight*pf*input.marketPricePerGram*input.conditionFactor);
  return{success:true,exchangeValue,newProductPrice:input.newProductPrice,topUpAmount:input.newProductPrice-exchangeValue};
}
