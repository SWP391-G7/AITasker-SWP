import { useCallback, useState, useRef, useEffect } from 'react'
import * as authService from '../../Services/authService'

const EmailVerification = ({ email, onVerificationSuccess }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [showResendMsg, setShowResendMsg] = useState(false)
  const inputRefs = useRef([])

  const sendCodeToEmail = useCallback(async () => {
    if (!email) {
      setErrorMsg('No email address was provided for verification')
      return
    }

    try {
      await authService.sendVerificationCode(email)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send verification code')
    }
  }, [email])

  // Auto-focus vào ô đầu tiên
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
    queueMicrotask(sendCodeToEmail)
  }, [sendCodeToEmail])

  // Countdown timer logic
  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [countdown])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return

    setErrorMsg('') // Xóa lỗi khi người dùng bắt đầu nhập lại
    const newOtp = [...otp]
    newOtp[index] = value.substring(value.length - 1)
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Auto-backspace: Nhảy về ô trước nếu ô hiện tại trống
        inputRefs.current[index - 1].focus()
      } else {
        // Xóa ký tự ô hiện tại
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
      }
    } else if (e.key === 'ArrowLeft') {
      if (index > 0) {
        inputRefs.current[index - 1].focus()
      }
    } else if (e.key === 'ArrowRight') {
      if (index < 5) {
        inputRefs.current[index + 1].focus()
      }
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pasteData)) return

    const newOtp = [...otp]
    pasteData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char
    })
    setOtp(newOtp)

    const nextFocusIndex = Math.min(pasteData.length, 5)
    inputRefs.current[nextFocusIndex].focus()
  }

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length < 6) {
      triggerError('Please enter all 6 digits')
      return
    }

    setIsVerifying(true)
    setErrorMsg('')

    try {
      await authService.verifyCode(email, code)
      // Call parent callback for success
      if (onVerificationSuccess) {
        onVerificationSuccess()
      }
    } catch (err) {
      triggerError(err.message || 'Invalid verification code')
    } finally {
      setIsVerifying(false)
    }
  }

  const triggerError = (msg) => {
    setErrorMsg(msg)
    setOtp(['', '', '', '', '', '']) // Xóa toàn bộ mã đã nhập khi có lỗi
    inputRefs.current[0].focus()
  }

  const handleInternalResend = async () => {
    if (countdown > 0) return
    
    setIsResending(true)
    try {
      await authService.sendVerificationCode(email)
      setCountdown(60)
      setShowResendMsg(true)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0].focus()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend code')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="text-center w-100">
      <div className="mb-4">
        <div className="bg-light-blue d-inline-block p-3 rounded-circle mb-3" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#ffffff" className="bi bi-envelope-check" viewBox="0 0 16 16">
            <path d="M2 2a2 2 0 0 0-2 2v8.01A2 2 0 0 0 2 14h5.5a.5.5 0 0 0 0-1H2a1 1 0 0 1-1-.966V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v5.5a.5.5 0 0 0 1 0V4a2 2 0 0 0-2-2H2Z" />
            <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm-1.993-1.679a.5.5 0 0 0-.686.172l-1.17 1.95-.547-.547a.5.5 0 0 0-.708.708l.774.773a.75.75 0 0 0 1.174-.144l1.335-2.226a.5.5 0 0 0-.172-.686Z" />
            <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.756Zm3.436-.586L16 11.801V4.697l-5.803 3.546Z" />
          </svg>
        </div>
        <h2 className="fw-bold text-white">Email Verification</h2>

        <div className="mt-2">
          <p className="text-muted">
            We've sent a 6-digit code to <br />
            <span className="fw-bold text-info">{email}</span>
          </p>
        </div>
      </div>

      <div className="d-flex justify-content-between mb-2 px-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            className={`otp-input ${errorMsg ? 'error' : ''}`}
            maxLength="1"
            value={digit}
            disabled={isVerifying}
            ref={(el) => (inputRefs.current[index] = el)}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
          />
        ))}
      </div>

      {errorMsg && (
        <div className="text-danger small mb-3 text-start px-2">
          <i className="bi bi-exclamation-circle me-1"></i> {errorMsg}
        </div>
      )}

      <button
        className="btn btn-primary w-100 btn-lg shadow-sm mb-3 d-flex align-items-center justify-content-center"
        onClick={handleVerify}
        disabled={isVerifying}
      >
        {isVerifying ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Verifying...
          </>
        ) : 'Verify Account'}
      </button>

      <div className="resend-container">
        {countdown > 0 ? (
          <p className="small text-muted">
            You can resend the code in <span className="fw-bold text-white">{countdown}s</span>
          </p>
        ) : (
          <p className="small text-muted">
            Didn't receive the code? <span className="auth-link cursor-pointer" style={{ cursor: isResending ? 'not-allowed' : 'pointer', opacity: isResending ? 0.6 : 1 }} onClick={handleInternalResend}>{isResending ? 'Sending...' : 'Resend Code'}</span>
          </p>
        )}

        {showResendMsg && countdown > 0 && (
          <div className="text-success small mt-1 animate-fade-in">
            <i className="bi bi-check2-circle me-1"></i> A new code has been sent to your email.
          </div>
        )}
      </div>
    </div>
  )
}

export default EmailVerification
