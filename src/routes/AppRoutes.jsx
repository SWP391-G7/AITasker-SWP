import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import LandingPages from "../Components/LandingPages/LandingPages";
import HeaderCom from "../Components/Navbar/HeaderCom";
import EmailVerificationPage from "../pages/EmailVerificationPage";
import ClientDashboardPage from "../pages/DashboardPage/Client/ClientDashboardPage";
import ClientProjectsPage from "../pages/DashboardPage/Client/ClientProjectsPage";
import PostJobPage from "../pages/DashboardPage/Client/PostJobPage";
import ClientMessagesPage from "../pages/DashboardPage/Client/ClientMessagesPage";
import ClientBillingPage from "../pages/DashboardPage/Client/ClientBillingPage";
import ClientSettingsPage from "../pages/DashboardPage/Client/ClientSettingsPage";
import AdminDashboardPage from "../pages/DashboardPage/Admin/AdminDashboardPage";
import UserManagementPage from "../pages/DashboardPage/Admin/UserManagementPage";
import ContentModerationPage from "../pages/DashboardPage/Admin/ContentModerationPage";
import DisputeResolutionPage from "../pages/DashboardPage/Admin/DisputeResolutionPage";
import AnalyticsPage from "../pages/DashboardPage/Admin/AnalyticsPage";
import ExpertDashboardPage from "../pages/DashboardPage/Expert/ExpertDashboardPage";
import MyProjectsPage from "../pages/DashboardPage/Expert/MyProjectsPage";
import FindWorkPage from "../pages/DashboardPage/Expert/FindWorkPage";
import EarningsPage from "../pages/DashboardPage/Expert/EarningsPage";
import ExpertMessagesPage from "../pages/DashboardPage/Expert/MessagesPage";
import ExpertSettingsPage from "../pages/DashboardPage/Expert/SettingsPage";
import { isLoggedIn } from "../Services/checkLogin";

function RequireAuth({ children }) {
  const location = useLocation();

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
    );
  }

  return children;
}

function GuestOnly({ children }) { //Redirect logged in users away from login/register pages
  if (isLoggedIn()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
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
        path="/dashboard"
        element={
          <RequireAuth>
            <ClientDashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/client/dashboard"
        element={
          <RequireAuth>
            <ClientDashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/client/projects"
        element={
          <RequireAuth>
            <ClientProjectsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/client/post-job"
        element={
          <RequireAuth>
            <PostJobPage />
          </RequireAuth>
        }
      />
      <Route
        path="/client/messages"
        element={
          <RequireAuth>
            <ClientMessagesPage />
          </RequireAuth>
        }
      />
      <Route
        path="/client/billing"
        element={
          <RequireAuth>
            <ClientBillingPage />
          </RequireAuth>
        }
      />
      <Route
        path="/client/settings"
        element={
          <RequireAuth>
            <ClientSettingsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin-dashboard"
        element={
          <RequireAuth>
            <AdminDashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/expert-dashboard"
        element={
          <RequireAuth>
            <ExpertDashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/expert/dashboard"
        element={
          <RequireAuth>
            <ExpertDashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/expert/projects"
        element={
          <RequireAuth>
            <MyProjectsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/expert/work"
        element={
          <RequireAuth>
            <FindWorkPage />
          </RequireAuth>
        }
      />
      <Route
        path="/expert/earnings"
        element={
          <RequireAuth>
            <EarningsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/expert/messages"
        element={
          <RequireAuth>
            <ExpertMessagesPage />
          </RequireAuth>
        }
      />
      <Route
        path="/expert/settings"
        element={
          <RequireAuth>
            <ExpertSettingsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin-users"
        element={
          <RequireAuth>
            <UserManagementPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin-moderation"
        element={
          <RequireAuth>
            <ContentModerationPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin-disputes"
        element={
          <RequireAuth>
            <DisputeResolutionPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin-analytics"
        element={
          <RequireAuth>
            <AnalyticsPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
