import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Clock,
  DollarSign,
  Loader2,
  MessageSquare,
  Send,
} from 'lucide-react';
import Footer from '../Components/Footer/Footer';
import { getMarketplaceJobById } from '../Services/serviceService';
import './Style/ServiceDetail.css';

const parseMoney = (value) => {
  const parsed = Number(String(value || '0').replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatMoney = (value) => `$${parseMoney(value).toLocaleString()}`;

const formatBudget = (task) => {
  const min = parseMoney(task.budget_min ?? task.budgetMin);
  const max = parseMoney(task.budget_max ?? task.budgetMax ?? task.budget);

  if (min && max && min !== max) return `${formatMoney(min)} - ${formatMoney(max)}`;
  if (max) return formatMoney(max);
  if (min) return formatMoney(min);
  return 'Budget TBD';
};

const formatDate = (value) => {
  if (!value) return 'No deadline';
  return new Date(value).toLocaleDateString();
};

const MarketplaceTaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTaskDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMarketplaceJobById(id);
        setTask(data);
      } catch (err) {
        setError(err.message || 'Failed to load client task.');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetail();
  }, [id]);

  const clientName = task?.client_name || task?.company_name || task?.clientName || 'Client';
  const requiredSkill = task?.required_skill || task?.requiredSkill || task?.category || 'AI Task';

  return (
    <div style={{ backgroundColor: '#060b18', minHeight: '100vh', color: '#f8fafc' }}>
      <div className="service-detail-container">
        <button className="back-btn" type="button" onClick={() => navigate('/marketplace')}>
          <ArrowLeft size={16} /> Back to Marketplace
        </button>

        {loading ? (
          <div className="loading-spinner">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="mt-3 text-muted">Loading client task...</p>
          </div>
        ) : error ? (
          <div className="error-card">
            <AlertCircle size={48} className="text-danger mb-3" />
            <h3>Failed to Load Task</h3>
            <p className="text-muted">{error}</p>
            <button className="back-btn mt-3 px-4 py-2" type="button" onClick={() => navigate('/marketplace')}>
              Go Back
            </button>
          </div>
        ) : (
          <div className="detail-layout">
            <div className="detail-main">
              <span className="detail-tag">{String(requiredSkill).toUpperCase()}</span>
              <h1 className="detail-title">{task.title || 'Untitled Client Task'}</h1>

              <div className="expert-bar">
                <div className="expert-avatar-large task-client-avatar"></div>
                <div className="expert-meta">
                  <div className="expert-bar-name">{clientName}</div>
                  <div className="expert-bar-rating">
                    <BriefcaseBusiness size={14} color="#10b981" />
                    <span className="rating-val">Open task</span>
                    <span className="rating-count">Client marketplace</span>
                  </div>
                </div>
              </div>

              <div className="detail-section glass-card">
                <h3 className="section-header">Task Description</h3>
                <p className="detail-description">
                  {task.description || 'No detailed description provided for this client task.'}
                </p>
              </div>

              <div className="detail-section glass-card">
                <h3 className="section-header">What the Expert Should Review</h3>
                <ul className="why-choose-list">
                  <li>Understand the client problem, desired output, and project scope.</li>
                  <li>Check the required skill/category before sending a proposal.</li>
                  <li>Review the budget and deadline to decide whether the task fits your availability.</li>
                  <li>Use proposal/contact flow when the backend proposal feature is ready.</li>
                </ul>
              </div>
            </div>

            <div className="detail-sidebar">
              <div className="pricing-card glass-card">
                <div className="pricing-header">
                  <span className="pricing-label">Client Budget</span>
                  <h2 className="pricing-amount">{formatBudget(task)}</h2>
                </div>

                <p className="pricing-desc">
                  This task was posted by a client and is available for experts to review from the marketplace.
                </p>

                <div className="pricing-metrics task-metrics">
                  <div className="metric">
                    <CalendarDays size={16} />
                    <span>{formatDate(task.deadline)}</span>
                  </div>
                  <div className="metric">
                    <Clock size={16} />
                    <span>{task.duration_days ? `${task.duration_days} days` : 'Duration TBD'}</span>
                  </div>
                  <div className="metric">
                    <DollarSign size={16} />
                    <span>{task.status || 'open'}</span>
                  </div>
                </div>

                <div className="features-list">
                  <h4 className="features-title">Task Summary</h4>
                  <div className="feature-item">
                    <Check size={14} className="text-success" />
                    <span>{requiredSkill}</span>
                  </div>
                  <div className="feature-item">
                    <Check size={14} className="text-success" />
                    <span>{clientName}</span>
                  </div>
                  <div className="feature-item">
                    <Check size={14} className="text-success" />
                    <span>{formatDate(task.created_at || task.createdAt)}</span>
                  </div>
                </div>

                <button className="order-btn" type="button" onClick={() => alert('Proposal integration is coming soon!')}>
                  <Send size={16} /> Send Proposal
                </button>

                <button className="contact-btn" type="button">
                  <MessageSquare size={16} /> Contact Client
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

export default MarketplaceTaskDetailPage;
