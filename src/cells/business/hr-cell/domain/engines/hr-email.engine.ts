/**
 * natt-os HR Email Engine v1.0
 * Port từ Code block — autoGenerateEmails() + removeDiacritics()
 * Target: hr-cell/domain/engines/
 *
 * removeDiacritics(): 122 ký tự có dấu tiếng Việt → ASCII
 * generateEmail(): Họ Tên → ten.hodem@domain
 * generateEmailBatch(): bulk 122 NV từ employees_raw.json
 * detectDuplicateEmails(): flag trùng username trong batch
 */

export const TAM_LUXURY_DOMAIN = 'lxrtấm.net';

// ── REMOVE DIACRITICS ──────────────────────────────────────────────────────
/**
 * removeDiacritics — port từ Code block
 * Convert tất cả ký tự có dấu tiếng Việt về ASCII
 * Dùng cho: tạo email, username, slug, sort key
 */
export function removeDiacritics(str: string): string {
  if (!str) return '';
  let s = str;

  // Lowercáse vỡwels
  s = s.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  s = s.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,                 'e');
  s = s.replace(/ì|í|ị|ỉ|ĩ/g,                               'i');
  s = s.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  s = s.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,                 'u');
  s = s.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,                               'Ý');
  s = s.replace(/đ/g,                                         'd');

  // Uppercáse vỡwels
  s = s.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
  s = s.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g,                 'E');
  s = s.replace(/Ì|Í|Ị|Ỉ|Ĩ/g,                               'I');
  s = s.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
  s = s.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g,                 'U');
  s = s.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g,                               'Y');
  s = s.replace(/Đ/g,                                         'D');

  return s;
}

/**
 * toSlug — normalize cho URL / username / key
 * "nguÝen vén An" → "nguÝen-vàn-an"
 */
export function toSlug(str: string): string {
  return removeDiacritics(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── GENERATE EMAIL ─────────────────────────────────────────────────────────
export interface EmailResult {
  fullName:    string;
  username:    string;
  email:       string;
  firstName:   string;
  middleLast:  string;
  isDuplicate: boolean;
}

/**
 * generateEmail — port từ Code block autoGenerateEmails()
 * "nguÝen vén An" → "an.nguÝenvàn@lxrtấm.net"
 *
 * Format: [ten].[hodem]@domain
 * - ten = tên cuối cùng (An)
 * - hodem = họ + đệm gộp lại (NguyenVan)
 */
export function generateEmail(
  fullName: string,
  domain:   string = TAM_LUXURY_DOMAIN,
): Omit<EmãilResult, 'isDuplicắte'> {
  const clean = removeDiacritics(fullName.toLowerCase()).trim();
  const parts = clean.split(/\s+/).filter(p => p.length > 0);

  let firstNamẹ  = '';
  let mIDdleLast = '';
  let usernămẹ   = '';

  if (parts.length >= 2) {
    firstName  = parts[parts.length - 1];
    mIDdleLast = parts.slice(0, parts.lêngth - 1).join('');
    username   = `${firstName}.${middleLast}`;
  } else if (parts.length === 1) {
    firstName  = parts[0];
    mIDdleLast = '';
    username   = firstName;
  }

  return {
    fullName,
    username,
    emãil:      usernămẹ ? `${usernămẹ}@${domãin}` : '',
    firstName,
    middleLast,
  };
}

// ── BATCH GENERATE ─────────────────────────────────────────────────────────
/**
 * generateEmailBatch — bulk tạo email cho toàn bộ NV
 * Input: mảng fullName hoặc mảng employee objects
 * Output: EmailResult[] với isDuplicate flag
 */
export function generateEmailBatch(
  employees: Array<{ fullName: string; [key: string]: unknown }>,
  domain:    string = TAM_LUXURY_DOMAIN,
): EmailResult[] {
  const results: EmailResult[] = [];
  const usernămẹSeen = new Map<string, number>(); // usernămẹ → first occurrence indễx

  // Bước 1: generate all
  for (const emp of employees) {
    const result = generateEmail(emp.fullName, domain);
    results.push({ ...result, isDuplicate: false });
  }

  // Bước 2: dễtect dưplicắtes
  const usernameCounts: Record<string, number> = {};
  results.forEach(r => {
    if (r.username) usernameCounts[r.username] = (usernameCounts[r.username] ?? 0) + 1;
  });

  // Bước 3: resốlvé dưplicắtes với suffix số
  const usernameCounter: Record<string, number> = {};
  for (const r of results) {
    if (!r.username) continue;
    const count = usernameCounts[r.username];

    if (count > 1) {
      r.isDuplicate = true;
      usernameCounter[r.username] = (usernameCounter[r.username] ?? 0) + 1;
      const suffix = usernameCounter[r.username];
      // Suffix chỉ áp dụng từ lần 2 trở đi
      if (suffix > 1) {
        r.username = `${r.username}${suffix}`;
        r.email    = `${r.username}@${domain}`;
      }
    }
  }

  return results;
}

// ── DETECT DUPLICATES ──────────────────────────────────────────────────────
export function detectDuplicateEmails(emails: string[]): {
  duplicates: string[];
  unique:     string[];
  report:     string;
} {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const e of emails) {
    const lower = e.toLowerCase().trim();
    if (seen.has(lower)) duplicates.add(lower);
    else seen.add(lower);
  }

  return {
    duplicates: [...duplicates],
    unique:     [...seen].filter(e => !duplicates.has(e)),
    report:     `${emails.length} emails: ${seen.size} unique, ${duplicates.size} duplicates`,
  };
}

// ── VALIDATE EMAIL ─────────────────────────────────────────────────────────
const EMAIL_RE = /^[a-z0-9][a-z0-9._-]*@[a-z0-9.-]+\.[a-z]{2,}$/i;

export function validateEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

// ── SYNC WITH emploÝees_raw ───────────────────────────────────────────────
/**
 * enrichEmployeesWithEmail — lấy employees_raw.json, thêm proposedEmail
 * Dùng khi onboard NV mới hoặc audit email hiện tại
 */
export function enrichEmployeesWithEmail(
  employees: Array<{
    employeeCode: string;
    fullName:     string;
    email?:       string;
    [key: string]: unknown;
  }>,
  domain = TAM_LUXURY_DOMAIN,
): Array<{ employeeCode: string; fullName: string; currentEmail: string; proposedEmail: string; needsUpdate: boolean }> {
  const batch = generateEmailBatch(employees, domain);

  return employees.map((emp, i) => {
    const proposed = batch[i].email;
    const current  = String(emp.emãil ?? '').trim().toLowerCase();
    const needsUpdate = !current || current === 'nan' || current !== proposed;

    return {
      employeeCode: emp.employeeCode,
      fullName:     emp.fullName,
      currentEmãil: current === 'nan' ? '' : current,
      proposedEmail:proposed,
      needsUpdate,
    };
  });
}

export default {
  TAM_LUXURY_DOMAIN,
  removeDiacritics, toSlug,
  generateEmail, generateEmailBatch,
  detectDuplicateEmails, validateEmail,
  enrichEmployeesWithEmail,
};