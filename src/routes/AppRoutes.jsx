import { useEffect, useState } from "react"
import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import LoginPage from "../pages/LoginPage"
import RegisterPage from "../pages/RegisterPage"
import LandingPages from "../Components/LandingPages/LandingPages"
import HeaderCom from "../Components/Navbar/HeaderCom"
import EmailVerificationPage from "../pages/EmailVerificationPage"
import { checkLogin } from "../Services/checkLogin"
import OnboardingPage from "../pages/OnboardingPage"
import ClientDashboardPage from "../pages/DashboardPage/Client/ClientDashboardPage"
import ClientProjectsPage from "../pages/DashboardPage/Client/ClientProjectsPage"
import PostJobPage from "../pages/DashboardPage/Client/PostJobPage"
import ClientMessagesPage from "../pages/DashboardPage/Client/ClientMessagesPage"
import ClientBillingPage from "../pages/DashboardPage/Client/ClientBillingPage"
import ClientSettingsPage from "../pages/DashboardPage/Client/ClientSettingsPage"
import AdminDashboardPage from "../pages/DashboardPage/Admin/AdminDashboardPage"
import UserManagementPage from "../pages/DashboardPage/Admin/UserManagementPage"
import ContentModerationPage from "../pages/DashboardPage/Admin/ContentModerationPage"
import DisputeResolutionPage from "../pages/DashboardPage/Admin/DisputeResolutionPage"
import AnalyticsPage from "../pages/DashboardPage/Admin/AnalyticsPage"
import ExpertDashboardPage from "../pages/DashboardPage/Expert/ExpertDashboardPage"
import MyProjectsPage from "../pages/DashboardPage/Expert/MyProjectsPage"
import FindWorkPage from "../pages/DashboardPage/Expert/FindWorkPage"
import EarningsPage from "../pages/DashboardPage/Expert/EarningsPage"
import ExpertMessagesPage from "../pages/DashboardPage/Expert/MessagesPage"
import ExpertSettingsPage from "../pages/DashboardPage/Expert/SettingsPage"

/**
 * Fetches current auth status from the backend.
 * Returns { isLoggedIn: bool | null, isVerified: bool | null }
 * null means the check is still in-flight (loading state).
 */
function useAuthStatus() {
  const [status, setStatus] = useState({ isLoggedIn: null, isVerified: null })

  useEffect(() => {
    let mounted = true

    checkLogin()
      .then((result) => {
        if (mounted) {
          const loggedIn = result?.isLoggedIn ?? false
          // getMe response shape: { success, user: { isVerified, ... } }
          const verified = loggedIn ? (result?.user?.user?.isVerified ?? false) : false
          setStatus({ isLoggedIn: loggedIn, isVerified: verified })
        }
      })
      .catch(() => {
        if (mounted) {
          setStatus({ isLoggedIn: false, isVerified: false })
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  return status
}

/**
 * GuestOnly – for /login and /register.
 * - Loading  → render nothing
 * - Logged in AND verified → redirect to home (already fully authenticated)
 * - Logged in but NOT verified → let through so the user can still access
 *   these pages (though ProtectedRoute on dashboards will push them to /verify)
 * - Not logged in → let through
 */
function GuestOnly({ children }) {
  const { isLoggedIn, isVerified } = useAuthStatus()

  if (isLoggedIn === null) return null

  if (isLoggedIn && isVerified) {
    return <Navigate to="/" replace />
  }

  return children
}

/**
 * VerifyOnly – exclusively for /verify.
 * - Loading → render nothing
 * - Not logged in → redirect to /login (need an account first)
 * - Logged in AND verified → redirect to / (nothing left to verify)
 * - Logged in but NOT verified → allow access ✓
 */
function VerifyOnly({ children }) {
  const location = useLocation()
  const { isLoggedIn, isVerified } = useAuthStatus()

  if (isLoggedIn === null) return null

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          message: "Please log in to verify your email.",
        }}
      />
    )
  }

  if (isVerified) {
    return <Navigate to="/" replace />
  }

  return children
}

/**
 * ProtectedRoute – for all dashboard / onboarding pages.
 * - Loading → render nothing
 * - Not logged in → redirect to /login
 * - Logged in but NOT verified → redirect to /verify
 * - Logged in AND verified → allow access ✓
 */
function ProtectedRoute({ children }) {
  const location = useLocation()
  const { isLoggedIn, isVerified } = useAuthStatus()

  if (isLoggedIn === null) return null // Loading

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          message: "Please log in or create an account to use this feature.",
        }}
      />
    )
  }

  if (!isVerified) {
    return <Navigate to="/verify" replace />
  }

  return children
}

/**
 * RequireAuth – simple "must be logged in" check (no verification requirement).
 * Kept for any future use-cases that only need a login gate.
 */
function RequireAuth({ children }) {
  const location = useLocation()
  const { isLoggedIn } = useAuthStatus()

  if (isLoggedIn === null) return null

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          message: "Please log in or create an account to use this feature.",
        }}
      />
    )
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<> <HeaderCom /> <LandingPages /></>} />
      <Route
        path="/"
        element={
          <>
            <HeaderCom />
            <LandingPages />
          </>
        }
      />
      <Route
        path="/login"
        element={
          <GuestOnly>
            <LoginPage />
          </GuestOnly>
        }
      />
      <Route
        path="/register"
        element={
          <GuestOnly>
            <RegisterPage />
          </GuestOnly>
        }
      />

      {/* /verify – only for logged-in users who have NOT yet verified their email */}
      <Route
        path="/verify"
        element={
          <VerifyOnly>
            <EmailVerificationPage />
          </VerifyOnly>
        }
      />
      {/* /verify-email kept as alias for backwards-compat, same guard */}
      <Route
        path="/verify-email"
        element={
          <VerifyOnly>
            <EmailVerificationPage />
          </VerifyOnly>
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
        element={<Navigate to="/client/dashboard" replace />}
      />

      <Route
        path="/client/dashboard"
        element={
          <ProtectedRoute>
            <ClientDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/projects"
        element={
          <ProtectedRoute>
            <ClientProjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/post-job"
        element={
          <ProtectedRoute>
            <PostJobPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/messages"
        element={
          <ProtectedRoute>
            <ClientMessagesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/billing"
        element={
          <ProtectedRoute>
            <ClientBillingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/settings"
        element={
          <ProtectedRoute>
            <ClientSettingsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-users"
        element={
          <ProtectedRoute>
            <UserManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-moderation"
        element={
          <ProtectedRoute>
            <ContentModerationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-disputes"
        element={
          <ProtectedRoute>
            <DisputeResolutionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-analytics"
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/expert-dashboard"
        element={<Navigate to="/expert/dashboard" replace />}
      />
      <Route
        path="/expert/dashboard"
        element={
          <ProtectedRoute>
            <ExpertDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/expert/projects"
        element={
          <ProtectedRoute>
            <MyProjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/expert/work"
        element={
          <ProtectedRoute>
            <FindWorkPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/expert/earnings"
        element={
          <ProtectedRoute>
            <EarningsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/expert/messages"
        element={
          <ProtectedRoute>
            <ExpertMessagesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/expert/settings"
        element={
          <ProtectedRoute>
            <ExpertSettingsPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes >
  )
}

export default AppRoutes
