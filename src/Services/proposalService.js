const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const createProposal = async ({ jobId, coverLetter, bidAmount, deliveryDays }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/proposals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      job_id: jobId,
      cover_letter: coverLetter,
      bid_amount: bidAmount,
      delivery_days: deliveryDays,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    const fieldErrors = result.errors
      ? Object.entries(result.errors).map(([field, message]) => `${field}: ${message}`).join('\n')
      : '';

    throw new Error(fieldErrors || result.message || 'Failed to submit proposal.');
  }

  return result.proposal || result.data || result;
};