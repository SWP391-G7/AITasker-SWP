import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import EmailVerificationPage from "../pages/EmailVerificationPage";
import ClientDashboardPage from "../pages/ClientDashboardPage";

import ClientProjectsPage from "../pages/MarketplacePage/Client/ClientProjectsPage";
import PostJobPage from "../pages/MarketplacePage/Client/PostJobPage";
import ClientMessagesPage from "../pages/MarketplacePage/Client/ClientMessagesPage";
import ClientBillingPage from "../pages/MarketplacePage/Client/ClientBillingPage";
import ClientSettingsPage from "../pages/MarketplacePage/Client/ClientSettingsPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/client/dashboard" replace />} />

      <Route path="/login" element={<LoginPage />} />

      <Route path="/register" element={<RegisterPage />} />

      <Route path="/verify-email" element={<EmailVerificationPage />} />

      <Route path="/verify" element={<Navigate to="/verify-email" replace />} />

      <Route path="/dashboard" element={<Navigate to="/client/dashboard" replace />} />

      <Route path="/client/dashboard" element={<ClientDashboardPage />} />

      <Route path="/client/projects" element={<ClientProjectsPage />} />

      <Route path="/client/post-job" element={<PostJobPage />} />

      <Route path="/client/messages" element={<ClientMessagesPage />} />

      <Route path="/client/billing" element={<ClientBillingPage />} />

      <Route path="/client/settings" element={<ClientSettingsPage />} />

      <Route path="*" element={<Navigate to="/client/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;