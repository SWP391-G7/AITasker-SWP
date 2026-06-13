import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import LoginPage from "../pages/LoginPage"
import RegisterPage from "../pages/RegisterPage"
import LandingPages from "../Components/LandingPages/LandingPages"
import HeaderCom from "../Components/Navbar/HeaderCom"
import EmailVerificationPage from "../pages/EmailVerificationPage"
import { isLoggedIn } from "../Services/checkLogin"
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
import { isLoggedIn } from "../Services/checkLogin"

function RequireAuth({ children }) {
  const location = useLocation()

  if (!isLoggedIn()) {
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

function GuestOnly({ children }) {
  if (isLoggedIn()) {
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

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<> <HeaderCom /> <LandingPages /></>} />
      <Route
        path="/login"
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
      <Route
        path="/verify-email"
        element={
          <GuestOnly>
            <EmailVerificationPage />
          </GuestOnly>
        }
      />
      <Route path="/verify" element={<Navigate to="/verify-email" replace />} />
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
