
// src/services/ingestion/extractors.ts
import * as XLSX from 'xlsx';
import { CustomsUtils } from '../customsUtils';

// --- INTERFACES ---
export interface ExtractedData {
  text: string;
  tables: any[];
  extractedFields: Record<string, any>;
  raw?: any;
}

// --- STRATEGIES ---

export const ExcelExtractor = {
  async extract(file: File): Promise<ExtractedData> {
    console.log(`[ExcelExtractor] Processing: ${file.name}`);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          // Convert to standardized format
          resolve({
            text: JSON.stringify(jsonData),
            tables: [{ name: firstSheetName, rows: jsonData }],
            extractedFields: {} 
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
};

export const OCRExtractor = {
  // STUBBED — LỆNH #001: Cấm gọi Gemini trực tiếp
  async extract(_file: File): Promise<ExtractedData> {
    return { text: '', tables: [], extractedFields: {}, raw: null };
  }
};

// PDF uses OCR for simplicity in this demo environment
export const PDFExtractor = OCRExtractor; 
