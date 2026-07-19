import { useEffect, useState } from "react"
import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import LoginPage from "../pages/auth/LoginPage"
import RegisterPage from "../pages/auth/RegisterPage"
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage"
import LandingPages from "../Components/LandingPages/LandingPages"
import HeaderCom from "../Components/Navbar/HeaderCom"
import EmailVerificationPage from "../pages/auth/EmailVerificationPage"
import { checkLogin } from "../Services/checkLogin"
import OnboardingPage from "../pages/onboarding/OnboardingPage"
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
import ExpertProposalDetailPage from "../pages/DashboardPage/Expert/ExpertProposalDetailPage"
import ClientExpertSearchPage from "../pages/clients-experts/ClientExpertSearchPage"
import ProfilePage from "../pages/profile/ProfilePage"
import AISolutionMarketplacePage from "../pages/marketplace/AISolutionMarketplacePage"
import ServiceDetailPage from "../pages/marketplace/ServiceDetailPage"
import MarketplaceTaskDetailPage from "../pages/marketplace/MarketplaceTaskDetailPage"
import ViewAllProjectPage from "../pages/profile/ViewAllProjectPage"
import ViewAllServicePage from "../pages/profile/ViewAllServicePage"
import MarketplaceProposalPage from "../pages/marketplace/MarketplaceProposalPage"
import ProjectDetailPage from "../pages/projects/ProjectDetailPage"
import DeactivatedPage from "../pages/misc/DeactivatedPage"
import MockPaymentGateway from "../pages/misc/MockPaymentGateway"
import ServiceRequestPage from "../pages/marketplace/ServiceRequestPage"
import ServiceRequestDetailPage from "../pages/marketplace/ServiceRequestDetailPage"
import { PrivacyPolicy, TermsOfService, HelpCenter, ApiDocs } from "../pages/info/InfoPages"

