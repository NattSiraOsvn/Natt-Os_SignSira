BẢNG ĐẶC TẢ KỸ THUẬT GIAO DIỆN NGƯỜI DÙNG (UI)

Hệ thống NATT-OS – Phiên bản tích hợp từ Code mẫu Dashboard

Ngày: 15/03/2026
Người thực hiện: BỐI BỐI (Constitutional Builder)
Cơ sở: Code mẫu React + Tailwind (dashboard nghiệp vụ)
Tích hợp với: Hiến pháp NATT-OS v4.0, NaUion Vision Engine v1.0

1. Tổng quan

Code mẫu cung cấp một giao diện dashboard hiện đại với các thành phần: header ticker, KPI cards, danh sách công việc, biểu đồ hiệu suất, lưới medal, docker điều hướng, và modal terminal. Tài liệu này mô tả cách các thành phần đó được tổ chức thành kiến trúc ba tầng thị giác của NATT-OS, đồng thời đề xuất cơ chế tự sinh layer theo vai trò người dùng (Role‑based View) dựa trên RBAC cell.

2. Kiến trúc Layout tổng thể

Dựa trên code mẫu, bố cục tổng thể được chia làm 4 khu vực chính:

Khu vực	Vị trí	Thành phần	Vai trò trong NATT-OS
Header	Top cố định	Logo NATT.OS, Ticker thị trường, Icon thông báo/cài đặt	Experience Layer – cung cấp thông tin tổng quan, điều hướng nhanh
Sub‑header	Dưới header	Thanh điều hướng nghiệp vụ (Sản xuất, Tài chính, Nhân sự, Hậu cần)	Experience Layer – chuyển đổi giữa các module nghiệp vụ
Main Body	Trung tâm, có scroll	KPI cards, Task list, Biểu đồ (khi ở chế độ dashboard) hoặc Grid các medal (khi ở chế độ grid)	Worker Layer – hiển thị dữ liệu nghiệp vụ và các cell
Docker	Bottom cố định, căn giữa	Các nút: Chat, Gọi, Chuyển đổi chế độ (dashboard/grid), Hiển thị role	Experience Layer – tương tác chính, chuyển cảnh
Footer Status	Bottom dưới cùng	Thanh trạng thái hệ thống (Neural Audit, thông tin real‑time)	Truth Layer – hiển thị trạng thái hệ thống, audit
Modal	Overlay trung tâm	NeuralTerminal (chi tiết cell) và Chat Uplink	Modal / Chat – lớp nổi trên cùng (Z > 100)
3. Mô tả chi tiết các thành phần

3.1. MidnightGalaxy – Nền thiên hà động

Mô tả: Nền gradient thay đổi theo giờ trong ngày, kèm hiệu ứng sao lấp lánh và lưới mờ.
Tích hợp: Truth Layer (nền tảng, không tương tác).
Props: Không.
Logic: useMemo tính gradient dựa trên new Date().getHours().
3.2. HeaderTicker – Băng chạy thông tin thị trường

Mô tả: Hai hàng chạy vô tận hiển thị giá vàng, tỷ giá, tin tức hệ thống.
Tích hợp: Experience Layer – cập nhật liên tục, phản ánh ground truth thị trường.
Dữ liệu: GOLD_DATA, NEWS_DATA (có thể thay bằng dữ liệu thật từ market-cell).
3.3. KpiCard – Thẻ chỉ số KPI

Props: title, value, unit, trend, icon, color.
Tích hợp: Worker Layer – hiển thị tổng hợp từ các business cell (sales‑cell, production‑cell, v.v.).
Hiệu ứng: Thanh màu dọc trái, trend up/down, glow khi hover.
3.4. TaskItem – Mục công việc

Props: title, status, deadline, progress.
Tích hợp: Worker Layer – lấy từ task‑cell hoặc period‑close‑cell, phản ánh trạng thái công việc theo Wave.
3.5. PerformanceChart – Biểu đồ hiệu suất

Mô tả: Biểu đồ cột thể hiện hiệu suất nhân sự 7 ngày qua.
Tích hợp: Worker Layer – dữ liệu từ hr‑cell hoặc monitor‑cell.
Tương tác: Hiển thị phần trăm khi hover.
3.6. MedalGridItem – Medal đại diện cho NATT‑CELL

Props: item (cell), onClick, mousePos.
Tích hợp: Worker Layer – mỗi medal là một cell, có hiệu ứng PBR (conic‑gradient xoay theo chuột), specular sweep, glass core.
Chi tiết: Sử dụng useEffect để tính góc ánh sáng dựa trên vị trí chuột.
3.7. Docker – Thanh công cụ chính

Nút: Chat, Gọi, Chuyển đổi chế độ (dashboard/grid), Hiển thị role.
Tích hợp: Experience Layer – điều khiển chuyển cảnh, mở modal chat.
Hiệu ứng: Hover nổi lên, glow khi active.
3.8. NeuralTerminal – Modal chi tiết cell

