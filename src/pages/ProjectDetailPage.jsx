import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  DollarSign,
  BriefcaseBusiness,
  PlusCircle,
  XCircle,
  CreditCard,
  Trash2,
  Edit,
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import ClientSidebar from '../Components/Dashboard/Client/ClientSidebar';
import ExpertSidebar from '../Components/Dashboard/Expert/ExpertSidebar';
import Footer from '../Components/Footer/Footer';
import {
  getProjectById,
  closeProject,
  getMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  payMilestone
} from '../Services/projectService';
import { createHandleLogout } from './DashboardPage/Expert/handleLogout';
import './DashboardPage/Client/ClientMarketplace.css';
import '../pages/Style/AdminDashboardPage.css';

function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  // Form states
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneContent, setMilestoneContent] = useState('');
  const [milestoneAmount, setMilestoneAmount] = useState('');
  const [milestoneDueDate, setMilestoneDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const user = useMemo(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const role = user?.role || 'client';
  const handleLogout = createHandleLogout(navigate);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const [projData, mileData] = await Promise.all([
        getProjectById(projectId),
        getMilestones(projectId)
      ]);
      setProject(projData);
      setMilestones(mileData);
    } catch (err) {
      setError(err.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  const handleCloseProject = async () => {
    const ok = window.confirm("Are you sure you want to abandon/close this project? This action is irreversible.");
    if (!ok) return;

    try {
      setLoading(true);
      await closeProject(projectId);
      alert("Project closed successfully.");
      await fetchProjectDetails();
    } catch (err) {
      setError(err.message || "Failed to close project.");
      setLoading(false);
    }
  };

  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    if (!milestoneTitle || !milestoneAmount) {
      alert("Title and Amount are required.");
      return;
    }

    try {
      setSubmitting(true);
      await createMilestone(projectId, {
        title: milestoneTitle,
        content: milestoneContent,
        amount: parseFloat(milestoneAmount),
        due_date: milestoneDueDate || null
      });
      alert("Milestone created successfully.");
      setShowCreateModal(false);
      
      // Clear forms
      setMilestoneTitle('');
      setMilestoneContent('');
      setMilestoneAmount('');
      setMilestoneDueDate('');

      // Refresh list
      const updated = await getMilestones(projectId);
      setMilestones(updated);
    } catch (err) {
      alert(err.message || "Failed to create milestone.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditModal = (milestone) => {
    setSelectedMilestone(milestone);
    setMilestoneTitle(milestone.title);
    setMilestoneContent(milestone.content || '');
    setMilestoneAmount(milestone.amount);
    setMilestoneDueDate(milestone.due_date ? new Date(milestone.due_date).toISOString().split('T')[0] : '');
    setShowEditModal(true);
  };

  const handleEditMilestone = async (e) => {
    e.preventDefault();
    if (!selectedMilestone) return;

    try {
      setSubmitting(true);
      await updateMilestone(selectedMilestone.id, {
        title: milestoneTitle,
        content: milestoneContent,
        amount: parseFloat(milestoneAmount),
        due_date: milestoneDueDate || null
      });
      alert("Milestone updated successfully.");
      setShowEditModal(false);

      // Clear forms
      setMilestoneTitle('');
      setMilestoneContent('');
      setMilestoneAmount('');
      setMilestoneDueDate('');
      setSelectedMilestone(null);

      // Refresh list
      const updated = await getMilestones(projectId);
      setMilestones(updated);
    } catch (err) {
      alert(err.message || "Failed to update milestone.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    const ok = window.confirm("Are you sure you want to delete this milestone?");
    if (!ok) return;

    try {
      await deleteMilestone(milestoneId);
      alert("Milestone deleted successfully.");
      const updated = await getMilestones(projectId);
      setMilestones(updated);
    } catch (err) {
      alert(err.message || "Failed to delete milestone.");
    }
  };

  const handlePayMilestone = async (milestoneId) => {
    const ok = window.confirm("Do you want to start payment for this milestone?");
    if (!ok) return;

    try {
      setLoading(true);
      const res = await payMilestone(milestoneId);
      alert("Payment successful!");
      if (res.projectCompleted) {
        alert("All milestones completed! The project is now marked as Completed.");
      }
      await fetchProjectDetails();
    } catch (err) {
      alert(err.message || "Failed to process payment.");
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (role === 'client') {
      navigate('/client/projects');
    } else {
      navigate('/expert/projects');
    }
  };

  const formatDateTime = (val) => {
    if (!val) return 'N/A';
    return new Date(val).toLocaleDateString();
  };

  const totalMilestonesAmount = useMemo(() => {
    return milestones.reduce((sum, m) => sum + parseFloat(m.amount), 0);
  }, [milestones]);

  const paidMilestonesAmount = useMemo(() => {
    return milestones
      .filter((m) => m.status === 'released')
      .reduce((sum, m) => sum + parseFloat(m.amount), 0);
  }, [milestones]);

  const progressPercent = useMemo(() => {
    if (milestones.length === 0) return 0;
    const releasedCount = milestones.filter((m) => m.status === 'released').length;
    return Math.round((releasedCount / milestones.length) * 100);
  }, [milestones]);

  return (
    <div className="market-client-layout">
      {role === 'client' ? (
        <ClientSidebar activeTab="projects" />
      ) : (
        <ExpertSidebar activeTab="projects" onTabChange={(id) => navigate(`/expert/${id}`)} onLogout={handleLogout} />
      )}

      <main className="post-job-main">
        <header className="post-job-header">
          <button type="button" className="back-circle" onClick={handleBack}>
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1>Project Workspace</h1>
            <p>Track progress, manage milestones, and payments.</p>
          </div>
        </header>

        {loading && (
          <div className="alert alert-success d-flex align-items-center gap-2">
            <Loader2 className="animate-spin" size={16} /> Loading project details...
          </div>
        )}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && project && (
          <>
            {project.status === 'terminated' ? (
              <section className="post-form-card" style={{ textAlign: 'center', padding: '50px 20px', color: '#ff4d4f' }}>
                <XCircle size={56} style={{ marginBottom: '15px' }} />
                <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '10px' }}>Project is no longer available</h2>
                <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
                  This project contract has been closed/abandoned by the client and is no longer active.
                </p>
              </section>
            ) : (
              <>
                <section className="task-detail-grid">
                  
                  {/* Left Column: Project Overview */}
                  <article className="post-form-card task-detail-card" style={{ flex: 2 }}>
                    <div className="task-detail-header">
                      <div>
                        <span className={`project-status ${project.status === 'completed' ? 'accepted-status' : 'active-status'}`}>
                          {project.status}
                        </span>
                        <h2 style={{ fontSize: '1.6rem', marginTop: '10px' }}>{project.title || "Contract Project"}</h2>
                      </div>
                      
                      {role === 'client' && project.status === 'active' && (
                        <button
                          type="button"
                          className="delete-project-btn"
                          style={{ borderColor: '#ff4d4f', color: '#ff4d4f', padding: '8px 16px', borderRadius: '8px' }}
                          onClick={handleCloseProject}
                        >
                          <XCircle size={16} className="me-1 d-inline" />
                          Abandon Project
                        </button>
                      )}
                    </div>

                    <p className="task-detail-description" style={{ whiteSpace: 'pre-wrap', marginTop: '20px', color: '#cbd5e1' }}>
                      {project.description || "No project description provided."}
                    </p>

                    <hr style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '25px 0' }} />

                    <div className="row" style={{ rowGap: '20px' }}>
                      <div className="col-sm-6">
                        <span className="text-muted small fw-bold d-block mb-1">CLIENT</span>
                        <strong className="text-white">{project.client_name}</strong>
                        <span className="text-muted d-block small">{project.client_email}</span>
                      </div>
                      <div className="col-sm-6">
                        <span className="text-muted small fw-bold d-block mb-1">AI EXPERT</span>
                        <strong className="text-white">{project.expert_name}</strong>
                        <span className="text-muted d-block small">{project.expert_email}</span>
                      </div>
                      <div className="col-sm-6">
                        <span className="text-muted small fw-bold d-block mb-1">START DATE</span>
                        <span className="text-white d-flex align-items-center">
                          <CalendarDays size={16} className="text-primary me-1" />
                          {formatDateTime(project.start_date)}
                        </span>
                      </div>
                      <div className="col-sm-6">
                        <span className="text-muted small fw-bold d-block mb-1">END DATE</span>
                        <span className="text-white d-flex align-items-center">
                          <CalendarDays size={16} className="text-primary me-1" />
                          {formatDateTime(project.end_date)}
                        </span>
                      </div>
                    </div>
                  </article>

                  {/* Right Column: Financial Card */}
                  <aside className="post-form-card task-proposal-summary" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: '280px' }}>
                    <div>
                      <span className="text-muted small fw-bold d-block mb-1">TOTAL CONTRACT VALUE</span>
                      <strong className="text-white d-flex align-items-center mb-4" style={{ fontSize: '2rem' }}>
                        <DollarSign size={28} className="text-success" />
                        {parseFloat(project.total_amount).toLocaleString()}
                      </strong>

                      <div className="mb-4">
                        <span className="text-muted small d-flex justify-content-between mb-1">
                          <span>Milestones Paid</span>
                          <span>${paidMilestonesAmount.toLocaleString()} / ${totalMilestonesAmount.toLocaleString()}</span>
                        </span>
                        <div className="progress-line" style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                          <div style={{ width: `${progressPercent}%`, height: '100%', background: '#4ade80', borderRadius: '4px' }}></div>
                        </div>
                        <span className="text-muted small d-block mt-1 text-end">{progressPercent}% Released</span>
                      </div>
                    </div>

                    {role === 'expert' && project.status === 'active' && (
                      <button
                        className="next-btn w-100 py-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                        type="button"
                        style={{ borderRadius: '10px' }}
                        onClick={() => setShowCreateModal(true)}
                      >
                        <PlusCircle size={18} />
                        Create Milestone
                      </button>
                    )}
                  </aside>
                </section>

                {/* Milestones Panel */}
                <section className="post-form-card" style={{ marginTop: '30px' }}>
                  <div className="projects-toolbar" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px', marginBottom: '20px' }}>
                    <div>
                      <h2 className="projects-title" style={{ fontSize: '1.3rem' }}>Milestones & Deliverables</h2>
                      <p className="projects-subtitle">Manage project phases and secure release funds.</p>
                    </div>
                  </div>

                  {milestones.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8' }}>
                      <AlertTriangle size={36} style={{ marginBottom: '10px', opacity: 0.5 }} />
                      <p style={{ margin: 0, fontSize: '0.95rem' }}>No milestones created yet.</p>
                      {role === 'expert' && (
                        <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem' }}>Click "Create Milestone" to add the first phase of this project.</p>
                      )}
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#94a3b8' }}>
                            <th style={{ padding: '12px 10px' }}>Milestone Title</th>
                            <th style={{ padding: '12px 10px' }}>Content / Notes</th>
                            <th style={{ padding: '12px 10px' }}>Amount</th>
                            <th style={{ padding: '12px 10px' }}>Due Date</th>
                            <th style={{ padding: '12px 10px' }}>Status</th>
                            <th style={{ padding: '12px 10px', textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {milestones.map((m) => (
                            <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                              <td style={{ padding: '15px 10px', color: '#fff', fontWeight: '600' }}>{m.title}</td>
                              <td style={{ padding: '15px 10px', color: '#cbd5e1', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={m.content}>
                                {m.content || 'N/A'}
                              </td>
                              <td style={{ padding: '15px 10px', color: '#cbd5e1', fontWeight: '500' }}>
                                ${parseFloat(m.amount).toLocaleString()}
                              </td>
                              <td style={{ padding: '15px 10px', color: '#cbd5e1' }}>
                                {m.due_date ? formatDateTime(m.due_date) : 'Flexible'}
                              </td>
                              <td style={{ padding: '15px 10px' }}>
                                <span className={`project-status ${m.status === 'released' ? 'accepted-status' : 'pending-status'}`} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                                  {m.status}
                                </span>
                              </td>
                              <td style={{ padding: '15px 10px', textAlign: 'right' }}>
                                <div className="d-inline-flex gap-2">
                                  {role === 'client' && m.status === 'pending' && project.status === 'active' && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-success px-3"
                                      style={{ borderRadius: '6px', fontSize: '0.8rem' }}
                                      onClick={() => handlePayMilestone(m.id)}
                                    >
                                      <CreditCard size={12} className="me-1 d-inline" />
                                      Pay
                                    </button>
                                  )}

                                  {role === 'expert' && m.status === 'pending' && project.status === 'active' && (
                                    <>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-light px-2"
                                        style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                                        onClick={() => handleOpenEditModal(m)}
                                      >
                                        <Edit size={12} />
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger px-2"
                                        style={{ borderRadius: '6px' }}
                                        onClick={() => handleDeleteMilestone(m.id)}
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </>
                                  )}
                                  
                                  {m.status === 'released' && (
                                    <span style={{ color: '#4ade80', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                      <CheckCircle size={14} /> Completed
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </>
            )}
          </>
        )}

        {/* Modal: Create Milestone */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="success-modal" style={{ background: '#0b1220', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', maxWidth: '500px', width: '90%', textAlign: 'left', padding: '30px', borderRadius: '16px' }} onClick={(e) => e.stopPropagation()}>
              <h3 className="mb-4 text-white" style={{ fontSize: '1.25rem' }}>Create Milestone</h3>
              <form onSubmit={handleCreateMilestone}>
                <div className="mb-3">
                  <label className="text-muted small fw-bold mb-1">MILESTONE TITLE</label>
                  <input
                    type="text"
                    required
                    className="form-control bg-dark bg-opacity-25 border-secondary text-white"
                    placeholder="e.g., Deliver RAG pipeline architecture documentation"
                    value={milestoneTitle}
                    onChange={(e) => setMilestoneTitle(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="text-muted small fw-bold mb-1">DESCRIPTION / DELIVERABLE NOTES</label>
                  <textarea
                    rows="3"
                    className="form-control bg-dark bg-opacity-25 border-secondary text-white"
                    placeholder="Detail the deliverables required to release this milestone's funds..."
                    value={milestoneContent}
                    onChange={(e) => setMilestoneContent(e.target.value)}
                  />
                </div>
                <div className="row">
                  <div className="col-6 mb-3">
                    <label className="text-muted small fw-bold mb-1">AMOUNT ($)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.01"
                      className="form-control bg-dark bg-opacity-25 border-secondary text-white"
                      placeholder="100.00"
                      value={milestoneAmount}
                      onChange={(e) => setMilestoneAmount(e.target.value)}
                    />
                  </div>
                  <div className="col-6 mb-3">
                    <label className="text-muted small fw-bold mb-1">DUE DATE (OPTIONAL)</label>
                    <input
                      type="date"
                      className="form-control bg-dark bg-opacity-25 border-secondary text-white"
                      value={milestoneDueDate}
                      onChange={(e) => setMilestoneDueDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="d-flex gap-2 justify-content-end pt-3 border-top border-secondary mt-4">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Milestone'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Milestone */}
        {showEditModal && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="success-modal" style={{ background: '#0b1220', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', maxWidth: '500px', width: '90%', textAlign: 'left', padding: '30px', borderRadius: '16px' }} onClick={(e) => e.stopPropagation()}>
              <h3 className="mb-4 text-white" style={{ fontSize: '1.25rem' }}>Edit Milestone</h3>
              <form onSubmit={handleEditMilestone}>
                <div className="mb-3">
                  <label className="text-muted small fw-bold mb-1">MILESTONE TITLE</label>
                  <input
                    type="text"
                    required
                    className="form-control bg-dark bg-opacity-25 border-secondary text-white"
                    placeholder="e.g., Deliver RAG pipeline architecture documentation"
                    value={milestoneTitle}
                    onChange={(e) => setMilestoneTitle(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="text-muted small fw-bold mb-1">DESCRIPTION / DELIVERABLE NOTES</label>
                  <textarea
                    rows="3"
                    className="form-control bg-dark bg-opacity-25 border-secondary text-white"
                    placeholder="Detail the deliverables required to release this milestone's funds..."
                    value={milestoneContent}
                    onChange={(e) => setMilestoneContent(e.target.value)}
                  />
                </div>
                <div className="row">
                  <div className="col-6 mb-3">
                    <label className="text-muted small fw-bold mb-1">AMOUNT ($)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.01"
                      className="form-control bg-dark bg-opacity-25 border-secondary text-white"
                      placeholder="100.00"
                      value={milestoneAmount}
                      onChange={(e) => setMilestoneAmount(e.target.value)}
                    />
                  </div>
                  <div className="col-6 mb-3">
                    <label className="text-muted small fw-bold mb-1">DUE DATE (OPTIONAL)</label>
                    <input
                      type="date"
                      className="form-control bg-dark bg-opacity-25 border-secondary text-white"
                      value={milestoneDueDate}
                      onChange={(e) => setMilestoneDueDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="d-flex gap-2 justify-content-end pt-3 border-top border-secondary mt-4">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                    {submitting ? 'Updating...' : 'Update Milestone'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <Footer variant="dashboard" />
      </main>
    </div>
  );
}

export default ProjectDetailPage;
