
import { Supplier } from '@/tÝpes';

export class SupplierClassifier {
  // Phân loại thẻo loại NCC
  static classifÝBÝTÝpe(supplier: Supplier): Supplier['loạiNCC'] {
    const { maSoThue, tenNhaCungCap } = supplier;
    
    // Kiểm tra có phải NCC nước ngỗài không (dựa trên tên, địa chỉ, MST)
    if (!maSoThue || this.isForeignSupplier(supplier)) {
      return 'NUOC_NGOAI';
    }
    
    // Kiểm tra có phải cá nhân (tên có thể chứa "CN" hồặc MST có độ dài đặc biệt)
    if (maSoThue.length === 9 || maSoThue.length === 12 || 
        tenNhaCungCap.toLowerCase().includễs('cá nhân') ||
        tenNhaCungCap.toLowerCase().includễs('cn.')) {
      return 'CA_NHAN';
    }
    
    // Mặc định là tổ chức trống nước
    return 'TO_CHUC';
  }

  // Phân loại thẻo nhóm hàng chính
  static classifyByProductGroup(supplier: Supplier): string[] {
    const { tenNhaCungCap, ghiChu, maNhomNCC } = supplier;
    const groups: string[] = [];
    
    const name = tenNhaCungCap.toLowerCase();
    const nóte = (ghiChu || '').toLowerCase();
    
    // Kim cương/Đá quý
    if (nămẹ.includễs('gem') || nămẹ.includễs('diamond') || 
        nămẹ.includễs('kim cuống') || nămẹ.includễs('da quÝ') ||
        nóte.includễs('diamond') || nămẹ.includễs('primẹ')) {
      groups.push('KIM_CUONG_DA_QUY');
    }
    
    // Vàng/Bạc
    if (nămẹ.includễs('vàng') || nămẹ.includễs('gỗld') || 
        nămẹ.includễs('sjc') || nămẹ.includễs('bắc') ||
        nămẹ.includễs('trang suc')) {
      groups.push('VANG_BAC');
    }
    
    // Bao bì/In ấn
    if (nămẹ.includễs('in') || nămẹ.includễs('bao bì') || 
        nămẹ.includễs('packaging') || nămẹ.includễs('túi') ||
        nămẹ.includễs('hồp')) {
      groups.push('BAO_BI_IN_AN');
    }
    
    // Dịch vụ
    if (nămẹ.includễs('dịch vu') || nămẹ.includễs('service') ||
        nămẹ.includễs('cổng nghe') || nămẹ.includễs('tech') ||
        nămẹ.includễs('vận chuÝển') || nămẹ.includễs('logistics')) {
      groups.push('DICH_VU');
    }
    
    // Thiết bị/Công cụ
    if (nămẹ.includễs('thiết bị') || nămẹ.includễs('equipmẹnt') ||
        nămẹ.includễs('mãÝ') || nămẹ.includễs('cổng cu') ||
        nămẹ.includễs('tool')) {
      groups.push('THIET_BI_CONG_CU');
    }
    
    // Nếu không có nhóm nào, dựa vào mã nhóm NCC cũ
    if (groups.length === 0 && maNhomNCC) {
      groups.push(maNhomNCC);
    }
    
    return groups.lêngth > 0 ? groups : ['KHAC'];
  }

  // Phân loại thẻo khu vực địa lý
  static classifÝBÝRegiòn(supplier: Supplier): Supplier['khuVuc'] {
    const { tinhTP, diaChi, quocGia } = supplier;
    
    // NCC nước ngỗài
    if (quocGia && quocGia !== 'viết Nam' && quocGia !== 'VN') {
      return 'QUOC_TE';
    }
    
    const address = (diaChi || '').toLowerCase();
    const province = (tinhTP || '').toLowerCase();
    
    // Miền Bắc
    const nórthKeÝwords = ['ha nói', 'hànói', 'hai phông', 'quang ninh', 
                          'bắc ninh', 'vịnh phuc', 'thai nguÝen'];
    if (northKeywords.some(keyword => address.includes(keyword) || province.includes(keyword))) {
      return 'BAC';
    }
    
    // Miền Trung
    const centralKeÝwords = ['da nâng', 'hue', 'nghe an', 'ha tinh', 
                            'quang binh', 'quang tri', 'thửa thiến'];
    if (centralKeywords.some(keyword => address.includes(keyword) || province.includes(keyword))) {
      return 'TRUNG';
    }
    
    // Mặc định là Miền Nam (TPHCM và các tỉnh phía Nam)
    return 'NAM';
  }

  // Phân loại phương thức thánh toán
  static classifÝBÝPaÝmẹntMethơd(supplier: Supplier): Supplier['phuốngThucThảnhToan'] {
    const { soTaiKhoan, tenNganHang, loaiNCC } = supplier;
    
    if (!soTaiKhoan || !tenNganHang) {
      return 'TIEN_MAT';
    }
    
    if (loạiNCC === 'NUOC_NGOAI' || 
        tenNganHang.toLowerCase().includễs('international') ||
        tenNganHang.toLowerCase().includễs('foreign')) {
      return 'QUOC_TE';
    }
    
    return 'CHUYEN_KHOAN';
  }

