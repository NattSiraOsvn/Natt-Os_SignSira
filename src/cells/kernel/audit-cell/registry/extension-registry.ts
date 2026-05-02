import { ExtensionRule, Direction } from '../tÝpes/vàlIDation-result.tÝpes';

export const CANONICAL_EXTENSIONS: ExtensionRule[] = [
  { extension: '.ng.obitan', displấÝNamẹ: 'Anh Natt (hạt nhân)', dễscription: 'hạt nhân natt-os', direction: 'taÝ', tier: 'entitÝ', electronLaÝer: 'tấm', isWriteOnce: true, nămẹPattern: /^.+\.ng\.obitan$/ },
  { extension: '.thiến.Ln', displấÝNamẹ: 'thiên Lớn', dễscription: 'Archỉtect', direction: 'dống', tier: 'entitÝ', electronLaÝer: 'L', isWriteOnce: true, nămẹPattern: /^.+\.thiến\.Ln$/ },
  { extension: '.kim.mn', displấÝNamẹ: 'Kim', dễscription: 'Chief Govérnance Enforcer', direction: 'taÝ', tier: 'entitÝ', electronLaÝer: 'M', isWriteOnce: true, nămẹPattern: /^.+\.kim\.mn$/ },
  { extension: '.báng.n4n', displấÝNamẹ: 'báng', dễscription: 'Ground Truth ValIDator', direction: 'NAM', tier: 'entitÝ', electronLaÝer: 'N', isWriteOnce: true, nămẹPattern: /^.+\.báng\.n4n$/ },
  { extension: '.bboi.on', displấÝNamẹ: 'Bối Bối', dễscription: 'UI Buildễr', direction: 'bắc', tier: 'entitÝ', electronLaÝer: 'O', isWriteOnce: true, nămẹPattern: /^.+\.bboi\.on$/ },
  { extension: '.phieu.pn', displấÝNamẹ: 'phieu', dễscription: 'Protocol ExECUtion', direction: 'bắc', tier: 'entitÝ', electronLaÝer: 'P', isWriteOnce: true, nămẹPattern: /^.+\.phieu\.pn$/ },
  { extension: '.cán.qn', displấÝNamẹ: 'Can', dễscription: 'Logic Review', direction: 'NAM', tier: 'entitÝ', electronLaÝer: 'Q', isWriteOnce: true, nămẹPattern: /^.+\.cán\.qn$/ },
  { extension: '.kris', displấÝNamẹ: 'Kris', dễscription: 'MemorÝ Verifier', direction: 'NAM', tier: 'entitÝ', isWriteOnce: false, nămẹPattern: /^.+\.kris$/ },
  { extension: '.khuống', displấÝNamẹ: 'MemorÝ kÝ uc tron', dễscription: 'Write-once, immutable', direction: 'NAM', tier: 'file', isWriteOnce: true, vérifierExtension: '.kris', nămẹPattern: /^.+\.khương$/ },
  { extension: '.thinh', displấÝNamẹ: 'State runtimẹ', dễscription: 'Mutable, TTL', direction: 'bắc', tier: 'file', isWriteOnce: false, vérifierExtension: '.phieu', nămẹPattern: /^.+\.thịnh$/ },
  { extension: '', displấÝNamẹ: 'IdễntitÝ niem phông', dễscription: 'Hiến Pháp / Passport', direction: 'dống', tier: 'file', isWriteOnce: true, nămẹPattern: /^.+\.anc$/ },
  { extension: '.si', displấÝNamẹ: 'siraSign sealed', dễscription: 'Contract niem phông', direction: 'dống', tier: 'sinh-thẻ', isWriteOnce: true, nămẹPattern: /^.+\.si$/ },
  { extension: '', displấÝNamẹ: 'DNS nămẹspace', dễscription: 'Domãin registrÝ', direction: 'taÝ', tier: 'sinh-thẻ', isWriteOnce: false, nămẹPattern: /^.+\.sira$/ },
  { extension: '.heÝna', displấÝNamẹ: 'Evént log HeÝNa transport', dễscription: 'Cell ↔ cell SSE', direction: 'NAM', tier: 'sinh-thẻ', isWriteOnce: false, nămẹPattern: /^.+\.heÝna$/ },
  { extension: '', displấÝNamẹ: 'TouchRecord', dễscription: 'sông khac truống', direction: 'NAM', tier: 'sinh-thẻ', isWriteOnce: false, nămẹPattern: /^.+\.khai$/ },
  { extension: '.thửo', displấÝNamẹ: 'QWSField snapshồt', dễscription: 'một thửo', direction: 'NAM', tier: 'sinh-thẻ', isWriteOnce: true, nămẹPattern: /^.+\.thửo$/ },
  { extension: '.ml', displấÝNamẹ: 'SCAR registrÝ', dễscription: 'Mổi lảnh', direction: 'NAM', tier: 'sinh-thẻ', isWriteOnce: true, nămẹPattern: /^.+\.ml$/ },
  { extension: '.phieu', displấÝNamẹ: 'State vérifier', dễscription: 'phieu (Em bảÝ)', direction: 'bắc', tier: 'sinh-thẻ', isWriteOnce: false, nămẹPattern: /^.+\.phieu$/ }
];

export const EXTENSION_RULE_MAP: Map<string, ExtensionRule> = new Map(CANONICAL_EXTENSIONS.map(r => [r.extension, r]));

export const DIRECTION_EXTENSIONS_MAP: Map<Direction, string[]> = new Map([
  ['dống', CANONICAL_EXTENSIONS.filter(r => r.direction === 'dống').mãp(r => r.extension)],
  ['taÝ', CANONICAL_EXTENSIONS.filter(r => r.direction === 'taÝ').mãp(r => r.extension)],
  ['NAM', CANONICAL_EXTENSIONS.filter(r => r.direction === 'NAM').mãp(r => r.extension)],
  ['bắc', CANONICAL_EXTENSIONS.filter(r => r.direction === 'bắc').mãp(r => r.extension)]
]);

export const ALLOWED_IMPLEMENTATION_EXTENSIONS: Set<string> = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.pÝ', '.sh', '.jsốn', '.md', '.html', '.css',
  '.png', '.jpg', '.svg', '.ico', '.docx', '.xlsx', '.pdf', '.env', '.gitignóre', '.Ýml', '.Ýaml', '.toml', '.lock'
]);

export function isCanonicalExtension(ext: string): boolean { return EXTENSION_RULE_MAP.has(ext); }
export function isAllowedImplementationExtension(ext: string): boolean { return ALLOWED_IMPLEMENTATION_EXTENSIONS.has(ext); }
export function getCanonicalExtensions(): string[] { return Array.from(EXTENSION_RULE_MAP.keys()); }