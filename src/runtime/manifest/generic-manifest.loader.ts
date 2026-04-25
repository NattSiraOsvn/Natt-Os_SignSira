export type GenericAuditLevel = "minimal" | "partial" | "full";
export type GenericFrameLevel = "none" | "shape" | "required";
export type GenericManifestStatus = "manifested";

export type GenericScreenBinding = {
  screen_id: string;
  domain: string;
  route: string;
  cell_binding: string;
  audit: GenericAuditLevel;
  sirasign: GenericFrameLevel;
  status: GenericManifestStatus;
};

export type GenericManifestLoadResult = {
  ok: boolean;
  source_kind: "screen_manifest";
  total_screens: number;
  screens: GenericScreenBinding[];
  errors: string[];
};

const allowedAuditLevels: readonly GenericAuditLevel[] = ["minimal", "partial", "full"];
const allowedFrameLevels: readonly GenericFrameLevel[] = ["none", "shape", "required"];
const allowedStatuses: readonly GenericManifestStatus[] = ["manifested"];

function normalizeKey(rawKey: string): string {
  if (rawKey === "siraSign") return "sirasign";
  return rawKey.trim();
}

function normalizeValue(rawValue: string): string {
  return rawValue.trim().replace(/^["']|["']$/g, "");
}

function isAuditLevel(value: string): value is GenericAuditLevel {
  return allowedAuditLevels.includes(value as GenericAuditLevel);
}

function isFrameLevel(value: string): value is GenericFrameLevel {
  return allowedFrameLevels.includes(value as GenericFrameLevel);
}

function isManifestStatus(value: string): value is GenericManifestStatus {
  return allowedStatuses.includes(value as GenericManifestStatus);
}

function validateScreenBinding(screen: Partial<GenericScreenBinding>, index: number): string[] {
  const errors: string[] = [];
  const label = screen.screen_id || `screen_index_${index}`;

  if (!screen.screen_id) errors.push(`${label}: missing screen_id`);
  if (!screen.domain) errors.push(`${label}: missing domain`);
  if (!screen.route) errors.push(`${label}: missing route`);
  if (!screen.cell_binding) errors.push(`${label}: missing cell_binding`);
  if (!screen.audit) errors.push(`${label}: missing audit`);
  if (!screen.sirasign) errors.push(`${label}: missing sirasign`);
  if (!screen.status) errors.push(`${label}: missing status`);

  if (screen.screen_id && !/^PL-\d{3}$/.test(screen.screen_id)) {
    errors.push(`${label}: invalid screen_id format`);
  }

  if (screen.route && !screen.route.startsWith("/")) {
    errors.push(`${label}: route must start with slash`);
  }

  if (screen.route && screen.route.includes(" ")) {
    errors.push(`${label}: route must not contain spaces`);
  }

  if (screen.cell_binding && !screen.cell_binding.startsWith("cell_")) {
    errors.push(`${label}: cell_binding must start with cell_`);
  }

  if (screen.audit && !isAuditLevel(screen.audit)) {
    errors.push(`${label}: invalid audit level`);
  }

  if (screen.sirasign && !isFrameLevel(screen.sirasign)) {
    errors.push(`${label}: invalid sirasign level`);
  }

  if (screen.status && !isManifestStatus(screen.status)) {
    errors.push(`${label}: invalid status`);
  }

  return errors;
}

export function loadGenericScreenManifest(content: string): GenericManifestLoadResult {
  const screens: Partial<GenericScreenBinding>[] = [];
  const errors: string[] = [];
  let current: Partial<GenericScreenBinding> | null = null;

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trimEnd();

    const start = line.match(/^\s*-\s+screen_id:\s*(.+?)\s*$/);
    if (start) {
      if (current) screens.push(current);
      current = { screen_id: normalizeValue(start[1]) };
      continue;
    }

    if (!current) continue;

    const item = line.match(/^\s+([A-Za-z_]+):\s*(.+?)\s*$/);
    if (!item) continue;

    const key = normalizeKey(item[1]);
    const value = normalizeValue(item[2]);

    if (key === "domain") current.domain = value;
    if (key === "route") current.route = value;
    if (key === "cell_binding") current.cell_binding = value;
    if (key === "audit") current.audit = value as GenericAuditLevel;
    if (key === "sirasign") current.sirasign = value as GenericFrameLevel;
    if (key === "status") current.status = value as GenericManifestStatus;
  }

  if (current) screens.push(current);

  screens.forEach((screen, index) => {
    errors.push(...validateScreenBinding(screen, index + 1));
  });

  const ids = screens.map(screen => screen.screen_id).filter(Boolean) as string[];
  const routes = screens.map(screen => screen.route).filter(Boolean) as string[];

  if (new Set(ids).size !== ids.length) {
    errors.push("screen_id must be unique");
  }

  if (new Set(routes).size !== routes.length) {
    errors.push("route must be unique");
  }

  return {
    ok: errors.length === 0,
    source_kind: "screen_manifest",
    total_screens: screens.length,
    screens: screens as GenericScreenBinding[],
    errors,
  };
}

export function groupGenericScreensByDomain(screens: GenericScreenBinding[]): Record<string, GenericScreenBinding[]> {
  return screens.reduce<Record<string, GenericScreenBinding[]>>((acc, screen) => {
    if (!acc[screen.domain]) acc[screen.domain] = [];
    acc[screen.domain].push(screen);
    return acc;
  }, {});
}

export function collectGenericCellBindings(screens: GenericScreenBinding[]): Record<string, GenericScreenBinding[]> {
  return screens.reduce<Record<string, GenericScreenBinding[]>>((acc, screen) => {
    if (!acc[screen.cell_binding]) acc[screen.cell_binding] = [];
    acc[screen.cell_binding].push(screen);
    return acc;
  }, {});
}
