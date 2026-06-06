export const sharedStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  
  .glass-card {
    background: rgba(39, 53, 76, 0.6) !important;
    backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  }
  .hover-card {
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) !important;
  }
  .hover-card:hover {
    transform: translateY(-8px);
    border-color: rgba(13, 110, 253, 0.3) !important;
    background: rgba(39, 53, 76, 0.8) !important;
    box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.3) !important;
  }
  .btn-primary { 
    transition: all 0.2s ease; 
  }
  .btn-primary:hover { 
    transform: scale(1.02); 
    filter: brightness(1.1); 
  }
  .fw-black { 
    font-weight: 900 !important; 
  }
  .content-wrapper { 
    margin-left: 260px; 
    z-index: 1; 
  }
  @media (max-width: 991.98px) {
    .content-wrapper { 
      margin-left: 0 !important; 
    }
  }
  .footer-link { 
    color: #b0b8c4 !important; 
    transition: color 0.2s ease; 
  }
  .footer-link:hover { 
    color: #0d6efd !important; 
  }
  .search-input:focus {
    background-color: rgba(255, 255, 255, 0.06) !important;
    border-color: rgba(13, 110, 253, 0.5) !important;
    box-shadow: 0 0 15px rgba(13, 110, 253, 0.1) !important;
  }
  .nav-item-custom {
    border-left: 3px solid transparent;
    transition: all 0.3s ease;
  }
  .nav-item-custom:hover {
    background: rgba(13, 110, 253, 0.05);
    border-left: 3px solid rgba(13, 110, 253, 0.5);
  }
  .nav-item-active {
    background: linear-gradient(90deg, rgba(13, 110, 253, 0.15) 0%, transparent 100%);
    border-left: 3px solid #0d6efd !important;
  }
  .glow-text { 
    text-shadow: 0 0 15px rgba(13, 110, 253, 0.5); 
  }
  .table-hover tbody tr:hover { 
    background-color: rgba(255, 255, 255, 0.02) !important; 
  }
  
  /* Custom scrollbar */
  ::-webkit-scrollbar { 
    width: 6px; 
  }
  ::-webkit-scrollbar-track { 
    background: transparent; 
  }
  ::-webkit-scrollbar-thumb { 
    background: rgba(255, 255, 255, 0.1); 
    border-radius: 10px; 
  }
  ::-webkit-scrollbar-thumb:hover { 
    background: rgba(255, 255, 255, 0.2); 
  }
`;
