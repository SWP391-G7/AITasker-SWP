const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('No authentication token found')
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
}

const parseResponse = async (response, fallbackMessage) => {
  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || fallbackMessage)
  }

  return result
}

export const getConversations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'GET',
      headers: getAuthHeaders()
    })

    return await parseResponse(response, 'Failed to fetch conversations')
  } catch (error) {
    console.error('Get conversations error:', error)
    throw error
  }
}

export const getConversationMessages = async (conversationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
      method: 'GET',
      headers: getAuthHeaders()
    })

    return await parseResponse(response, 'Failed to fetch conversation messages')
  } catch (error) {
    console.error('Get conversation messages error:', error)
    throw error
  }
}

export const createConversation = async (targetId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ targetId })
    })

    return await parseResponse(response, 'Failed to create conversation')
  } catch (error) {
    console.error('Create conversation error:', error)
    throw error
  }
}

export const sendMessage = async ({ conversationId, content, attachments = null }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        conversationId,
        content,
        attachments
      })
    })

    return await parseResponse(response, 'Failed to send message')
  } catch (error) {
    console.error('Send message error:', error)
    throw error
  }
}
