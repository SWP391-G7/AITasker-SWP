const LoadingSpinner = () => {
  return (
    <div 
      className="d-flex flex-column justify-content-center align-items-center min-vh-100" 
      style={{ backgroundColor: '#0D1C32', zIndex: 9999 }}
    >
      <style>
        {`
          @keyframes spin-outer {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes spin-inner {
            0% { transform: rotate(360deg); }
            100% { transform: rotate(0deg); }
          }
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.05); }
          }
          .spinner-container {
            position: relative;
            width: 80px;
            height: 80px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .outer-ring {
            position: absolute;
            width: 100%;
            height: 100%;
            border: 3px solid transparent;
            border-top-color: #0d6efd;
            border-bottom-color: #0d6efd;
            border-radius: 50%;
            animation: spin-outer 1.5s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite;
            filter: drop-shadow(0 0 8px rgba(13, 110, 253, 0.5));
          }
          .inner-ring {
            position: absolute;
            width: 65%;
            height: 65%;
            border: 2px solid rgba(13, 110, 253, 0.1);
            border-left-color: #0d6efd;
            border-radius: 50%;
            border-radius: 50%;
            animation: spin-inner 1.5s linear infinite;
            opacity: 0.7;
          }
          .core-dot {
            width: 8px;
            height: 8px;
            background-color: #0d6efd;
            border-radius: 50%;
            box-shadow: 0 0 15px #0d6efd, 0 0 30px #0d6efd;
            animation: pulse-glow 1.5s ease-in-out infinite;
          }
        `}
      </style>
      <div className="spinner-container mb-4">
        <div className="outer-ring"></div>
        <div className="inner-ring"></div>
        <div className="core-dot"></div>
      </div>
      <div className="text-center">
        <p className="text-primary fw-bold text-uppercase tracking-widest mb-0" style={{ fontSize: '11px', letterSpacing: '3px', opacity: 0.9 }}>
          Initializing System
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
