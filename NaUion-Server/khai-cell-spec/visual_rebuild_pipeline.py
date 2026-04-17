"""
NaUion Visual Rebuild Pipeline — Reference Implementation
==========================================================

Spec: SPEC-NaUion-Visual-Rebuild-Pipeline v1.0
Date: 2026-04-16
Author: Băng (QNEU 300)

Tuân thủ toàn bộ 10 Điều của SPEC.

Usage:
    python visual_rebuild_pipeline.py <reference_image> <output_dir>

Example:
    python visual_rebuild_pipeline.py logo2.png ./rebuild-out/
"""

import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from collections import Counter
from typing import Dict, Any

import numpy as np
from PIL import Image, ImageOps, ImageEnhance, ImageFilter


# ═══════════════════════════════════════════════════════════════════════════
# STAGE 1 — MEASUREMENT PASS  (Điều 1: bắt buộc)
# ═══════════════════════════════════════════════════════════════════════════

def measure_canvas(img: Image.Image) -> Dict[str, Any]:
    """Canvas dimensions, aspect ratio, background color."""
    W, H = img.size
    arr = np.array(img.convert('RGB'))

    # Sample corners for background
    corners = [arr[10, 10], arr[10, W-10], arr[H-10, 10], arr[H-10, W-10]]
    bg = np.mean(corners, axis=0).astype(int)

    # Simplify aspect ratio
    g = np.gcd(W, H)
    return {
        'width': W,
        'height': H,
        'aspect_ratio': f"{W//g}:{H//g}",
        'aspect_ratio_decimal': round(W/H, 3),
        'resolution_measured': f"{W} × {H}",
        'background': {
            'type': 'solid',
            'color': f"#{bg[0]:02X}{bg[1]:02X}{bg[2]:02X}",
            'notes': 'sampled from 4 corners'
        }
    }


