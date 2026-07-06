import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, KeyRound, Lock, Mail } from "lucide-react"
import { forgotPassword, resetPassword } from "../../Services/authService"
import "./Auth.css"

function ForgotPasswordForm() {
  const navigate = useNavigate()
  const [step, setStep] = useState("email")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData({
      ...formData,
      [name]: name === "code" ? value.replace(/\D/g, "").slice(0, 6) : value,
    })
  }

  const validateEmail = () => {
    if (!formData.email.trim()) return "Email is required"
    if (!formData.email.includes("@")) return "Email is invalid"
    return ""
  }

  const validateReset = () => {
    const emailError = validateEmail()
    if (emailError) return emailError
    if (formData.code.length !== 6) return "Code must be a 6-digit number"
    if (!formData.newPassword.trim()) return "New password is required"
    if (formData.newPassword.length < 6) return "Password must be at least 6 characters"
    if (formData.newPassword !== formData.confirmPassword) return "Confirm password does not match"
    return ""
  }

  const handleRequestCode = async (event) => {
    event.preventDefault()

    const validateError = validateEmail()
    if (validateError) {
      setError(validateError)
      return
    }

    try {
      setError("")
      setNotice("")
      setIsLoading(true)
      await forgotPassword(formData.email)
      setStep("reset")
      setNotice("A password reset code has been sent to your email.")
    } catch (err) {
      setError(err.message || "Could not send reset code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (event) => {
    event.preventDefault()

    const validateError = validateReset()
    if (validateError) {
      setError(validateError)
      return
    }

    try {
      setError("")
      setNotice("")
      setIsLoading(true)
      await resetPassword({
        email: formData.email,
        code: formData.code,
        newPassword: formData.newPassword,
      })
      navigate("/login", {
        replace: true,
        state: { message: "Password reset successfully. Please log in with your new password." },
      })
    } catch (err) {
      setError(err.message || "Could not reset password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <h2 className="form-title">Reset password</h2>
      <p className="form-subtitle">
        {step === "email"
          ? "Enter your account email and we will send a reset code."
          : "Enter the code from your email and choose a new password."}
      </p>

      <form onSubmit={step === "email" ? handleRequestCode : handleResetPassword}>
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
            disabled={isLoading || step === "reset"}
          />
        </div>

        {step === "reset" && (
          <>
            <div className="input-group">
              <span className="input-icon">
                <KeyRound size={19} />
              </span>
              <input
                type="text"
                name="code"
                placeholder="6-digit code"
                value={formData.code}
                onChange={handleChange}
                disabled={isLoading}
                inputMode="numeric"
              />
            </div>

            <div className="input-group">
              <span className="input-icon">
                <Lock size={19} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                placeholder="New password"
                value={formData.newPassword}
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

            <div className="input-group">
              <span className="input-icon">
                <Lock size={19} />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
              <button
                type="button"
                className="show-password-btn"
                onClick={() => setShowConfirmPassword((value) => !value)}
                disabled={isLoading}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </>
        )}

        {notice && <p className="auth-notice">{notice}</p>}
        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="primary-btn" disabled={isLoading}>
          {step === "email"
            ? (isLoading ? "Sending code..." : "Send reset code")
            : (isLoading ? "Resetting..." : "Reset password")}
        </button>
      </form>

      {step === "reset" && (
        <button className="forgot-btn" type="button" onClick={handleRequestCode} disabled={isLoading}>
          Resend code
        </button>
      )}

      <div className="bottom-text">
        Remembered your password?{" "}
        <button type="button" onClick={() => navigate("/login")} disabled={isLoading}>
          Log in
        </button>
      </div>
    </>
  )
}

export default ForgotPasswordForm
