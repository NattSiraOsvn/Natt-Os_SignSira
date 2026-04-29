import { ExtensionRule, Direction } from '../types/validation-result.types';

export const CANONICAL_EXTENSIONS: ExtensionRule[] = [
  { extension: '.ng.obitan', displayName: 'Anh Natt (hat nhan)', description: 'hat nhan natt-os', direction: 'tay', tier: 'entity', electronLayer: 'tam', isWriteOnce: true, namePattern: /^.+\.ng\.obitan$/ },
  { extension: '.thien.Ln', displayName: 'thiên Lớn', description: 'Architect', direction: 'dong', tier: 'entity', electronLayer: 'L', isWriteOnce: true, namePattern: /^.+\.thien\.Ln$/ },
  { extension: '.kim.mn', displayName: 'Kim', description: 'Chief Governance Enforcer', direction: 'tay', tier: 'entity', electronLayer: 'M', isWriteOnce: true, namePattern: /^.+\.kim\.mn$/ },
  { extension: '.bang.n4n', displayName: 'bang', description: 'Ground Truth Validator', direction: 'NAM', tier: 'entity', electronLayer: 'N', isWriteOnce: true, namePattern: /^.+\.bang\.n4n$/ },
  { extension: '.bboi.on', displayName: 'Bối Bối', description: 'UI Builder', direction: 'bac', tier: 'entity', electronLayer: 'O', isWriteOnce: true, namePattern: /^.+\.bboi\.on$/ },
  { extension: '.phieu.pn', displayName: 'phieu', description: 'Protocol Execution', direction: 'bac', tier: 'entity', electronLayer: 'P', isWriteOnce: true, namePattern: /^.+\.phieu\.pn$/ },
  { extension: '.can.qn', displayName: 'Can', description: 'Logic Review', direction: 'NAM', tier: 'entity', electronLayer: 'Q', isWriteOnce: true, namePattern: /^.+\.can\.qn$/ },
  { extension: '.kris', displayName: 'Kris', description: 'Memory Verifier', direction: 'NAM', tier: 'entity', isWriteOnce: false, namePattern: /^.+\.kris$/ },
  { extension: '.khuong', displayName: 'Memory ky uc tron', description: 'Write-once, immutable', direction: 'NAM', tier: 'file', isWriteOnce: true, verifierExtension: '.kris', namePattern: /^.+\.khương$/ },
  { extension: '.thinh', displayName: 'State runtime', description: 'Mutable, TTL', direction: 'bac', tier: 'file', isWriteOnce: false, verifierExtension: '.phieu', namePattern: /^.+\.thịnh$/ },
  { extension: '.anc', displayName: 'Identity niem phong', description: 'Hiến Pháp / Passport', direction: 'dong', tier: 'file', isWriteOnce: true, namePattern: /^.+\.anc$/ },
  { extension: '.si', displayName: 'siraSign sealed', description: 'Contract niem phong', direction: 'dong', tier: 'sinh-the', isWriteOnce: true, namePattern: /^.+\.si$/ },
  { extension: '.sira', displayName: 'DNS namespace', description: 'Domain registry', direction: 'tay', tier: 'sinh-the', isWriteOnce: false, namePattern: /^.+\.sira$/ },
  { extension: '.heyna', displayName: 'Event log HeyNa transport', description: 'Cell ↔ cell SSE', direction: 'NAM', tier: 'sinh-the', isWriteOnce: false, namePattern: /^.+\.heyna$/ },
  { extension: '.khai', displayName: 'TouchRecord', description: 'song khac truong', direction: 'NAM', tier: 'sinh-the', isWriteOnce: false, namePattern: /^.+\.khai$/ },
  { extension: '.thuo', displayName: 'QWSField snapshot', description: 'mot thuo', direction: 'NAM', tier: 'sinh-the', isWriteOnce: true, namePattern: /^.+\.thuo$/ },
  { extension: '.ml', displayName: 'SCAR registry', description: 'Mau lanh', direction: 'NAM', tier: 'sinh-the', isWriteOnce: true, namePattern: /^.+\.ml$/ },
  { extension: '.phieu', displayName: 'State verifier', description: 'phieu (Em bay)', direction: 'bac', tier: 'sinh-the', isWriteOnce: false, namePattern: /^.+\.phieu$/ }
];

export const EXTENSION_RULE_MAP: Map<string, ExtensionRule> = new Map(CANONICAL_EXTENSIONS.map(r => [r.extension, r]));

export const DIRECTION_EXTENSIONS_MAP: Map<Direction, string[]> = new Map([
  ['dong', CANONICAL_EXTENSIONS.filter(r => r.direction === 'dong').map(r => r.extension)],
  ['tay', CANONICAL_EXTENSIONS.filter(r => r.direction === 'tay').map(r => r.extension)],
  ['NAM', CANONICAL_EXTENSIONS.filter(r => r.direction === 'NAM').map(r => r.extension)],
  ['bac', CANONICAL_EXTENSIONS.filter(r => r.direction === 'bac').map(r => r.extension)]
]);

export const ALLOWED_IMPLEMENTATION_EXTENSIONS: Set<string> = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.py', '.sh', '.json', '.md', '.html', '.css',
  '.png', '.jpg', '.svg', '.ico', '.docx', '.xlsx', '.pdf', '.env', '.gitignore', '.yml', '.yaml', '.toml', '.lock'
]);

export function isCanonicalExtension(ext: string): boolean { return EXTENSION_RULE_MAP.has(ext); }
export function isAllowedImplementationExtension(ext: string): boolean { return ALLOWED_IMPLEMENTATION_EXTENSIONS.has(ext); }
export function getCanonicalExtensions(): string[] { return Array.from(EXTENSION_RULE_MAP.keys()); }
