import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  FileText,
  Loader2,
  Send,
  X,
} from 'lucide-react';
import Footer from '../Components/Footer/Footer';
import { getMarketplaceJobById } from '../Services/serviceService';
import { createProposal } from '../Services/proposalService';
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



const MarketplaceTaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromProfile = location.state?.fromProfile;
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProposal, setShowProposal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

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

  const proposalDefaults = useMemo(
    () => ({
      bidAmount: parseMoney(task?.budget_max ?? task?.budgetMax ?? task?.budget) || '',
      deliveryDays: task?.duration_days || task?.durationDays || '',
    }),
    [task]
  );

  const handleSubmitProposal = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const coverLetter = String(formData.get('coverLetter') || '').trim();
    const implementationApproach = String(formData.get('implementationApproach') || '').trim();
    const portfolioUrl = String(formData.get('portfolioUrl') || '').trim();
    const bidAmount = formData.get('bidAmount');
    const deliveryDays = formData.get('deliveryDays');

    const combinedCoverLetter = [
      coverLetter,
      implementationApproach ? `Implementation Approach:\n${implementationApproach}` : '',
      portfolioUrl ? `Portfolio / Reference:\n${portfolioUrl}` : '',
    ].filter(Boolean).join('\n\n');

    try {
      setSubmitting(true);
      setSubmitError('');
      setSubmitMessage('');

      await createProposal({
        jobId: id,
        coverLetter: combinedCoverLetter,
        bidAmount: Number(bidAmount),
        deliveryDays: Number(deliveryDays),
      });

      setSubmitMessage('Proposal submitted successfully. The client can now review it.');
      form.reset();
      form.querySelectorAll('input, textarea').forEach((el) => {
        if (el.type !== 'hidden' && el.type !== 'submit' && el.type !== 'reset') el.value = '';
      });
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="service-detail-page-wrapper">
      <div className="service-detail-container">
        <button className="back-btn" type="button" onClick={() => navigate(fromProfile ? -1 : '/marketplace')}>
          <ArrowLeft size={16} /> {fromProfile ? 'Back to Profile' : 'Back to Marketplace'}
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
                    <Clock size={16} />
                    <span>{task.duration_days ? `${task.duration_days} days duration` : 'Duration TBD'}</span>
                  </div>
                  <div className="metric">
                    <DollarSign size={16} />
                    <span>{task.status || 'open'}</span>
                  </div>
                </div>

                {task?.status === 'open' ? (
                  <button className="order-btn" type="button" onClick={() => setShowProposal(true)} style={{ marginTop: '1.25rem' }}>
                    <Send size={16} /> Send Proposal
                  </button>
                ) : (
                  <div className="proposal-closed-msg">
                    This task is no longer accepting proposals.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showProposal && (
        <div className="proposal-overlay" onClick={() => setShowProposal(false)}>
          <div className="proposal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="proposal-modal-header">
              <div className="proposal-modal-header-text">
                <div className="proposal-modal-header-icon">
                  <FileText size={20} />
                </div>
                <div>
                  <h2>Create a Proposal</h2>
                  <p>Explain how you will solve this task</p>
                </div>
              </div>
              <button type="button" className="proposal-close-btn" onClick={() => setShowProposal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="proposal-modal-body">
              <form className="proposal-form" onSubmit={handleSubmitProposal}>
                <label className="proposal-field">
                  <span>Cover Letter</span>
                  <textarea name="coverLetter" rows="6" required placeholder="Introduce yourself, explain your approach, and tell the client why you are a good fit for this task." />
                </label>

                  <div className="proposal-field-grid">
                    <label className="proposal-field">
                      <span>Bid Amount</span>
                      <div className="proposal-input-with-icon">
                        <DollarSign size={18} />
                        <input name="bidAmount" type="number" min="1" step="1" defaultValue={proposalDefaults.bidAmount} placeholder="1200" required />
                        <div className="proposal-input-stepper">
                          <button type="button" tabIndex={-1} onClick={(e) => { const i = e.currentTarget.parentElement.previousElementSibling; i.stepUp(); i.dispatchEvent(new Event('input', { bubbles: true })); }}>
                            <ChevronUp size={14} />
                          </button>
                          <button type="button" tabIndex={-1} onClick={(e) => { const i = e.currentTarget.parentElement.previousElementSibling; i.stepDown(); i.dispatchEvent(new Event('input', { bubbles: true })); }}>
                            <ChevronDown size={14} />
                          </button>
                        </div>
                      </div>
                    </label>

                    <label className="proposal-field">
                      <span>Delivery Days</span>
                      <div className="proposal-input-with-icon">
                        <Clock size={18} />
                        <input name="deliveryDays" type="number" min="1" defaultValue={proposalDefaults.deliveryDays} placeholder="14" required />
                        <div className="proposal-input-stepper">
                          <button type="button" tabIndex={-1} onClick={(e) => { const i = e.currentTarget.parentElement.previousElementSibling; i.stepUp(); i.dispatchEvent(new Event('input', { bubbles: true })); }}>
                            <ChevronUp size={14} />
                          </button>
                          <button type="button" tabIndex={-1} onClick={(e) => { const i = e.currentTarget.parentElement.previousElementSibling; i.stepDown(); i.dispatchEvent(new Event('input', { bubbles: true })); }}>
                            <ChevronDown size={14} />
                          </button>
                        </div>
                      </div>
                    </label>
                  </div>

                <label className="proposal-field">
                  <span>Implementation Approach</span>
                  <textarea name="implementationApproach" rows="4" placeholder="Describe milestones, tools, model strategy, testing plan, and expected deliverables." />
                </label>

                <label className="proposal-field">
                  <span>Portfolio or Reference Link</span>
                  <input name="portfolioUrl" type="url" placeholder="https://your-portfolio.com/project" />
                </label>

                {submitError && <div className="proposal-status-message error">{submitError}</div>}
                {submitMessage && <div className="proposal-status-message success">{submitMessage}</div>}

                <div className="proposal-actions-row">
                  <button className="contact-btn" type="reset" disabled={submitting}>Clear Form</button>
                  <button className="order-btn" type="submit" disabled={submitting}>
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                    {submitting ? 'Submitting...' : 'Submit Proposal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MarketplaceTaskDetailPage;
