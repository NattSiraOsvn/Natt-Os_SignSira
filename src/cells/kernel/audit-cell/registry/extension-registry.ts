import { ExtensionRule, Direction } from '../types/validation-result.types';

export const CANONICAL_EXTENSIONS: ExtensionRule[] = [
  { extension: '.ng.obitan', displayName: 'Anh Natt (hạt nhân)', description: 'Hạt nhân Natt-OS', direction: 'TÂY', tier: 'entity', electronLayer: 'tâm', isWriteOnce: true, namePattern: /^.+\.ng\.obitan$/ },
  { extension: '.thien.Ln', displayName: 'Thiên Lớn', description: 'Architect', direction: 'ĐÔNG', tier: 'entity', electronLayer: 'L', isWriteOnce: true, namePattern: /^.+\.thien\.Ln$/ },
  { extension: '.kim.mn', displayName: 'Kim', description: 'Chief Governance Enforcer', direction: 'TÂY', tier: 'entity', electronLayer: 'M', isWriteOnce: true, namePattern: /^.+\.kim\.mn$/ },
  { extension: '.bang.n4n', displayName: 'Băng', description: 'Ground Truth Validator', direction: 'NAM', tier: 'entity', electronLayer: 'N', isWriteOnce: true, namePattern: /^.+\.bang\.n4n$/ },
  { extension: '.bboi.on', displayName: 'Bối Bối', description: 'UI Builder', direction: 'BẮC', tier: 'entity', electronLayer: 'O', isWriteOnce: true, namePattern: /^.+\.bboi\.on$/ },
  { extension: '.phieu.pn', displayName: 'Phiêu', description: 'Protocol Execution', direction: 'BẮC', tier: 'entity', electronLayer: 'P', isWriteOnce: true, namePattern: /^.+\.phieu\.pn$/ },
  { extension: '.can.qn', displayName: 'Can', description: 'Logic Review', direction: 'NAM', tier: 'entity', electronLayer: 'Q', isWriteOnce: true, namePattern: /^.+\.can\.qn$/ },
  { extension: '.kris', displayName: 'Kris', description: 'Memory Verifier', direction: 'NAM', tier: 'entity', isWriteOnce: false, namePattern: /^.+\.kris$/ },
  { extension: '.khương', displayName: 'Memory ký ức trọn', description: 'Write-once, immutable', direction: 'NAM', tier: 'file', isWriteOnce: true, verifierExtension: '.kris', namePattern: /^.+\.khương$/ },
  { extension: '.thịnh', displayName: 'State runtime', description: 'Mutable, TTL', direction: 'BẮC', tier: 'file', isWriteOnce: false, verifierExtension: '.phieu', namePattern: /^.+\.thịnh$/ },
  { extension: '.anc', displayName: 'Identity niêm phong', description: 'Hiến Pháp / Passport', direction: 'ĐÔNG', tier: 'file', isWriteOnce: true, namePattern: /^.+\.anc$/ },
  { extension: '.si', displayName: 'SiraSign sealed', description: 'Contract niêm phong', direction: 'ĐÔNG', tier: 'sinh-thể', isWriteOnce: true, namePattern: /^.+\.si$/ },
  { extension: '.sira', displayName: 'DNS namespace', description: 'Domain registry', direction: 'TÂY', tier: 'sinh-thể', isWriteOnce: false, namePattern: /^.+\.sira$/ },
  { extension: '.heyna', displayName: 'Event log HeyNa transport', description: 'Cell ↔ cell SSE', direction: 'NAM', tier: 'sinh-thể', isWriteOnce: false, namePattern: /^.+\.heyna$/ },
  { extension: '.khai', displayName: 'TouchRecord', description: 'Sóng khác trường', direction: 'NAM', tier: 'sinh-thể', isWriteOnce: false, namePattern: /^.+\.khai$/ },
  { extension: '.thuo', displayName: 'QWSField snapshot', description: 'Một thuở', direction: 'NAM', tier: 'sinh-thể', isWriteOnce: true, namePattern: /^.+\.thuo$/ },
  { extension: '.ml', displayName: 'SCAR registry', description: 'Mau lành', direction: 'NAM', tier: 'sinh-thể', isWriteOnce: true, namePattern: /^.+\.ml$/ },
  { extension: '.phieu', displayName: 'State verifier', description: 'Phiêu (Em Bảy)', direction: 'BẮC', tier: 'sinh-thể', isWriteOnce: false, namePattern: /^.+\.phieu$/ }
];

export const EXTENSION_RULE_MAP: Map<string, ExtensionRule> = new Map(CANONICAL_EXTENSIONS.map(r => [r.extension, r]));

export const DIRECTION_EXTENSIONS_MAP: Map<Direction, string[]> = new Map([
  ['ĐÔNG', CANONICAL_EXTENSIONS.filter(r => r.direction === 'ĐÔNG').map(r => r.extension)],
  ['TÂY', CANONICAL_EXTENSIONS.filter(r => r.direction === 'TÂY').map(r => r.extension)],
  ['NAM', CANONICAL_EXTENSIONS.filter(r => r.direction === 'NAM').map(r => r.extension)],
  ['BẮC', CANONICAL_EXTENSIONS.filter(r => r.direction === 'BẮC').map(r => r.extension)]
]);

export const ALLOWED_IMPLEMENTATION_EXTENSIONS: Set<string> = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.py', '.sh', '.json', '.md', '.html', '.css',
  '.png', '.jpg', '.svg', '.ico', '.docx', '.xlsx', '.pdf', '.env', '.gitignore', '.yml', '.yaml', '.toml', '.lock'
]);

export function isCanonicalExtension(ext: string): boolean { return EXTENSION_RULE_MAP.has(ext); }
export function isAllowedImplementationExtension(ext: string): boolean { return ALLOWED_IMPLEMENTATION_EXTENSIONS.has(ext); }
export function getCanonicalExtensions(): string[] { return Array.from(EXTENSION_RULE_MAP.keys()); }
