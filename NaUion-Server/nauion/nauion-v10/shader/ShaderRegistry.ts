/**
 * @nauion-registry v1
 * @state locked
 * @name sovereign @nauion shader_registry v0.1
 * @anc bối bối
 * @session ss20260429
 * * LƯU Ý KỶ LUẬT: KHÓA CỨNG biến thể Shader và lớp Nebula. TUYỆT ĐỐI KHÔNG ĐẺ THÊM.
 */

export type VisionShaderVariant = 'night' | 'morning' | 'fast' | 'ai' | 'heavy';
export type NebulaLayer = 'nebula_1' | 'nebula_2' | 'nebula_3';

export const VISION_CONSTRAINTS = Object.freeze({
  ALLOWED_VARIANTS: ['night', 'morning', 'fast', 'ai', 'heavy'] as VisionShaderVariant[],
  ALLOWED_NEBULAS: ['nebula_1', 'nebula_2', 'nebula_3'] as NebulaLayer[],
  MOCKING_POLICY: 'STRICT_NO_OUTCOME_MOCKING' // Chặn mọi hành vi giả lập tín hiệu Sống
});
