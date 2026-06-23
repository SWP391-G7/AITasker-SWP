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
      price: parseFloat(serviceData.price) || 0,
      pricing_type: 'fixed',
      delivery_days: serviceData.deliveryDays ? parseInt(serviceData.deliveryDays, 10) : 3,
      tags: serviceData.category || ''
    })
  });

  const result = await response.json();

  if (!response.ok) {
    const fieldErrors = result.errors
      ? Object.entries(result.errors).map(([field, msg]) => `- ${field}: ${msg}`).join('\n')
      : '';
    const message = fieldErrors
      ? `${result.message}\n${fieldErrors}`
      : (result.message || 'Failed to publish service');
    throw new Error(message);
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
 * Get all client job/task posts for experts from the public search endpoint.
 */
export const getMarketplaceJobs = async () => {
  const response = await fetch(`${API_BASE_URL}/search?target=jobs`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch client tasks');
  }

  return result.results || [];
};


/**
 * Get one client task/job post for marketplace task detail.
 */
export const getMarketplaceJobById = async (id) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
    method: 'GET',
    headers
  });

  const result = await response.json();

  if (!response.ok) {
    const jobs = await getMarketplaceJobs();
    const fallbackJob = jobs.find((job) => String(job.id) === String(id));

    if (fallbackJob) {
      return fallbackJob;
    }

    throw new Error(result.message || 'Failed to fetch client task detail');
  }

  return result.job || result.data || result.jobPost || result;
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

/**
 * Get all services created by the current expert
 */
export const getMyServices = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/services/my`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch your services');
  }

  return result.services || result.data || [];
};

/**
 * Update an existing service listing
 */
export const updateService = async (id, data) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/services/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to update service');
  }

  return result;
};

/**
 * Delete a service listing
 */
export const deleteService = async (id) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/services/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to delete service');
  }

  return result;
};

