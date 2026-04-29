// WGSL Fragment Shader: Vỏ Thủy tinh lỏng (Lớp L5 Immune Camouflage)
// Ánh xạ polarity 'cool-rim' (Fresnel) và 'warm-core' (Emission)

struct Uniforms {
    pressure_value: f32,
    is_preview_mode: u32, // 1 nếu thiếu sirasign_ref
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@fragment
fn main(@location(0) vUv: vec2<f32>, @location(1) vNormal: vec3<f32>, @location(2) vViewDir: vec3<f32>) -> @location(0) vec4<f32> {
    
    // 1. Khúc xạ Thủy tinh lỏng (Liquid Glass Base)
    // base_color = textureSample(screenTexture, ... distorted uv ...);

    // 2. Viền sáng Fresnel (cool-rim) -> Kỷ luật Boundary
    let dotNV = max(dot(normalize(vNormal), normalize(vViewDir)), 0.0);
    let fresnel = pow(1.0 - dotNV, 3.0);
    let rim_color = vec3<f32>(0.6, 0.8, 1.0) * fresnel * uniforms.pressure_value;

    // 3. Lõi phát sáng (warm-core Bloom)
    let core_bloom = vec3<f32>(0.96, 0.76, 0.07) * (1.0 - fresnel) * uniforms.pressure_value; // #F7C313

    let final_color = rim_color + core_bloom; // + base_color khúc xạ

    // Nếu Preview Mode (Thiếu SiraSign), hiển thị mờ đi (Opacity = 0.5)
    let alpha = select(1.0, 0.5, uniforms.is_preview_mode == 1u);

    return vec4<f32>(final_color, alpha);
}
