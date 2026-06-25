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
import { 
  createProposal, 
  getProposalByJob, 
  updateProposal, 
  deleteProposal 
} from '../Services/proposalService';
import './Style/ServiceDetail.css';
import './Style/ProposalModal.css';

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

  // Proposal states
  const [myProposal, setMyProposal] = useState(null);
  const [fetchingProposal, setFetchingProposal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isExpert = storedUser?.role === 'expert';

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

  useEffect(() => {
    const fetchProposal = async () => {
      if (isExpert && id) {
        try {
          setFetchingProposal(true);
          const data = await getProposalByJob(id);
          if (data && data.proposals && data.proposals.length > 0) {
            setMyProposal(data.proposals[0]);
          } else {
            setMyProposal(null);
          }
        } catch (err) {
          console.error('Failed to fetch proposal details:', err);
        } finally {
          setFetchingProposal(false);
        }
      }
    };

    fetchProposal();
  }, [id, isExpert]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    const errors = {};
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      errors.bidAmount = 'Please enter a valid positive bid amount';
    }
    if (!deliveryDays || parseInt(deliveryDays, 10) <= 0) {
      errors.deliveryDays = 'Please enter a valid positive number of days';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmittingProposal(true);
      const proposalData = {
        job_id: id,
        cover_letter: coverLetter,
        bid_amount: parseFloat(bidAmount),
        delivery_days: parseInt(deliveryDays, 10)
      };

      if (isEditMode && myProposal) {
        const response = await updateProposal(myProposal.id, proposalData);
        setMyProposal(response.proposal);
        alert('Proposal updated successfully!');
      } else {
        const response = await createProposal(proposalData);
        setMyProposal(response.proposal);
        alert('Proposal sent successfully!');
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message || 'Something went wrong while submitting the proposal');
    } finally {
      setSubmittingProposal(false);
    }
  };

  const handleDeleteProposal = async () => {
    if (!myProposal) return;
    if (window.confirm('Are you sure you want to delete this proposal?')) {
      try {
        await deleteProposal(myProposal.id);
        setMyProposal(null);
        alert('Proposal deleted successfully!');
      } catch (err) {
        alert(err.message || 'Failed to delete proposal');
      }
    }
  };

  const clientName = task?.client_name || task?.company_name || task?.clientName || 'Client';
  const requiredSkill = task?.required_skill || task?.requiredSkill || task?.category || 'AI Task';

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
                <img 
                  src="https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200&h=200&fit=crop" 
                  alt={clientName} 
                  className="expert-avatar-large" 
                />
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

                {isExpert && !myProposal && (
                  <button className="order-btn" type="button" onClick={() => {
                    setIsEditMode(false);
                    setCoverLetter('');
                    setBidAmount('');
                    setDeliveryDays('');
                    setFormErrors({});
                    setIsModalOpen(true);
                  }}>
                    <Send size={16} /> Send Proposal
                  </button>
                )}

                <button className="contact-btn" type="button">
                  <MessageSquare size={16} /> Contact Client
                </button>
              </div>

              {isExpert && myProposal && (
                <div className="proposal-display-card glass-card">
                  <h3 className="proposal-display-header">
                    Your Proposal
                  </h3>
                  <div className="proposal-detail-row">
                    <span>Bid Amount:</span>
                    <strong>{formatMoney(myProposal.bid_amount)}</strong>
                  </div>
                  <div className="proposal-detail-row">
                    <span>Delivery:</span>
                    <strong>{myProposal.delivery_days} days</strong>
                  </div>
                  <div className="proposal-detail-row">
                    <span>Status:</span>
                    <span className={`proposal-status-badge ${myProposal.status}`}>
                      {myProposal.status}
                    </span>
                  </div>
                  {myProposal.cover_letter && (
                    <div className="proposal-cover-letter-section">
                      <span className="proposal-cover-letter-title">Cover Letter:</span>
                      <p className="proposal-cover-letter-text">
                        {myProposal.cover_letter}
                      </p>
                    </div>
                  )}
                  <div className="proposal-actions-grid">
                    <button className="proposal-edit-btn" onClick={() => {
                      setIsEditMode(true);
                      setCoverLetter(myProposal.cover_letter || '');
                      setBidAmount(myProposal.bid_amount);
                      setDeliveryDays(myProposal.delivery_days);
                      setFormErrors({});
                      setIsModalOpen(true);
                    }}>
                      Update
                    </button>
                    <button className="proposal-delete-btn" onClick={handleDeleteProposal}>
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="proposal-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="proposal-modal-header">
                <h3>
                  {isEditMode ? 'Update Proposal' : 'Submit Proposal'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="proposal-modal-close-btn"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div className="proposal-form-group">
                  <label className="proposal-form-label">
                    Bid Amount ($)
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={bidAmount} 
                    onChange={(e) => setBidAmount(e.target.value)} 
                    placeholder="e.g. 500" 
                    className="proposal-form-input"
                    required 
                  />
                  {formErrors.bidAmount && (
                    <span className="proposal-form-error">{formErrors.bidAmount}</span>
                  )}
                </div>

                <div className="proposal-form-group">
                  <label className="proposal-form-label">
                    Delivery Time (days)
                  </label>
                  <input 
                    type="number" 
                    value={deliveryDays} 
                    onChange={(e) => setDeliveryDays(e.target.value)} 
                    placeholder="e.g. 7" 
                    className="proposal-form-input"
                    required 
                  />
                  {formErrors.deliveryDays && (
                    <span className="proposal-form-error">{formErrors.deliveryDays}</span>
                  )}
                </div>

                <div className="proposal-form-group">
                  <label className="proposal-form-label">
                    Cover Letter
                  </label>
                  <textarea 
                    value={coverLetter} 
                    onChange={(e) => setCoverLetter(e.target.value)} 
                    placeholder="Explain why you are the best fit for this project..." 
                    rows="5"
                    className="proposal-form-textarea"
                  />
                </div>

                <div className="proposal-form-actions">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="proposal-cancel-btn"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submittingProposal}
                    className="proposal-submit-btn"
                  >
                    {submittingProposal ? 'Submitting...' : isEditMode ? 'Update' : 'Send'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MarketplaceTaskDetailPage;
