import { Routes, Route, } from "react-router-dom";

import EmailVerificationPage from "../pages/EmailVerificationPage";
import Dashboard from "../pages/Dashboard";

function AppRoutes() {
  return (
    <Routes>

      <Route path="/verify" element={<EmailVerificationPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default AppRoutes;