import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import LandingPages from "../Components/LandingPages/LandingPages";
import HeaderCom from "../Components/Navbar/HeaderCom";
import EmailVerificationPage from "../pages/EmailVerificationPage";
<<<<<<< HEAD
import ClientDashboardPage from "../pages/MarketplacePage/Client/ClientDashboardPage";
=======
import AdminDashboardPage from "../pages/AdminDashboardPage";
import ExpertDashboardPage from "../pages/ExpertDashboardPage";
import ClientDashboardPage from "../pages/ClientDashboardPage";
>>>>>>> dashboard-admin
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

      <Route path="/client/dashboard" element={<ClientDashboardPage />} />

      <Route
        path="/expert/dashboard"
        element={
          <RequireAuth>
            <ExpertDashboardPage />
          </RequireAuth>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <RequireAuth>
            <ClientDashboardPage />
          </RequireAuth>
        }
      />

      <Route path="/dashboard" element={<Navigate to="/client/dashboard" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;