import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, Loader2, AlertCircle, Star, XCircle } from 'lucide-react';
import Footer from '../Components/Footer/Footer';
import { getServiceById } from '../Services/serviceService';
import { updateContentStatus } from '../Services/adminDashboardService';
import { getStoredUser } from '../Services/checkLogin';
import './Style/ServiceDetail.css';

const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromProfile = location.state?.fromProfile;
  const fromLanding = location.state?.fromLanding;
  const backLabel = fromProfile ? "Back to Profile" : fromLanding ? "Back to Home" : "Back to Marketplace";
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moderationAction, setModerationAction] = useState('');
  const [moderationError, setModerationError] = useState('');

  const currentUser = getStoredUser();
  const isAdmin = currentUser?.role === 'admin';
  const canModerateService = isAdmin && service?.status === 'pending';

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getServiceById(id);
        setService(data);
      } catch (err) {
        setError(err.message || 'Failed to load service details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleModerateService = async (status) => {
    try {
      setModerationAction(status);
      setModerationError('');
      const updatedService = await updateContentStatus('service', id, status);
      setService((prev) => ({ ...prev, ...updatedService }));
    } catch (err) {
      setModerationError(err.message || 'Failed to update service status.');
    } finally {
      setModerationAction('');
    }
  };

  return (
    <div className="service-detail-page-wrapper">
      <div className="service-detail-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        {loading ? (
          <div className="loading-spinner">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="mt-3 text-muted">Loading service details...</p>
          </div>
        ) : error ? (
          <div className="error-card">
            <AlertCircle size={48} className="text-danger mb-3" />
            <h3>Failed to Load Service</h3>
            <p className="text-muted">{error}</p>
            <button className="back-btn mt-3 px-4 py-2" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        ) : service.status === 'removed' || service.status === 'rejected' ? (
          <div className="error-card" style={{ borderColor: '#ef4444' }}>
            <AlertCircle size={48} className="text-danger mb-3" />
            <h3>Service removed by Administrator</h3>
            <p className="text-muted">This content is unavailable because it has been removed due to a violation of AITasker's policy.</p>
            <button className="back-btn mt-3 px-4 py-2" onClick={() => navigate('/marketplace')}>
              Back to Marketplace
            </button>
          </div>
        ) : (
          <div className="detail-layout">
            <div className="detail-main">
              <span className="detail-tag">{service.tags?.toUpperCase() || 'SERVICE'}</span>
              <h1 className="detail-title">{service.title}</h1>

              <div className="expert-bar">
                <div className="expert-avatar-large initials-avatar">
                  {(service.expert_name || 'E').charAt(0).toUpperCase()}
                </div>
                <div className="expert-meta">
                  <div className="expert-bar-name">{service.expert_name || 'Service Expert'}</div>
                  <div className="expert-bar-rating">
                    <Star size={14} fill="#10b981" color="#10b981" />
                    <span className="rating-val">{service.avg_rating ? Number(service.avg_rating).toFixed(1) : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section glass-card">
                <h3 className="section-header">About This Service</h3>
                <p className="detail-description">{service.description || 'No detailed description provided.'}</p>
              </div>
            </div>

            <div className="detail-sidebar">
              <div className="pricing-card glass-card">
                <div className="pricing-header">
                  <span className="pricing-label">{service.pricing_type === 'hourly' ? 'Hourly Rate' : 'Fixed Price'}</span>
                  <h2 className="pricing-amount">${Number(service.price).toLocaleString()}</h2>
                </div>

                <div className="pricing-metrics">
                  <div className="metric">
                    <Clock size={16} />
                    <span>{service.delivery_days || 'TBD'} Days Delivery</span>
                  </div>
                </div>

                {canModerateService && (
                  <div className="admin-service-moderation">
                    <button
                      className="service-moderation-btn approve"
                      type="button"
                      disabled={Boolean(moderationAction)}
                      onClick={() => handleModerateService('approved')}
                    >
                      <CheckCircle2 size={16} />
                      {moderationAction === 'approved' ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      className="service-moderation-btn reject"
                      type="button"
                      disabled={Boolean(moderationAction)}
                      onClick={() => handleModerateService('rejected')}
                    >
                      <XCircle size={16} />
                      {moderationAction === 'rejected' ? 'Rejecting...' : 'Reject'}

                    </button>
                    {moderationError && <p className="service-moderation-error">{moderationError}</p>}
                  </div>
                )}

                {isAdmin && service.status && (
                  <div className={`service-status-note status-${service.status}`}>
                    Status: <span>{service.status}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ServiceDetailPage;
