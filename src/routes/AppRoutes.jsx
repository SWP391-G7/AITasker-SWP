import { Routes, Route} from "react-router-dom"
import LoginPage from "../pages/LoginPage"
import RegisterPage from "../pages/RegisterPage"
import LandingPages from "../Components/LandingPages/LandingPages"
import HeaderCom from "../Components/Navbar/HeaderCom"
import EmailVerificationPage from "../pages/EmailVerificationPage"
import Dashboard from "../pages/Dashboard"

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<> <HeaderCom /> <LandingPages /></>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify" element={<EmailVerificationPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  )
}

export default AppRoutes