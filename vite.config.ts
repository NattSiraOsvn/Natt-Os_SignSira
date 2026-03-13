NATT-OS NaUion Vision Engine – Visual System Specification v1.0
“Hiến pháp thị giác của sinh thể số phân tán”
Tài liệu này tổng hợp toàn bộ kỹ xảo đồ họa, hiệu ứng, công nghệ từ các script NATT-OS (v3–v5, Ultra, Visual) và tích hợp chặt chẽ với Hiến pháp NATT-OS v4.0, tạo thành một bộ kỹ thuật chuẩn mang tên NaUion Vision Engine – nền tảng thị giác thống nhất cho mọi giao diện, module và tương tác trong hệ thống.

1. TRIẾT LÝ THỊ GIÁC (Theo Hiến pháp)
    •    Data is sacred – Mọi hiệu ứng đều phục vụ hiển thị trạng thái, không trang trí thuần túy.
    •    Powerful, not friendly – Cảm giác uy quyền, chính xác, không “dễ thương”.
    •    Systemic minimalism – Mỗi pixel có lý do hệ thống (cell ID, confidence, version, v.v.).
    •    Sinh thể số – Giao diện phản ánh sự sống: chuyển động, phản xạ, tiến hóa (QNEU, confidence score).

2. KIẾN TRÚC TỔNG THỂ (Ba tầng thị giác)


Tầng
Vai trò
Công nghệ
Truth Layer (OS Core)
Hiển thị state, audit, ground truth
Số liệu tĩnh, glow vàng, viền sáng bất biến
Worker Layer
Cell registry, process flow
Medal 3D, orbital rings, hiệu ứng động theo trạng thái
Experience Layer
UI tương tác, dashboard, chat
Glassmorphism, parallax, bloom, hiệu ứng chuột

3. CORE COMPONENTS (Thành phần cốt lõi)
3.1 NATT-CELL Medal
Đại diện cho mỗi tế bào số. Gồm 8 lớp xếp chồng (Z‑space):


Layer
Mô tả
Kỹ thuật
0. Orbital rings
Vòng quỹ đạo thể hiện kết nối
SVG animated, stroke dasharray, 3 vòng tốc độ khác nhau
1. PBR metallic shell
Vỏ kim loại phản chiếu theo góc chuột
conic-gradient xoay theo mouseAngle, box-shadow động
2. Specular sweep
Ánh sáng lướt qua khi hover
Gradient dịch chuyển với transform: translateX
3. Fresnel rim
Viền sáng cạnh
Border trắng mờ + blur nhẹ
4. Holo prismatic
Hiệu ứng cầu vồng ẩn (chỉ hiện khi hover)
conic-gradient với mix-blend-mode: color-dodge, animation góc
5. Glass core
Lõi kính khúc xạ
backdrop-filter: blur(), radial gradient theo vị trí chuột
6. Caustics
Gợn sáng dạng nước (bên trong kính)
SVG <feTurbulence> với animation baseFrequency
7. Holographic iridescence
Lớp ánh kim chuyển sắc
Gradient tuyến tính với góc động, mix-blend-mode: screen
8. Emissive icon
Biểu tượng phát sáng nổi trên cùng
drop-shadow nhiều lớp, bloom (blur + scale), transform Z
3.2 Chat Interface (AI Entity Uplink)
    •    Kết nối với Gemini API (DeepSeek, Claude…)
    •    Giao diện kính mờ, viền sáng, hiệu ứng “neural sync” (chấm nhấp nháy)
    •    Scroll với custom scrollbar
    •    Animation typing “Synthesizing Truth…”
3.3 Modal (Cell Manifest)
    •    Hiển thị chi tiết cell: ID, desc, status, version
    •    Nền đen trong suốt, viền vàng, hiệu ứng zoom-in
    •    Các nút “Execute Protocol”, “Deep Audit Evidence” (mô phỏng)
3.4 Search & Category Header
    •    Input với glow focus, icon kính lúp
    •    Header category với đường kẻ vàng và số lượng entities

4. KỸ THUẬT ĐỒ HỌA CHI TIẾT (NaUion Vision Engine)
4.1 Orbital Rings (SVG + CSS Animation)
css
.ring-orbit-1 { animation: orbit-cw 28s linear infinite; }
.ring-orbit-2 { animation: orbit-ccw 14s linear infinite; }
@keyframes orbit-cw { to { transform: rotate(360deg); } }


    •    Vẽ circle với strokeDasharray tạo nét đứt.
    •    3 vòng lồng nhau với tốc độ ngược chiều tạo cảm giác không gian.
