import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Clock,
  DollarSign,
  Loader2,
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

  const requiredSkill = task?.required_skill || task?.requiredSkill || 'AI Task';

  return (
    <div className="service-detail-page-wrapper">
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
                <div className="expert-avatar-large initials-avatar">
                  {(task.client_name || task.company_name || 'C').charAt(0).toUpperCase()}
                </div>
                <div className="expert-meta">
                  <div className="expert-bar-name">{task.client_name || task.company_name || task.clientName || 'Client'}</div>
                  <div className="expert-bar-rating">
                    <BriefcaseBusiness size={14} color="#10b981" />
                    <span className="rating-val">Open task</span>
                  </div>
                </div>
              </div>

              <div className="detail-section glass-card">
                <h3 className="section-header">Task Description</h3>
                <p className="detail-description">
                  {task.description || 'No detailed description provided for this client task.'}
                </p>
              </div>
            </div>

            <div className="detail-sidebar">
              <div className="pricing-card glass-card">
                <div className="pricing-header">
                  <span className="pricing-label">Client Budget</span>
                  <h2 className="pricing-amount">{formatBudget(task)}</h2>
                </div>

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
