import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  DollarSign,
  EyeOff,
  Loader2,
  RefreshCcw,
  Send,
  XCircle,
} from 'lucide-react';
import Footer from '../../Components/Footer/Footer';
import { getStoredUser } from '../../Services/checkLogin';
import { getMarketplaceJobById } from '../../Services/serviceService';

import DetailCarousel from '../../Components/marketplace/DetailCarousel';
import AdminModerationConfirmModal from '../../Components/Dashboard/Admin/AdminModerationConfirmModal';
import '../../Components/marketplace/Marketplace.css';
import { updateContentStatus } from '../../Services/adminDashboardService';
import '../Style/ServiceDetail.css';

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



const MarketplaceTaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moderationAction, setModerationAction] = useState('');
  const [moderationError, setModerationError] = useState('');
  const [moderationConfirmAction, setModerationConfirmAction] = useState('');
  const currentUser = getStoredUser();
  const isAdmin = String(currentUser?.role || '').toLowerCase().includes('admin');
  const isExpert = currentUser?.role === 'expert';

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
  const taskStatus = String(task?.status || 'open').toLowerCase();
  const canModerateTask = isAdmin && taskStatus === 'pending';
  const canUnpublishTask = isAdmin && taskStatus === 'open';
  const canRepublishTask = isAdmin && ['removed', 'rejected'].includes(taskStatus);
  const canSendProposal = isExpert && taskStatus === 'open';

  const handleModerateTask = async (status) => {
    try {
      setModerationAction(status);
      setModerationError('');
      const updatedTask = await updateContentStatus('job', id, status);
      setTask((prev) => ({ ...prev, ...updatedTask }));
    } catch (err) {
      setModerationError(err.message || 'Failed to update task status.');
    } finally {
      setModerationAction('');
      setModerationConfirmAction('');
    }
  };

  const confirmModerationAction = () => {
    const status = ['approve', 'republish'].includes(moderationConfirmAction) ? 'approved' : 'removed';
    handleModerateTask(status);
  };

  return (
    <div className="service-detail-page-wrapper">
      <div className="service-detail-container">
        <button className="back-btn" type="button" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back 
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
            <button className="back-btn mt-3 px-4 py-2" type="button" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        ) : (task.status === 'removed' || task.status === 'rejected') && !isAdmin ? (
          <div className="error-card" style={{ borderColor: '#ef4444' }}>
            <AlertCircle size={48} className="text-danger mb-3" />
            <h3>Post removed by Administrator</h3>
            <p className="text-muted">This content is unavailable because it has been removed due to a violation of AITasker's policy.</p>
            <button className="back-btn mt-3 px-4 py-2" type="button" onClick={() => navigate('/marketplace')}>
              Back to Marketplace
            </button>
          </div>
        ) : (
          <div className="detail-layout">
            <div className="detail-main">
              <span className="detail-tag">{String(requiredSkill).toUpperCase()}</span>
              <h1 className="detail-title">{task.title || 'Untitled Client Task'}</h1>

              <div className="expert-bar clickable" onClick={() => navigate(`/profile/${task.client_id || task.clientId}`)}>
                <div className="expert-avatar-large initials-avatar">
                  {(task.client_name || task.company_name || 'C').charAt(0).toUpperCase()}
                </div>
                <div className="expert-meta">
                  <div className="expert-bar-name">{task.client_name || task.company_name || task.clientName || 'Client'}</div>
                  <div className="expert-bar-rating">
                    <BriefcaseBusiness size={14} color="#10b981" />
                    <span className="rating-val">Open</span>
                  </div>
                </div>
              </div>

              <DetailCarousel itemId={task.id} images={task.images} title={task.title} />

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
                    <Clock size={16} />
                    <span>{task.duration_days ? `${task.duration_days} days duration` : 'Duration TBD'}</span>
                  </div>
                  <div className="metric">
                    <DollarSign size={16} />
                    <span>{taskStatus}</span>
                  </div>
                </div>

                {canSendProposal ? (
                  <button className="order-btn" type="button" onClick={() => navigate(`/marketplace/task/${task.id}/proposal`)} style={{ marginTop: '1.25rem' }}>
                    <Send size={16} /> Send Proposal
                  </button>
                ) : canModerateTask ? (
                  <div className="admin-service-moderation">
                    <button
                      className="service-moderation-btn approve"
                      type="button"
                      disabled={Boolean(moderationAction)}
                      onClick={() => setModerationConfirmAction('approve')}
                    >
                      <CheckCircle2 size={16} />
                      {moderationAction === 'approved' ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      className="service-moderation-btn reject"
                      type="button"
                      disabled={Boolean(moderationAction)}
                      onClick={() => setModerationConfirmAction('reject')}
                    >
                      <XCircle size={16} />
                      {moderationAction === 'removed' ? 'Removing...' : 'Reject'}
                    </button>
                    {moderationError && <p className="service-moderation-error">{moderationError}</p>}
                  </div>
                ) : canUnpublishTask ? (
                  <div className="admin-service-moderation">
                    <button
                      className="service-moderation-btn unpublish"
                      type="button"
                      disabled={Boolean(moderationAction)}
                      onClick={() => setModerationConfirmAction('unpublish')}
                    >
                      <EyeOff size={16} />
                      {moderationAction === 'removed' ? 'Unpublishing...' : 'Unpublish'}
                    </button>
                    {moderationError && <p className="service-moderation-error">{moderationError}</p>}
                  </div>
                ) : canRepublishTask ? (
                  <div className="admin-service-moderation">
                    <button
                      className="service-moderation-btn approve"
                      type="button"
                      disabled={Boolean(moderationAction)}
                      onClick={() => setModerationConfirmAction('republish')}
                    >
                      <RefreshCcw size={16} />
                      {moderationAction === 'approved' ? 'Publishing...' : 'Publish Again'}
                    </button>
                    {moderationError && <p className="service-moderation-error">{moderationError}</p>}
                  </div>
                ) : taskStatus !== 'open' ? (
                  <div className="proposal-closed-msg">
                    This task is no longer accepting proposals.
                  </div>
                ) : null}

                {(isAdmin || taskStatus !== 'open') && (
                  <div className={`service-status-note status-${taskStatus}`}>
                    Status: <span>{taskStatus}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
      <AdminModerationConfirmModal
        action={moderationConfirmAction}
        contentTitle={task?.title}
        loading={Boolean(moderationAction)}
        onCancel={() => setModerationConfirmAction('')}
        onConfirm={confirmModerationAction}
      />
    </div>
  );
};

export default MarketplaceTaskDetailPage;

