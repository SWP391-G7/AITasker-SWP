const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const getMyInvitations = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/invitations/my`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch requests.');
  }

  return result.invitations || [];
};

export const createInvitation = async ({ serviceId, coverLetter, bidAmount, deliveryDays }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/invitations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      service_id: serviceId,
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
    throw new Error(fieldErrors || result.message || 'Failed to send request.');
  }

  return result.invitation;
};

export const getInvitationById = async (invitationId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/invitations/${invitationId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch request details.');
  }

  return result.invitation;
};

export const updateInvitationStatus = async ({ invitationId, status, start_project }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/invitations/${invitationId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status, start_project }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || `Failed to ${status} request.`);
  }

  return result;
};

export const counterInvitation = async ({ invitationId, bidAmount, deliveryDays, coverLetter }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/invitations/${invitationId}/counter`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      bid_amount: bidAmount,
      delivery_days: deliveryDays,
      cover_letter: coverLetter,
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to submit counter offer.');
  }

  return result.invitation;
};

export const startProjectFromInvitation = async (invitationId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/invitations/${invitationId}/start-project`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to start project.');
  }

  return result.project;
};

export const initiateInvitationPayment = async (invitationId, paymentSource = 'card') => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found. Please log in first.');
  const response = await fetch(`${API_BASE_URL}/payment/pay-invitation/${invitationId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ payment_source: paymentSource }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to initiate service payment.');
  return result;
};
