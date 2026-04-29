// WGSL Compute Shader: Vật lý Hạt lượng tử (Tầng L3 Living Memory)
// Tuân thủ ui-kernel-contract.sira - Không tự sinh hiệu ứng nếu pressure_value = 0.0

struct Uniforms {
    pressure_type: u32,  // 0: IDLE, 1: FALL, 2: DISSIPATE, 3: OSCILLATE
    pressure_value: f32, // 0.0 -> 1.0 (Nhận trực tiếp từ chị Kim)
    time: f32,
    deltaTime: f32,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
// Bỏ qua định nghĩa struct Particle và buffer để tinh gọn minh họa kiến trúc.

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) GlobalInvocationID: vec3<u32>) {
    let index = GlobalInvocationID.x;
    // ... lấy data hạt ...

    // Trạng thái tĩnh (Không có tín hiệu sống)
    if (uniforms.pressure_value == 0.0) {
        // Hạt chỉ dao động vi phân tại chỗ (Orbit stillness)
        return; 
    }

    let forceMultiplier = uniforms.pressure_value;

    // RULE: Ánh xạ 3 Outcome Sống
    if (uniforms.pressure_type == 1u) {
        // FALL: Tế bào suy giảm -> Lực hút cực đại về tâm (Gravity Collapse)
        // velocity += normalize(-position) * forceMultiplier;
    } 
    else if (uniforms.pressure_type == 2u) {
        // DISSIPATE: Phân tán năng lượng -> Lực đẩy văng ra ngoài, giảm alpha
        // velocity += normalize(position) * forceMultiplier;
        // alpha -= deltaTime * forceMultiplier;
    } 
    else if (uniforms.pressure_type == 3u) {
        // OSCILLATE: Cộng hưởng -> Tần số Cymatics cuộn vòng
        // velocity += vec3(cos(time), sin(time), 0.0) * forceMultiplier;
    }

    // ... cập nhật vị trí hạt ...
}
