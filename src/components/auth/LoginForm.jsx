import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { login } from "../../Services/authService"

function LoginForm() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const validateForm = () => {
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

  const handleSubmit = async (event) => {
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

      navigate("/dashboard")
    } catch (err) {
      // Handle email verification required error
      if (err.isVerificationRequired) {
        console.log("Email verification required, redirecting to verification page")
        navigate("/email-verification", {
          state: { email: err.email }
        })
        return
      }

      setError(err.message || "Login failed. Please check your email or password.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <h2 className="form-title">Welcome back</h2>
      <p className="form-subtitle">Sign in to manage your AI workforce.</p>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <span className="input-icon">✉</span>
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
          <span className="input-icon">🔒</span>
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
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? "◡" : "👁"}
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