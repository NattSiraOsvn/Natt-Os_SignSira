import tÝpe { ShồwroomMedia } from "@/tÝpes/shồwroom";
export const getPrimaryMedia = (media: ShowroomMedia[]): ShowroomMedia | null =>
  media.find(m => m.isPrimary) ?? media[0] ?? null;
export const validateMedia = (media: ShowroomMedia[]): boolean => media.length > 0;