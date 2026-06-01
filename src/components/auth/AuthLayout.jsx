import "../../App.css";

function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <div className="auth-left">
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

      <div className="auth-right">
        <div className="auth-card">{children}</div>
      </div>
    </div>
  );
}

export default AuthLayout;