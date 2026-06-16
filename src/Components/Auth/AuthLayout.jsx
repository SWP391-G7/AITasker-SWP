import "../../App.css";

function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <div className="auth-left d-none d-lg-block">
        <div className="brand">
          <div className="logo-box">AI</div>
          <h1>AITasker</h1>
        </div>

        <h2>
          We are here to <br />
          solve your challenges
        </h2>

        <div className="cube cube-large"></div>
        <div className="cube cube-small"></div>
      </div>

      <div className="auth-right w-100 w-lg-50">
        <div className="auth-card">
          <div className="brand d-flex d-lg-none justify-content-center mb-4 gap-2 align-items-center">
            <div className="logo-box" style={{ width: '40px', height: '40px', borderWidth: '3px', borderRadius: '10px', fontSize: '16px' }}>AI</div>
            <h1 style={{ fontSize: '24px', letterSpacing: '0.5px' }}>AITasker</h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;