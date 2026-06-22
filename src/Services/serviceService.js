const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Publish a new service listing (Mocked via localStorage as backend is locked)
 */
export const publishService = async (serviceData) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  let expertName = 'AI Expert';
  try {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      expertName = user.fullName || user.full_name || 'AI Expert';
    }
  } catch (e) {
    console.error('Error fetching expert name for custom service:', e);
  }

  const newService = {
    id: `local-${Date.now()}`,
    expert_name: expertName,
    avg_rating: 5.0,
    title: serviceData.title,
    price: serviceData.price || 0,
    pricing_type: 'fixed',
    delivery_days: serviceData.deliveryDays || 3,
    tags: serviceData.category || 'NLP',
    description: serviceData.description || '',
    tiers: serviceData.tiers || null,
    faqs: serviceData.faqs || [],
    images: serviceData.images || [],
    videoLink: serviceData.videoLink || ""
  };

  const existing = JSON.parse(localStorage.getItem('custom_services') || '[]');
  existing.push(newService);
  localStorage.setItem('custom_services', JSON.stringify(existing));

  return {
    success: true,
    data: newService
  };
};

/**
 * Get all services from the database (Mocked via localStorage as backend is locked)
 */
export const getMarketplaceServices = async () => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const custom = JSON.parse(localStorage.getItem('custom_services') || '[]');
  return custom;
};

