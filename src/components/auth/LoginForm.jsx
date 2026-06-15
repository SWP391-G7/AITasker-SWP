import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import { login } from "../../Services/authService"

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

  const handleChange = (event) => { //Set form data state when user types in email or password fields
    const { name, value } = event.target

    setFormData({
      ...formData,
      [name]: value,
    })
  }

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
      navigate("/dashboard")
    } catch (err) {
      setError(err.message || "Login failed. Please check your email or password.")
    } finally {
      setIsLoading(false)
    }
  }

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

      <button className="forgot-btn" type="button" disabled={isLoading}>
        Forgot password?
      </button>

      <div className="divider">
        <span></span>
        <p>or</p>
        <span></span>
      </div>

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