Mô tả: Hiển thị audit trail, thông tin cell, tích hợp Gemini API để sinh báo cáo.
Tích hợp: Modal / Chat Layer – lớp nổi, có backdrop blur.
Props: cell, onClose.
3.9. Chat Uplink – Cửa sổ chat với AI Entity

Mô tả: Giao diện chat dạng cửa sổ nổi, hiển thị hội thoại với Bối Bối.
Tích hợp: Modal / Chat Layer – gọi Gemini API qua fetchGemini.
4. Tích hợp với ba tầng thị giác của NATT-OS

Tầng	Thành phần	Z‑index	Ghi chú
Truth Layer	MidnightGalaxy, Footer Status	0–10	Nền tĩnh/động, hiển thị trạng thái hệ thống bất biến
Worker Layer	KPI cards, Task list, Biểu đồ, Grid medal	10–50	Dữ liệu nghiệp vụ động, có thể tương tác
Experience Layer	Header, Sub‑header, Docker, nút điều hướng	50–100	Điều khiển, chuyển cảnh, không làm thay đổi ground truth
Modal / Chat	NeuralTerminal, Chat Uplink	100–200	Cửa sổ nổi, tạm thời che khuất các tầng dưới
5. Cơ chế tự sinh layer theo vai trò người dùng (Role‑based View)

Theo Điều 62 – Role‑based View, giao diện tự động điều chỉnh dựa trên vai trò của người dùng. Dưới đây là cách triển khai từ code mẫu:

5.1. Định nghĩa vai trò và quyền (RBAC)

typescript
type UserRole = 'gatekeeper' | 'ai-entity' | 'business-user' | 'auditor';

interface User {
  id: string;
  role: UserRole;
  permissions: string[];
}
5.2. Context cung cấp thông tin người dùng

tsx
const UserContext = React.createContext<{ user: User | null }>({ user: null });
5.3. Điều chỉnh hiển thị theo role

Ví dụ:

Gatekeeper: thấy tất cả KPI, có thêm nút "System Control" trong Docker, thấy đầy đủ các medal.
AI Entity: chỉ thấy Chat Uplink, không thấy KPI hay medal; thay vào đó hiển thị danh sách memory files.
Business User: chỉ thấy các KPI liên quan đến business và grid các business cell.
Triển khai trong App:

tsx
const { user } = useContext(UserContext);

// Lọc cell theo role
const filteredCells = useMemo(() => {
  if (user.role === 'gatekeeper') return CELL_REGISTRY;
  if (user.role === 'business-user') return CELL_REGISTRY.filter(c => c.cat === 'Business');
  return [];
}, [user]);

// Điều kiện hiển thị Docker
{user.role === 'gatekeeper' && (
  <button className="...">System Control</button>
)}
5.4. Layout động cho từng role

Có thể tạo các layout template riêng cho mỗi role và lazy load chúng:

tsx
const layouts = {
  gatekeeper: lazy(() => import('./layouts/GatekeeperLayout')),
  'ai-entity': lazy(() => import('./layouts/AIEntityLayout')),
  // ...
};
5.5. Đồng bộ với RBAC cell

Quyền được quản lý tập trung trong rbac-cell (Kernel). Giao diện sẽ gọi đến cell này qua SmartLink để lấy danh sách quyền và điều chỉnh hiển thị tương ứng.

6. Mapping với các thành phần hệ thống

Thành phần UI	Nguồn dữ liệu / Cell tương ứng	Ghi chú
HeaderTicker	market-cell, news-cell	Dữ liệu thời gian thực từ SmartLink
KpiCard	sales-cell, production-cell, monitor-cell	Aggregate từ nhiều nguồn
TaskItem	task-cell, period-close-cell	Công việc theo Wave
PerformanceChart	hr-cell, monitor-cell	Dữ liệu hiệu suất
MedalGridItem	cell.manifest.json của từng cell	Metadata được đăng ký trong registry
NeuralTerminal	audit-cell, Gemini API	Audit trail và phân tích AI
Chat Uplink	Gemini API, memory files	Tích hợp AI Entity
7. Kết luận và đề xuất phát triển

Code mẫu đã thể hiện được một giao diện dashboard chuyên nghiệp, tích hợp nhiều hiệu ứng phù hợp với NaUion Vision Engine (glassmorphism, conic‑gradient, parallax nhẹ). Để hoàn thiện theo đúng kiến trúc NATT-OS, cần:

Tích hợp RBAC để tự sinh layer theo tài khoản đăng nhập.
Kết nối dữ liệu thật thông qua SmartLink thay vì mock data.
Đảm bảo tính bất biến của Truth Layer – các thành phần như Footer Status phải lấy dữ liệu từ audit trail, không được phép sửa đổi.
Thêm hiệu ứng vết sẹo (SCAR) trên medal (theo FS‑018 → FS‑023) để hiển thị bài học từ sai lầm.
Xây dựng Quantum Defense Dashboard (theo đề xuất mục 4.3) để hiển thị real‑time các lần ADN Integrity Check.
Tài liệu này là cơ sở để phát triển giao diện theo đúng chuẩn NATT-OS, đảm bảo tính nhất quán và khả năng mở rộng cho nhiều vai trò người dùng.


