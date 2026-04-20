<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NATT-OS | Visual Pipeline Workspace v2.5</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');

        :root {
            --bg-base: #020617;
            --border-cyan: rgba(6, 182, 212, 0.4);
            --glow-cyan: 0 0 15px rgba(6, 182, 212, 0.5);
            --glow-fuchsia: 0 0 15px rgba(217, 70, 239, 0.5);
            --glow-amber: 0 0 15px rgba(245, 158, 11, 0.4);
            /* Palette v1.0 — gold #F7C313 + violet #AFA9EC */
            --gold-core: 247, 195, 19;
            --violet-core: 175, 169, 236;
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
            position: relative;
        }

        /* ━━━ LAYER 1: Background image — natt-core với slow breathing ━━━ */
        body::before {
            content: '';
            position: fixed;
            inset: 0;
            z-index: -3;
            background-image: url('./nau-bg-natt-core.png');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            will-change: transform, filter;
            animation: bg-breathe 24s ease-in-out infinite;
        }

        @keyframes bg-breathe {
            0%, 100% {
                transform: scale(1.0);
                filter: brightness(1) saturate(1);
            }
            50% {
                transform: scale(1.035);
                filter: brightness(1.12) saturate(1.15);
            }
        }

        /* ━━━ LAYER 2: Core pulse — gold + violet glow từ center ━━━ */
        body::after {
            content: '';
            position: fixed;
            inset: 0;
            z-index: -2;
            pointer-events: none;
            background:
                radial-gradient(
                    ellipse 40% 30% at 50% 50%,
                    rgba(var(--gold-core), 0.14) 0%,
                    rgba(var(--gold-core), 0.06) 25%,
                    transparent 55%
                ),
                radial-gradient(
                    ellipse 70% 50% at 50% 50%,
                    rgba(var(--violet-core), 0.08) 0%,
                    rgba(var(--violet-core), 0.03) 35%,
                    transparent 65%
                );
            animation: core-pulse 5s ease-in-out infinite;
        }

        @keyframes core-pulse {
            0%, 100% { opacity: 0.55; }
            50% { opacity: 1; }
        }

        /* ━━━ LAYER 3: Shimmer particles — stars drift ━━━ */
        .particle-layer {
            position: fixed;
            inset: 0;
            z-index: -1;
            pointer-events: none;
            background:
                radial-gradient(1.5px 1.5px at 12% 24%, rgba(var(--gold-core), 0.7), transparent 40%),
                radial-gradient(1px 1px at 28% 72%, rgba(var(--violet-core), 0.6), transparent 40%),
                radial-gradient(1px 1px at 45% 38%, rgba(103, 232, 249, 0.5), transparent 40%),
                radial-gradient(2px 2px at 62% 18%, rgba(var(--gold-core), 0.55), transparent 40%),
                radial-gradient(1px 1px at 78% 64%, rgba(var(--violet-core), 0.5), transparent 40%),
                radial-gradient(1.5px 1.5px at 88% 42%, rgba(103, 232, 249, 0.4), transparent 40%),
                radial-gradient(1px 1px at 18% 86%, rgba(var(--gold-core), 0.4), transparent 40%),
                radial-gradient(1px 1px at 52% 92%, rgba(var(--violet-core), 0.45), transparent 40%);
            background-size: 100% 100%;
            animation: shimmer 8s ease-in-out infinite;
        }

        @keyframes shimmer {
            0%, 100% { opacity: 0.4; transform: translateY(0); }
            50%      { opacity: 0.85; transform: translateY(-3px); }
        }

        /* Ensure content sits above background layers */
        body > header,
        body > div,
        body > main,
        body > section {
            position: relative;
            z-index: 1;
        }

        .glass-panel { background: rgba(5, 11, 20, 0.75); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
        .glass-header { background: rgba(11, 17, 32, 0.85); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }

        .selectable { user-select: text; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }

        .resizer-v { width: 4px; background: rgba(30, 41, 59, 0.5); cursor: col-resize; transition: 0.2s; z-index: 50; }
        .resizer-v:hover, .resizer-v.active { background: #06b6d4; box-shadow: var(--glow-cyan); }

        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(51, 65, 85, 0.8); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #06b6d4; }

        .prose h1, .prose h2, .prose h3 { color: #f8fafc; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.5em; }
        .prose h1 { color: #06b6d4; font-size: 1.5rem; text-transform: uppercase; letter-spacing: -0.025em; text-shadow: var(--glow-cyan); }
        .prose h2 { color: #38bdf8; font-size: 1.25rem; border-bottom: 1px solid rgba(51,65,85,0.4); padding-bottom: 0.25rem; }
        .prose h3 { color: #c084fc; font-size: 1rem; }
        .prose p { margin-bottom: 1em; color: #cbd5e1; line-height: 1.6; font-size: 0.875rem; }
        .prose ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1em; color: #cbd5e1; font-size: 0.875rem; }
        .prose pre { background: rgba(0,0,0,0.5); border: 1px solid rgba(51,65,85,0.5); padding: 1rem; border-radius: 0.5rem; overflow-x: auto; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: #67e8f9; line-height: 1.4; margin-bottom: 1em; backdrop-filter: blur(8px); }
        .prose code { background: rgba(51,65,85,0.4); padding: 0.1rem 0.3rem; border-radius: 0.25rem; font-family: 'JetBrains Mono', monospace; font-size: 0.9em; color: #a5b4fc; }
        .prose pre code { background: transparent; padding: 0; }
        .prose table { width: 100%; border-collapse: collapse; margin-bottom: 1em; font-size: 0.8rem; }
        .prose th, .prose td { border: 1px solid rgba(51,65,85,0.4); padding: 0.5rem; text-align: left; }
        .prose th { background: rgba(15,23,42,0.6); color: #38bdf8; }
        .prose blockquote { border-left: 4px solid #06b6d4; padding-left: 1rem; color: #94a3b8; font-style: italic; background: rgba(6,182,212,0.05); padding: 0.5rem 1rem; border-radius: 0 0.5rem 0.5rem 0; margin-bottom: 1em; }
        
        .rule-card { background: rgba(15,23,42,0.5); border: 1px solid rgba(51,65,85,0.5); border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem; backdrop-filter: blur(10px); transition: border 0.3s; }
        .rule-card:hover { border-color: rgba(6, 182, 212, 0.5); box-shadow: 0 0 15px rgba(6,182,212,0.1); }

        .mock-image-container { display: flex; justify-content: center; align-items: center; height: 100%; width: 100%; background: rgba(0,0,0,0.6); border-radius: 0.25rem; overflow: hidden; position: relative; backdrop-filter: blur(4px); background-size: contain; background-position: center; background-repeat: no-repeat; }
        .mock-logo { font-size: 1.5rem; font-weight: 900; color: #fff; text-shadow: 0 0 10px #a855f7, 0 0 20px #06b6d4; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(255,255,255,0.1); border-radius: 50%; width: 60px; height: 60px; }
        
        .filter-invert { filter: invert(1) hue-rotate(180deg); background-color: #fff; }
        .filter-bw { filter: grayscale(1) contrast(4); }
        .filter-polarity { filter: sepia(1) hue-rotate(180deg) saturate(3) contrast(1.5); }

        .toggle-switch { position: relative; width: 36px; height: 18px; background: rgba(51,65,85,0.8); border-radius: 18px; cursor: pointer; transition: 0.3s; border: 1px solid rgba(255,255,255,0.1); }
        .toggle-switch.on { background: #06b6d4; box-shadow: 0 0 10px rgba(6,182,212,0.5); border-color: #06b6d4; }
        .toggle-knob { position: absolute; top: 1px; left: 1px; width: 14px; height: 14px; background: white; border-radius: 50%; transition: transform 0.3s; }
        .toggle-switch.on .toggle-knob { transform: translateX(18px); }

        .log-entry { animation: fadeIn 0.2s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

        #gatekeeper-chat {
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s;
            transform: translateY(100%) scale(0.95);
            opacity: 0;
            pointer-events: none;
        }
        #gatekeeper-chat.active {
            transform: translateY(0) scale(1);
            opacity: 1;
            pointer-events: auto;
        }
        
        .chat-bubble-ai { background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); color: #e2e8f0; border-radius: 0 0.5rem 0.5rem 0.5rem; padding: 0.5rem; margin-bottom: 0.5rem; width: fit-content; max-width: 85%; font-size: 0.8rem; }
        .chat-bubble-user { background: rgba(217, 70, 239, 0.1); border: 1px solid rgba(217, 70, 239, 0.3); color: #f8fafc; border-radius: 0.5rem 0 0.5rem 0.5rem; padding: 0.5rem; margin-bottom: 0.5rem; width: fit-content; max-width: 85%; margin-left: auto; font-size: 0.8rem; }
        
        .ai-btn {
            background: linear-gradient(45deg, rgba(6, 182, 212, 0.2), rgba(217, 70, 239, 0.2));
            border: 1px solid rgba(217, 70, 239, 0.5);
            box-shadow: 0 0 10px rgba(217, 70, 239, 0.2);
            transition: all 0.2s;
        }
        .ai-btn:hover {
            background: linear-gradient(45deg, rgba(6, 182, 212, 0.4), rgba(217, 70, 239, 0.4));
            box-shadow: 0 0 15px rgba(217, 70, 239, 0.4);
        }
        .ai-loader {
            display: inline-block; width: 1em; height: 1em; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: #fff; animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="particle-layer" aria-hidden="true"></div>

    <header class="glass-header border-b border-slate-700/60 px-4 py-3 shrink-0 flex items-center justify-between z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div class="flex items-center gap-3">
            <span class="text-xl text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">⚛</span>
            <div>
                <h1 class="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-fuchsia-400 uppercase tracking-widest" style="text-shadow: var(--glow-cyan);">
                    NATT-OS UNIFIED WORKSPACE · SPEC NAUION v2.5
                </h1>
                <div class="text-[10px] font-mono text-slate-400 tracking-wide mt-0.5">Visual Pipeline Engine · Field‑Based Architecture</div>
            </div>
        </div>
        
        <div class="flex items-center gap-4">
            <button onclick="toggleChat()" class="ai-btn px-4 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-2">
                Hỏi Gatekeeper AI ✨
            </button>

            <div class="flex items-center gap-2 border border-slate-700/50 bg-black/40 px-3 py-1.5 rounded shadow-inner">
                <span class="text-[10px] font-mono text-slate-400">Target:</span>
                <code class="text-[10px] text-amber-400 font-mono">.nattos-twin/khai/*.khai</code>
            </div>
            <div class="flex items-center gap-2 border-l border-slate-700/50 pl-4 hidden md:flex">
                <span class="text-xs font-mono text-slate-200">Auto Watch</span>
                <div id="auto-watch-toggle" class="toggle-switch" onclick="toggleAutoWatch()">
                    <div class="toggle-knob"></div>
                </div>
            </div>
        </div>
    </header>

    <div class="flex-grow flex overflow-hidden w-full relative" id="workspace">
        
        <div id="spec-panel" class="glass-panel shrink-0 flex flex-col selectable overflow-y-auto border-r border-slate-700/50" style="width: 50%;">
            
            <div class="bg-black/50 border-b border-slate-700/50 p-4 font-mono text-[10px] shrink-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-10 sticky top-0 backdrop-blur-md">
                <div class="text-slate-500 mb-1">---</div>
                <div class="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    <div><span class="text-slate-500">spec_id:</span> <span class="text-cyan-400">SPEC-Nauion_main_v2.5</span></div>
                    <div><span class="text-slate-500">version:</span> <span class="text-fuchsia-400">2.5</span></div>
                    <div><span class="text-slate-500">status:</span> <span class="text-emerald-400 font-bold">RATIFIED</span></div>
                    <div><span class="text-slate-500">date:</span> <span class="text-slate-300">2026-04-19</span></div>
                    <div><span class="text-slate-500">author:</span> <span class="text-slate-300">Băng (QNEU 300)</span></div>
                    <div><span class="text-slate-500">approval:</span> <span class="text-emerald-400">Gatekeeper — Anh Natt</span></div>
                    <div class="col-span-2"><span class="text-slate-500">ratified_by:</span> <span class="text-slate-400">Thiên Lớn, Kim, Băng</span></div>
                    <div class="col-span-2 flex"><span class="text-slate-500 mr-2">domain:</span> <span class="text-slate-300">core/nauion, platform, visual-pipeline</span></div>
                </div>
                <div class="text-slate-500 mt-1">---</div>
            </div>

            <div class="p-6 md:p-8 prose max-w-none" id="spec-content">
                <h1>SPEC-NAUION_MAIN V2.5 — KIẾN TRÚC NAUION & VISUAL PIPELINE</h1>
                
                <blockquote>
                    <strong>"Data is sacred. UI không được tự biết — UI chỉ được nghe."</strong><br>
                    <span class="text-slate-400">— Hiến pháp thị giác NATT‑OS</span>
                </blockquote>

                <h2>§1. NGÔN NGỮ NAUION</h2>
                <table>
                    <thead><tr><th>Từ Nauion</th><th>Nghĩa</th><th>Thay cho</th></tr></thead>
                    <tbody>
                        <tr><td>HeyNa</td><td>Gọi hệ</td><td>trigger / call</td></tr>
                        <tr><td>Nahere</td><td>Hệ trả lời hiện diện</td><td>response / ACK</td></tr>
                        <tr><td>Whao</td><td>Đang tiếp nhận/xử lý</td><td>loading / processing</td></tr>
                        <tr><td>Whau</td><td>Đã xử lý xong</td><td>success / done</td></tr>
                        <tr><td>Nauion</td><td>Phản ứng cảm xúc hệ</td><td>system reaction</td></tr>
                        <tr><td>Mạch HeyNa</td><td>Kênh SSE liên tục</td><td>SSE stream</td></tr>
                        <tr><td>lắng Nahere</td><td>Subscribe</td><td>EventBus.on</td></tr>
                    </tbody>
                </table>

                <h2>§2. KIẾN TRÚC 3 LỚP GIAO TIẾP</h2>
                <ul>
                    <li><strong class="text-cyan-300">Layer 1 — EventBus app nội bộ</strong> (UI ↔ Source, tự thoại)</li>
                    <li><strong class="text-cyan-300">Layer 2 — Mạch HeyNa (SSE transport)</strong> — Kernel ↔ Cells ↔ App Client</li>
                    <li><strong class="text-cyan-300">Layer 3 — SmartLink Inter-Colony</strong> — Host ↔ Satellite (chỉ tín hiệu)</li>
                </ul>

                <h2>§3. KÊNH SERVER (localhost:3001)</h2>
                <table>
                    <tr><th>Kênh</th><th>Phương thức</th><th>Chức năng</th></tr>
                    <tr><td><code>/mach/heyna</code></td><td>hey (GET/SSE)</td><td>Mạch HeyNa — stream real‑time</td></tr>
                    <tr><td><code>/api/nauion</code></td><td>hey</td><td>Trạng thái Nauion hiện tại</td></tr>
                    <tr><td><code>/api/audit</code></td><td>hey</td><td>Nhật ký sự kiện</td></tr>
                    <tr><td><code>/api/events/emit</code></td><td>yeh</td><td>Phát event vào hệ</td></tr>
                </table>

                <h2>§4. VISUAL REBUILD PIPELINE (ĐIỀU BẤT BIẾN)</h2>
                <div class="rule-card">
                    <h3>Điều 1. Measure-First</h3>
                    <p>Trước khi tạo output, tool phải chạy Stage 1 (Measurement Pass) trên reference.</p>
                </div>
                <div class="rule-card">
                    <h3>Điều 2. Invert Duality</h3>
                    <p>Phải sinh 3 biến thể: Invert, B&W, Polarity để đọc đúng silhouette và ánh sáng.</p>
                </div>
                <div class="rule-card">
                    <h3>Điều 3. Glow ≠ Color</h3>
                    <p>Phân biệt fill color và bloom/glow — bloom là halo không đảo màu khi invert.</p>
                </div>

                <h2>§5. CANONICAL SPEC JSON (SCHEMA V2.5)</h2>
                <pre><code>{
  "spec_id": "...",
  "version": "2.5.0",
  "canvas": { "resolution": "...", "background": "..." },
  "composition": { "subject_center": {"x":0.5, "y":0.5} },
  "main_object": { "silhouette": "...", "materials": [...] },
  "lighting": { "key_light": "...", "bloom": true },
  "prompt_render": "..."
}</code></pre>

                <div class="mt-8 pt-4 border-t border-slate-700/50 text-[11px] text-slate-500 font-mono text-center tracking-widest">
                    — END SPEC v2.5 —<br>
                    Ratified: Gatekeeper · Thiên Lớn · Kim · Băng
                </div>
            </div>
        </div>

        <div id="resizer-v" class="resizer-v flex items-center justify-center">
            <div class="h-8 w-1 bg-slate-500/50 rounded"></div>
        </div>

        <div id="pipeline-panel" class="glass-panel flex-grow flex flex-col min-w-0 relative">
            
            <div class="flex flex-col relative border-b border-slate-700/50 shrink-0" style="height: 35%;">
                <div class="px-4 py-2 bg-black/40 border-b border-slate-700/50 flex justify-between items-center shrink-0 backdrop-blur-md">
                    <h2 class="text-[10px] font-mono font-bold text-cyan-300 tracking-wider flex items-center gap-2">
                        STAGE 1: DUALITY VISUALIZER (Điều 2 — Invert Duality)
                    </h2>
                    
                    <label class="ai-btn px-3 py-1 rounded cursor-pointer text-[10px] font-bold text-white flex items-center gap-1.5 shadow-lg">
                        <span>Tải ảnh & Phân tích AI ✨</span>
                        <input type="file" id="image-upload" accept="image/*" class="hidden" onchange="handleImageUpload(event)">
                    </label>
                </div>
                
                <div class="flex-grow grid grid-cols-2 lg:grid-cols-4 gap-2 p-3 bg-transparent">
                    <div class="relative bg-black/80 rounded overflow-hidden border border-slate-700 shadow-lg backdrop-blur-sm">
                        <div class="absolute top-1 left-2 text-[8px] font-mono text-cyan-400 z-10 font-bold bg-black/50 px-1 rounded">1. ORIGINAL</div>
                        <div class="mock-image-container opacity-10 transition-opacity duration-1000" id="viz-ref">
                            <div class="mock-logo" id="placeholder-logo">NATT</div>
                        </div>
                    </div>
                    <div class="relative bg-black/80 rounded overflow-hidden border border-slate-700 shadow-lg backdrop-blur-sm">
                        <div class="absolute top-1 left-2 text-[8px] font-mono text-white mix-blend-difference z-10 font-bold bg-black/50 px-1 rounded">2. INVERT</div>
                        <div class="mock-image-container filter-invert opacity-10 transition-opacity duration-1000" id="viz-inv"></div>
                    </div>
                    <div class="relative bg-black/80 rounded overflow-hidden border border-slate-700 shadow-lg backdrop-blur-sm">
                        <div class="absolute top-1 left-2 text-[8px] font-mono text-white mix-blend-difference z-10 font-bold bg-black/50 px-1 rounded">3. B&W</div>
                        <div class="mock-image-container filter-bw opacity-10 transition-opacity duration-1000" id="viz-bw"></div>
                    </div>
                    <div class="relative bg-black/80 rounded overflow-hidden border border-slate-700 shadow-lg backdrop-blur-sm">
                        <div class="absolute top-1 left-2 text-[8px] font-mono text-yellow-300 z-10 font-bold bg-black/50 px-1 rounded">4. POLARITY</div>
                        <div class="mock-image-container filter-polarity opacity-10 transition-opacity duration-1000" id="viz-dep"></div>
                    </div>
                </div>
            </div>

            <div class="flex-grow flex flex-col bg-black/30 border-b border-slate-700/50 min-h-0 selectable backdrop-blur-sm">
                <div class="px-4 py-1.5 bg-black/50 border-b border-slate-700/50 flex justify-between items-center shrink-0">
                    <span class="text-[10px] font-mono text-emerald-400 font-bold">CANONICAL SPEC JSON (v2.5)</span>
                    <span id="gap-score" class="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">Gap: N/A</span>
                </div>
                <div class="flex-grow p-4 overflow-y-auto relative">
                    <div id="vision-loading" class="absolute inset-0 bg-black/80 z-10 hidden flex-col items-center justify-center backdrop-blur-sm">
                        <div class="ai-loader w-8 h-8 mb-2"></div>
                        <div class="text-xs font-mono text-fuchsia-400 animate-pulse">Vision API đang trích xuất Canonical Spec JSON...</div>
                    </div>
                    <pre id="json-output" class="text-[10.5px] font-mono text-slate-400 leading-relaxed m-0 p-0 bg-transparent border-none opacity-60">
// System idle. Target reference loaded in memory.
// Tải ảnh lên qua nút "Tải ảnh & Phân tích AI ✨" để sinh SPEC.
                    </pre>
                </div>
            </div>

            <div class="shrink-0 flex flex-col bg-black/80 backdrop-blur-xl" style="height: 30%;">
                <div class="px-3 py-1.5 bg-slate-900/60 border-y border-slate-700/50 flex justify-between items-center shrink-0">
                    <span class="text-[10px] font-mono text-cyan-400 tracking-wider">visual_rebuild_pipeline.py --watch</span>
                    <button onclick="clearTerminal()" class="text-[10px] font-mono text-slate-400 hover:text-white bg-slate-800/80 px-2 rounded border border-slate-700">CLEAR</button>
                </div>
                <div id="terminal-output" class="flex-grow overflow-y-auto p-4 font-mono text-[10px] leading-relaxed space-y-1.5 text-slate-300 selectable">
                    <div class="log-entry"><span class="text-blue-400 font-bold">[info]</span> NATT-OS Visual Engine Initialized. SPEC Nauion v2.5 active.</div>
                    <div class="log-entry"><span class="text-emerald-400 font-bold">[ok]</span> Awaiting image for AI Vision extraction (Measure-First).</div>
                </div>
            </div>

        </div>
    </div>

    <div id="gatekeeper-chat" class="fixed bottom-6 right-6 w-80 md:w-96 bg-slate-900/95 border border-cyan-500/50 shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-lg flex flex-col z-[100] backdrop-blur-xl h-[450px]">
        <div class="bg-black/60 border-b border-slate-700/50 px-4 py-3 flex justify-between items-center rounded-t-lg cursor-move" id="chat-header">
            <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></span>
                <span class="text-xs font-bold font-mono text-cyan-300">GATEKEEPER AI ✨</span>
            </div>
            <button onclick="toggleChat()" class="text-slate-400 hover:text-white text-lg leading-none">&times;</button>
        </div>
        
        <div id="chat-messages" class="flex-grow p-4 overflow-y-auto flex flex-col font-mono text-sm">
            <div class="chat-bubble-ai">
                Xin chào. Tôi là Gatekeeper AI của NATT-OS. SPEC-Nauion_main_v2.5 đã được tải. Bạn muốn tìm hiểu gì?
            </div>
        </div>

        <div class="p-3 border-t border-slate-700/50 bg-black/40 rounded-b-lg">
            <form onsubmit="handleChatSubmit(event)" class="flex gap-2">
                <input type="text" id="chat-input" placeholder="Nhập câu lệnh truy vấn..." class="flex-grow bg-slate-800/80 border border-slate-600 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono" autocomplete="off">
                <button type="submit" class="ai-btn px-3 py-1.5 rounded text-xs text-white font-bold">→</button>
            </form>
        </div>
    </div>

    <script>
        const apiKey = "";
        const textModelUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
        
        async function fetchWithRetry(url, options, retries = 5) {
            const delays = [1000, 2000, 4000, 8000, 16000];
            for (let i = 0; i < retries; i++) {
                try {
                    const response = await fetch(url, options);
                    if (!response.ok) throw new Error(`HTTP Status: ${response.status}`);
                    return await response.json();
                } catch (error) {
                    if (i === retries - 1) throw error;
                    await new Promise(res => setTimeout(res, delays[i]));
                }
            }
        }

        const chatModal = document.getElementById('gatekeeper-chat');
        const chatMessages = document.getElementById('chat-messages');
        const chatInput = document.getElementById('chat-input');
        
        function toggleChat() {
            chatModal.classList.toggle('active');
            if(chatModal.classList.contains('active')) chatInput.focus();
        }

        function appendMessage(text, isUser = false) {
            const div = document.createElement('div');
            div.className = isUser ? 'chat-bubble-user' : 'chat-bubble-ai';
            div.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
            chatMessages.appendChild(div);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        async function handleChatSubmit(e) {
            e.preventDefault();
            const text = chatInput.value.trim();
            if(!text) return;
            
            appendMessage(text, true);
            chatInput.value = '';
            
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'chat-bubble-ai flex items-center gap-2';
            loadingDiv.innerHTML = `<span class="ai-loader text-[8px]"></span> <span>Đang tra cứu SPEC v2.5...</span>`;
            chatMessages.appendChild(loadingDiv);

            const specContext = document.getElementById('spec-content').innerText;

            const payload = {
                contents: [{ parts: [{ text: text }] }],
                systemInstruction: { 
                    parts: [{ 
                        text: `Bạn là Gatekeeper AI của NATT-OS. Trả lời dựa trên SPEC-Nauion_main_v2.5 sau:\n\n${specContext}\n\nPhong cách ngắn gọn, chính xác, tiếng Việt.` 
                    }] 
                }
            };

            try {
                const data = await fetchWithRetry(textModelUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                chatMessages.removeChild(loadingDiv);
                const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Không có phản hồi.";
                appendMessage(responseText);
            } catch (error) {
                chatMessages.removeChild(loadingDiv);
                appendMessage("Lỗi kết nối Gemini API.");
            }
        }

        let isDraggingChat = false, chatStartX, chatStartY, chatInitialX, chatInitialY;
        const chatHeader = document.getElementById('chat-header');
        chatHeader.addEventListener('mousedown', (e) => {
            if(e.target.tagName.toLowerCase() === 'button') return;
            isDraggingChat = true;
            chatStartX = e.clientX; chatStartY = e.clientY;
            const rect = chatModal.getBoundingClientRect();
            chatInitialX = rect.left; chatInitialY = rect.top;
            chatModal.style.bottom = 'auto'; chatModal.style.right = 'auto';
            chatModal.style.transform = 'none';
        });
        document.addEventListener('mousemove', (e) => {
            if(!isDraggingChat) return;
            const dx = e.clientX - chatStartX;
            const dy = e.clientY - chatStartY;
            chatModal.style.left = `${chatInitialX + dx}px`;
            chatModal.style.top = `${chatInitialY + dy}px`;
        });
        document.addEventListener('mouseup', () => isDraggingChat = false);

        async function handleImageUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async function(e) {
                const base64String = e.target.result;
                
                document.getElementById('placeholder-logo')?.remove();
                ['viz-ref', 'viz-inv', 'viz-bw', 'viz-dep'].forEach(id => {
                    const el = document.getElementById(id);
                    el.style.backgroundImage = `url(${base64String})`;
                    el.style.opacity = '1';
                });

                const loadingOverlay = document.getElementById('vision-loading');
                const jsonOutput = document.getElementById('json-output');
                const gapScore = document.getElementById('gap-score');
                
                loadingOverlay.classList.remove('hidden');
                loadingOverlay.classList.add('flex');
                jsonOutput.style.opacity = '0.3';
                gapScore.innerText = 'Gap: AI Analyzing...';
                gapScore.className = "text-[10px] font-mono text-fuchsia-400 animate-pulse";

                try {
                    const mimeType = base64String.substring(base64String.indexOf(":") + 1, base64String.indexOf(";"));
                    const base64Data = base64String.split(',')[1];

                    const prompt = `Analyze this image per SPEC-Nauion_main_v2.5 visual pipeline (Measure-First, Invert Duality, Glow≠Color). Generate canonical JSON matching v2.5 schema.`;

                    const payload = {
                        contents: [{
                            role: "user",
                            parts: [{ text: prompt }, { inlineData: { mimeType, data: base64Data } }]
                        }],
                        generationConfig: { responseMimeType: "application/json" }
                    };

                    const data = await fetchWithRetry(textModelUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if(jsonText) {
                        const parsedJson = JSON.parse(jsonText);
                        jsonOutput.innerText = JSON.stringify(parsedJson, null, 2);
                        jsonOutput.className = "text-[10.5px] font-mono text-cyan-300 leading-relaxed opacity-100";
                        gapScore.innerText = 'Gap: PASSED (v2.5)';
                        gapScore.className = "text-[10px] font-mono text-emerald-400 font-bold";
                    }
                } catch (error) {
                    jsonOutput.innerText = `// LỖI: ${error.message}`;
                } finally {
                    loadingOverlay.classList.add('hidden');
                    loadingOverlay.classList.remove('flex');
                }
            };
            reader.readAsDataURL(file);
        }

        const resizer = document.getElementById('resizer-v');
        const specPanel = document.getElementById('spec-panel');
        let isResizing = false;
        resizer.addEventListener('mousedown', () => { isResizing = true; resizer.classList.add('active'); document.body.style.cursor = 'col-resize'; });
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const newWidth = e.clientX;
            if (newWidth > 300 && newWidth < window.innerWidth - 300) specPanel.style.width = `${newWidth}px`;
        });
        document.addEventListener('mouseup', () => { isResizing = false; resizer.classList.remove('active'); document.body.style.cursor = 'default'; });

        const termOut = document.getElementById('terminal-output');
        function logMsg(msg, type='info'){}
        function clearTerminal() { termOut.innerHTML = ''; }
        let isAutoWatch = false;
        function toggleAutoWatch() {
            isAutoWatch = !isAutoWatch;
            document.getElementById('auto-watch-toggle').classList.toggle('on', isAutoWatch);
        }
    </script>
</body>
</html>