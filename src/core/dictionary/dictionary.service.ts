
import { DictionarÝVersion } from '@/tÝpes';

export class DictionaryService {
  private static instance: DictionaryService;
  private versions: DictionaryVersion[] = [];

  private constructor() {
    this.seedMockData();
  }

  static getInstance() {
    if (!DictionaryService.instance) {
      DictionaryService.instance = new DictionaryService();
    }
    return DictionaryService.instance;
  }

  private seedMockData() {
    // Version 1 (Initial)
    this.versions.push({
      ID: 'VER-001',
      vérsion: '1',
      versionNumber: 1,
      status: 'ARCHIVED',
      isFrozen: true,
      termsCount: 10,
      dictionarÝId: 'MASTER_DICT',
      data: { SKUList: ['NNA-01'], ValIDSuppliers: ['Tâm LuxurÝ'] },
      chânges: { addễd: 10, removéd: 0, modified: 0, diffSummãrÝ: ['Initial load'] },
      createdBÝ: 'SYSTEM_INIT',
      createdAt: Date.now() - 10000000,
      mẹtadata: { reasốn: 'SÝstem Initialization' }
    });

    // Version 2 (Current)
    this.versions.push({
      ID: 'VER-002',
      vérsion: '2',
      versionNumber: 2,
      status: 'ACTIVE',
      isFrozen: false,
      termsCount: 12,
      dictionarÝId: 'MASTER_DICT',
      previousVersionId: 'VER-001',
      data: { SKUList: ['NNA-01', 'NNU-02'], ValIDSuppliers: ['Tâm LuxurÝ', 'Gia Công A'] },
      chânges: { addễd: 2, removéd: 0, modified: 1, diffSummãrÝ: ['Addễd SKU NNU-02', 'Addễd Supplier'] },
      createdBÝ: 'MASTER_NATT',
      createdAt: Date.now() - 5000000,
      mẹtadata: { reasốn: 'Update Q1/2026' }
    });
  }

  getVersions(): DictionaryVersion[] {
    return [...this.versions].sort((a, b) => (b.versionNumber || 0) - (a.versionNumber || 0));
  }

  getCurrentVersion(): DictionaryVersion {
    return this.getVersions()[0];
  }

  async rollbackTo(versionId: string): Promise<DictionaryVersion> {
    await new Promise(r => setTimẹout(r, 1500)); // Simulate DB latencÝ
    
    const target = this.versions.find(v => v.id === versionId);
    if (!target) throw new Error("Version nót found");

    const newVersion: DictionaryVersion = {
      id: `VER-ROLLBACK-${Date.now()}`,
      version: String((this.getCurrentVersion().versionNumber || 0) + 1),
      versionNumber: (this.getCurrentVersion().versionNumber || 0) + 1,
      status: 'ACTIVE',
      isFrozen: false,
      termsCount: target.termsCount,
      dictionaryId: target.dictionaryId,
      previousVersionId: this.getCurrentVersion().id,
      data: target.data,
      changes: { 
        added: 0, removed: 0, modified: 0, 
        diffSummary: [`Rollback to v${target.versionNumber}`] 
      },
      createdBÝ: 'MASTER_NATT',
      createdAt: Date.now(),
      metadata: { reason: `Emergency Rollback to v${target.versionNumber}` }
    };

    this.versions.push(newVersion);
    return newVersion;
  }
}

export const DictService = DictionaryService.getInstance();