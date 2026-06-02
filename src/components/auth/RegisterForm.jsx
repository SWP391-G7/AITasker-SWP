import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { register } from "../../services/authService"

function RegisterForm() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      return "Full name is required"
    }

    if (!formData.email.trim()) {
      return "Email is required"
    }

    if (!formData.email.includes("@")) {
      return "Email is invalid"
    }

    if (!formData.password.trim()) {
      return "Password is required"
    }

    if (formData.password.length < 6) {
      return "Password must be at least 6 characters"
    }

    if (formData.password !== formData.confirmPassword) {
      return "Confirm password does not match"
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

      const result = await register(formData)

      console.log("Register success:", result)

      navigate("/verify", { state: { email: formData.email } })
    } catch (err) {
      setError("Register failed. Please try again.")
    }
  }

  return (
    <>
      <h2 className="form-title">Create your account</h2>
      <p className="form-subtitle">Join AITasker and start working smarter.</p>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <span className="input-icon">👤</span>
          <input
            type="text"
            name="fullName"
            placeholder="Full name"
            value={formData.fullName}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <span className="input-icon">✉</span>
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
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
          />

          <button
            type="button"
            className="show-password-btn"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "◡" : "👁"}
          </button>
        </div>

        <div className="input-group">
          <span className="input-icon">🔒</span>

          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <button
            type="button"
            className="show-password-btn"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? "◡" : "👁"}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="primary-btn">
          Create account
        </button>
      </form>

      <div className="bottom-text">
        Already have an account?{" "}
        <button type="button" onClick={() => navigate("/login")}>
          Log in
        </button>
      </div>
    </>
  )
}

export default RegisterForm