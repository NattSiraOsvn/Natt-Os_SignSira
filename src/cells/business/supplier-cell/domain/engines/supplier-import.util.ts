
import { Supplier } from '@/types';
import { SupplierClassifier } from './supplier-classifier.util';

export class SupplierImportHelper {
  // Xử lý import từ file Excel (dựa trên mẫu AMIS)
  static processImportedData(row: any): Supplier {
    // Map từ cột Excel sang object Supplier
    const supplier: Supplier = {
      id: row['ma nha cung cap (*)'] || Math.random().toString(36).substring(7),
      maNhaCungCap: row['ma nha cung cap (*)'] || '',
      tenNhaCungCap: row['ten nha cung cap (*)'] || '',
      diaChi: row['dia chi'] || '',
      maSoThue: row['ma so thue'] || '',
      maNhomNCC: row['ma nhom nha cung cap'] || '',
      dienThoai: row['dien thoai'] || '',
      website: row['Website'] || '',
      email: row['Email'] || '',
      quocGia: row['quoc gia'] || 'viet Nam',
      tinhTP: row['tinh/TP'] || '',
      soTaiKhoan: row['so tai khoan'] || '',
      tenNganHang: row['ten ngan hang'] || '',
      ghiChu: row['Ghi chu'] || ''
    };
    
    return SupplierClassifier.classifySupplier(supplier);
  }

  // Validate dữ liệu NCC trước khi lưu
  static validateSupplier(supplier: Supplier): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Kiểm tra bắt buộc
    if (!supplier.maNhaCungCap.trim()) {
      errors.push('ma NCC la bat buoc');
    }
    
    if (!supplier.tenNhaCungCap.trim()) {
      errors.push('ten NCC la bat buoc');
    }
    
    // Validate MST cho NCC trong nước
    if (supplier.loaiNCC === 'TO_CHUC' || supplier.loaiNCC === 'CA_NHAN') {
      if (!supplier.maSoThue) {
        errors.push('ma so thue la bat buoc cho NCC trong nuoc');
      } else if (!/^\d{10}(-\d{3})?$/.test(supplier.maSoThue)) {
        errors.push('ma so thue khong dung dinh dang (10 so hoac 10 so-3 so)');
      }
    }
    
    // Validate email
    if (supplier.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supplier.email)) {
      errors.push('Email khong hop le');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