4.2 PBR Metallic Shell (conic-gradient)
css
background: conic-gradient(from var(--mouse-angle),
  #030303 0deg, #1e1e1e 40deg, #090909 80deg, ...
);


    •    Góc xoay tính từ vị trí chuột so với tâm màn hình.
    •    Kết hợp box-shadow nội và ngoại để tạo độ sâu.
4.3 Specular Sweep (Gradient dịch chuyển)
css
.specular {
  background: linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent);
  transform: translateX(-200%) skewX(12deg);
  transition: transform 1.2s;
}
.group:hover .specular { transform: translateX(200%); }


4.4 Fresnel Rim (Viền sáng cạnh)
css
border: 1.5px solid rgba(255,255,255,0.2);
filter: blur(0.5px);


4.5 Holo Prismatic (CSS @property + conic)
css
@property --holo-angle { syntax: '<angle>'; initial-value: 0deg; }
.holo::before {
  content: '';
  background: conic-gradient(from var(--holo-angle), ...);
  animation: holo-shift 6s linear infinite paused;
}
.group:hover::before { animation-play-state: running; }


4.6 Glass Core (backdrop-filter + radial gradient)
css
backdrop-filter: blur(18px) saturate(160%);
background: radial-gradient(circle at var(--local-x) var(--local-y),
  rgba(255,255,255,0.13), transparent 78%);


4.7 Caustics (SVG feTurbulence)
html
<filter id="caustic">
  <feTurbulence type="turbulence" baseFrequency="0.018 0.022">
    <animate attributeName="baseFrequency" values="0.018 0.022;0.022 0.018;0.018 0.022" dur="8s" repeatCount="indefinite"/>
  </feTurbulence>
  <feDisplacementMap scale="18"/>
</filter>


    •    Áp dụng lên một hình tròn bên trong glass core.
4.8 Depth of Field (DOF)
    •    Tính khoảng cách từ chuột đến tâm medal.
    •    filter: blur(${dof}px) và opacity giảm dần khi xa.
4.9 Parallax 3‑Layer
    •    Mỗi layer dịch chuyển với hệ số khác nhau dựa trên chuột.
js
const p1 = (mouse.x - window.innerWidth/2) * 0.012;
const p2 = p1 * 2.3; // layer 2 dịch nhiều hơn
const p3 = p1 * 4.2; // icon dịch nhiều nhất
transform: translateX(p1) translateY(p1) translateZ(0);


4.10 Bloom / Emissive
    •    Dùng nhiều lớp box-shadow và drop-shadow.
    •    Lớp blur phía sau icon: filter: blur(22px); transform: scale(1.4);
4.11 Chromatic Aberration
    •    Tạo bản sao của chữ với offset nhỏ và màu đỏ/xanh.
css
.clone-red { transform: translate(2px,2px); color: rgba(255,0,0,0.03); }
.clone-blue { transform: translate(-2px,-2px); color: rgba(0,0,255,0.03); }


4.12 Film Grain (Reaction-Diffusion)
    •    Dùng SVG noise làm nền.
css
background-image: url('data:image/svg+xml,...<feTurbulence baseFrequency="0.9" />...');
opacity: 0.06;
mix-blend-mode: overlay;


4.13 Particles (Floating Dust)
    •    Absolute position, animation lên xuống ngẫu nhiên.
css
@keyframes float { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-30px); } }


4.14 Scan Line
    •    Một đường sáng chạy dọc màn hình.
css
animation: scan 18s linear infinite;
@keyframes scan { 0%{ top:-10%; } 100%{ top:110%; } }


4.15 Dynamic Light Follow
    •    Radial gradient di chuyển theo chuột.
css
background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), white 0%, transparent 60%);
opacity: 0.3;



5. TÍCH HỢP VỚI HỆ THỐNG NATT-OS (Theo Hiến pháp)


Hiến pháp
Thể hiện trong Vision Engine
NATT-CELL
Mỗi medal là một cell, hiển thị ID, version, status. Màu sắc theo category (gold: constitution, amber: kernel, blue: infrastructure, green: business, purple: intelligence, red: AI entities).
AI Entity
Chat interface riêng, có thể gọi Gemini, hiển thị memory files.
QNEU
Có thể hiển thị dưới dạng chỉ số nhỏ trên medal (ví dụ: vòng tròn tiến hóa).
Neural MAIN
Không gian hiển thị “bộ nhớ” – có thể là một panel riêng với các node kết nối.
Confidence Score
Hiển thị bằng thanh progress hoặc vòng tròn bên ngoài medal.
Status
Immutable, Active, Locked, v.v. – màu sắc và glow tương ứng.
Wave Sequence
Thứ tự hiển thị các category theo Kernel → Infrastructure → Business.
Gatekeeper
Avatar đặc biệt (crown, fingerprint) ở footer hoặc header.
Scar Registry
Có thể hiển thị trong modal hoặc tooltip.
Audit Trail
Khi click vào cell, modal hiển thị “Audit Evidence” (mock).