function useAuthStatus() {
  const [status, setStatus] = useState({ isLoggedIn: null, isVerified: null, isOnboarded: null, role: null })

  useEffect(() => {
    let mounted = true

    checkLogin()
      .then((result) => {
        if (mounted) {
          const loggedIn = result?.isLoggedIn ?? false
          const user = result?.user?.user
          const verified = loggedIn ? (user?.isVerified ?? false) : false
          // isOnboarded is enriched onto the user object by authService.getMe
          const onboarded = loggedIn ? (user?.isOnboarded ?? false) : false
          setStatus({ isLoggedIn: loggedIn, isVerified: verified, isOnboarded: onboarded, role: user?.role ?? null })
        }
      })
      .catch(() => {
        if (mounted) {
          setStatus({ isLoggedIn: false, isVerified: false, isOnboarded: false, role: null })
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  return status
}

const roleHomePaths = {
  admin: "/admin/dashboard",
  client: "/client/dashboard",
  expert: "/expert/dashboard",
}

const isAdminRole = (role) => String(role || "").toLowerCase() === "admin"

function GuestOnly({ children }) {
  const { isLoggedIn, isVerified, isOnboarded, role } = useAuthStatus()

  if (isLoggedIn === null) return null
  if (isLoggedIn && isVerified) {
    // Redirect to onboarding if profile not yet complete
    if (!isOnboarded && !isAdminRole(role)) return <Navigate to="/onboarding" replace />
    return <Navigate to={roleHomePaths[role] || "/"} replace />
  }

  return children
}

// Allows access only to logged-in, verified users who have NOT yet onboarded.
// Already-onboarded users are sent straight to their role dashboard.
function OnboardingOnly({ children }) {
  const location = useLocation()
  const { isLoggedIn, isVerified, isOnboarded, role } = useAuthStatus()

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

  // Profile already established — send them home
  if (isOnboarded || isAdminRole(role)) return <Navigate to={roleHomePaths[role] || "/"} replace />

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

function ProtectedRoute({ children, allowedRoles, onboardingRequired = true }) {
  const location = useLocation()
  const { isLoggedIn, isVerified, isOnboarded, role } = useAuthStatus()

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

  // Redirect to onboarding if the user hasn't completed their profile yet
  if (onboardingRequired && !isOnboarded && !isAdminRole(role)) {
    return <Navigate to="/onboarding" replace />
  }

  if (allowedRoles?.length && !allowedRoles.includes(role)) {
    return <Navigate to={roleHomePaths[role] || "/"} replace />
  }

  return children
}

function DashboardRedirect() {
  const location = useLocation()
  const { isLoggedIn, isVerified, isOnboarded, role } = useAuthStatus()

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

  if (!isOnboarded && !isAdminRole(role)) return <Navigate to="/onboarding" replace />

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
          <>
            <AISolutionMarketplacePage />
          </>
        }
      />
      <Route
        path="/marketplace/service/:id"
        element={
          <>
            <HeaderCom />
            <ServiceDetailPage />
          </>
        }
      />
      <Route
        path="/marketplace/service/:id/request"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <HeaderCom />
            <ServiceRequestPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/marketplace/task/:id"
        element={
          <>
            <HeaderCom />
            <MarketplaceTaskDetailPage />
          </>
        }
      />
      <Route
        path="/marketplace/task/:id/proposal"
        element={
          <ProtectedRoute allowedRoles={["expert"]}>
            <HeaderCom />
            <MarketplaceProposalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients-experts"
        element={
          <>
            <HeaderCom />
            <ClientExpertSearchPage />
          </>
        }
      />


      <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
      <Route path="/forgot-password" element={<GuestOnly><ForgotPasswordPage /></GuestOnly>} />
      <Route path="/verify" element={<VerifyOnly><EmailVerificationPage /></VerifyOnly>} />
      <Route path="/deactivated" element={<DeactivatedPage />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/help" element={<HelpCenter />} />
      <Route path="/api-docs" element={<ApiDocs />} />
      <Route path="/mock-payment-gateway/:token" element={<MockPaymentGateway />} />

      <Route path="/onboarding" element={<OnboardingOnly><OnboardingPage /></OnboardingOnly>} />
      <Route path="/dashboard" element={<DashboardRedirect />} />

      <Route path="/client/dashboard" element={<ProtectedRoute allowedRoles={["client"]}><ClientDashboardPage /></ProtectedRoute>} />
      <Route path="/client/projects" element={<ProtectedRoute allowedRoles={["client"]}><ClientProjectsPage /></ProtectedRoute>} />
      <Route path="/client/projects/:jobId" element={<ProtectedRoute allowedRoles={["client"]}><ClientTaskDetailPage /></ProtectedRoute>} />
      <Route path="/client/post-job" element={<ProtectedRoute allowedRoles={["client"]}><PostJobPage /></ProtectedRoute>} />
      <Route path="/client/messages" element={<ProtectedRoute allowedRoles={["client"]}><ClientMessagesPage /></ProtectedRoute>} />
      <Route path="/client/billing" element={<ProtectedRoute allowedRoles={["client"]}><ClientBillingPage /></ProtectedRoute>} />
      <Route path="/client/settings" element={<ProtectedRoute allowedRoles={["client"]}><ClientSettingsPage /></ProtectedRoute>} />

      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><UserManagementPage /></ProtectedRoute>} />
      <Route path="/admin/moderation" element={<ProtectedRoute allowedRoles={["admin"]}><ContentModerationPage /></ProtectedRoute>} />
      <Route path="/admin/disputes" element={<ProtectedRoute allowedRoles={["admin"]}><DisputeResolutionPage /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={["admin"]}><AnalyticsPage /></ProtectedRoute>} />

      <Route path="/expert-dashboard" element={<Navigate to="/expert/dashboard" replace />} />
      <Route path="/expert/dashboard" element={<ProtectedRoute allowedRoles={["expert"]}><ExpertDashboardPage /></ProtectedRoute>} />
      <Route path="/expert/post-service" element={<ProtectedRoute allowedRoles={["expert"]}><PostServicePage /></ProtectedRoute>} />
      <Route path="/expert/projects" element={<ProtectedRoute allowedRoles={["expert"]}><MyProjectsPage /></ProtectedRoute>} />
      <Route path="/expert/proposal/:id" element={<ProtectedRoute allowedRoles={["expert"]}><ExpertProposalDetailPage /></ProtectedRoute>} />
      <Route path="/expert/earnings" element={<ProtectedRoute allowedRoles={["expert"]}><EarningsPage /></ProtectedRoute>} />
      <Route path="/expert/messages" element={<ProtectedRoute allowedRoles={["expert"]}><ExpertMessagesPage /></ProtectedRoute>} />
      <Route path="/expert/settings" element={<ProtectedRoute allowedRoles={["expert"]}><ExpertSettingsPage /></ProtectedRoute>} />
      <Route path="/profile/:userId" element={<ProfilePage />} />
      <Route path="/profile/:userId/projects" element={<ViewAllProjectPage />} />
      <Route path="/profile/:userId/services" element={<ViewAllServicePage />} />
      <Route path="/client/experts/:userId" element={<ProfilePage />} />
      <Route path="/client/clients/:userId" element={<ProfilePage />} />
      <Route
        path="/projects/:projectId"
        element={
          <ProtectedRoute>
            <ProjectDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/service-requests/:id"
        element={
          <ProtectedRoute>
            <ServiceRequestDetailPage />
          </ProtectedRoute>
        }
      />

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

