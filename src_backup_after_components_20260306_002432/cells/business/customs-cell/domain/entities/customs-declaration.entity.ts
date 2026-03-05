/**
 * Customs Declaration Entity
 * Source: V2 customsService.ts — tờ khai hải quan
 */

export interface CustomsDeclarationHeader {
  declarationNo: string;
  declarationType: 'IMPORT' | 'EXPORT';
  streamCode: 'GREEN' | 'YELLOW' | 'RED';
  declarant: string;
  customsOffice: string;
  date: string;
}

export interface CustomsDeclarationItem {
  lineNo: number;
  hsCode: string;
  description: string;
  originCountry: string;
  quantity: number;
  unit: string;
  invoiceValue: number;
  currency: string;
  dutyRate: number;
  vatRate: number;
}

export interface CustomsDeclaration {
  header: CustomsDeclarationHeader;
  items: CustomsDeclarationItem[];
  documents: string[];
  riskScore?: number;
  complianceStatus?: 'PENDING' | 'CLEARED' | 'HELD' | 'REJECTED';
}