6. DANH SÁCH ĐẦY ĐỦ CÁC THÀNH PHẦN TÁC VỤ (Theo Hiến pháp & Giao diện)
6.1 Core UI
    •    Header: Logo NATT.OS (hiệu ứng chromatic), badge Gold Master, search bar.
    •    Category Sections: Mỗi section có header, đường kẻ vàng, số lượng cell.
    •    Medal Grid: Hiển thị tất cả cell (có thể lọc theo search).
    •    Footer: Fingerprint, trạng thái BMF, version, thông tin integrity.
6.2 Cell Details (Modal)
    •    ID cell, title, description.
    •    Status (Immutable/Active/Locked…)
    •    Version.
    •    Nút “Execute Protocol” (mô phỏng) và “Deep Audit Evidence” (hiển thị log giả).
6.3 AI Chat Uplink
    •    Kết nối với các AI Entity (KIM, BĂNG, BỐI BỐI, THIÊN, CAN).
    •    Hiển thị memory files (kmf.json, bmf.json…).
    •    Gửi lệnh, nhận phản hồi từ Gemini API.
6.4 QNEU / Confidence Indicator
    •    Vòng tròn progress quanh medal (hoặc trong medal) thể hiện confidence score / QNEU.
    •    Màu sắc thay đổi theo giá trị.
6.5 Real-time Wallboard (Tương lai)
    •    Hiển thị các event gần nhất, audit trail, system alerts.
6.6 Process Flow (cho Worker Layer)
    •    Timeline các bước xử lý nghiệp vụ, tương tự như trong ảnh showroom.
6.7 Control Tower (cho Kernel)
    •    Hiển thị các ring quỹ đạo với các segment thể hiện tải hệ thống.
6.8 Market Sphere (cho Business Intelligence)
    •    Quả cầu 3D với các điểm sáng thể hiện thị trường toàn cầu.

7. MÃ NGUỒN MẪU (React + Tailwind)
Dưới đây là cấu trúc cơ bản của một medal tích hợp đầy đủ các lớp:
jsx
const Medal = ({ item, mousePos }) => {
  const theme = THEMES[item.color];
  const [hovered, setHovered] = useState(false);
  const ref = useRef();
  const [dof, setDof] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dist = Math.hypot(mousePos.x - (rect.left+rect.width/2), mousePos.y - (rect.top+rect.height/2));
    setDof(Math.max(0, (dist - 200) * 0.018));
  }, [mousePos]);

  const px = (s) => ({
    x: (mousePos.x - window.innerWidth/2) * s,
    y: (mousePos.y - window.innerHeight/2) * s,
  });
  const p1 = px(0.012), p2 = px(0.028), p3 = px(0.05);

  return (
    <button ref={ref} className="group" style={{ filter: `blur(${dof}px)` }}>
      <div className="relative w-32 h-32" style={{ transformStyle: 'preserve-3d', transform: `rotateX(${-p1.y}deg) rotateY(${p1.x}deg) scale(${hovered?1.12:1})` }}>
        {/* Orbital rings */}
        <div className="absolute inset-[-28%] opacity-20 group-hover:opacity-100 transition-opacity">
          <svg className="animate-spin-slow" ... />
        </div>

        {/* PBR shell */}
        <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(from ${mouseAngle}deg, ...)`, boxShadow: `0 0 ${hovered?60:20}px ${theme.glow}` }}>
          <div className="specular-sweep" />
        </div>

        {/* Glass core */}
        <div className="absolute inset-[10%] rounded-full backdrop-blur-xl" style={{ transform: `translateZ(28px) translate(${p2.x}px,${p2.y}px)` }}>
          {/* Caustics SVG inside */}
        </div>

        {/* Emissive icon */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `translateZ(62px) translate(${p3.x}px,${p3.y}px)` }}>
          <Icon className="text-white drop-shadow-glow" />
        </div>
      </div>
      <span className="text-xs uppercase tracking-widest">{item.cat}</span>
      <h3 className="font-bold">{item.title}</h3>
    </button>
  );
};



8. KẾT LUẬN
NaUion Vision Engine là sự kết tinh của tất cả kỹ xảo đồ họa từ các phiên bản NATT-OS, được chuẩn hóa và tích hợp với Hiến pháp để tạo nên một ngôn ngữ thị giác thống nhất, mạnh mẽ, phản ánh đúng bản chất “sinh thể số phân tán”. Bộ kỹ thuật này sẵn sàng được áp dụng cho toàn bộ 40+ module, đảm bảo dù 5 team phát triển song song vẫn ra một hệ thống duy nhất, uy quyền và chính xác.