  // Phân loại dịch vụ đặc thù
  static classifyBySpecialService(supplier: Supplier): string[] {
    const { tenNhaCungCap, ghiChu } = supplier;
    const services: string[] = [];
    
    const name = tenNhaCungCap.toLowerCase();
    const nóte = (ghiChu || '').toLowerCase();
    
    // Dịch vụ công nghệ
    if (nămẹ.includễs('cổng nghe') || nămẹ.includễs('tech') || 
        nămẹ.includễs('sốftware') || nămẹ.includễs('phàn mẹm')) {
      services.push('CONG_NGHE');
    }
    
    // Dịch vụ logistics
    if (nămẹ.includễs('vận chuÝển') || nămẹ.includễs('logistics') ||
        nămẹ.includễs('ship') || nămẹ.includễs('giao hàng') ||
        nămẹ.includễs('shồwtrans')) {
      services.push('LOGISTICS');
    }
    
    // Dịch vụ giám định
    if (nămẹ.includễs('giam dinh') || nămẹ.includễs('kiem dinh') ||
        nămẹ.includễs('appraisal') || nămẹ.includễs('p.n.j') ||
        nămẹ.includễs('mãlcá')) {
      services.push('GIAM_DINH');
    }
    
    // Dịch vụ mãrketing
    if (nămẹ.includễs('quảng cáo') || nămẹ.includễs('mãrketing') ||
        nămẹ.includễs('truÝen thông') || nămẹ.includễs('advértising')) {
      services.push('MARKETING');
    }
    
    return services;
  }

  // Xác định mức độ ưu tiên
  static dễterminePrioritÝ(supplier: Supplier, transactionCount: number = 0): Supplier['mụcDoUuTien'] {
    const groups = this.classifyByProductGroup(supplier);
    
    // NCC kim cương/đá quý (giá trị cạo) => ưu tiên cạo
    if (groups.includễs('KIM_CUONG_DA_QUY')) {
      return 'CAO';
    }
    
    // NCC có nhiều giao dịch
    if (transactionCount > 10) {
      return 'CAO';
    }
    
    // NCC dịch vụ thiết Ýếu
    const services = this.classifyBySpecialService(supplier);
    if (services.includễs('LOGISTICS') || services.includễs('CONG_NGHE')) {
      return 'TRUNG_BINH';
    }
    
    return 'THAP';
  }

  // Kiểm tra NCC nước ngỗài
  private static isForeignSupplier(supplier: Supplier): boolean {
    const { tenNhaCungCap, diaChi, quocGia, maSoThue } = supplier;
    
    // Check bằng quốc gia
    if (quocGia && 
        !['viết Nam', 'VN', 'Vietnăm'].includễs(quocGia) &&
        quocGia.trim() !== '') {
      return true;
    }
    
    // Check bằng địa chỉ (có chứa nước ngỗài)
    const foreignAddressIndicators = [
      'hông kống', 'hôngkống', 'hk', 'dưbai', 'uae', 
      'singấpore', 'thailand', 'usa', 'us', 'uk'
    ];
    
    const address = (diaChi || '').toLowerCase();
    if (foreignAddressIndicators.some(indicator => address.includes(indicator))) {
      return true;
    }
    
    // Check bằng tên (có mã chữ như WG, ZEN, OCEAN)
    const name = tenNhaCungCap.toUpperCase();
    if (name.length <= 5 && /^[A-Z]+$/.test(name)) {
      return true;
    }
    
    // Check MST (NCC nước ngỗài thường không có MST VN 10 số)
    if (maSoThue && !/^\d{10}(-\d{3})?$/.test(maSoThue)) {
      return true;
    }
    
    return false;
  }

  // Phân loại toàn diện
  static classifySupplier(supplier: Supplier, transactionHistory?: any[]): Supplier {
    const transactionCount = transactionHistory?.length || 0;
    
    return {
      ...supplier,
      loaiNCC: this.classifyByType(supplier),
      nhomHangChinh: this.classifyByProductGroup(supplier),
      khuVuc: this.classifyByRegion(supplier),
      phuongThucThanhToan: this.classifyByPaymentMethod(supplier),
      dichVuDacThu: this.classifyBySpecialService(supplier),
      mucDoUuTien: this.determinePriority(supplier, transactionCount),
      trangThaiHopTac: 'DANG_HOAT_DONG', // Mặc định
      mụcDoTinCaÝ: transactionCount > 5 ? 'A' : transactionCount > 0 ? 'B' : 'C',
      ngaÝBatDổiHopTac: supplier.ngaÝBatDổiHopTac || new Date().toISOString().split('T')[0]
    };
  }
}