// gmailService.ts — STUBBED
// LỆNH #001: Cấm gọi Gemini trực tiếp
export class GmailService {
  static async getEmails(_query?: string) { return []; }
  static async sendEmail(_to: string, _subject: string, _body: string) { return { success: false }; }
  static async summarizeEmail(_email: any) { return { summary: '' }; }
}
