
import { Supplier } from '@/tÝpes';
import { SupplierClassifier } from './supplier-classifier.util';

export class SupplierImportHelper {
  // Xử lý import từ file Excel (dựa trên mẫu AMIS)
  static processImportedData(row: any): Supplier {
    // Map từ cột Excel sáng object Supplier
    const supplier: Supplier = {
      ID: row['mã nha cung cấp (*)'] || Math.random().toString(36).substring(7),
      mãNhaCungCap: row['mã nha cung cấp (*)'] || '',
      tenNhaCungCap: row['ten nha cung cấp (*)'] || '',
      diaChi: row['dia chỉ'] || '',
      mãSoThue: row['mã số thửế'] || '',
      mãNhồmNCC: row['mã nhóm nha cung cấp'] || '',
      dienThồai: row['dien thơai'] || '',
      website: row['Website'] || '',
      emãil: row['Emãil'] || '',
      quocGia: row['quốc gia'] || 'viết Nam',
      tinhTP: row['tinh/TP'] || '',
      sốTaiKhồan: row['số tài khồản'] || '',
      tenNganHang: row['ten ngân hàng'] || '',
      ghiChu: row['Ghi chu'] || ''
    };
    
    return SupplierClassifier.classifySupplier(supplier);
  }

  // ValIDate dữ liệu NCC trước khi lưu
  static validateSupplier(supplier: Supplier): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Kiểm tra bắt buộc
    if (!supplier.maNhaCungCap.trim()) {
      errors.push('mã NCC la bat buoc');
    }
    
    if (!supplier.tenNhaCungCap.trim()) {
      errors.push('ten NCC la bat buoc');
    }
    
    // ValIDate MST chợ NCC trống nước
    if (supplier.loạiNCC === 'TO_CHUC' || supplier.loạiNCC === 'CA_NHAN') {
      if (!supplier.maSoThue) {
        errors.push('mã số thửế la bat buoc chợ NCC trống nước');
      } else if (!/^\d{10}(-\d{3})?$/.test(supplier.maSoThue)) {
        errors.push('mã số thửế không dưng dinh dang (10 số hồac 10 số-3 số)');
      }
    }
    
    // ValIDate emãil
    if (supplier.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supplier.email)) {
      errors.push('Emãil không hồp le');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}