import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ExpertSidebar from '../../../Components/Dashboard/Expert/ExpertSidebar';
import ExpertHeader from '../../../Components/Dashboard/Expert/ExpertHeader';
import Footer from '../../../Components/Footer/Footer';
import PostServiceForm from '../../../Components/Dashboard/Expert/PostService/PostServiceForm';
import '../../Style/AdminDashboardPage.css';
import '../../Style/ExpertDashboardPage.css';

import { logout } from '../../../Services/authService';

const PostServicePage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [searchQuery, setSearchQuery] = React.useState('');

  const user = React.useMemo(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleTabChange = (id) => {
    if (id === 'dashboard') navigate('/expert/dashboard');
    else navigate(`/expert/${id}`);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate('/expert/dashboard');
    }
  };

  const stepLabels = [
    { title: "Overview", subtitle: "Technical Overview" },
    { title: "Pricing", subtitle: "Service Packages" },
    { title: "Description", subtitle: "Detailed Information" },
    { title: "Media", subtitle: "Gallery & Video" }
  ];

  return (
    <div className="admin-dashboard-layout expert-dashboard-layout">
      <ExpertSidebar activeTab="post-service" onTabChange={handleTabChange} onLogout={handleLogout} />

      <main className="admin-main-panel expert-main-panel">
        <ExpertHeader
          title="Post a New Service"
          subtitle="Define your offering and start helping clients with AI."
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onLogout={handleLogout}
        />

        <header className="post-service-header mb-4" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button 
            className="back-btn-styled" 
            onClick={handleBack}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: 'white' }}>
              {stepLabels[currentStep - 1].title}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, fontWeight: '500' }}>
              Step {currentStep} of 4: {stepLabels[currentStep - 1].subtitle}
            </p>
          </div>
        </header>

        <PostServiceForm currentStep={currentStep} setCurrentStep={setCurrentStep} />

        <Footer variant="dashboard" />
      </main>
    </div>
  );
};

export default PostServicePage;
