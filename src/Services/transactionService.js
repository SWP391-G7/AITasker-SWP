const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
};

export const getMyTransactionsAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to retrieve transactions.');
    }
    return result; // contains { success, transactions, stats: { totalLifetime, availableNow, pendingClearance, inEscrow } }
  } catch (error) {
    console.error('Get my transactions error:', error);
    throw error;
  }
};
