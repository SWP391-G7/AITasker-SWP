import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import Sidebar from '../Components/ExpertDashboard/Sidebar';
import Header from '../Components/ExpertDashboard/Header';
import Footer from '../Components/ExpertDashboard/Footer';
import FinancialPerformanceCard from '../Components/ExpertDashboard/FinancialPerformanceCard';
import ExpertRatingCard from '../Components/ExpertDashboard/ExpertRatingCard';
import TechnicalStackCard from '../Components/ExpertDashboard/TechnicalStackCard';
import ActiveContractsCard from '../Components/ExpertDashboard/ActiveContractsCard';
import NewInvitationsCard from '../Components/ExpertDashboard/NewInvitationsCard';
import { sharedStyles } from '../Components/ExpertDashboard/styles';

const ExpertDashboardPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Lấy thông tin người dùng từ localStorage
  const user = useMemo(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch  {
      return null;
    }
  }, []);

  useEffect(() => {
    // Giả lập tải dữ liệu trong 1.5 giây
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(loadTimer);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const readyTimer = setTimeout(() => setIsReady(true), 100);
      return () => readyTimer && clearTimeout(readyTimer);
    }
  }, [isLoading]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="d-flex min-vh-100 text-white position-relative overflow-hidden" style={{ backgroundColor: '#0D1C32', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Decorative Background Blobs */}
      <div className="position-fixed" style={{ top: '-10%', right: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(13, 110, 253, 0.08) 0%, transparent 70%)', zIndex: 0 }}></div>
      <div className="position-fixed" style={{ bottom: '-10%', left: '-5%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(13, 110, 253, 0.05) 0%, transparent 70%)', zIndex: 0 }}></div>

      <style>{sharedStyles}</style>

      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column content-wrapper">
        <Header user={user} onLogout={handleLogout} />

        {/* Main Dashboard Content */}
        <main className="container-fluid p-4">
          <div className="row g-4">
            {/* Column Left & Middle (8/12) */}
            <div className="col-12 col-xl-8 d-flex flex-column gap-4">
              <FinancialPerformanceCard isReady={isReady} />
              <ActiveContractsCard />
            </div>

            {/* Column Right (4/12) */}
            <div className="col-12 col-xl-4 d-flex flex-column gap-4">
              <ExpertRatingCard isReady={isReady} />
              <TechnicalStackCard />
              <NewInvitationsCard />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default ExpertDashboardPage;