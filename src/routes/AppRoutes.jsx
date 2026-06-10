import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import LandingPages from "../Components/LandingPages/LandingPages";
import HeaderCom from "../Components/Navbar/HeaderCom";
import EmailVerificationPage from "../pages/EmailVerificationPage";
import ClientDashboardPage from "../pages/MarketplacePage/Client/ClientDashboardPage";
import ExpertDashboardPage from "../pages/MarketplacePage/Expert/ExpertDashboardPage";
import MyProjectsPage from "../pages/MarketplacePage/Expert/MyProjectsPage";
import FindWorkPage from "../pages/MarketplacePage/Expert/FindWorkPage";
import EarningsPage from "../pages/MarketplacePage/Expert/EarningsPage";
import MessagesPage from "../pages/MarketplacePage/Expert/MessagesPage";
import SettingsPage from "../pages/MarketplacePage/Expert/SettingsPage";
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

function GuestOnly({ children }) {
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
        element={<Navigate to="/expert/dashboard" replace />}
      />
      <Route
        path="/landing"
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
        path="/client/dashboard"
        element={
          <RequireAuth>
            <ClientDashboardPage />
          </RequireAuth>
        }
      />
      
      {/* Expert Routes - No Auth Required for Testing */}
      <Route path="/expert/dashboard" element={<ExpertDashboardPage />} />
      <Route path="/expert/projects" element={<MyProjectsPage />} />
      <Route path="/expert/work" element={<FindWorkPage />} />
      <Route path="/expert/earnings" element={<EarningsPage />} />
      <Route path="/expert/messages" element={<MessagesPage />} />
      <Route path="/expert/settings" element={<SettingsPage />} />

      <Route path="/dashboard" element={<Navigate to="/client/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
