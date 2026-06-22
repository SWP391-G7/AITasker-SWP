import { allServices } from '../Components/AISolutionMarketPlace/servicesData';

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

/**
 * Get a single service listing by ID (with fallback to mock data)
 */
export const getServiceById = async (id) => {
  // Fallback for mock data (id format: 'mock-X')
  if (typeof id === 'string' && id.startsWith('mock-')) {
    const idx = parseInt(id.replace('mock-', ''), 10);
    if (!isNaN(idx) && allServices[idx]) {
      const mockService = allServices[idx];
      // Format mock service to align with DB response structure
      return {
        id: id,
        title: mockService.title,
        description: `This is a high-quality AI service listing in the ${mockService.tag} category. Delivered by expert ${mockService.expert} with a perfect track record. We offer top-tier implementation, custom integration, and continuous support.`,
        price: parseFloat(mockService.price.replace('$', '').replace(',', '')),
        pricing_type: 'fixed',
        delivery_days: 3,
        tags: mockService.tag,
        expert_name: mockService.expert,
        avg_rating: mockService.rating,
        image_url: mockService.image
      };
    }
    throw new Error('Mock service not found');
  }

  // Real DB call
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/services/${id}`, {
    method: 'GET',
    headers
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch service detail');
  }

  return result.data || result.service;
};


