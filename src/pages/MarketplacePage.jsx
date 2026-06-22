import { Navigate } from 'react-router-dom'

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
}

export default function MarketplacePage() {
  const user = getStoredUser()

  if (user?.role === 'client') {
    return <Navigate to="/clients-experts" replace />
  }

  if (user?.role === 'expert') {
    return <Navigate to="/expert/work" replace />
  }

  return <Navigate to="/onboarding" replace />
}