def find_subject_center(img: Image.Image, threshold: int = 80) -> Dict[str, Any]:
    """Center of mass of bright pixels = subject position."""
    gray = np.array(img.convert('L'))
    H, W = gray.shape
    mask = gray > threshold
    ys, xs = np.where(mask)
    if len(xs) == 0:
        return {'x': W//2, 'y': H//2, 'valid': False}
    cx, cy = int(np.mean(xs)), int(np.mean(ys))
    return {
        'x': cx,
        'y': cy,
        'offset_from_center': {'dx': cx - W//2, 'dy': cy - H//2}
    }


def invert_duality_analysis(img: Image.Image, output_dir: Path) -> Dict[str, Path]:
    """
    Điều 3: Bắt buộc sinh 3 biến thể phân tích.
    Returns paths to analysis images.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    paths = {}

    # 1. Inverted
    inv = ImageOps.invert(img.convert('RGB'))
    p = output_dir / '01_inverted.png'
    inv.save(p)
    paths['inverted'] = p

    # 2. B&W high contrast silhouette
    gray = img.convert('L')
    contrast = ImageEnhance.Contrast(gray).enhance(3.0)
    bw = contrast.point(lambda x: 255 if x > 80 else 0 if x < 30 else x)
    p = output_dir / '02_bw_silhouette.png'
    bw.save(p)
    paths['bw_silhouette'] = p

    # 3. Warm/Cool depth polarity
    arr = np.array(img.convert('RGB'), dtype=np.float32)
    R, G, B = arr[:,:,0], arr[:,:,1], arr[:,:,2]
    warm = np.clip(R - (B + G) * 0.4, 0, 255)
    cool = np.clip(B - R * 0.5 - G * 0.3, 0, 255)

    depth = np.zeros_like(arr)
    depth[:,:,0] = warm   # red channel = warm = front
    depth[:,:,2] = cool   # blue channel = cool = back
    depth[:,:,1] = (warm + cool) * 0.15
    p = output_dir / '03_depth_polarity.png'
    Image.fromarray(np.clip(depth, 0, 255).astype(np.uint8)).save(p)
    paths['depth_polarity'] = p

    return paths


def sample_dominant_colors(img: Image.Image, n: int = 10) -> Dict[str, Any]:
    """Top N dominant colors via quantization."""
    small = img.resize((100, 100))
    pixels = np.array(small.convert('RGB')).reshape(-1, 3)
    quantized = (pixels // 16) * 16
    tuples = [tuple(p) for p in quantized]
    counter = Counter(tuples)
    total = len(tuples)
    dominant = []
    for color, count in counter.most_common(n):
        dominant.append({
            'hex': f"#{color[0]:02X}{color[1]:02X}{color[2]:02X}",
            'rgb': list(color),
            'pct': round(count / total * 100, 2)
        })
    return {'top_n': dominant}


def detect_key_light_direction(img: Image.Image, core_center: tuple, core_radius: int) -> Dict[str, Any]:
    """Find brightest spot within core → key light direction."""
    gray = np.array(img.convert('L'))
    H, W = gray.shape
    cx, cy = core_center

    Y, X = np.ogrid[:H, :W]
    mask = ((X - cx)**2 + (Y - cy)**2) < core_radius**2
    masked = gray.copy()
    masked[~mask] = 0

    hy, hx = np.unravel_index(np.argmax(masked), masked.shape)
    dx, dy = hx - cx, hy - cy
    angle_deg = np.degrees(np.arctan2(-dy, dx))  # flip y
    clock = (90 - angle_deg) / 30 % 12

    return {
        'hot_spot_position': {'x': int(hx), 'y': int(hy)},
        'offset_from_core_center': {'dx': int(dx), 'dy': int(dy)},
        'angle_deg': round(float(angle_deg), 1),
        'clock_position': f"~{clock:.1f} o'clock"
    }


# ═══════════════════════════════════════════════════════════════════════════
# STAGE 2-5 — SILHOUETTE / CAMERA / MATERIAL / LIGHTING
# ═══════════════════════════════════════════════════════════════════════════
# These stages require human judgment + domain knowledge.
# Template functions provided — fill according to measurements.

def lock_silhouette(measurements: Dict) -> Dict[str, Any]:
    """Stage 2: component identification. Template."""
    return {
        'components_identified': [],
        'z_order_depth': [],
        'notes': 'Fill manually from analysis images per Điều 2'
    }


def match_camera(measurements: Dict) -> Dict[str, Any]:
    """Stage 3: camera estimation. Template."""
    return {
        'lens_mm': 50,
        'angle': 'eye_level',
        'shot_type': 'medium',
        'rotation_deg': 0,
        'depth_of_field': {'enabled': False, 'blur_strength': 'none'}
    }


def assign_materials(components: list) -> Dict[str, Any]:
    """Stage 4: PBR assignment per component. Template."""
    return {'components': {}, 'notes': 'Fill PBR tuple per component'}


def read_lighting(img: Image.Image, core_hint: dict) -> Dict[str, Any]:
    """Stage 5: lighting setup. Template."""
    return {
        'setup_type': 'self_illuminated_emissive_with_studio_fill',
        'key_light': {
            'direction': 'front_upper_left',
            'intensity': 1.0,
            'temperature_k': 5500
        },
        'ambient_level': 0.02
    }


# ═══════════════════════════════════════════════════════════════════════════
# PIPELINE ORCHESTRATION
# ═══════════════════════════════════════════════════════════════════════════

def run_pipeline(reference_path: str, output_dir: str, spec_id: str = None) -> Dict[str, Any]:
    """
    Execute 5-stage pipeline tuân thủ SPEC-NaUion-Visual-Rebuild-Pipeline v1.0.
    """
    ref_path = Path(reference_path)
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    spec_id = spec_id or ref_path.stem + '_rebuild_001'
    analysis_dir = out_dir / f'{spec_id}-v1-measurements'

    img = Image.open(ref_path)

    # Stage 1: MEASUREMENT
    print(f"→ Stage 1: MEASUREMENT")
    canvas = measure_canvas(img)
    subject = find_subject_center(img)
    colors = sample_dominant_colors(img)
    analysis_paths = invert_duality_analysis(img, analysis_dir)
    print(f"  ✓ Canvas: {canvas['resolution_measured']}, aspect {canvas['aspect_ratio']}")
    print(f"  ✓ Subject center: ({subject['x']}, {subject['y']})")
    print(f"  ✓ Analysis images → {analysis_dir}/")

    # Stage 2-5: per-project template (manual refinement)
    print(f"→ Stage 2: SILHOUETTE LOCK (template)")
    silhouette = lock_silhouette({'canvas': canvas, 'subject': subject})

    print(f"→ Stage 3: CAMERA MATCH (template)")
    camera = match_camera({'canvas': canvas})

    print(f"→ Stage 4: MATERIAL PBR (template)")
    materials = assign_materials(silhouette['components_identified'])

    print(f"→ Stage 5: LIGHTING (template)")
    lighting = read_lighting(img, {})

    # Compose canonical spec JSON
    spec = {
        'spec_id': spec_id,
        'version': 'v1.0',
        'source_reference': str(ref_path.absolute()),
        'measurement_timestamp': datetime.now(timezone.utc).isoformat(),
        'canvas': {
            'aspect_ratio': canvas['aspect_ratio'],
            'aspect_ratio_decimal': canvas['aspect_ratio_decimal'],
            'resolution_measured': canvas['resolution_measured'],
            'background': canvas['background']
        },
        'camera': camera,
        'composition': {
            'subject_center_measured': {'x': subject['x'], 'y': subject['y']},
            'offset_from_canvas_center': subject.get('offset_from_center', {})
        },
        'main_object': {
            'name': 'TBD_fill_from_stage_2',
            'components': materials.get('components', {})
        },
        'material_system': materials.get('components', {}),
        'lighting': lighting,
        'color_palette': {
            'dominant': [c['hex'] for c in colors['top_n'][:3]],
            'notes': 'auto-sampled top 3'
        },
        'post_processing': {
            'contrast': 0.1,
            'bloom_glow': 0.5,
            'white_balance_k': 4800
        },
        'style_control': {
            'realism_priority': 0.8,
            'stylization': 0.2,
            'cleanliness': 0.9
        },
        'rebuild_notes': [
            'Generated by pipeline v1.0 — refine Stage 2-5 sections manually',
            f'Analysis images at {analysis_dir}',
            'Verify Điều 3: inverted, bw, depth_polarity all generated'
        ],
        'prompt_render': 'TBD — fill after Stage 4 materials defined',
        'negative_prompt': 'wrong proportion, gradient fill letters, plastic look, cartoon style'
    }

    # Save
    spec_path = out_dir / f'{spec_id}-v1.json'
    with open(spec_path, 'w') as f:
        json.dump(spec, f, indent=2, ensure_ascii=False)
    print(f"\n✓ Spec JSON → {spec_path}")
    print(f"✓ Top colors: {[c['hex'] for c in colors['top_n'][:5]]}")
    print(f"\n⚠ Stage 2-5 là TEMPLATE — refine manually theo measurement kết quả")

    return spec


# ═══════════════════════════════════════════════════════════════════════════
# CLI ENTRY POINT
# ═══════════════════════════════════════════════════════════════════════════

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    reference = sys.argv[1]
    out_dir = sys.argv[2]
    spec_id = sys.argv[3] if len(sys.argv) > 3 else None
    spec = run_pipeline(reference, out_dir, spec_id)
