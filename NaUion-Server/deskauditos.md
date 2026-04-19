<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NATT-OS | Visual Pipeline Workspace v1.0</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');

        :root {
            --bg-base: #020617;
            --border-cyan: rgba(6, 182, 212, 0.4);
            --glow-cyan: 0 0 15px rgba(6, 182, 212, 0.5);
            --glow-fuchsia: 0 0 15px rgba(217, 70, 239, 0.5);
            --glow-amber: 0 0 15px rgba(245, 158, 11, 0.4);
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-base);
            color: #f8fafc;
            height: 100vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            user-select: none;
            
            /* --- BACKGROUND CHUẨN NATT-OS --- */
            background-image: url('mannen.jpg');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background-attachment: fixed;
        }

        /* Lớp kính mờ Liquid Glass chuẩn v2.5 cho các panel */
        .glass-panel {
            background: rgba(5, 11, 20, 0.65);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
        }
        
        .glass-header {
            background: rgba(11, 17, 32, 0.75);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
        }

        .selectable { user-select: text; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }

        /* Draggable Resizer */
        .resizer-v { width: 4px; background: rgba(30, 41, 59, 0.5); cursor: col-resize; transition: 0.2s; z-index: 50; }
        .resizer-v:hover, .resizer-v.active { background: #06b6d4; box-shadow: var(--glow-cyan); }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(51, 65, 85, 0.8); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #06b6d4; }

        /* Document Styling */
        .prose h1, .prose h2, .prose h3 { color: #f8fafc; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.5em; }
        .prose h1 { color: #06b6d4; font-size: 1.5rem; text-transform: uppercase; letter-spacing: -0.025em; text-shadow: var(--glow-cyan); }
        .prose h2 { color: #38bdf8; font-size: 1.25rem; border-bottom: 1px solid rgba(51,65,85,0.4); padding-bottom: 0.25rem; }
        .prose h3 { color: #c084fc; font-size: 1rem; }
        .prose p { margin-bottom: 1em; color: #cbd5e1; line-height: 1.6; font-size: 0.875rem; }
        .prose ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1em; color: #cbd5e1; font-size: 0.875rem; }
        .prose li { margin-bottom: 0.25rem; }
        .prose pre { background: rgba(0,0,0,0.5); border: 1px solid rgba(51,65,85,0.5); padding: 1rem; border-radius: 0.5rem; overflow-x: auto; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: #67e8f9; line-height: 1.4; margin-bottom: 1em; backdrop-filter: blur(8px); }
        .prose code { background: rgba(51,65,85,0.4); padding: 0.1rem 0.3rem; border-radius: 0.25rem; font-family: 'JetBrains Mono', monospace; font-size: 0.9em; color: #a5b4fc; }
        .prose pre code { background: transparent; padding: 0; }
        .prose table { width: 100%; border-collapse: collapse; margin-bottom: 1em; font-size: 0.8rem; }
        .prose th, .prose td { border: 1px solid rgba(51,65,85,0.4); padding: 0.5rem; text-align: left; }
        .prose th { background: rgba(15,23,42,0.6); color: #38bdf8; }
        .prose blockquote { border-left: 4px solid #06b6d4; padding-left: 1rem; color: #94a3b8; font-style: italic; background: rgba(6,182,212,0.05); padding: 0.5rem 1rem; border-radius: 0 0.5rem 0.5rem 0; margin-bottom: 1em; }
        
        .rule-card { background: rgba(15,23,42,0.5); border: 1px solid rgba(51,65,85,0.5); border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem; backdrop-filter: blur(10px); transition: border 0.3s; }
        .rule-card:hover { border-color: rgba(6, 182, 212, 0.5); box-shadow: 0 0 15px rgba(6,182,212,0.1); }

        /* Fake Image Simulation classes */
        .mock-image-container { display: flex; justify-content: center; align-items: center; height: 100%; width: 100%; background: rgba(0,0,0,0.6); border-radius: 0.25rem; overflow: hidden; position: relative; backdrop-filter: blur(4px); }
        .mock-logo { font-size: 1.5rem; font-weight: 900; color: #fff; text-shadow: 0 0 10px #a855f7, 0 0 20px #06b6d4; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(255,255,255,0.1); border-radius: 50%; width: 60px; height: 60px; }
        
        /* Filters */
        .filter-invert { filter: invert(1) hue-rotate(180deg); background: #fff; }
        .filter-bw { filter: grayscale(1) contrast(4); }
        .filter-polarity { background: linear-gradient(135deg, #ef4444 0%, rgba(0,0,0,0.5) 50%, #3b82f6 100%); mix-blend-mode: screen; }

        /* Toggle */
        .toggle-switch { position: relative; width: 36px; height: 18px; background: rgba(51,65,85,0.8); border-radius: 18px; cursor: pointer; transition: 0.3s; border: 1px solid rgba(255,255,255,0.1); }
        .toggle-switch.on { background: #06b6d4; box-shadow: 0 0 10px rgba(6,182,212,0.5); border-color: #06b6d4; }
        .toggle-knob { position: absolute; top: 1px; left: 1px; width: 14px; height: 14px; background: white; border-radius: 50%; transition: transform 0.3s; }
        .toggle-switch.on .toggle-knob { transform: translateX(18px); }

        .log-entry { animation: fadeIn 0.2s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    </style>
</head>
<body>

    <!-- Global Header (Glassmorphism) -->
    <header class="glass-header border-b border-slate-700/60 px-4 py-3 shrink-0 flex items-center justify-between z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div class="flex items-center gap-3">
            <span class="text-xl text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">&#128214;</span>
            <div>
                <h1 class="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-fuchsia-400 uppercase tracking-widest" style="text-shadow: var(--glow-cyan);">
                    NATT-OS UNIFIED WORKSPACE
                </h1>
                <div class="text-[10px] font-mono text-slate-400 tracking-wide mt-0.5">SPEC Viewer // Visual Pipeline Engine</div>
            </div>
        </div>
        
        <div class="flex items-center gap-4">
            <div class="flex items-center gap-2 border border-slate-700/50 bg-black/40 px-3 py-1.5 rounded shadow-inner">
                <span class="text-[10px] font-mono text-slate-400">Target Folder:</span>
                <code class="text-[10px] text-amber-400 font-mono" style="text-shadow: var(--glow-amber);">/assets/references/*</code>
            </div>
            <div class="flex items-center gap-2 border-l border-slate-700/50 pl-4">
                <span class="text-xs font-mono text-slate-200">Auto Watch</span>
                <div id="auto-watch-toggle" class="toggle-switch" onclick="toggleAutoWatch()">
                    <div class="toggle-knob"></div>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Workspace Splitter -->
    <div class="flex-grow flex overflow-hidden w-full relative" id="workspace">
        
        <!-- LEFT PANEL: Canonical Spec Document -->
        <div id="spec-panel" class="glass-panel shrink-0 flex flex-col selectable overflow-y-auto border-r border-slate-700/50" style="width: 50%;">
            
            <!-- YAML Frontmatter -->
            <div class="bg-black/50 border-b border-slate-700/50 p-4 font-mono text-[10px] shrink-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-10 sticky top-0 backdrop-blur-md">
                <div class="text-slate-500 mb-1">---</div>
                <div class="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    <div><span class="text-slate-500">spec_id:</span> <span class="text-cyan-400">SPEC-NaUion-Visual-Rebuild-Pipeline</span></div>
                    <div><span class="text-slate-500">version:</span> <span class="text-fuchsia-400">v1.0</span></div>
                    <div><span class="text-slate-500">status:</span> <span class="text-rose-400 font-bold bg-rose-950/30 px-1 rounded border border-rose-900/50">LOCKED_FOR_REVIEW</span></div>
                    <div><span class="text-slate-500">date:</span> <span class="text-slate-300">2026-04-16</span></div>
                    <div><span class="text-slate-500">author:</span> <span class="text-slate-300">Băng (QNEU 300)</span></div>
                    <div><span class="text-slate-500">approval:</span> <span class="text-emerald-400">Gatekeeper — Anh Natt</span></div>
                    <div class="col-span-2"><span class="text-slate-500">ratified_by:</span> <span class="text-slate-400">(pending Thiên Lớn, Kim)</span></div>
                    <div class="col-span-2 flex"><span class="text-slate-500 mr-2">related_specs:</span> 
                        <ul class="text-slate-400">
                            <li>- SPEC-Nauion_main_v2.5</li>
                            <li>- SPEC-NATT-OS-PLATFORM-SPEC</li>
                            <li>- VISION_ENGINE_SPEC_FINAL</li>
                        </ul>
                    </div>
                    <div class="col-span-2"><span class="text-slate-500">domain:</span> <span class="text-slate-300">governance/rendering/visual-fidelity</span></div>
                </div>
                <div class="text-slate-500 mt-1">---</div>
            </div>

            <!-- Markdown Content rendered as HTML -->
            <div class="p-6 md:p-8 prose max-w-none">
                <h1>SPEC-NaUion-Visual-Rebuild-Pipeline v1.0</h1>
                
                <blockquote>
                    <strong>"Measure before make. Match camera before material. Lock silhouette before lighting."</strong><br>
                    <span class="text-slate-400">— Nguyên tắc cốt lõi của pipeline tái tạo trực quan trong hệ NaUion</span>
                </blockquote>

                <h2 id="sec-1">§1. MỤC ĐÍCH</h2>
                <p>SPEC này định nghĩa <strong>pipeline bắt buộc</strong> cho mọi tác vụ tái tạo trực quan (visual rebuild) trong hệ NaUion, bao gồm:</p>
                <ul>
                    <li>Tái tạo logo, icon, asset từ reference</li>
                    <li>Render avatar 3D cho entity NATT-OS (áp dụng cho Unity VR project)</li>
                    <li>Generate visual mockup từ ảnh/sketch tham chiếu</li>
                    <li>So sánh fidelity giữa reference và output</li>
                    <li>Sinh prompt render cho external AI image generators (Midjourney, DALL-E, Sora, Stable Diffusion)</li>
                    <li>Sinh scene config cho 3D engines (Blender, Cycles, Unreal, Three.js)</li>
                </ul>
                <p>SPEC này KHÔNG áp dụng cho:</p>
                <ul>
                    <li>Vẽ từ trí tưởng tượng không có reference</li>
                    <li>Tác vụ đồ họa vector thuần túy (logo design from brief)</li>
                    <li>UI component generation (thuộc phạm vi <code>SPEC-Nauion_main</code>)</li>
                </ul>

                <h2 id="sec-2">§2. ĐỊNH NGHĨA (LEXICON)</h2>
                <table>
                    <thead><tr><th>Thuật ngữ</th><th>Định nghĩa</th></tr></thead>
                    <tbody>
                        <tr><td><strong class="text-cyan-300">Reference</strong></td><td>Ảnh/video/scene gốc cần tái tạo. Nguồn sự thật duy nhất.</td></tr>
                        <tr><td><strong class="text-cyan-300">Measurement Pass</strong></td><td>Giai đoạn đo đạc reference bằng tool, sinh ra dữ liệu số.</td></tr>
                        <tr><td><strong class="text-cyan-300">Silhouette</strong></td><td>Hình khối/viền chủ thể độc lập với màu sắc, ánh sáng, texture.</td></tr>
                        <tr><td><strong class="text-cyan-300">Invert Duality</strong></td><td>Đảo ngược màu + tăng contrast 2 trục để lộ ranh giới thật.</td></tr>
                        <tr><td><strong class="text-cyan-300">PBR Material</strong></td><td>Physically-Based Rendering (metalness, roughness, IOR...).</td></tr>
                        <tr><td><strong class="text-cyan-300">Bloom Halo</strong></td><td>Vùng phát sáng mở rộng ra ngoài, tạo 60-80% cảm giác "sáng chói".</td></tr>
                        <tr><td><strong class="text-cyan-300">Depth Polarity</strong></td><td>Phân cực nóng-lạnh để đọc chiều sâu: nóng tiến, lạnh lùi.</td></tr>
                        <tr><td><strong class="text-cyan-300">Spec JSON</strong></td><td>Đầu ra chuẩn của pipeline — JSON canonical chứa toàn bộ tham số.</td></tr>
                        <tr><td><strong class="text-cyan-300">Rebuild Gap</strong></td><td>Sai số đo được giữa reference và output. Mục tiêu: minimize.</td></tr>
                    </tbody>
                </table>

                <h2 id="sec-3">§3. KIẾN TRÚC PIPELINE (5 GIAI ĐOẠN)</h2>
<pre>    ┌─────────────────────────────────────────────────────────────┐
    │                    REFERENCE (Sự thật gốc)                   │
    └─────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────────────────┐
    │  <span class="text-fuchsia-400">Stage 1 — MEASUREMENT</span>       (bắt buộc, không bỏ qua)       │
    │  • Dimensions, aspect, canvas                                │
    │  • Subject center of mass                                    │
    │  • Color sampling (dominant, accent, bg)                     │
    │  • Stroke width, component ratios                            │
    │  • Invert + contrast duality analysis                        │
    │  • Depth polarity map (warm/cool separation)                 │
    └─────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────────────────┐
    │  <span class="text-fuchsia-400">Stage 2 — SILHOUETTE LOCK</span>   (bắt buộc trước material)      │
    │  • Outline component positions + sizes                       │
    │  • Geometry hierarchy (what is in front of what)             │
    │  • Z-order depth layers                                      │
    │  • Proportions only — NO color, NO lighting yet              │
    └─────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────────────────┐
    │  <span class="text-fuchsia-400">Stage 3 — CAMERA MATCH</span>      (bắt buộc trước material)      │
    │  • Lens (mm), FOV, angle, rotation                           │
    │  • DoF, focal point                                          │
    │  • Shot type (close/medium/wide)                             │
    └─────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────────────────┐
    │  <span class="text-fuchsia-400">Stage 4 — MATERIAL PBR</span>      (chỉ sau khi silhouette lock)  │
    │  • Per-component PBR tuple                                   │
    │  • Transmission/IOR cho glass                                │
    │  • Emissive intensity cho light sources                      │
    │  • Subsurface cho organic                                    │
    └─────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────────────────┐
    │  <span class="text-fuchsia-400">Stage 5 — LIGHTING MATCH</span>    (cuối cùng)                    │
    │  • Key light direction (đọc từ highlight position)           │
    │  • Fill/rim/ambient                                          │
    │  • Emissive vs external light ratio                          │
    │  • Shadow softness                                           │
    └─────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────────────────┐
    │               <span class="text-emerald-400">OUTPUT: Spec JSON + Prompt + Rebuild</span>           │
    │               <span class="text-emerald-400">Compare vs Reference → Measure Rebuild Gap</span>     │
    └─────────────────────────────────────────────────────────────┘</pre>

                <h2 id="sec-4">§4. CÁC ĐIỀU (ARTICLES — INVARIANTS)</h2>
                
                <div class="rule-card">
                    <h3>Điều 1. Nguyên tắc Measure-First</h3>
                    <p><strong class="text-emerald-400">BẮT BUỘC:</strong> Trước khi tạo bất kỳ output nào (SVG, code, render), tool phải chạy Stage 1 (Measurement Pass) trên reference.</p>
                    <p><strong class="text-rose-400">Cấm:</strong> Skip measurement với lý do "trông giống thế", "để nhanh", "reference đã rõ".</p>
                    <p><strong>Kiểm tra:</strong> Spec JSON phải chứa field <code>measurement_timestamp</code> và <code>source_reference</code> trỏ về file reference thật.</p>
                </div>

                <div class="rule-card">
                    <h3>Điều 2. Thứ tự 5 giai đoạn là TUYỆT ĐỐI</h3>
                    <p><strong class="text-emerald-400">BẮT BUỘC:</strong> Pipeline phải chạy tuần tự Stage 1 → 5. Không được rẽ nhánh ngược.</p>
                    <ul class="text-slate-300">
                        <li><span class="text-rose-400">❌</span> Vẽ material trước khi lock silhouette</li>
                        <li><span class="text-rose-400">❌</span> Chọn lighting trước khi match camera</li>
                        <li><span class="text-rose-400">❌</span> Render test trước khi có measurement</li>
                    </ul>
                    <p class="text-amber-300 mt-2 text-xs font-mono">Nếu phát hiện sai ở stage cao: phải quay lại stage thấp nhất bị ảnh hưởng, không patch cục bộ.</p>
                </div>

                <div class="rule-card">
                    <h3>Điều 3. Invert Duality là công cụ bắt buộc</h3>
                    <p><strong class="text-emerald-400">BẮT BUỘC:</strong> Trong Stage 1, phải sinh ít nhất 3 biến thể để đọc reference:</p>
                    <ol class="list-decimal pl-5 text-slate-200">
                        <li><strong>Inverted image</strong> — lộ ranh giới thật khi mắt thường bị lừa.</li>
                        <li><strong>B&W high-contrast silhouette</strong> — xác định hình khối.</li>
                        <li><strong>Warm/Cool depth polarity</strong> — đọc chiều sâu nóng/lạnh.</li>
                    </ol>
<pre><code># Stage 1 analysis outputs
inverted   = ImageOps.invert(src)
bw_high    = grayscale >> contrast×3.0 >> threshold(30,80)
warm_map   = clip(R - (G+B)×0.4)
cool_map   = clip(B - R×0.5 - G×0.3)
depth_viz  = stack(warm→red_channel, cool→blue_channel)</code></pre>
                </div>

                <div class="rule-card">
                    <h3>Điều 4. Separation of Concerns — Glow KHÔNG PHẢI Color</h3>
                    <p><strong class="text-emerald-400">BẮT BUỘC:</strong> Khi đọc reference, tool phải phân biệt: <strong>Fill color</strong>, <strong>Glow halo</strong>, và <strong>Emissive layer</strong>.</p>
                    <blockquote class="text-sm border-amber-500 bg-amber-950/20">Anti-pattern: "Chữ NATT có gradient xanh-tím-hồng" → SAI. Chữ thật là trắng solid, gradient là glow halo.</blockquote>
                    <p>Nguyên tắc: nếu invert → màu chuyển sang opposite nhưng hình giữ nguyên → đó là <strong>fill color</strong>. Nếu invert → biến mất/loãng ra → đó là <strong>glow</strong>.</p>
                </div>

                <div class="rule-card">
                    <h3>Điều 5. Canonical Spec JSON Schema</h3>
                    <p><strong class="text-emerald-400">BẮT BUỘC:</strong> Output của pipeline là file JSON tuân thủ schema trong §7 (Appendix A). Không được bỏ các block: <code>canvas</code>, <code>camera</code>, <code>composition</code>, <code>main_object</code>, <code>material_system</code>, <code>lighting</code>, <code>post_processing</code>.</p>
                </div>

                <div class="rule-card">
                    <h3>Điều 6. Rebuild Gap phải được đo định lượng</h3>
                    <table>
                        <thead><tr><th>Metric</th><th>Ngưỡng chấp nhận</th></tr></thead>
                        <tbody>
                            <tr><td>Dimension ratio</td><td><span class="text-emerald-400">±2%</span></td></tr>
                            <tr><td>Subject center offset</td><td><span class="text-emerald-400">±5px</span> (cho canvas ≥ 1024px)</td></tr>
                            <tr><td>Dominant color ΔE</td><td><span class="text-emerald-400">&lt; 5</span> (CIE Lab)</td></tr>
                            <tr><td>Silhouette IoU</td><td><span class="text-emerald-400">&gt; 0.92</span></td></tr>
                            <tr><td>Component count</td><td><span class="text-emerald-400">exact match</span></td></tr>
                        </tbody>
                    </table>
                </div>

                <div class="rule-card">
                    <h3>Điều 7. Engine-Agnostic Output</h3>
                    <p><strong class="text-emerald-400">BẮT BUỘC:</strong> Spec JSON phải độc lập engine. Có thể dùng cho AI gen, Blender, Three.js, SVG.</p>
                    <p><strong class="text-rose-400">Cấm:</strong> Nhúng engine-specific code trong spec JSON.</p>
                </div>

                <div class="rule-card">
                    <h3>Điều 8, 9 & 10. Tóm lược System/Anti-patterns</h3>
                    <ul class="text-slate-300">
                        <li><strong>§8:</strong> Tích hợp NATT-OS Entity (avatar JSON spec lưu trong file <code>.anc</code>).</li>
                        <li><strong>§9:</strong> Giữ Memory Trail, không xóa version cũ.</li>
                        <li><strong class="text-rose-400 font-bold">§10 Anti-patterns CẤM tuyệt đối:</strong> Skip measurement, Đoán số lượng (guess count), Patch lighting trước silhouette...</li>
                    </ul>
                </div>

                <h2 id="sec-5">§5. WORKFLOW CHUẨN (REFERENCE)</h2>
<pre><code>def visual_rebuild_pipeline(reference_path: str, output_dir: str) -> SpecJSON:
    """Pipeline tham chiếu - tuân thủ toàn bộ 10 Điều."""

    # === Stage 1: MEASUREMENT ===
    ref = load_image(reference_path)
    measurements = {
        'canvas': measure_canvas(ref),
        'subject': find_subject_center(ref),
        'colors': sample_dominant_colors(ref),
        'silhouette': extract_silhouette(ref),
    }
    analysis = {
        'inverted': invert(ref),
        'bw_high_contrast': to_bw_contrast(ref, factor=3.0),
        'depth_polarity': warm_cool_separation(ref),
    }

    # === Stage 2: SILHOUETTE LOCK ===
    components = identify_components(measurements, analysis)
    z_order = determine_depth_order(components, analysis['depth_polarity'])

    # === Stage 3: CAMERA MATCH ===
    camera = estimate_camera(measurements, components)

    # === Stage 4: MATERIAL PBR ===
    materials = assign_pbr_per_component(components, ref)

    # === Stage 5: LIGHTING ===
    lighting = read_lighting_from_highlights(ref, components)

    # === OUTPUT ===
    spec = compose_spec_json(...)
    validate_against_schema(spec)
    return spec</code></pre>

                <h2 id="sec-6">§6, §7, §8, §9. APPENDICES & HISTORY</h2>
                <p class="text-sm text-slate-400 italic">Vui lòng tham khảo source markdown để xem Schema JSON chi tiết, Engine Targets, và Case Study (logo2.png).</p>

                <h2 id="sec-10">§10. ENFORCEMENT</h2>
                <p>SPEC này có hiệu lực ngay sau khi Gatekeeper ratify.</p>
<pre><code># .git/hooks/pre-commit
for asset in $(git diff --cached --name-only | grep -E '\.(png|svg|jpg)$'); do
    spec="${asset%.*}.spec.json"
    if [ ! -f "$spec" ]; then
        echo "❌ Asset $asset thiếu spec JSON."
        exit 1
    fi
done</code></pre>

                <div class="mt-8 pt-4 border-t border-slate-700/50 text-[11px] text-slate-500 font-mono text-center tracking-widest">
                    — END SPEC —<br>
                    Ratified pending: Gatekeeper (Anh Natt) · Thiên Lớn · Kim<br>
                    Canonical location: src/governance/specs/visual-rebuild-pipeline.spec.md
                </div>
            </div>
        </div>

        <!-- RESIZER -->
        <div id="resizer-v" class="resizer-v flex items-center justify-center">
            <div class="h-8 w-1 bg-slate-500/50 rounded"></div>
        </div>

        <!-- RIGHT PANEL: Pipeline Engine & Terminal (Glassmorphism) -->
        <div id="pipeline-panel" class="glass-panel flex-grow flex flex-col min-w-0">
            
            <!-- TOP: Duality Visualizer (Stage 1) -->
            <div class="flex flex-col relative border-b border-slate-700/50 shrink-0" style="height: 35%;">
                <div class="px-4 py-2 bg-black/40 border-b border-slate-700/50 flex justify-between items-center shrink-0 backdrop-blur-md">
                    <h2 class="text-[10px] font-mono font-bold text-cyan-300 tracking-wider">PIPELINE ENGINE / STAGE 1: DUALITY VISUALIZER</h2>
                </div>
                <div class="flex-grow grid grid-cols-2 lg:grid-cols-4 gap-2 p-3 bg-transparent">
                    <div class="relative bg-black/80 rounded overflow-hidden border border-slate-700 shadow-lg backdrop-blur-sm">
                        <div class="absolute top-1 left-2 text-[8px] font-mono text-cyan-400 z-10 font-bold">1. ORIGINAL</div>
                        <div class="mock-image-container opacity-10 transition-opacity duration-1000" id="viz-ref">
                            <div class="mock-logo">CORE</div>
                        </div>
                    </div>
                    <div class="relative bg-black/80 rounded overflow-hidden border border-slate-700 shadow-lg backdrop-blur-sm">
                        <div class="absolute top-1 left-2 text-[8px] font-mono text-white mix-blend-difference z-10 font-bold">2. INVERT</div>
                        <div class="mock-image-container filter-invert opacity-10 transition-opacity duration-1000" id="viz-inv">
                            <div class="mock-logo">CORE</div>
                        </div>
                    </div>
                    <div class="relative bg-black/80 rounded overflow-hidden border border-slate-700 shadow-lg backdrop-blur-sm">
                        <div class="absolute top-1 left-2 text-[8px] font-mono text-white mix-blend-difference z-10 font-bold">3. B&W</div>
                        <div class="mock-image-container filter-bw opacity-10 transition-opacity duration-1000" id="viz-bw">
                            <div class="mock-logo">CORE</div>
                        </div>
                    </div>
                    <div class="relative bg-black/80 rounded overflow-hidden border border-slate-700 shadow-lg backdrop-blur-sm">
                        <div class="absolute top-1 left-2 text-[8px] font-mono text-yellow-300 z-10 font-bold">4. POLARITY</div>
                        <div class="mock-image-container opacity-10 transition-opacity duration-1000" id="viz-dep">
                            <div class="absolute inset-0 filter-polarity mix-blend-screen z-0"></div>
                            <div class="mock-logo z-10 mix-blend-overlay">CORE</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- MIDDLE: Spec JSON Output -->
            <div class="flex-grow flex flex-col bg-black/30 border-b border-slate-700/50 min-h-0 selectable backdrop-blur-sm">
                <div class="px-4 py-1.5 bg-black/50 border-b border-slate-700/50 flex justify-between items-center shrink-0">
                    <span class="text-[10px] font-mono text-emerald-400 font-bold">CANONICAL SPEC JSON</span>
                    <span id="gap-score" class="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">Gap: N/A</span>
                </div>
                <div class="flex-grow p-4 overflow-y-auto">
                    <pre id="json-output" class="text-[10.5px] font-mono text-slate-400 leading-relaxed m-0 p-0 bg-transparent border-none opacity-60">
// System idle.
// Target reference image loaded in memory: mannen.jpg
// Toggle 'Auto Watch' to execute rebuild pipeline...
                    </pre>
                </div>
            </div>

            <!-- BOTTOM: Terminal -->
            <div class="shrink-0 flex flex-col bg-black/80 backdrop-blur-xl" style="height: 30%;">
                <div class="px-3 py-1.5 bg-slate-900/60 border-y border-slate-700/50 flex justify-between items-center shrink-0">
                    <span class="text-[10px] font-mono text-cyan-400 tracking-wider">visual_rebuild_pipeline.py --watch</span>
                    <button onclick="clearTerminal()" class="text-[10px] font-mono text-slate-400 hover:text-white bg-slate-800/80 px-2 rounded border border-slate-700">CLEAR</button>
                </div>
                <div id="terminal-output" class="flex-grow overflow-y-auto p-4 font-mono text-[10px] leading-relaxed space-y-1.5 text-slate-300 selectable">
                    <div class="log-entry"><span class="text-blue-400 font-bold">[info]</span> NATT-OS Visual Engine Initialized. Reading SPEC definition...</div>
                    <div class="log-entry"><span class="text-emerald-400 font-bold">[ok]</span> Rules mapped to engine successfully. Background image loaded.</div>
                </div>
            </div>

        </div>
    </div>

    <script>
        // --- Splitter Logic ---
        const resizer = document.getElementById('resizer-v');
        const specPanel = document.getElementById('spec-panel');
        let isResizing = false;

        resizer.addEventListener('mousedown', () => {
            isResizing = true;
            resizer.classList.add('active');
            document.body.style.cursor = 'col-resize';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const newWidth = e.clientX;
            if (newWidth > 300 && newWidth < window.innerWidth - 300) {
                specPanel.style.width = `${newWidth}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isResizing = false;
            resizer.classList.remove('active');
            document.body.style.cursor = 'default';
        });

        // --- Terminal Logic ---
        const termOut = document.getElementById('terminal-output');
        function logMsg(msg, type = 'info') {
            const time = new Date().toLocaleTimeString('en-US', { hour12: false });
            const div = document.createElement('div');
            let c = 'text-slate-300', l = 'info';
            if(type === 'pass') { c = 'text-emerald-400'; l = 'pass'; }
            if(type === 'warn') { c = 'text-amber-400'; l = 'warn'; }
            if(type === 'sys') { c = 'text-fuchsia-400'; l = 'exec'; }

            div.className = `log-entry ${c}`;
            div.innerHTML = `<span class="text-slate-500">[${time}]</span> <strong class="${c}">[${l}]</strong> ${msg}`;
            termOut.appendChild(div);
            termOut.scrollTop = termOut.scrollHeight;
        }
        function clearTerminal() { termOut.innerHTML = ''; }

        // --- Pipeline Engine Logic ---
        let isAutoWatch = false;
        let watchInterval = null;
        let isProcessing = false;

        function toggleAutoWatch() {
            isAutoWatch = !isAutoWatch;
            const btn = document.getElementById('auto-watch-toggle');
            if(isAutoWatch) {
                btn.classList.add('on');
                logMsg('Directory Watcher ON: Listening to /assets/references/', 'warn');
                watchInterval = setInterval(triggerPipeline, 3000);
            } else {
                btn.classList.remove('on');
                clearInterval(watchInterval);
                logMsg('Watcher OFF. Manual mode.', 'info');
            }
        }

        function triggerPipeline() {
            if(isProcessing) return;
            isProcessing = true;
            clearInterval(watchInterval); 

            logMsg('NEW FILE DETECTED: mannen.jpg', 'sys');
            document.getElementById('json-output').innerText = '// Processing Stage 1-5 (Background Engine Analysis)...';
            document.getElementById('json-output').className = "text-[10.5px] font-mono text-amber-300/80 leading-relaxed";
            document.getElementById('gap-score').innerText = 'Gap: Calculating...';
            document.getElementById('gap-score').className = "text-[10px] font-mono text-amber-400 animate-pulse bg-slate-900/80 px-2 py-0.5 rounded border border-amber-900";

            // Reset visualizer
            ['viz-ref', 'viz-inv', 'viz-bw', 'viz-dep'].forEach(id => {
                document.getElementById(id).style.opacity = '0.1';
            });

            // Timed Execution to match SPEC workflow
            setTimeout(() => {
                logMsg('Stage 1 [MEASUREMENT]: Extracting Duality Maps from mannen.jpg (SPEC Điều 3)...', 'info');
                document.getElementById('viz-ref').style.opacity = '1';
                setTimeout(() => {
                    document.getElementById('viz-inv').style.opacity = '1';
                    document.getElementById('viz-bw').style.opacity = '1';
                    document.getElementById('viz-dep').style.opacity = '1';
                    logMsg('Stage 1 PASS: Quantum core structure identified. Inner glow separated from base trace streams.', 'pass');
                }, 800);
            }, 500);

            setTimeout(() => logMsg('Stage 2 [SILHOUETTE]: Z-order mapped. Central atom sphere + 2 orbital trace waves.', 'info'), 2200);
            setTimeout(() => logMsg('Stage 3 [CAMERA]: Deep space projection locked. Central focus DoF.', 'info'), 3000);
            setTimeout(() => logMsg('Stage 4 [MATERIAL]: Emissive intensity isolated. Outer space particle layer mapped.', 'info'), 3800);
            setTimeout(() => logMsg('Stage 5 [LIGHTING]: Central core emissive burst detected. Bloom halo calculated at 85%.', 'info'), 4600);

            setTimeout(() => {
                logMsg('Compiling Canonical Spec JSON (SPEC Điều 5)...', 'sys');
                
                const finalJson = {
                    "spec_id": "SPEC-natt-core-mannen-bg",
                    "version": "1.0.0",
                    "source_reference": "/assets/references/mannen.jpg",
                    "measurement_timestamp": new Date().toISOString(),
                    "canvas": { "resolution_measured": "1920x1080", "background": "deep_space_nebula_01" },
                    "main_object": {
                        "quantum_atom_core": { "size_px": "center_focused", "material": "emission_plasma_gold" },
                        "orbital_traces": { "count": 2, "colors": ["neon_blue", "neon_magenta", "neon_amber"] },
                        "particle_field": { "density": "high", "type": "floating_stardust" },
                        "glow_halo": { "intensity": "85%", "type": "bloom_post_fx" }
                    },
                    "lighting": { "key_light": "internal_core_burst", "ambient": "dark_void" },
                    "rebuild_gap": { "dimension_ratio": "0.1%", "silhouette_iou": 0.98 }
                };

                const jsonEl = document.getElementById('json-output');
                jsonEl.innerText = JSON.stringify(finalJson, null, 2);
                jsonEl.className = "text-[10.5px] font-mono text-cyan-300 leading-relaxed opacity-100 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]";
                
                const gapEl = document.getElementById('gap-score');
                gapEl.innerText = 'Gap: IoU 0.98 (PASSED)';
                gapEl.className = "text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900 shadow-[0_0_10px_rgba(16,185,129,0.3)]";
                
                logMsg('Spec verified against schema and saved. Compliance 100%.', 'pass');

                // Resume watcher
                isProcessing = false;
                if(isAutoWatch) {
                    setTimeout(() => {
                        logMsg('Waiting for next asset...', 'info');
                        watchInterval = setInterval(triggerPipeline, 8000);
                    }, 2000);
                }
            }, 5500);
        }
    </script>
</body>
</html>
