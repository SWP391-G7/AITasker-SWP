const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Searches and filters experts, clients, services, and jobs.
 * @param {Object} searchParams - The search target and criteria filters
 */
export const search = async (searchParams) => {
  try {
    // 1. Build query string dynamically, omitting empty or null filters
    const queryParts = [];
    
    Object.keys(searchParams).forEach((key) => {
      const val = searchParams[key];
      if (val !== undefined && val !== null && val !== '') {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
      }
    });

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

    // 2. Perform public request
    const response = await fetch(`${API_BASE_URL}/search${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Search failed');
    }

    return {
      results: result.results || [],
      count: result.count || 0,
      target: result.target
    };
  } catch (error) {
    console.error('Search API Error:', error);
    throw error;
  }
};
