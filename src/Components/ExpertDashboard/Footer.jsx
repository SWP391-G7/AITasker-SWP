const Footer = () => {
  return (
    <footer 
      className="mt-auto py-4 px-4 border-top" 
      style={{ 
        backgroundColor: '#091426', 
        borderColor: 'rgba(255,255,255,0.05)' 
      }}
    >
      <div className="container-fluid">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div className="d-flex flex-wrap justify-content-center gap-4">
            <a href="#" className="footer-link text-decoration-none small">Privacy Policy</a>
            <a href="#" className="footer-link text-decoration-none small">Terms of Service</a>
            <a href="#" className="footer-link text-decoration-none small">Help Center</a>
            <a href="#" className="footer-link text-decoration-none small">API Documentation</a>
          </div>
          <p className="text-secondary mb-0 small opacity-75">
            &copy; 2026 AITasker. Developed for AI Workforce Management.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
