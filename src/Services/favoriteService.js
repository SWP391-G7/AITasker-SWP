const STORAGE_KEY = 'favorites';

const getFavoritesMap = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

const saveFavoritesMap = (map) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
};

export const getFavorites = (targetType) => {
  const map = getFavoritesMap();
  return map[targetType] || [];
};

export const addFavorite = (targetType, targetId) => {
  const map = getFavoritesMap();
  if (!map[targetType]) map[targetType] = [];
  if (!map[targetType].includes(targetId)) {
    map[targetType].push(targetId);
    saveFavoritesMap(map);
  }
};

export const removeFavorite = (targetType, targetId) => {
  const map = getFavoritesMap();
  if (map[targetType]) {
    map[targetType] = map[targetType].filter((id) => id !== targetId);
    saveFavoritesMap(map);
  }
};
