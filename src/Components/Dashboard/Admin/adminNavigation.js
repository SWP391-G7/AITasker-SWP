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

  if (tabId === 'disputes') {
    navigate('/admin-disputes')
    return
  }

  if (tabId === 'analytics') {
    navigate('/admin-analytics')
    return
  }

  if (setActiveTab) {
    setActiveTab(tabId)
  }
}
