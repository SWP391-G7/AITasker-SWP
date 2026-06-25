import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  FileText,
  Loader2,
  Send,
  X,
} from 'lucide-react';
import { getMarketplaceJobById } from '../Services/serviceService';
import { createProposal } from '../Services/proposalService';
import './Style/ServiceDetail.css';

const parseMoney = (value) => {
  const parsed = Number(String(value || '0').replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatMoney = (value) => `$${parseMoney(value).toLocaleString()}`;

const formatBudget = (task) => {
  const min = parseMoney(task?.budget_min ?? task?.budgetMin);
  const max = parseMoney(task?.budget_max ?? task?.budgetMax ?? task?.budget);

  if (min && max && min !== max) return `${formatMoney(min)} - ${formatMoney(max)}`;
  if (max) return formatMoney(max);
  if (min) return formatMoney(min);
  return 'Budget TBD';
};

const formatDate = (value) => {
  if (!value) return 'No deadline';
  return new Date(value).toLocaleDateString();
};

const MarketplaceProposalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getMarketplaceJobById(id);
        setTask(data);
      } catch (err) {
        setError(err.message || 'Failed to load task summary.');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

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

      setSubmitMessage('Proposal submitted successfully. The client can now review it from their task detail.');
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

  const requiredSkill = task?.required_skill || task?.requiredSkill || 'AI Task';

  const proposalDefaults = useMemo(
    () => ({
      bidAmount: parseMoney(task?.budget_max ?? task?.budgetMax ?? task?.budget) || '',
      deliveryDays: task?.duration_days || task?.durationDays || '',
    }),
    [task]
  );

  return (
    <div className="proposal-page-wrapper">
      <div className="proposal-modal-overlay">
        <section className="proposal-modal-shell" role="dialog" aria-modal="true" aria-labelledby="proposal-title">
          <div className="proposal-modal-header">
            <div className="proposal-hero">
              <span className="detail-tag">Expert Proposal</span>
              <h1 className="detail-title" id="proposal-title">Create a Proposal</h1>
              <p>
                Prepare your offer for the client task. Your proposal will be sent to the client for review.
              </p>
            </div>

            <button className="proposal-close-btn" type="button" onClick={() => navigate(-1)} aria-label="Close proposal popup">
              <X size={20} />
            </button>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <Loader2 className="animate-spin text-primary" size={48} />
              <p className="mt-3 text-muted">Loading task summary...</p>
            </div>
          ) : error ? (
            <div className="error-card">
              <AlertCircle size={48} className="text-danger mb-3" />
              <h3>Failed to Load Task</h3>
              <p className="text-muted">{error}</p>
            </div>
          ) : (
            <div className="proposal-layout">
              <main className="proposal-form-card glass-card">
                <div className="proposal-section-heading">
                  <FileText size={22} />
                  <div>
                    <h2>Proposal Details</h2>
                    <p>Explain how you will solve the task and set your delivery terms.</p>
                  </div>
                </div>

                <form className="proposal-form" onSubmit={handleSubmitProposal}>
                  <label className="proposal-field">
                    <span>Cover Letter</span>
                    <textarea
                      name="coverLetter"
                      rows="8"
                      required
                      placeholder="Introduce yourself, explain your approach, and tell the client why you are a good fit for this task."
                    />
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
                    <textarea
                      name="implementationApproach"
                      rows="5"
                      placeholder="Describe milestones, tools, model strategy, testing plan, and expected deliverables."
                    />
                  </label>

                  <label className="proposal-field">
                    <span>Portfolio or Reference Link</span>
                    <input name="portfolioUrl" type="url" placeholder="https://your-portfolio.com/project" />
                  </label>

                  {submitError && <div className="proposal-status-message error">{submitError}</div>}
                  {submitMessage && <div className="proposal-status-message success">{submitMessage}</div>}

                  <div className="proposal-actions-row">
                    <button className="contact-btn" type="reset" disabled={submitting}>
                      Clear Form
                    </button>
                    <button className="order-btn" type="submit" disabled={submitting}>
                      {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                      {submitting ? 'Submitting...' : 'Submit Proposal'}
                    </button>
                  </div>
                </form>
              </main>

              <aside className="proposal-summary-column">
                <section className="pricing-card glass-card proposal-task-card">
                  <span className="pricing-label">Task Summary</span>
                  <h2>{task?.title || 'Untitled Client Task'}</h2>
                  <p>{task?.description || 'No description provided for this task.'}</p>

                  <div className="proposal-task-meta">
                    <div className="metric">
                      <BriefcaseBusiness size={16} />
                      <span>{String(requiredSkill).toUpperCase()}</span>
                    </div>
                    <div className="metric">
                      <DollarSign size={16} />
                      <span>{formatBudget(task)}</span>
                    </div>
                    <div className="metric">
                      <CalendarDays size={16} />
                      <span>{formatDate(task?.deadline)}</span>
                    </div>
                    <div className="metric">
                      <Clock size={16} />
                      <span>{task?.duration_days ? `${task.duration_days} days` : 'Duration TBD'}</span>
                    </div>
                  </div>
                </section>

                <section className="glass-card proposal-checklist-card">
                  <h3>Before Submitting</h3>
                  <div>
                    <span><CheckCircle2 size={16} /> Clear scope and deliverables</span>
                    <span><CheckCircle2 size={16} /> Realistic timeline</span>
                    <span><CheckCircle2 size={16} /> Budget matches task complexity</span>
                  </div>
                </section>
              </aside>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MarketplaceProposalPage;