import type { InputMetrics, InputPersona } from "@/types";
export const Calibration = {
  analyze:(metrics:InputMetrics):{ persona:InputPersona; confidence:number }=>{ const cpm=metrics.currentCPM; let name="NORMAL"; let desc="Nhập liệu bình thường"; if(cpm>200){name="EXPERT";desc="Chuyên gia";} else if(cpm>100){name="PROFICIENT";desc="Thành thạo";} else if(cpm<30){name="CAUTIOUS";desc="Cẩn thận";} return { persona:{ id:name, name, description:desc, cpmRange:[cpm-20,cpm+20] as [number,number], intensityThreshold:metrics.intensity }, confidence:Math.min(95,60+Math.floor(metrics.keystrokes/10)) }; },
  benchmark:(samples:InputMetrics[]):InputMetrics=>{ if(!samples.length)return{currentCPM:0,keystrokes:0,clicks:0,intensity:0}; const avg=(key:keyof InputMetrics)=>samples.reduce((s:number,m:InputMetrics)=>s+(m[key] as number),0)/samples.length; return{currentCPM:avg("currentCPM"),keystrokes:avg("keystrokes"),clicks:avg("clicks"),intensity:avg("intensity")}; },
  identifyPersona:(metrics:InputMetrics):InputPersona=>Calibration.analyze(metrics).persona,
  saveProfile:(_profile:any):void=>{},
};
