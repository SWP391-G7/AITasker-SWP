import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, KeyRound, Lock, Mail } from "lucide-react"
import { forgotPassword, resetPassword, verifyPasswordResetCode } from "../../Services/authService"
import "./Auth.css"

const emptyOtp = ["", "", "", "", "", ""]

function ForgotPasswordForm() {
  const navigate = useNavigate()
  const inputRefs = useRef([])

  const [step, setStep] = useState("email")
  const [otp, setOtp] = useState(emptyOtp)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (step === "code") {
      inputRefs.current[0]?.focus()
    }
  }, [step])

  const resetOtp = () => {
    setOtp(emptyOtp)
    queueMicrotask(() => inputRefs.current[0]?.focus())
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const validateEmail = () => {
    if (!formData.email.trim()) return "Email is required"
    if (!formData.email.includes("@")) return "Email is invalid"
    return ""
  }

  const validatePassword = () => {
    if (!formData.newPassword.trim()) return "New password is required"
    if (formData.newPassword.length < 6) return "Password must be at least 6 characters"
    if (formData.newPassword !== formData.confirmPassword) return "Confirm password does not match"
    return ""
  }

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return

    setError("")
    const nextOtp = [...otp]
    nextOtp[index] = value.substring(value.length - 1)
    setOtp(nextOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
        return
      }

      const nextOtp = [...otp]
      nextOtp[index] = ""
      setOtp(nextOtp)
    } else if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (event.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpPaste = (event) => {
    event.preventDefault()
    const pastedCode = event.clipboardData.getData("text").trim().slice(0, 6)
    if (!/^\d+$/.test(pastedCode)) return

    const nextOtp = [...emptyOtp]
    pastedCode.split("").forEach((digit, index) => {
      if (index < 6) nextOtp[index] = digit
    })
    setOtp(nextOtp)
    inputRefs.current[Math.min(pastedCode.length, 5)]?.focus()
  }

  const requestCode = async ({ resend = false } = {}) => {
    const validateError = validateEmail()
    if (validateError) {
      setError(validateError)
      return
    }

    try {
      setError("")
      setNotice("")
      resend ? setIsResending(true) : setIsLoading(true)
      await forgotPassword(formData.email)
      setStep("code")
      resetOtp()
      setNotice(resend ? "A new code has been sent to your email." : "A password reset code has been sent to your email.")
    } catch (err) {
      setError(err.message || "Could not send reset code. Please try again.")
    } finally {
      setIsLoading(false)
      setIsResending(false)
    }
  }

  const handleRequestCode = async (event) => {
    event.preventDefault()
    await requestCode()
  }

  const handleVerifyCode = async (event) => {
    event.preventDefault()
    const code = otp.join("")

    if (code.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }

    try {
      setError("")
      setNotice("")
      setIsLoading(true)
      await verifyPasswordResetCode({
        email: formData.email,
        code,
      })
      setStep("password")
      setNotice("Code verified. You can now set a new password.")
    } catch (err) {
      setError(err.message || "Could not verify code. Please try again.")
      resetOtp()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (event) => {
    event.preventDefault()

    const validateError = validatePassword()
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
        code: otp.join(""),
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
        {step === "email" && "Enter your account email and we will send a reset code."}
        {step === "code" && "Enter the 6-digit code we sent to your email."}
        {step === "password" && "Choose and confirm your new password."}
      </p>

      <form
        onSubmit={
          step === "email"
            ? handleRequestCode
            : step === "code"
              ? handleVerifyCode
              : handleResetPassword
        }
      >
        {step === "email" && (
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
        )}

        {step === "code" && (
          <div className="forgot-otp-section">
            <div className="forgot-otp-icon">
              <KeyRound size={28} />
            </div>
            <p className="forgot-otp-copy">
              We've sent a 6-digit code to <br />
              <span>{formData.email}</span>
            </p>

            <div className="forgot-otp-inputs">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  className={`otp-input ${error ? "error" : ""}`}
                  maxLength="1"
                  value={digit}
                  disabled={isLoading}
                  ref={(element) => {
                    inputRefs.current[index] = element
                  }}
                  onChange={(event) => handleOtpChange(index, event.target.value)}
                  onKeyDown={(event) => handleOtpKeyDown(index, event)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                />
              ))}
            </div>
          </div>
        )}

        {step === "password" && (
          <>
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
          {step === "email" && (isLoading ? "Sending code..." : "Send reset code")}
          {step === "code" && (isLoading ? "Verifying..." : "Verify code")}
          {step === "password" && (isLoading ? "Resetting..." : "Reset password")}
        </button>
      </form>

      {step === "code" && (
        <button className="forgot-btn" type="button" onClick={() => requestCode({ resend: true })} disabled={isLoading || isResending}>
          {isResending ? "Sending..." : "Resend code"}
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
