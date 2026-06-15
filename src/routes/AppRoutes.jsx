import { Routes, Route, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import LoginPage from "../pages/LoginPage"
import RegisterPage from "../pages/RegisterPage"
import LandingPages from "../Components/LandingPages/LandingPages"
import HeaderCom from "../Components/Navbar/HeaderCom"
import EmailVerificationPage from "../pages/EmailVerificationPage"
import Dashboard from "../pages/Dashboard"
import { isLoggedIn, getStoredUser } from "../Services/checkLogin"
import OnboardingPage from "../pages/OnboardingPage";
import ClientDashboard from "../pages/ClientDashboard"
import ExpertDashboard from "../pages/ExpertDashboard"
import JobPostPage from "../pages/JobPostPage"
import ServicePostPage from "../pages/ServicePostPage"
import MyJobsPage from "../pages/MyJobsPage"
import ProfilePage from "../pages/ProfilePage"
import SearchResultsPage from "../pages/SearchResultsPage"

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

// Protected route wrapper - redirects guests to the login page
function ProtectedRoute({ children }) {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(null)

  useEffect(() => {
    setIsUserLoggedIn(isLoggedIn())
  }, [])

  if (isUserLoggedIn === null) return null // Loading

  if (!isUserLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return children
}

function DashboardRedirect() {
  const user = getStoredUser()
  const role = user?.role || "client"
  return <Navigate to={`/${role}/dashboard`} replace />
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
      <Route 
        path="/onboarding" 
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/client/dashboard" 
        element={
          <ProtectedRoute>
            <ClientDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/expert/dashboard" 
        element={
          <ProtectedRoute>
            <ExpertDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/post-service" 
        element={
          <ProtectedRoute>
            <ServicePostPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile/:userId" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/post-job" 
        element={
          <ProtectedRoute>
            <JobPostPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/my-jobs" 
        element={
          <ProtectedRoute>
            <MyJobsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/search-results" 
        element={
          <SearchResultsPage />
        } 
      />
    </Routes>
  )
}

export default AppRoutes