const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Publish a new service listing
 */
export const publishService = async (serviceData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/services`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(serviceData)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to publish service');
  }

  return result;
};

/**
 * Get all services from the database
 */
export const getMarketplaceServices = async () => {
  const response = await fetch(`${API_BASE_URL}/services`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch services');
  }

  return result.data;
};
