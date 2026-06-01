import { useState, useEffect } from 'react';
import EmailVerification from './EmailVerification';
import './Auth.css';

const Auth = () => {
  const [userEmail, setUserEmail] = useState('nguyenvana@gmail.com');
  const [pendingEmail, setPendingEmail] = useState('nguyenvana@gmail.com');
  const [showSuccess, setShowSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    sendOtp(userEmail).catch(() => {});
  }, []);

  const sendOtp = async (email) => {
    setMessage('');
    setIsSending(true);

    const response = await fetch('/api/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    setIsSending(false);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send OTP');
    }

    setMessage(`OTP đã gửi đến ${email}. Vui lòng kiểm tra Gmail để lấy mã.`);
    setUserEmail(email);
  };

  const handleVerifySuccess = async (code) => {
    const response = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: userEmail, code }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Verification failed');
    }

    setShowSuccess(true);
  };

  const handleResendCode = () => {
    return sendOtp(userEmail);
  };

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    try {
      await sendOtp(pendingEmail);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="auth-page px-3">
      <div className="mb-4 text-center">
        <form className="d-flex flex-column align-items-center gap-2 mb-3" onSubmit={handleEmailSubmit}>
          <label className="text-white fw-bold">Email đăng ký</label>
          <div className="d-flex gap-2 w-100 justify-content-center">
            <input
              type="email"
              className="form-control" 
              value={pendingEmail}
              onChange={(e) => setPendingEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              style={{ maxWidth: '320px' }}
            />
            <button type="submit" className="btn btn-success" disabled={isSending}>
              {isSending ? 'Sending...' : 'Send code'}
            </button>
          </div>
        </form>
        {message && <p className="text-light small">{message}</p>}
      </div>

      <EmailVerification
        email={userEmail}
        onVerify={handleVerifySuccess}
        onResend={handleResendCode}
      />

      {showSuccess && (
        <div className="modal-overlay">
          <div className="success-modal">
            <div className="success-icon">
              <i className="bi bi-check-lg"></i>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
              </svg>
            </div>
            <h2 className="fw-bold mb-2">Verified!</h2>
            <p className="text-muted mb-4">
              Your email <span className="text-dark fw-bold">{userEmail}</span> has been successfully verified.
            </p>
            <button
              className="btn btn-primary w-100 btn-lg rounded-pill"
              onClick={() => setShowSuccess(false)}
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
