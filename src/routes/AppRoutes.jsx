import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import LandingPages from "../Components/LandingPages/LandingPages";
import HeaderCom from "../Components/Navbar/HeaderCom";
import EmailVerificationPage from "../pages/EmailVerificationPage";
import ClientDashboardPage from "../pages/MarketplacePage/Client/ClientDashboardPage";
import AdminDashboardPage from "../pages/MarketplacePage/Admin/AdminDashboardPage";
import UserManagementPage from "../pages/MarketplacePage/Admin/UserManagementPage";
import ContentModerationPage from "../pages/MarketplacePage/Admin/ContentModerationPage";
import DisputeResolutionPage from "../pages/MarketplacePage/Admin/DisputeResolutionPage";
import ExpertDashboardPage from "../pages/MarketplacePage/Expert/ExpertDashboardPage";
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
