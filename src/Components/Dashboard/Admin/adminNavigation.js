export const handleAdminTabChange = (tabId, navigate, setActiveTab) => {
  if (tabId === 'dashboard') {
    navigate('/admin-dashboard')
    return
  }

  if (tabId === 'users') {
    navigate('/admin-users')
    return
  }

  if (tabId === 'moderation') {
    navigate('/admin-moderation')
    return
  }

  if (setActiveTab) {
    setActiveTab(tabId)
  }
}
