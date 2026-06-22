import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, Check, MessageSquare, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import Footer from '../Components/Footer/Footer';
import { getServiceById } from '../Services/serviceService';
import './Style/ServiceDetail.css';

const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div style={{ backgroundColor: '#060b18', minHeight: '100vh', color: '#f8fafc' }}>
      <div className="service-detail-container">
        <button className="back-btn" onClick={() => navigate('/marketplace')}>
          <ArrowLeft size={16} /> Back to Marketplace
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
            <button className="back-btn mt-3 px-4 py-2" onClick={() => navigate('/marketplace')}>
              Go Back
            </button>
          </div>
        ) : (
          <div className="detail-layout">
            {/* Left Column: Core content */}
            <div className="detail-main">
              <span className="detail-tag">{service.tags?.toUpperCase() || 'AI SERVICE'}</span>
              <h1 className="detail-title">{service.title}</h1>
              
              {/* Expert Bar */}
              <div className="expert-bar">
                <div className="expert-avatar-large"></div>
                <div className="expert-meta">
                  <div className="expert-bar-name">{service.expert_name || 'AI Expert'}</div>
                  <div className="expert-bar-rating">
                    <Star size={14} fill="#10b981" color="#10b981" />
                    <span className="rating-val">{service.avg_rating || '5.0'}</span>
                    <span className="rating-count">(42 reviews)</span>
                  </div>
                </div>
              </div>

              {/* Service banner image */}
              <div className="detail-image-wrapper">
                <img 
                  src={service.image_url || "https://images.unsplash.com/photo-1620712943543-bcc4628c6bb5?auto=format&fit=crop&q=80&w=800"} 
                  alt={service.title} 
                  className="detail-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1620712943543-bcc4628c6bb5?auto=format&fit=crop&q=80&w=800";
                  }}
                />
              </div>

              {/* About description */}
              <div className="detail-section glass-card">
                <h3 className="section-header">About This Service</h3>
                <p className="detail-description">{service.description || 'No detailed description provided for this service listing.'}</p>
              </div>

              {/* Key Features */}
              <div className="detail-section glass-card">
                <h3 className="section-header">Why Choose this Service?</h3>
                <ul className="why-choose-list">
                  <li>Customized AI system designed specifically for your corporate dataset.</li>
                  <li>Industry-standard MLOps practices ensuring robust performance and zero down-time.</li>
                  <li>Detailed integration code snippets and API endpoints configuration documentation.</li>
                  <li>30 days of post-deployment expert maintenance support.</li>
                </ul>
              </div>
            </div>

            {/* Right Column: Pricing Sidebar */}
            <div className="detail-sidebar">
              <div className="pricing-card glass-card">
                <div className="pricing-header">
                  <span className="pricing-label">Fixed Price Plan</span>
                  <h2 className="pricing-amount">${parseFloat(service.price).toLocaleString()}</h2>
                </div>
                
                <p className="pricing-desc">
                  Full customized AI solution, detailed documentation, configuration codes, and post-launch integration support.
                </p>

                <div className="pricing-metrics">
                  <div className="metric">
                    <Clock size={16} />
                    <span>{service.delivery_days || 3} Days Delivery</span>
                  </div>
                </div>

                <div className="features-list">
                  <h4 className="features-title">What's Included:</h4>
                  <div className="feature-item">
                    <Check size={14} className="text-success" />
                    <span>Custom model fine-tuning</span>
                  </div>
                  <div className="feature-item">
                    <Check size={14} className="text-success" />
                    <span>Full integration source code</span>
                  </div>
                  <div className="feature-item">
                    <Check size={14} className="text-success" />
                    <span>Setup & Deployment guide</span>
                  </div>
                  <div className="feature-item">
                    <Check size={14} className="text-success" />
                    <span>Commercial licensing rights</span>
                  </div>
                </div>

                <button className="order-btn" onClick={() => alert('Ordering integration is coming soon!')}>
                  Order Now
                </button>
                
                <button className="contact-btn">
                  <MessageSquare size={16} /> Contact Expert
                </button>
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
