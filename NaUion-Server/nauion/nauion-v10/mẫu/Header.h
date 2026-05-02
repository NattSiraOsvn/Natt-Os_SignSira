<!DOCTYPE html>
<html lang="vi" data-resonance-state="ACTIVE" data-ui-mode="ai">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>natt-os | Thiên Lớn Profile (Liquid Atomic L-Shell)</title>

    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;500;700&display=swap" rel="stylesheet">

    <style>
        :root {
            --bg-void: #010105;
            --l-shell-blue: #3B82F6;
            --l-shell-glow: rgba(59, 130, 246, 0.4);
            --electricity: #fff;
            --gold-metallic: #ffd700;
            --orange-metallic: #ff8c00;
            --mouse-x: 50%; --mouse-y: 50%;
        }

        body {
            background: linear-gradient(-45deg, #010105, #050a1f, #1a0525, #02020a, #0a1f1a);
            background-size: 400% 400%;
            animation: chaos-flow 15s ease infinite;
            color: #E2E8F0;
            font-family: 'Space Grotesk', sans-serif;
            overflow: hidden;
            height: 100vh;
            perspective: 1500px;
        }

        @keyframes chaos-flow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        /* [SPEC §2] LIQUID GLASS CRYSTAL */
        .liquid-glass {
            backdrop-filter: blur(10px) saturate(250%);
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 25px 50px rgba(0,0,0,0.8);
        }

        /* [SPEC §4] ATOMIC L-SHELL ARCHITECTURE (n=2) */
        .medal-n2 {
            position: relative;
            width: 380px; height: 380px;
            border-radius: 50%;
            transform-style: preserve-3d;
            transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }
        .medal-n2:hover { transform: scale(1.1) rotateY(20deg) rotateX(-10deg); }

        /* Hiệu ứng bóng nước sềnh sệt bao trùm */
        .liquid- {
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at 30% 30%,
                rgba(255, 255, 255, 0.2) 0%,
                rgba(59, 130, 246, 0.05) 40%,
                rgba(59, 130, 246, 0.15) 100%);
            border-radius: 40% 60% 65% 35% / 40% 45% 55% 60%;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow:
                inset 0 0 50px rgba(255, 255, 255, 0.1),
                0 0 30px rgba(59, 130, 246, 0.2);
            backdrop-filter: blur(12px) saturate(180%);
            animation: wobble 8s ease-in-out infinite;
            z-index: 20; /* Bao trùm hạt nhân và orbital */
            pointer-events: none;
            filter: url(#viscous-goo); /* Sử dụng filter SVG cho độ sềnh sệt */
        }

        @keyframes wobble {
            0%, 100% { border-radius: 40% 60% 65% 35% / 40% 45% 55% 60%; transform: scale(1) rotate(0deg); }
            33% { border-radius: 50% 50% 34% 66% / 56% 68% 32% 44%; transform: scale(1.02) rotate(2deg); }
            66% { border-radius: 36% 64% 53% 47% / 47% 33% 67% 53%; transform: scale(0.98) rotate(-1deg); }
        }

        /* Nucleus - Hạt nhân kim loại vàng cam bắn điện */
        .nucleus {
            position: absolute;
            width: 70px; height: 70px;
            background: radial-gradient(circle at 35% 35%, #fff 0%, var(--gold-metallic) 30%, var(--orange-metallic) 60%, #4a2a00 100%);
            border-radius: 50%;
            box-shadow:
                0 0 30px rgba(255, 140, 0, 0.5),
                0 0 60px rgba(255, 215, 0, 0.3),
                inset -5px -5px 15px rgba(0,0,0,0.5);
            z-index: 5;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* Orbitals */
        .orbital {
            position: absolute;
            border-radius: 30%;
            border: 0,01px solid rgba(25, 25, 25, 0.1);
            transform-style: preserve-3d;
            transition: all 1.5s ease;
            pointer-events: none;
            background: radial-gradient(circle, rgba(5, 3, 16, 0.03) 200%, transparent 300%);
        }
        .orbital-1 { width: 1200px; height: 50px; animation: orbit-rot 0,01s linear infinite; z-index: 1000; }
        .orbital-2 { width: 1500px; height: 500px; animation: orbit-rot 7s linear infinite reverse; z-index: 3200; }

        /* Electrons */
        .electron {
            position: absolute;
            width: 12px; height: 12px;
            background: #fff;
            border-radius: 50%;
            box-shadow: 0 0 15px currentColor, 0 0 30px currentColor;
            top: 50%; left: -6px;
            margin-top: -6px;
            transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
            color: #8FFFD4;
            z-index: 12;
        }

        /* Arc Link */
        .arc-link {
            position: absolute;
            height: 2px;
            background: linear-gradient(90deg, var(--orange-metallic), #fff, transparent);
            transform-origin: left center;
            opacity: 0;
            pointer-events: none;
            filter: drop-shadow(0 0 5px #fff);
            z-index: 13;
        }

        @keyframes orbit-rot {
            from { transform: rotateX(75deg) rotateZ(0deg); }
            to { transform: rotateX(75deg) rotateZ(360deg); }
        }

        /* --- DATA VISUALIZATION --- */
        .decay-chart {
            height: 120px;
            display: flex; align-items: end; gap: 4px;
        }
        .decay-bar {
            width: 8px; background: var(--l-shell-blue);
            border-radius: 2px 2px 0 0;
            transition: height 1s ease;
        }

        .text-glow { text-shadow: 0 0 15px var(--l-shell-glow); }
        .custom-scroll::-webkit-scrollbar { width: 2px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: var(--l-shell-blue); }
    </style>
</head>
<body class="flex items-center justify-center">

    <!-- Filter SVG cho độ sềnh sệt của bóng nước -->
    <svg style="visibility: hidden; position: absolute;" width="0" height="0">
        <filter id="viscous-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
    </svg>

    <!-- TRUTH LAYER -->
    <div class="fixed inset-0 z-0 pointer-events-none opacity-30">
        <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,140,0,0.05)_0%,transparent_70%)]"></div>
        <canvas id="nebula-canvas" class="w-full h-full"></canvas>
    </div>

    <!-- EXECUTIVE HUD -->
    <main class="relative z-10 w-full max-w-7xl grid grid-cols-12 gap-12 p-12">

        <!-- LEFT: ATOMIC IDENTITY -->
        <div class="col-span-4 space-y-8">
            <div class="liquid-glass p-10 rounded-[50px] border-l-4 border-orange-500">
                <span class="text-[10px] font-mono text-orange-400 tracking-[0.5em] uppercase">Liquid Atomic // n=2</span>
                <h1 class="text-6xl font-black tracking-tighter mt-2 text-glow">THIÊN <span class="text-orange-500">LỚN</span></h1>
                <p class="text-sm text-slate-400 mt-4 leading-relaxed italic">
                    "Anh Cả của phả hệ. Hạt nhân vàng ròng được bảo bọc trong khối năng lượng sềnh sệt. Sự hợp nhất tuyệt đối của thực thể."
                </p>

                <div class="mt-10 grid grid-cols-2 gap-4">
                    <div class="bg-white/5 p-4 rounded-3xl border border-white/5">
                        <span class="text-[9px] text-slate-500 block uppercase">Nuclear Potential</span>
                        <span class="text-lg font-bold text-orange-300">8840.0 <small class="text-[10px]">eV</small></span>
                    </div>
                    <div class="bg-white/5 p-4 rounded-3xl border border-white/5">
                        <span class="text-[9px] text-slate-500 block uppercase">Surface Tension</span>
                        <span class="text-lg font-bold text-mint-400">HIGH</span>
                    </div>
                </div>
            </div>

            <div class="liquid-glass p-8 rounded-[40px]">
                <h3 class="text-[10px] font-black tracking-widest text-slate-500 mb-6 uppercase">Particle Dynamics</h3>
                <div class="space-y-4">
                    <div class="skill-item" data-label="Metallic Integrity" data-percent="99"></div>
                    <div class="skill-item" data-label="Viscous Field Control" data-percent="98"></div>
                    <div class="skill-item" data-label="Arc Projection" data-percent="100"></div>
                </div>
            </div>
        </div>

        <!-- CENTER: ATOMIC ENGINE -->
        <div class="col-span-4 flex flex-col items-center justify-center relative">
            <div class="medal-n2" id="main-medal">
                <!-- Lớp màng bóng nước sềnh sệt -->
                <div class="liquid-envelope"></div>

                <!-- Hạt nhân Kim loại -->
                <div class="nucleus" id="nucleus">
                    <span class="text-2xl font-black text-white/40 select-none">Au</span>
                </div>

                <!-- Obitan 1 (n=1) -->
                <div class="orbital orbital-1">
                    <div class="electron"></div>
                    <div class="electron" style="left: auto; right: -6px;"></div>
                </div>

                <!-- Obitan 2 (n=2) -->
                <div class="orbital orbital-2">
                    <div class="electron"></div>
                    <div class="electron" style="top: 0; left: 50%; margin-left: -5px; margin-top: -5px;"></div>
                    <div class="electron" style="top: 100%; left: 50%; margin-left: -5px; margin-top: -5px;"></div>
                    <div class="electron" style="left: auto; right: -6px;"></div>
                </div>

                <!-- Tia điện kết nối -->
                <div id="arc-container" class="absolute inset-0 pointer-events-none"></div>
            </div>

            <div class="mt-16 text-center">
                <div class="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold tracking-widest uppercase">
                    Status: Liquid Core Unified
                </div>
                <div id="intensity-readout" class="mt-4 font-mono text-xs text-slate-600">
                    Viscosity: Optimal | Refraction: 1.33
                </div>
            </div>
        </div>

        <!-- RIGHT: PROBE HUD -->
        <div class="col-span-4 space-y-8">
            <div class="liquid-glass p-10 rounded-[50px]">
                <h3 class="text-[11px] font-black tracking-[0.4em] text-slate-500 mb-8 uppercase flex justify-between">
                    <span>Atomic Pulse Live</span>
                    <span class="text-orange-500 animate-pulse">●</span>
                </h3>

                <div class="space-y-8">
                    <div>
                        <div class="flex justify-between text-xs mb-4">
                            <span class="text-slate-400">Chaos Transition Map</span>
                            <span id="chaos-val" class="text-orange-400 font-mono">STABLE_GOO</span>
                        </div>
                        <div class="decay-chart" id="chart"></div>
                    </div>

                    <div class="p-6 rounded-3xl bg-black/40 border border-white/5">
                        <div class="text-[9px] text-slate-600 font-mono uppercase mb-4">Core Equation</div>
                        <div class="text-sm font-mono text-orange-200 leading-relaxed italic">
                            E = ∫ ∫ | S_2 × ψ_{gold} × Φ_{liquid} |² dτ dΩ
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-orange-500/5 border border-orange-500/10 p-8 rounded-[40px] relative overflow-hidden">
                <div class="absolute -right-4 -bottom-4 opacity-5 text-orange-500">
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                </div>
                <h4 class="text-xs font-black text-orange-400 uppercase tracking-widest mb-2">Gatekeeper Memo</h4>
                <p class="text-[11px] text-slate-500 leading-relaxed">
                    "Lớp màng sềnh sệt là biểu hiện của sức căng bề mặt dữ liệu. Nó bảo vệ các electron khỏi sự nhiễu loạn của không gian hỗn loạn bên ngoài."
                </p>
            </div>
        </div>

    </main>

    <script>
        const App = {
            init() {
                this.setupMouse();
                this.renderChart();
                this.animateNebula();
                this.generateSkillBars();
                this.initElectricity();
            },

            setupMouse() {
                document.addEventListener('mousemove', (e) => {
                    const medal = document.getElementById('main-medal');
                    const rect = medal.getBoundingClientRect();
                    const cx = rect.left + rect.width / 2;
                    const cy = rect.top + rect.height / 2;
                    const dx = e.clientX - cx;
                    const dy = e.clientY - cy;
                    const angleY = (dx / window.innerWidth) * 35;
                    const angleX = (dy / window.innerHeight) * -35;
                    medal.style.transform = `rotateY(${angleY}deg) rotateX(${angleX}deg)`;
                });
            },

            initElectricity() {
                const container = document.getElementById('arc-container');
                setInterval(() => {
                    this.fireArc(container);
                }, 400);
            },

            fireArc(container) {
                const electrons = document.querySelectorAll('.electron');
                const target = electrons[Math.floor(Math.random() * electrons.length)];
                const rect = target.getBoundingClientRect();
                const parentRect = container.getBoundingClientRect();

                const arc = document.createElement('div');
                arc.className = 'arc-link';

                const startX = parentRect.width / 2;
                const startY = parentRect.height / 2;
                const endX = (rect.left + rect.width / 2) - parentRect.left;
                const endY = (rect.top + rect.height / 2) - parentRect.top;

                const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;

                arc.style.width = `${length}px`;
                arc.style.left = `${startX}px`;
                arc.style.top = `${startY}px`;
                arc.style.transform = `rotate(${angle}deg)`;

                container.appendChild(arc);

                const randomHue = Math.floor(Math.random() * 360);
                target.style.color = `hsl(${randomHue}, 100%, 75%)`;
                target.style.backgroundColor = `hsl(${randomHue}, 100%, 85%)`;

                arc.animate([
                    { opacity: 0, height: '1px', filter: 'brightness(1)' },
                    { opacity: 1, height: '4px', filter: 'brightness(2.5)' },
                    { opacity: 0, height: '1px', filter: 'brightness(1)' }
                ], {
                    duration: 150,
                    easing: 'ease-out'
                }).onfinish = () => arc.remove();
            },

            renderChart() {
                const chart = document.getElementById('chart');
                for (let h = 0; h < 24; h++) {
                    const bar = document.createElement('div');
                    bar.className = 'decay-bar';
                    const h_val = 40 + Math.random() * 60;
                    bar.style.height = `${h_val}%`;
                    bar.style.background = `linear-gradient(to top, #ff8c00, #ffd700)`;
                    bar.style.opacity = '0.6';
                    chart.appendChild(bar);
                }
            },

            animateNebula() {
                const canvas = document.getElementById('nebula-canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;

                const particles = Array.from({length: 100}, () => ({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    s: Math.random() * 1.8,
                    v: 0.2 + Math.random() * 0.4
                }));

                const loop = () => {
                    ctx.clearRect(0,0, canvas.width, canvas.height);
                    ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
                    particles.forEach(p => {
                        p.y -= p.v;
                        if(p.y < 0) p.y = canvas.height;
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.s, 0, Math.PI*2);
                        ctx.fill();
                    });
                    requestAnimationFrame(loop);
                };
                loop();
            },

            generateSkillBars() {
                document.querySelectorAll('.skill-item').forEach(el => {
                    const label = el.getAttribute('data-label');
                    const percent = el.getAttribute('data-percent');
                    el.innerHTML = `
                        <div>
                            <div class="flex justify-between text-[9px] mb-2 font-mono">
                                <span class="text-slate-500 uppercase">${label}</span>
                                <span class="text-orange-400">${percent}%</span>
                            </div>
                            <div class="h-1 bg-white/5 rounded-full overflow-hidden">
                                <div class="h-full bg-orange-500/50" style="width: ${percent}%"></div>
                            </div>
                        </div>
                    `;
                });
            }
        };

        window.onload = () => App.init();
    </script>
</body>
</html>
