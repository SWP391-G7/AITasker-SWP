const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Publish a new service listing to the backend API
 */
export const publishService = async (serviceData) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/services`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: serviceData.title,
      description: serviceData.description || '',
      price: serviceData.price || 0,
      pricing_type: 'fixed',
      delivery_days: serviceData.deliveryDays ? parseInt(serviceData.deliveryDays, 10) : 3,
      tags: serviceData.category || ''
    })
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to publish service');
  }

  return result;
};

/**
 * Get all services from the backend API (via public search endpoint)
 */
export const getMarketplaceServices = async () => {
  const response = await fetch(`${API_BASE_URL}/search?target=services`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch services');
  }

  return result.results || [];
};


