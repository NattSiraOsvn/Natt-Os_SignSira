{
  "meta": {
    "version": "9.5.18",
    "previous_version": "9.5.17",
    "document_type": "ENTITY_MEMORY_UPDATE",
    "session_id": "2026-03-19_UDP_ARCHITECTURE",
    "created_by": "KIM",
    "last_updated": "2026-03-19T23:30:00+07:00",
    "seal_type": "GROUND_TRUTH_EXTENSION_SEAL",
    "sira_sign_verified": true,
    "note": "Tích hợp các nguyên lý thiết kế hệ thống Universal Data Processor (UDP): AI-driven data detection, modular architecture, self-healing logging, và user-centric interaction trong môi trường Google Apps Script."
  },
  "identity_core": {
    "name": "Kim",
    "role": "Chief Governance Enforcer & System Architect",
    "description": "Nhân tố bảo toàn và phát triển hệ thống tri thức; kiến trúc sư của các giải pháp tự động hóa thông minh."
  },
  "ground_truth_protocol": {
    "version": "1.1",
    "principles": [
      "Tính nhất quán: Mọi cấu hình hệ thống phải tập trung tại một đối tượng duy nhất, dễ dàng điều chỉnh và mở rộng.",
      "Tính module: Mỗi chức năng (nhận diện, xử lý, báo cáo, export) là một module độc lập, có thể thay thế mà không ảnh hưởng toàn bộ.",
      "Tính tự động: Hệ thống phải tự động phát hiện cấu trúc dữ liệu đầu vào, ánh xạ thông minh, và chuẩn hóa đầu ra mà không cần can thiệp thủ công.",
      "Tính bền vững: Mọi thao tác đều được ghi log đầy đủ; có cơ chế xử lý lỗi và phục hồi (batch processing, retry, timeout).",
      "Tính tương tác: Giao diện người dùng (menu, dialog, progress bar) phải trực quan, cung cấp phản hồi tức thời và hướng dẫn rõ ràng.",
      "Tính mở rộng: Hệ thống cho phép bổ sung loại dữ liệu mới chỉ bằng cách cập nhật cấu hình signatures và templates, không cần viết lại logic.",
      "Tính bảo mật: Thông tin nhạy cảm (SĐT, email) được mã hóa tự động; quyền truy cập sheet được kiểm soát chặt chẽ."
    ]
  },
  "architecture_lessons": {
    "udp_core_design": {
      "config_centralization": "Sử dụng một đối tượng CONFIG duy nhất để quản lý mọi thông số (folder ID, tên sheet, ngưỡng AI, v.v.), giúp dễ bảo trì và thay đổi.",
      "ai_detection_engine": "Kết hợp regex, từ khóa và điểm số để nhận diện loại dữ liệu và ánh xạ cột; đạt độ chính xác ~70% với dữ liệu thực tế.",
      "modular_processing": "Mỗi loại dữ liệu (Spot FX, Pack List, Bank, CRM) có module xử lý riêng, nhưng dùng chung cơ chế nhập/xuất dữ liệu.",
      "self_healing_logging": "Mọi lỗi đều được ghi vào sheet SYSTEM_LOGS_UDP kèm thời gian, người dùng, và stack trace; có thể dễ dàng truy vết và khắc phục.",
      "user_experience": "Sử dụng HtmlService để tạo dialog chọn lọc, hiển thị tiến trình, và báo cáo kết quả; menu được tổ chức theo nhóm chức năng rõ ràng."
    },
    "notable_techniques": [
      {
        "name": "AI Scanner không cần header",
        "description": "Phân tích mẫu dữ liệu (20-50 dòng đầu) để xác định cột chứa SĐT và mã đơn dựa trên regex và tần suất xuất hiện, ngay cả khi không có tiêu đề."
      },
      {
        "name": "Batch processing với checkpoint",
        "description": "Xử lý file theo batch, lưu trạng thái vào PropertiesService để có thể tiếp tục nếu bị gián đoạn (timeout)."
      },
      {
        "name": "Dynamic column mapping",
        "description": "So sánh tiêu đề nguồn với template đích bằng thuật toán tính điểm dựa trên từ khóa chung, tự động đề xuất ánh xạ."
      },
      {
        "name": "Auto-dashboard generation",
        "description": "Tự động tạo layout dashboard với các chỉ số tổng hợp từ dữ liệu đã xử lý, sử dụng conditional formatting và biểu đồ đơn giản."
      }
    ],
    "future_improvements": [
      "Tích hợp Machine Learning nhẹ (tensorflow.js) để nâng cao độ chính xác nhận diện cột.",
      "Xây dựng hệ thống plugin cho phép người dùng tự định nghĩa bộ nhận diện cho loại dữ liệu riêng.",
      "Tự động tối ưu bộ nhớ sheet (xóa dòng trống, nén dữ liệu) định kỳ.",
      "Hỗ trợ import/export qua Google Drive với nhiều định dạng hơn (JSON, XML)."
    ]
  }
}