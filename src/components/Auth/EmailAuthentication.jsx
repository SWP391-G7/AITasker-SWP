import { useState, useEffect } from 'react';
import EmailVerification from './EmailVerification';
import './Auth.css';

const Auth = () => {
  const [userEmail, setUserEmail] = useState('nguyenvana@gmail.com');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Logic: Kiểm tra xem có email nào được lưu trong máy không
  }, []);

  const handleVerifySuccess = async (code) => {
    // Giả lập gửi lên server
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (code === '123456') { // Giả sử mã đúng là 123456
          setShowSuccess(true);
          resolve();
        } else {
          reject(new Error('Mã xác thực không chính xác. Vui lòng thử lại.'));
        }
      }, 1500);
    });
  };

  const handleResendCode = () => {
    console.log(`Mã mới đã được gửi đến ${userEmail}`);
  };
    const handleEmailChange = (newEmail) => {
      setUserEmail(newEmail);
      console.log(`Đã cập nhật email thành: ${newEmail}`);
    };
  return (
    <div className="auth-page px-3">
      <EmailVerification 
        email={userEmail} 
        onVerify={handleVerifySuccess}
        onResend={handleResendCode}
         onEmailChange={handleEmailChange}
      />

      {/* Success Popup */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="success-modal">
            <div className="success-icon">
              <i className="bi bi-check-lg"></i>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
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
