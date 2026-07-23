/**
 * Frontend module: Components/Auth/LoginForm.jsx
 *
 * Vai trò: Component Login Form: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import { login, googleLogin } from "../../Services/authService"
import { useGoogleLogin } from "@react-oauth/google"
import "./Auth.css"

// React component “Login Form” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Handler “handle change” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleChange = (event) => { //Set form data state when user types in email or password fields
    const { name, value } = event.target

    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // React component “validate Form” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
  const validateForm = () => { //Validate form inputs
    if (!formData.email.trim()) {
      return "Email is required"
    }

    if (!formData.email.includes("@")) {
      return "Email is invalid"
    }

    if (!formData.password.trim()) {
      return "Password is required"
    }

    return ""
  }

  // Handler “handle submit” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleSubmit = async (event) => { //Handle form submission when user clicks "Log In" button
    event.preventDefault()

    const validateError = validateForm()

    if (validateError) {
      setError(validateError)
      return
    }

    try {
      setError("")
      setIsLoading(true)

      const result = await login(formData)

      console.log("Login success:", result)

      // Navigate to dashboard; ProtectedRoute will redirect unverified
      // users to /verify automatically based on their isVerified status.
      navigate("/")
    } catch (err) {
      if (err.code === 'ACCOUNT_DEACTIVATED') {
        navigate('/deactivated')
      } else {
        setError(err.message || "Login failed. Please check your email or password.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setError("")
        setIsLoading(true)
        const result = await googleLogin({ accessToken: tokenResponse.access_token })
        console.log("Google Login success:", result)
        navigate("/")
      } catch (err) {
        if (err.code === 'ACCOUNT_DEACTIVATED') {
          navigate('/deactivated')
        } else {
          setError(err.message || "Google Login failed. Please try again.")
        }
      } finally {
        setIsLoading(false)
      }
    },
    onError: () => {
      setError("Google Login was unsuccessful. Try again later.")
    }
  })

  return (
    <>
      <h2 className="form-title">Welcome back</h2>
      <p className="form-subtitle">Sign in to manage your AI workforce.</p>

      {location.state?.message && <p className="auth-notice">{location.state.message}</p>}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <span className="input-icon">
            <Mail size={19} />
          </span>
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className="input-group">
          <span className="input-icon">
            <Lock size={19} />
          </span>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
          />

          <button
            type="button"
            className="show-password-btn"
            onClick={() => setShowPassword((value) => !value)}
            disabled={isLoading}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="primary-btn" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <button
        className="forgot-btn"
        type="button"
        onClick={() => navigate("/update-password")}
        disabled={isLoading}
      >
        Forgot password?
      </button>

      <div className="divider">
        <span></span>
        <p>or</p>
        <span></span>
      </div>

      <button
        type="button"
        className="outline-btn google-login-btn"
        onClick={() => handleGoogleLogin()}
        disabled={isLoading}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" className="google-icon-svg">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      <button
        type="button"
        className="outline-btn"
        onClick={() => navigate("/register")}
        disabled={isLoading}
      >
        Create new account
      </button>
    </>
  )
}

export default LoginForm
