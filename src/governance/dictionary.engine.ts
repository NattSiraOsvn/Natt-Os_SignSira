export interface DictionaryVersion { version:string; changes:number; publishedAt:number; author:string; }
export const DictService = {
  lookup:(_:string):string|null=>null, addTerm:(_k:string,_v:string):void=>{},
  getVersions:():DictionaryVersion[]=>[], rollback:(_:string):void=>{}, export:():Record<string,string>=>({}),
  rollbackTo:(_versionId:string):void=>DictService.rollback(_versionId),
};
