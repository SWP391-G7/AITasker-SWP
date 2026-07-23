const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Sends partial form text to backend to be generated/extended using Gemini AI
 * @param {string} text - Casual draft text
 * @param {string} type - Use case identifier (e.g. 'job_description', 'service_description', 'proposal', 'request', 'bio')
 * @returns {Promise<Object>} - Parsed JSON object containing fields (e.g. title, description, skills)
 */
export const generateFormWithAI = async (text, type, context = '') => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ text, type, context }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'AI Core busy');
    }

    return result.data;
  } catch (error) {
    console.error('AI generation service error:', error);
    throw error;
  }
};
