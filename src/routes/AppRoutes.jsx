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
import ClientTaskDetailPage from "../pages/DashboardPage/Client/ClientTaskDetailPage"
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
import EarningsPage from "../pages/DashboardPage/Expert/EarningsPage"
import ExpertMessagesPage from "../pages/DashboardPage/Expert/MessagesPage"
import ExpertSettingsPage from "../pages/DashboardPage/Expert/SettingsPage"
import PostServicePage from "../pages/DashboardPage/Expert/PostServicePage"
import ClientExpertSearchPage from "../pages/ClientExpertSearchPage"
import ProfilePage from "../pages/ProfilePage"
import AISolutionMarketplacePage from "../pages/AISolutionMarketplacePage"
import ServiceDetailPage from "../pages/ServiceDetailPage"
import MarketplaceTaskDetailPage from "../pages/MarketplaceTaskDetailPage"
import ViewAllProjectPage from "../pages/ViewAllProjectPage"
import ViewAllServicePage from "../pages/ViewAllServicePage"
import MarketplaceProposalPage from "../pages/MarketplaceProposalPage"

function useAuthStatus() {
  const [status, setStatus] = useState({ isLoggedIn: null, isVerified: null, role: null })

  useEffect(() => {
    let mounted = true

    checkLogin()
      .then((result) => {
        if (mounted) {
          const loggedIn = result?.isLoggedIn ?? false
          const user = result?.user?.user
          const verified = loggedIn ? (user?.isVerified ?? false) : false
          setStatus({ isLoggedIn: loggedIn, isVerified: verified, role: user?.role ?? null })
        }
      })
      .catch(() => {
        if (mounted) {
          setStatus({ isLoggedIn: false, isVerified: false, role: null })
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  return status
}

const roleHomePaths = {
  admin: "/admin-dashboard",
  client: "/client/dashboard",
  expert: "/expert/dashboard",
}

function GuestOnly({ children }) {
  const { isLoggedIn, isVerified } = useAuthStatus()

  if (isLoggedIn === null) return null
  if (isLoggedIn && isVerified) return <Navigate to="/" replace />

  return children
}

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

  if (isVerified) return <Navigate to="/" replace />

  return children
}

function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation()
  const { isLoggedIn, isVerified, role } = useAuthStatus()

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

  if (!isVerified) return <Navigate to="/verify" replace />

  if (allowedRoles?.length && !allowedRoles.includes(role)) {
    return <Navigate to={roleHomePaths[role] || "/"} replace />
  }

  return children
}

function DashboardRedirect() {
  const location = useLocation()
  const { isLoggedIn, isVerified, role } = useAuthStatus()

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

  if (!isVerified) return <Navigate to="/verify" replace />

  return <Navigate to={roleHomePaths[role] || "/"} replace />
}

function AppRoutes() {
  const location = useLocation()
  const backgroundLocation = location.state?.backgroundLocation

  return (
    <>
    <Routes location={backgroundLocation || location}>
      <Route path="/" element={<><HeaderCom /><LandingPages /></>} />

      <Route
        path="/marketplace"
        element={
          <ProtectedRoute>
            <AISolutionMarketplacePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/marketplace/service/:id"
        element={
          <ProtectedRoute>
            <HeaderCom />
            <ServiceDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/marketplace/task/:id"
        element={
          <ProtectedRoute>
            <HeaderCom />
            <MarketplaceTaskDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/marketplace/task/:id/proposal"
        element={
          <ProtectedRoute>
            <HeaderCom />
            <MarketplaceProposalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients-experts"
        element={
          <ProtectedRoute>
            <ClientExpertSearchPage />
          </ProtectedRoute>
        }
      />


      <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
      <Route path="/verify" element={<VerifyOnly><EmailVerificationPage /></VerifyOnly>} />
      <Route path="/verify-email" element={<VerifyOnly><EmailVerificationPage /></VerifyOnly>} />

      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<DashboardRedirect />} />

      <Route path="/client/dashboard" element={<ProtectedRoute allowedRoles={["client"]}><ClientDashboardPage /></ProtectedRoute>} />
      <Route path="/client/projects" element={<ProtectedRoute allowedRoles={["client"]}><ClientProjectsPage /></ProtectedRoute>} />
      <Route path="/client/projects/:jobId" element={<ProtectedRoute allowedRoles={["client"]}><ClientTaskDetailPage /></ProtectedRoute>} />
      <Route path="/client/post-job" element={<ProtectedRoute allowedRoles={["client"]}><PostJobPage /></ProtectedRoute>} />
      <Route path="/client/messages" element={<ProtectedRoute allowedRoles={["client"]}><ClientMessagesPage /></ProtectedRoute>} />
      <Route path="/client/billing" element={<ProtectedRoute allowedRoles={["client"]}><ClientBillingPage /></ProtectedRoute>} />
      <Route path="/client/settings" element={<ProtectedRoute allowedRoles={["client"]}><ClientSettingsPage /></ProtectedRoute>} />

      <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="/admin-users" element={<ProtectedRoute allowedRoles={["admin"]}><UserManagementPage /></ProtectedRoute>} />
      <Route path="/admin-moderation" element={<ProtectedRoute allowedRoles={["admin"]}><ContentModerationPage /></ProtectedRoute>} />
      <Route path="/admin-disputes" element={<ProtectedRoute allowedRoles={["admin"]}><DisputeResolutionPage /></ProtectedRoute>} />
      <Route path="/admin-analytics" element={<ProtectedRoute allowedRoles={["admin"]}><AnalyticsPage /></ProtectedRoute>} />

      <Route path="/expert-dashboard" element={<Navigate to="/expert/dashboard" replace />} />
      <Route path="/expert/dashboard" element={<ProtectedRoute allowedRoles={["expert"]}><ExpertDashboardPage /></ProtectedRoute>} />
      <Route path="/expert/post-service" element={<ProtectedRoute allowedRoles={["expert"]}><PostServicePage /></ProtectedRoute>} />
      <Route path="/expert/projects" element={<ProtectedRoute allowedRoles={["expert"]}><MyProjectsPage /></ProtectedRoute>} />
      <Route path="/expert/earnings" element={<ProtectedRoute allowedRoles={["expert"]}><EarningsPage /></ProtectedRoute>} />
      <Route path="/expert/messages" element={<ProtectedRoute allowedRoles={["expert"]}><ExpertMessagesPage /></ProtectedRoute>} />
      <Route path="/expert/settings" element={<ProtectedRoute allowedRoles={["expert"]}><ExpertSettingsPage /></ProtectedRoute>} />
      <Route path="/profile/:userId" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/profile/:userId/projects" element={<ProtectedRoute><ViewAllProjectPage /></ProtectedRoute>} />
      <Route path="/profile/:userId/services" element={<ProtectedRoute><ViewAllServicePage /></ProtectedRoute>} />
      <Route path="/client/experts/:userId" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/client/clients/:userId" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    {backgroundLocation && (
      <Routes>
        <Route path="/profile/:userId/projects" element={<ProtectedRoute><ViewAllProjectPage /></ProtectedRoute>} />
        <Route path="/profile/:userId/services" element={<ProtectedRoute><ViewAllServicePage /></ProtectedRoute>} />
      </Routes>
    )}
    </>
  )
}

export default AppRoutes

