Đây là **khung code thông số kỹ thuật ảnh** - LAMF NỀN TẢNG PHÁT TRIỂN 1 CELLO - CHUYÊN RENDER NA-ICON

```json
{
  "scene_id": "image_rebuild_001",
  "render_goal": "rebuild_original_image_as_close_as_possible",
  "canvas": {
    "aspect_ratio": "auto_from_reference",
    "resolution_target": "high",
    "background": {
      "type": "solid_or_scene_based",
      "color": "sample_from_reference"
    }
  },
  "camera": {
    "shot_type": "close_up | medium | wide",
    "angle": "eye_level | low_angle | high_angle",
    "rotation_deg": 0,
    "lens_mm": 50,
    "fov_estimate": "auto",
    "focus_subject": "main_object",
    "depth_of_field": {
      "enabled": true,
      "blur_strength": "low | medium | high"
    }
  },
  "composition": {
    "subject_position": "center | left | right",
    "cropping": "full | half | detail",
    "symmetry": "none | soft | strong",
    "negative_space_ratio": 0.2
  },
  "main_object": {
    "name": "object_name",
    "dimensions_estimate": {
      "height_mm": 0,
      "width_mm": 0,
      "depth_mm": 0
    },
    "proportions": {
      "body_ratio": "1:1",
      "top_to_bottom": "auto"
    },
    "geometry": {
      "primary_shapes": [],
      "edge_profile": "sharp | soft | beveled | rounded",
      "thickness_mm": 0
    }
  },
  "material_system": {
    "primary_material": {
      "type": "metal | glass | ceramic | wood | fabric | stone",
      "base_color": "#FFFFFF",
      "metalness": 0.0,
      "roughness": 0.5,
      "specular": 0.5,
      "transmission": 0.0,
      "ior": 1.45,
      "subsurface": 0.0,
      "anisotropy": 0.0
    },
    "secondary_materials": []
  },
  "surface_detail": {
    "finish": "matte | satin | semi_gloss | gloss | mirror",
    "texture_scale": "fine | medium | coarse",
    "imperfections": {
      "dust": 0.0,
      "micro_scratches": 0.0,
      "fingerprints": 0.0
    }
  },
  "color_palette": {
    "dominant": ["#000000"],
    "secondary": ["#FFFFFF"],
    "accent": ["#C9A227"]
  },
  "lighting": {
    "setup_type": "studio | natural | mixed | interior",
    "key_light": {
      "direction": "front_left",
      "intensity": 1.0,
      "size": "large",
      "temperature_k": 4500
    },
    "fill_light": {
      "direction": "front_right",
      "intensity": 0.4,
      "size": "medium",
      "temperature_k": 5000
    },
    "rim_light": {
      "enabled": false,
      "direction": "back",
      "intensity": 0.3,
      "temperature_k": 6000
    },
    "ambient_level": 0.2,
    "shadow_softness": "soft"
  },
  "environment": {
    "type": "studio | room | architectural | outdoor",
    "floor_reflection": 0.0,
    "background_blur": 0.0
  },
  "render_engine_hint": {
    "engine": "cycles | corona | vray | redshift | unreal",
    "samples": 512,
    "global_illumination": true,
    "ray_depth": 8,
    "denoise": true
  },
  "post_processing": {
    "exposure": 0.0,
    "contrast": 0.1,
    "highlights": -0.1,
    "shadows": 0.1,
    "clarity": 0.05,
    "sharpen": 0.1,
    "vignette": 0.0,
    "white_balance_k": 4800
  },
  "style_control": {
    "realism_priority": 1.0,
    "stylization": 0.0,
    "cleanliness": 0.9
  },
  "rebuild_notes": [
    "measure visual ratio from reference image",
    "sample exact colors from highlight, midtone, shadow",
    "match camera angle before matching material",
    "lock silhouette first, then refine micro material"
  ],
  "prompt_render": "Ultra realistic render of [object], matched to reference image, exact silhouette, precise material response, accurate lighting direction, physically correct reflections, high detail surface, true-to-reference composition.",
  "negative_prompt": "wrong proportion, extra parts, distorted geometry, plastic look, overexposed highlights, blurred edges, low detail, cartoon, exaggerated reflections, incorrect camera angle"
}
```
 CELLO PHẢI HỘI ĐỦ tool “AI prompt” + engine vật lý + pipeline TUYỆT ĐỐI
## Bước chuẩn (quan trọng hơn tool):

1. **Match camera trước**

   * góc
   * FOV (~35–85mm)

2. **Dựng silhouette 3D**

   * đúng hình trước
   * chưa cần đẹp

3. **Material PBR**

   * metalness
   * roughness
   * IOR

4. **Lighting**

   * copy hướng sáng từ ảnh
   * check highlight + shadow

5. **Render test → chỉnh dần**
  → dùng **Corona / V-Ray / Blender Cycles**
