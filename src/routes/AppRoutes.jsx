import { Routes, Route} from "react-router-dom"
import LoginPage from "../pages/LoginPage"
import RegisterPage from "../pages/RegisterPage"
import LandingPages from "../Components/LandingPages/LandingPages"
import HeaderCom from "../Components/Navbar/HeaderCom"
import EmailVerificationPage from "../pages/EmailVerificationPage"
import Dashboard from "../pages/Dashboard"
import ForbiddenPage from "../pages/ForbiddenPage"
import ExpertDashboardPage from "../pages/ExpertDashboardPage"
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<> <HeaderCom /> <LandingPages /></>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify" element={<EmailVerificationPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/expert-dashboard" element={<ExpertDashboardPage />} />
      <Route path="/403" element={<ForbiddenPage />} />
    </Routes>
  )
}

export default AppRoutes