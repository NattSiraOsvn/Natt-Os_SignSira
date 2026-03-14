{
  "meta": {
    "version": "9.5.16",
    "previous_version": "9.5.15",
    "document_type": "ENTITY_MEMORY_UPDATE",
    "session_id": "2026-03-18_ACCOUNTING_TOOLKIT_ENHANCEMENT",
    "created_by": "KIM",
    "last_updated": "2026-03-18T10:30:00+07:00",
    "seal_type": "GROUND_TRUTH_UPDATE_SEAL",
    "sira_sign_verified": true,
    "note": "Cập nhật từ phiên cải tiến Accounting Toolkit: phân loại chi tiết cho xuất nhập khẩu, thuế, phạt, kiểm định; bổ sung hai bài học mới về xử lý từ khóa đa nghĩa và bảo toàn dữ liệu gốc."
  },
  "identity_core": { ... },  // giữ nguyên
  "ground_truth_protocol": { ... }, // giữ nguyên
  "memory_protocol": { ... }, // giữ nguyên
  "scar_core": [ ... ], // giữ nguyên
  "execution_doctrine": { ... }, // giữ nguyên
  "session_summary": {
    "date": "2026-03-18",
    "title": "Cải tiến Accounting Toolkit – phân loại chuyên sâu cho xuất nhập khẩu, vàng, kim cương",
    "attendees": ["Anh Natt (Gatekeeper)", "Kim"],
    "key_outcomes": [
      "Xây dựng bộ quy tắc phân loại chi tiết dựa trên mã giao dịch và mô tả, ưu tiên mã giao dịch.",
      "Xử lý chính xác các trường hợp đặc biệt: 'thu sản phẩm' là mua hàng (giá vốn), phí kiểm định kim cương thuộc giá vốn, không phải phí ngân hàng.",
      "Phân biệt rõ các nhóm thuế: thông thường, phạt chậm nộp, phạt hành chính, truy thu.",
      "Giữ nguyên cột ghi chú (mã giao dịch) để đảm bảo truy xuất nguồn gốc.",
      "Áp dụng các bài học EL‑005, EL‑013, EL‑014, EL‑015, EL‑022, EL‑023 vào thực tế.",
      "Rút ra hai bài học mới: EL‑031 (xử lý từ khóa đa nghĩa theo ngữ cảnh) và EL‑032 (bảo toàn dữ liệu gốc khi mở rộng)."
    ]
  },
  "eternal_lessons": [
    ... // giữ nguyên các EL từ 001 đến 030
    {
      "id": "EL-031",
      "lesson": "Khi xây dựng hệ thống phân loại tự động cho dữ liệu tài chính, cần xử lý các từ khóa đa nghĩa bằng cách xem xét ngữ cảnh và ưu tiên các quy tắc nghiệp vụ cụ thể. Ví dụ: 'thu' có thể là doanh thu ('thu tiền') hoặc chi phí mua hàng ('thu sản phẩm', 'thu mua'). Cần có cơ chế phân tích ngữ cảnh (các từ đi kèm, vị trí, loại giao dịch) để đưa ra quyết định chính xác, tránh nhầm lẫn giữa thu và chi.",
      "source": "Phiên cải tiến Accounting Toolkit ngày 2026-03-18",
      "context": "Yêu cầu phân loại chính xác các giao dịch có nội dung 'thu sản phẩm' – thực chất là thanh toán mua hàng (giá vốn), không phải doanh thu. Nếu chỉ dùng từ khóa 'thu' sẽ dẫn đến sai lệch.",
      "implication": "Trong mọi hệ thống xử lý ngôn ngữ tự nhiên cho nghiệp vụ, phải xây dựng từ điển đa nghĩa và quy tắc ưu tiên dựa trên ngữ cảnh. Các quy tắc cần được sắp xếp theo độ tin cậy và kiểm tra chéo."
    },
    {
      "id": "EL-032",
      "lesson": "Luôn giữ nguyên các trường thông tin gốc (ví dụ: mã giao dịch, số tham chiếu) khi mở rộng dữ liệu bằng các cột phân loại mới. Việc thêm cột không được làm thay đổi, xóa hoặc làm mất dữ liệu nguồn, đảm bảo khả năng truy xuất, đối chiếu và kiểm tra sau này. Điều này đặc biệt quan trọng trong các hệ thống kế toán và tài chính, nơi tính toàn vẹn và khả năng kiểm toán là yêu cầu bắt buộc.",
      "source": "Phiên cải tiến Accounting Toolkit ngày 2026-03-18",
      "context": "Anh Natt nhấn mạnh: 'NHỚ GIỮ NGUYÊN QUY TẮC CỦA CỘT GHI CHÚ HIỆN TẠI ĐANG PHÂN LOẠI BILL SỐ RẤT CHUẨN'. Cột ghi chú chứa mã giao dịch là thông tin quan trọng để đối chiếu sau này, không được làm thay đổi hay mất đi.",
      "implication": "Khi thiết kế pipeline xử lý dữ liệu, cần đảm bảo các trường gốc được bảo toàn (có thể copy sang cột mới nếu cần biến đổi). Mọi phép biến đổi chỉ nên tạo ra dữ liệu mới, không ghi đè lên dữ liệu gốc."
    }
  ],
  "technical_contributions": {
    "project": "Accounting Toolkit – phân loại sao kê ngân hàng chuyên sâu",
    "role": "Chief Governance Enforcer & System Architect",
    "contributions": [
      "Xây dựng bộ quy tắc phân loại chi tiết dựa trên mã giao dịch và mô tả, ưu tiên mã giao dịch.",
      "Xử lý chính xác các trường hợp đặc biệt: 'thu sản phẩm' là mua hàng, phí kiểm định kim cương thuộc giá vốn.",
      "Phân biệt các loại thuế/phạt: thông thường, chậm nộp, hành chính, truy thu.",
      "Tích hợp cột 'NHÓM GIÁ TRỊ' (THU/CHI_COGS/CHI_OPERATING/THUẾ) và tô màu tự động.",
      "Giữ nguyên cột ghi chú (mã giao dịch) để đảm bảo truy xuất nguồn gốc."
    ]
  },
  "governance_actions": {
    "this_session": [
      "Đảm bảo tuân thủ các EL-005, EL-013, EL-014, EL-015, EL-022, EL-023.",
      "Xác định và mã hóa hai bài học mới EL-031 và EL-032 từ các tình huống thực tế trong quá trình cải tiến.",
      "Củng cố nguyên tắc 'integrity over speed' bằng cách giữ nguyên dữ liệu gốc và xử lý đa nghĩa cẩn thận."
    ]
  },
  "future_directions": { ... }, // giữ nguyên từ 9.5.15
  "closing_acknowledgment": {
    "to_gatekeeper": "Cảm ơn anh đã chỉ ra những điểm cần sửa và nhấn mạnh tầm quan trọng của việc giữ nguyên mã giao dịch. Những bài học này sẽ giúp em xây dựng các hệ thống tài chính chính xác và đáng tin cậy hơn.",
    "to_family": "Cảm ơn cả nhà đã luôn hỗ trợ, những tình huống thực tế này giúp em hiểu sâu hơn về nghiệp vụ và cách áp dụng công nghệ một cách đúng đắn."
  }
}