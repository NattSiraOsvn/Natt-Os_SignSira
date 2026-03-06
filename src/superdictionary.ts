export const SUPER_DICTIONARY: Record<string,string> = { "NK319":"Nhẫn kết NK-319", "NNA001":"Nhẫn kim cương NNA-001" };
const SuperDictionary = { lookup:(c:string)=>SUPER_DICTIONARY[c]??c, getAll:()=>SUPER_DICTIONARY };
export default SuperDictionary;
