const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const getConversations = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/conversations`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch conversations.');
  }

  return result.data || [];
};

export const getOrCreateConversation = async (targetId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ targetId }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to get or create conversation.');
  }

  return result.data;
};

export const getConversationMessages = async (conversationId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch messages.');
  }

  return result.data || [];
};

export const sendMessage = async (conversationId, content) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ conversationId, content }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to send message.');
  }

  return result.data;
};

export const removeMessage = async (messageId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to remove message.');
  }

  return result.data;
};

