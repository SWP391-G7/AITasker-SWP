/**
 * Frontend module: Services/favoriteService.js
 *
 * Vai trò: Service favorite Service: lớp giao tiếp giữa UI và backend API.
 * Luồng chính: Nhận dữ liệu từ component, gắn token/header, gọi endpoint, chuẩn hóa response và ném Error khi request thất bại.
 * Lưu ý bảo trì: Component không nên lặp lại URL hoặc logic HTTP đã được đóng gói tại đây.
 */
const STORAGE_KEY = 'favorites';

// Đọc hoặc suy ra dữ liệu cho nghiệp vụ “get favorites map”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
const getFavoritesMap = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

// Thực hiện phần logic “save favorites map” trong phạm vi trách nhiệm của module hiện tại.
const saveFavoritesMap = (map) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
};

// Đọc hoặc suy ra dữ liệu cho nghiệp vụ “get favorites”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
export const getFavorites = (targetType) => {
  const map = getFavoritesMap();
  return map[targetType] || [];
};

// Tạo hoặc gửi dữ liệu cho nghiệp vụ “add favorite”, đồng thời chuyển lỗi về caller/UI theo cơ chế của module.
export const addFavorite = (targetType, targetId) => {
  const map = getFavoritesMap();
  if (!map[targetType]) map[targetType] = [];
  if (!map[targetType].includes(targetId)) {
    map[targetType].push(targetId);
    saveFavoritesMap(map);
  }
};

// Thay đổi trạng thái hoặc dữ liệu cho nghiệp vụ “remove favorite”; cần giữ validation và quyền truy cập trước khi cập nhật.
export const removeFavorite = (targetType, targetId) => {
  const map = getFavoritesMap();
  if (map[targetType]) {
    map[targetType] = map[targetType].filter((id) => id !== targetId);
    saveFavoritesMap(map);
  }
};
