import { Routes, Route, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import LoginPage from "../pages/LoginPage"
import RegisterPage from "../pages/RegisterPage"
import LandingPages from "../Components/LandingPages/LandingPages"
import HeaderCom from "../Components/Navbar/HeaderCom"
import EmailVerificationPage from "../pages/EmailVerificationPage"
import Dashboard from "../pages/Dashboard"
import { isLoggedIn } from "../Services/checkLogin"
import OnboardingPage from "../pages/OnboardingPage";
import ClientDashboard from "../pages/ClientDashboard"
import ProfilePage from "../pages/ProfilePage"

// Protected route wrapper - redirects logged-in users away from auth pages
function AuthRoute({ children }) {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(null)

  useEffect(() => {
    setIsUserLoggedIn(isLoggedIn())
  }, [])

  if (isUserLoggedIn === null) return null // Loading

  if (isUserLoggedIn) {
    return <Navigate to="/" replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<> <HeaderCom /> <LandingPages /></>} />
      <Route 
        path="/login" 
        element={
          <AuthRoute>
            <LoginPage />
          </AuthRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <AuthRoute>
            <RegisterPage />
          </AuthRoute>
        } 
      />
      <Route 
        path="/verify-email" 
        element={
          <AuthRoute>
            <EmailVerificationPage />
          </AuthRoute>
        } 
      />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/client/dashboard" element={<ClientDashboard />} />
      <Route path="/profile/:userId" element={<ProfilePage />} />
      
      
    </Routes>
  )
}

export default AppRoutes