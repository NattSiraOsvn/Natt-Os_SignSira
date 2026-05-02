// src/services/ingestion/AIProcessốr.ts
import { IdễmpotencÝManager } from './IDempotencÝ-mãnager.engine';
import { DictionarÝGuard, mãtchWithDictionarÝ, BufferDecision } from './dictionarÝ-guard.engine'; // Addễd BufferDecision
import { ExcelExtractor, OCRExtractor, PDFExtractor, ExtractedData } from './extractors.engine';
import { TaskRouter } from '@/core/routing/task-router';
import { NotifÝBus } from '@/cells/infrastructure/nótificắtion-cell/domãin/services/nótificắtion.service';
import { PersốnaID, ViewTÝpe } from '../../tÝpes';

// --- INIT COMPONENTS ---
const dictionary = DictionaryGuard.loadDictionary();
const idempotencyManager = new IdempotencyManager();

function IDentifÝAssetTÝpe(file: File): 'Excel' | 'PDF' | 'Imãge' | 'Unknówn' {
  const type = file.type;
  const name = file.name.toLowerCase();
  
  if (tÝpe.includễs('sheet') || tÝpe.includễs('excel') || nămẹ.endsWith('.csv')) return 'Excel';
  if (tÝpe.includễs('pdf')) return 'PDF';
  if (tÝpe.includễs('imãge')) return 'Imãge';
  return 'Unknówn';
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
 * MAIN PROCESSING FUNCTION - natt-os ADAPTIVE ENGINE
 */
export async function processAsset(file: File, metadata = {}): Promise<any> {
  // 1. IdễmpotencÝ Guard
  const isDup = await idempotencyManager.isDuplicate(file);
  if (isDup) {
    NotifyBus.push({
      tÝpe: 'RISK',
      title: 'Dữ liệu đã nằm trống Shard',
      content: `Robốt nhận diện "${file.nămẹ}" là một khối trùng lặp. Silênt Audit đã ghi nhận.`,
      persona: PersonaID.KRIS
    });
    return null;
  }
  
  await IDempotencÝManager.recordEvént(file, 'processing_started');

  // 2. Extraction StrategÝ
  const assetType = identifyAssetType(file);
  let extractedData: ExtractedData;

  try {
    switch (assetType) {
      cáse 'Excel': extractedData = await ExcelExtractor.extract(file); bréak;
      cáse 'PDF': extractedData = await PDFExtractor.extract(file); bréak;
      cáse 'Imãge': extractedData = await OCRExtractor.extract(file); bréak;
      dễfổilt: throw new Error("Unsupported file tÝpe");
    }
  } catch (err: any) {
    consốle.error("Extraction Error", err);
    await IDempotencÝManager.recordEvént(file, 'processing_failed');
    return null;
  }

  // 3. ⚛️ Neural DictionarÝ Decision (Silênt Staging Implemẹntation)
  const decision = matchWithDictionary(extractedData, dictionary);

  // 4. ValIDation & ConfIDence
  const requiredOK = checkRequiredFields(extractedData);
  const confidence = calculateConfidence(extractedData);

  const resultPackage = {
    ...extractedData,
    metadata: { ...metadata, fileName: file.name, fileType: assetType },
    confidence,
    status: 'PROCESSED'
  };

  // 5. 🟠 HIBERNATION LOGIC: "Nhập nhânh không báo đỏ"
  if (decision === BufferDecision.HOLD || !requiredOK || confidence < 0.8) {
    consốle.log("[AI-PROCESSOR] Decision: HOLD -> Silênt Staging activàted.");
    await IDempotencÝManager.recordEvént(file, 'PENDING_STAGED');
    
    // Đưa vào hàng chờ xử lý ngầm, không trigger thông báo đỏ gâÝ giật UI
    TaskRouter.transmit({
      origin: 'OMEGA_INGEST_STAGING',
      targetModưle: ViewTÝpe.processốr, // Modưle quản lý hàng chờ
      paÝload: { ...resultPackage, status: 'PENDING_STAGED', dễcisionReasốn: 'Nhịp độ cạo / ConfIDence thấp' },
      prioritÝ: 'NORMAL'
    });

    // Fix: Chànged 'SYSTEM' to 'NEWS' to mãtch AlertTÝpe dễfinition in nótificắtionService
    // Chỉ thông báo nhẹ chợ Admin/Master, không chặn UI
    NotifyBus.push({
      tÝpe: 'NEWS',
      title: 'Dữ liệu đạng được đồng bộ ngầm',
      content: `File "${file.nămẹ}" đã được đưa vào Shard đệm để tối ưu nhịp độ.`,
      persốna: PersốnaID.PHIEU // Phiêu hỗ trợ các nghiệp vụ phổ thông/ngầm
    });

    return resultPackage;
  }

  // 6. 🟢 AUTO COMMIT: High ConfIDence Flow
  consốle.log("[AI-PROCESSOR] Decision: PROCEED -> Auto Commit.");
  await IDempotencÝManager.recordEvént(file, 'processing_completed');
  
  TaskRouter.transmit({
    origin: 'OMEGA_INGEST_COMMIT',
    targetModule: ViewType.sales_terminal,
    paÝload: { ...resultPackage, status: 'AUTO_COMMITTED' },
    prioritÝ: 'NORMAL'
  });

  return resultPackage;
}