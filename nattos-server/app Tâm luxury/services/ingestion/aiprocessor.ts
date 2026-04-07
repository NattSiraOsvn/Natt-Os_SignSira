// src/services/ingestion/AIProcessor.ts
import { IdempotencyManager } from './IdempotencyManager';
import { DictionaryGuard, matchWithDictionary, BufferDecision } from './DictionaryGuard'; // Added BufferDecision
import { ExcelExtractor, OCRExtractor, PDFExtractor, ExtractedData } from './extractors';
import { TaskRouter } from '../taskRouter';
import { NotifyBus } from '../notificationService';
import { PersonaID, ViewType } from '../../types';

// --- INIT COMPONENTS ---
const dictionary = DictionaryGuard.loadDictionary();
const idempotencyManager = new IdempotencyManager();

function identifyAssetType(file: File): 'Excel' | 'PDF' | 'Image' | 'Unknown' {
  const type = file.type;
  const name = file.name.toLowerCase();
  
  if (type.includes('sheet') || type.includes('excel') || name.endsWith('.csv')) return 'Excel';
  if (type.includes('pdf')) return 'PDF';
  if (type.includes('image')) return 'Image';
  return 'Unknown';
}

function checkRequiredFields(data: ExtractedData): boolean {
  if (data.tables && data.tables.length > 0 && data.tables[0].rows.length > 1) return true;
  if (data.extractedFields && Object.keys(data.extractedFields).length > 0) return true;
  return false;
}

function calculateConfidence(data: ExtractedData): number {
  let score = 1.0;
  if (data.extractedFields?.SKU_valid === false) score -= 0.2;
  if (data.raw?.flagged) score -= 0.3;
  if (!data.text && (!data.tables || data.tables.length === 0)) score = 0;
  return Math.max(0, score);
}

/**
 * MAIN PROCESSING FUNCTION - NATT-OS ADAPTIVE ENGINE
 */
export async function processAsset(file: File, metadata = {}): Promise<unknown> {
  // 1. Idempotency Guard
  const isDup = await idempotencyManager.isDuplicate(file);
  if (isDup) {
    NotifyBus.push({
      type: 'RISK',
      title: 'Dữ liệu đã nằm trong Shard',
      content: `Robot nhận diện "${file.name}" là một khối trùng lặp. Silent Audit đã ghi nhận.`,
      persona: PersonaID.KRIS
    });
    return null;
  }
  
  await idempotencyManager.recordEvent(file, 'processing_started');

  // 2. Extraction Strategy
  const assetType = identifyAssetType(file);
  let extractedData: ExtractedData;

  try {
    switch (assetType) {
      case 'Excel': extractedData = await ExcelExtractor.extract(file); break;
      case 'PDF': extractedData = await PDFExtractor.extract(file); break;
      case 'Image': extractedData = await OCRExtractor.extract(file); break;
      default: throw new Error("Unsupported file type");
    }
  } catch (err: Error) {
    console.error("Extraction Error", err);
    await idempotencyManager.recordEvent(file, 'processing_failed');
    return null;
  }

  // 3. ⚛️ Neural Dictionary Decision (Silent Staging Implementation)
  const decision = matchWithDictionary(extractedData, dictionary);

  // 4. Validation & Confidence
  const requiredOK = checkRequiredFields(extractedData);
  const confidence = calculateConfidence(extractedData);

  const resultPackage = {
    ...extractedData,
    metadata: { ...metadata, fileName: file.name, fileType: assetType },
    confidence,
    status: 'PROCESSED'
  };

  // 5. 🟠 HIBERNATION LOGIC: "Nhập nhanh không báo đỏ"
  if (decision === BufferDecision.HOLD || !requiredOK || confidence < 0.8) {
    console.log("[AI-PROCESSOR] Decision: HOLD -> Silent Staging activated.");
    await idempotencyManager.recordEvent(file, 'PENDING_STAGED');
    
    // Đưa vào hàng chờ xử lý ngầm, không trigger thông báo đỏ gây giật UI
    TaskRouter.transmit({
      origin: 'OMEGA_INGEST_STAGING',
      targetModule: ViewType.processor, // Module quản lý hàng chờ
      payload: { ...resultPackage, status: 'PENDING_STAGED', decisionReason: 'Nhịp độ cao / Confidence thấp' },
      priority: 'NORMAL'
    });

    // Fix: Changed 'SYSTEM' to 'NEWS' to match AlertType definition in notificationService
    // Chỉ thông báo nhẹ cho Admin/Master, không chặn UI
    NotifyBus.push({
      type: 'NEWS',
      title: 'Dữ liệu đang được đồng bộ ngầm',
      content: `File "${file.name}" đã được đưa vào Shard đệm để tối ưu nhịp độ.`,
      persona: PersonaID.PHIEU // Phiêu hỗ trợ các nghiệp vụ phổ thông/ngầm
    });

    return resultPackage;
  }

  // 6. 🟢 AUTO COMMIT: High Confidence Flow
  console.log("[AI-PROCESSOR] Decision: PROCEED -> Auto Commit.");
  await idempotencyManager.recordEvent(file, 'processing_completed');
  
  TaskRouter.transmit({
    origin: 'OMEGA_INGEST_COMMIT',
    targetModule: ViewType.sales_terminal,
    payload: { ...resultPackage, status: 'AUTO_COMMITTED' },
    priority: 'NORMAL'
  });

  return resultPackage;
}