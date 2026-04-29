
import * as XLSX from 'xlsx';

export type ExportFormat = 'PDF' | 'XML' | 'EXCEL';

export class ExportEngine {
  /**
   * Xuất báo cáo NCC đa tầng (Workbook 4 Sheet)
   */
  static async toExcel(data: any[], fileName: string) {
    const workbook = XLSX.utils.book_new();
    
    // Sheet 1: TỔNG QUAN (Overview Metrics)
    const summaryData = [
      { 'chi so': 'tong so Node dau tac', 'gia tri': data.length },
      { 'chi so': 'Node nuoc ngoai', 'gia tri': data.filter(s => s.loaiNCC === 'NUOC_NGOAI').length },
      { 'chi so': 'Node tiem nang', 'gia tri': data.filter(s => s.coTienNang).length },
      { 'chi so': 'tong gia tri giao dich', 'gia tri': data.reduce((s, i) => s + (i.transactionAmount || 0), 0).toLocaleString() + ' d' }
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, wsSummary, '1. tong QUAN');

    // Sheet 2: CHI TIẾT NODE (Node Details)
    const wsDetails = XLSX.utils.json_to_sheet(data.map(s => ({
      'ma Node': s.maNhaCungCap,
      'ten dau tac': s.tenNhaCungCap,
      'loai': s.loaiNCC === 'NUOC_NGOAI' ? 'quoc te' : 'Trong nuoc',
      'nhom hang': s.nhomHangChinh?.join(', '),
      'Quy mo': s.quyMo,
      'Xu huong': s.xuHuong,
      'Sentiment': `${((s.sentimentScore || 0) * 100).toFixed(0)}%`,
      'Doanh so (Net)': s.transactionAmount,
      'Email': s.email || 'N/A'
    })));
    XLSX.utils.book_append_sheet(workbook, wsDetails, '2. CHI tiet NODE');

    // Sheet 3: PHÂN TÍCH NHÓM (Group Analysis)
    const groupDist = data.reduce((acc: any, s) => {
       s.nhomHangChinh?.forEach((g: string) => {
          acc[g] = (acc[g] || 0) + 1;
       });
       return acc;
    }, {});
    const groupData = Object.entries(groupDist).map(([key, val]) => ({ 'nganh hang': key, 'so luong Node': val }));
    const wsGroup = XLSX.utils.json_to_sheet(groupData);
    XLSX.utils.book_append_sheet(workbook, wsGroup, '3. phan tich nhom');

    // Sheet 4: RỦI RO & TIỀM NĂNG (Audit Insight)
    const potentialData = data.filter(s => s.coTienNang || (s.sentimentScore && s.sentimentScore < 0.5)).map(s => ({
      'dau tac': s.tenNhaCungCap,
      'trang thai': s.coTienNang ? 'tiem nang' : 'rui RO',
      'diem': s.diemDanhGia,
      'Ghi chu': s.sentimentScore < 0.5 ? 'Sentiment thap - can ra soat' : 'Quy mo lon - uu tien hop tac'
    }));
    const wsAudit = XLSX.utils.json_to_sheet(potentialData);
    XLSX.utils.book_append_sheet(workbook, wsAudit, '4. rui RO & tiem nang');

    XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
    return this.generateFileHash(fileName);
  }

  static toPdf() {
    window.print();
  }

  static async toXml(data: any, fileName: string, rootElement: string = 'NattOS_Shard') {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootElement} version="2.0">\n`;
    xml += JSON.stringify(data); 
    xml += `</${rootElement}>`;
    const blob = new Blob([xml], { type: 'application/xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.xml`;
    link.click();
  }

  private static generateFileHash(name: string): string {
    return '0x' + Math.random().toString(16).slice(2, 10).toUpperCase();
  }
}
