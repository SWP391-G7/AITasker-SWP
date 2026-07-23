/**
 * Frontend module: Services/aiService.js
 *
 * Vai trò: Service ai Service: lớp giao tiếp giữa UI và backend API.
 * Luồng chính: Nhận dữ liệu từ component, gắn token/header, gọi endpoint, chuẩn hóa response và ném Error khi request thất bại.
 * Lưu ý bảo trì: Component không nên lặp lại URL hoặc logic HTTP đã được đóng gói tại đây.
 */
// Ưu tiên API URL theo môi trường deploy; fallback phục vụ chạy local.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Gửi bản nháp form tới backend để Gemini tối ưu.
 *
 * @param {string} text Nội dung các field đã được AIExtendButton ghép lại.
 * @param {string} type Khóa chọn prompt/schema, ví dụ profile_expert/profile_client.
 * @param {string} context Ngữ cảnh tùy chọn của job/service đích.
 * @returns {Promise<Object>} Object đã được backend parse, sẵn sàng merge vào form.
 */
export const generateFormWithAI = async (text, type, context = '') => {
  try {
    // Endpoint AI là private nên request phải mang access token hiện tại.
    const token = localStorage.getItem('token');
    
    // Dừng sớm thay vì gửi một request chắc chắn bị middleware protect từ chối.
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Chỉ backend biết API key Gemini; frontend không gọi Gemini trực tiếp.
    const response = await fetch(`${API_BASE_URL}/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ text, type, context }),
    });

    // Backend luôn trả JSON cho cả trường hợp thành công và thất bại.
    const result = await response.json();

    // Chuẩn hóa lỗi HTTP thành Error để component xử lý bằng catch/toast.
    if (!response.ok) {
      throw new Error(result.message || 'AI Core busy');
    }

    // Bỏ lớp envelope `{ success, data }`, chỉ trả dữ liệu field cho UI.
    return result.data;
  } catch (error) {
    // Giữ log kỹ thuật trong console và ném tiếp để AIExtendButton xử lý giao diện.
    console.error('AI generation service error:', error);
    throw error;
  }
};
