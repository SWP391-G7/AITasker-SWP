import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  DollarSign,
  Info,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  CreditCard
} from 'lucide-react';
import ClientSidebar from '../Components/Dashboard/Client/ClientSidebar';
import ExpertSidebar from '../Components/Dashboard/Expert/ExpertSidebar';
import Footer from '../Components/Footer/Footer';
import {
  getProjectById,
  closeProject,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  payMilestone
} from '../Services/projectService';
import './DashboardPage/Client/ClientMarketplace.css';

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    content: '',
    amount: '',
    due_date: ''
  });

  // User details
  const user = useMemo(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return null;
      const parsed = JSON.parse(storedUser);
      return parsed;
    } catch {
      return null;
    }
  }, []);

  const role = useMemo(() => {
    if (!user) return null;
    return user.role || (user.user && user.user.role) || (user.user && user.user.user && user.user.user.role);
  }, [user]);

  const userId = useMemo(() => {
    if (!user) return null;
    return user.id || (user.user && user.user.id) || (user.user && user.user.user && user.user.user.id);
  }, [user]);

  const fetchProjectData = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError('');
      const data = await getProjectById(projectId);
      setProject(data.project);
      setMilestones(data.milestones || []);
    } catch (err) {
      setError(err.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const handleCloseProject = async () => {
    const ok = window.confirm('Are you sure you want to close this project? This will mark it as abandoned and it will no longer be available.');
    if (!ok) return;

    try {
      setLoading(true);
      await closeProject(projectId);
      await fetchProjectData();
    } catch (err) {
      setError(err.message || 'Failed to close project');
      setLoading(false);
    }
  };

  const handleOpenCreateMilestone = () => {
    setModalMode('create');
    setMilestoneForm({ title: '', content: '', amount: '', due_date: '' });
    setShowMilestoneModal(true);
  };

  const handleOpenEditMilestone = (milestone) => {
    setModalMode('edit');
    setSelectedMilestone(milestone);
    setMilestoneForm({
      title: milestone.title || '',
      content: milestone.content || '',
      amount: milestone.amount || '',
      due_date: milestone.due_date ? new Date(milestone.due_date).toISOString().split('T')[0] : ''
    });
    setShowMilestoneModal(true);
  };

  const handleMilestoneFormSubmit = async (e) => {
    e.preventDefault();
    if (!milestoneForm.title.trim() || !milestoneForm.amount) {
      alert('Title and Amount are required.');
      return;
    }

    try {
      setLoading(true);
      if (modalMode === 'create') {
        await createMilestone(projectId, milestoneForm);
      } else {
        await updateMilestone(selectedMilestone.id, milestoneForm);
      }
      setShowMilestoneModal(false);
      await fetchProjectData();
    } catch (err) {
      setError(err.message || 'Failed to save milestone.');
      setLoading(false);
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    const ok = window.confirm('Are you sure you want to delete this milestone?');
    if (!ok) return;

    try {
      setLoading(true);
      await deleteMilestone(milestoneId);
      await fetchProjectData();
    } catch (err) {
      setError(err.message || 'Failed to delete milestone.');
      setLoading(false);
    }
  };

  const handlePayMilestone = async (milestoneId) => {
    const ok = window.confirm('Do you want to process payment for this milestone?');
    if (!ok) return;

    try {
      setLoading(true);
      const res = await payMilestone(milestoneId);
      if (res.projectCompleted) {
        alert('Payment processed successfully. All milestones have been finished, the project is now completed!');
      } else {
        alert('Payment processed successfully.');
      }
      await fetchProjectData();
    } catch (err) {
      setError(err.message || 'Failed to process payment.');
      setLoading(false);
    }
  };

  const formatProjectDate = (dateVal) => {
    if (!dateVal) return 'Ongoing';
    return new Date(dateVal).toLocaleDateString();
  };

  const totalPaid = useMemo(() => {
    return milestones
      .filter((m) => m.status === 'released')
      .reduce((sum, m) => sum + parseFloat(m.amount), 0);
  }, [milestones]);

  const progressPercent = useMemo(() => {
    if (milestones.length === 0) return 0;
    const releasedCount = milestones.filter((m) => m.status === 'released').length;
    return Math.round((releasedCount / milestones.length) * 100);
  }, [milestones]);

  const handleBack = () => {
    if (role === 'client') {
      navigate('/client/projects');
    } else {
      navigate('/expert/projects');
    }
  };

  if (loading && !project) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#070c14', color: '#fff' }}>
        <h3>Loading project details...</h3>
      </div>
    );
  }

  // Check if project status is abandoned (terminated)
  const isAbandoned = project && project.status === 'terminated';

  return (
    <div className="market-client-layout">
      {role === 'client' ? (
        <ClientSidebar activeTab="projects" />
      ) : (
        <ExpertSidebar activeTab="projects" />
      )}

      <main className="post-job-main">
        <header className="post-job-header" style={{ marginBottom: '24px' }}>
          <button type="button" className="back-circle" onClick={handleBack} style={{ cursor: 'pointer' }}>
            <ArrowLeft size={26} />
          </button>
          <div>
            <h1>Project Detail</h1>
            <p>Track progress, milestones, and release payments.</p>
          </div>
        </header>

        {error && <div className="alert alert-danger" style={{ marginBottom: '24px' }}>{error}</div>}

        {isAbandoned ? (
          <section className="post-form-card" style={{ textAlign: 'center', padding: '60px 40px', background: '#0b1220', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <AlertTriangle size={64} style={{ color: '#ef4444', marginBottom: '20px' }} />
            <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '700', marginBottom: '12px' }}>Project is no longer available</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto 30px auto' }}>
              This project contract has been abandoned or closed by the client.
            </p>
            <button className="next-btn" type="button" onClick={handleBack} style={{ cursor: 'pointer' }}>
              Return to Projects
            </button>
          </section>
        ) : (
          project && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* PROJECT INFO CARD */}
              <section className="post-form-card" style={{ background: '#0b1220', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h2 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: '700', margin: 0 }}>{project.title || "Project Contract"}</h2>
                      <span className={`project-status ${project.status}`} style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '12px' }}>
                        {project.status}
                      </span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>{project.description || "No description provided."}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    {role === 'client' && project.status === 'active' && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        style={{ border: '1px solid #ff4d4f', color: '#ff4d4f', background: 'transparent', borderRadius: '8px', padding: '10px 16px', fontWeight: '600', cursor: 'pointer' }}
                        onClick={handleCloseProject}
                      >
                        Abandon Project
                      </button>
                    )}
                    {role === 'expert' && project.status === 'active' && (
                      <button
                        className="btn btn-sm btn-primary"
                        style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 16px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={handleOpenCreateMilestone}
                      >
                        <Plus size={16} />
                        Add Milestone
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>CLIENT</span>
                    <strong style={{ color: '#fff', fontSize: '1rem' }}>{project.client_name || "Client"}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>{project.client_email}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>EXPERT</span>
                    <strong style={{ color: '#fff', fontSize: '1rem' }}>{project.expert_name || "AI Expert"}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>{project.expert_email}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>TOTAL BUDGET</span>
                    <strong style={{ color: '#fff', fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}>
                      <DollarSign size={18} style={{ color: '#10b981' }} />
                      {parseFloat(project.total_amount).toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>TIMELINE</span>
                    <span style={{ color: '#fff', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CalendarDays size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
                      {formatProjectDate(project.start_date)} - {formatProjectDate(project.end_date)}
                    </span>
                  </div>
                </div>

                <div className="client-project-progress" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>Milestone Progress</span>
                    <strong style={{ color: '#fff' }}>{progressPercent}% ({milestones.filter(m => m.status === 'released').length}/{milestones.length} Paid)</strong>
                  </div>
                  <div className="progress-line" style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${progressPercent}%`, height: '100%', background: '#10b981', transition: 'width 0.3s' }}></div>
                  </div>
                </div>
              </section>

              {/* MILESTONES TABLE/LIST */}
              <section className="post-form-card" style={{ background: '#0b1220', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '600', marginBottom: '20px' }}>Milestone Breakdown</h3>

                {milestones.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.4)' }}>
                    <Info size={36} style={{ opacity: 0.2, marginBottom: '12px' }} />
                    <h4 style={{ color: '#fff', marginBottom: '8px' }}>No Milestones Defined</h4>
                    <p style={{ fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
                      {role === 'expert' ? 'Define deliverables and split the total budget into milestones to begin.' : 'Wait for the expert to create payment milestones.'}
                    </p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'rgba(255,255,255,0.8)' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                          <th style={{ padding: '12px 16px' }}>Milestone</th>
                          <th style={{ padding: '12px 16px' }}>Deliverables</th>
                          <th style={{ padding: '12px 16px' }}>Amount</th>
                          <th style={{ padding: '12px 16px' }}>Due Date</th>
                          <th style={{ padding: '12px 16px' }}>Status</th>
                          <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {milestones.map((m) => (
                          <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '20px 16px', fontWeight: '600', color: '#fff' }}>{m.title}</td>
                            <td style={{ padding: '20px 16px', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', maxWidth: '300px' }}>
                              {m.content || "No deliverable description."}
                            </td>
                            <td style={{ padding: '20px 16px', fontWeight: '600', color: '#fff' }}>${parseFloat(m.amount).toLocaleString()}</td>
                            <td style={{ padding: '20px 16px', fontSize: '0.9rem' }}>
                              {m.due_date ? new Date(m.due_date).toLocaleDateString() : 'No due date'}
                            </td>
                            <td style={{ padding: '20px 16px' }}>
                              <span className={`project-status ${m.status}`} style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px' }}>
                                {m.status}
                              </span>
                            </td>
                            <td style={{ padding: '20px 16px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                {role === 'client' && m.status === 'pending' && project.status === 'active' && (
                                  <button
                                    onClick={() => handlePayMilestone(m.id)}
                                    style={{
                                      backgroundColor: '#10b981',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '6px 12px',
                                      fontSize: '0.85rem',
                                      fontWeight: '600',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <CreditCard size={14} />
                                    Pay
                                  </button>
                                )}

                                {role === 'expert' && m.status === 'pending' && project.status === 'active' && (
                                  <>
                                    <button
                                      onClick={() => handleOpenEditMilestone(m)}
                                      style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#fff',
                                        borderRadius: '6px',
                                        padding: '6px 8px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteMilestone(m.id)}
                                      style={{
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                        color: '#ef4444',
                                        borderRadius: '6px',
                                        padding: '6px 8px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </>
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

            </div>
          )
        )}

        <Footer variant="dashboard" />
      </main>

      {/* MILESTONE CREATION/EDIT MODAL */}
      {showMilestoneModal && (
        <div className="modal-overlay" onClick={() => setShowMilestoneModal(false)}>
          <div
            className="success-modal proposal-detail-modal"
            style={{
              background: '#0b1220',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              maxWidth: '500px',
              width: '90%',
              textAlign: 'left',
              padding: '30px',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="fw-bold mb-4 text-white" style={{ fontSize: '1.4rem' }}>
              {modalMode === 'create' ? 'Create Milestone' : 'Edit Milestone'}
            </h3>

            <form onSubmit={handleMilestoneFormSubmit}>
              <div className="mb-3">
                <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                  MILESTONE TITLE
                </label>
                <input
                  type="text"
                  placeholder="e.g. Frontend draft UI integration"
                  value={milestoneForm.title}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  required
                />
              </div>

              <div className="mb-3">
                <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                  DELIVERABLE DETAILS
                </label>
                <textarea
                  placeholder="Describe what will be delivered under this milestone..."
                  rows={3}
                  value={milestoneForm.content}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, content: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', resize: 'vertical' }}
                />
              </div>

              <div className="row" style={{ display: 'flex', gap: '15px', marginBottom: '24px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                    AMOUNT ($)
                  </label>
                  <input
                    type="number"
                    placeholder="250"
                    value={milestoneForm.amount}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, amount: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                    DUE DATE
                  </label>
                  <input
                    type="date"
                    value={milestoneForm.due_date}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, due_date: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                  type="button"
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '8px', padding: '8px 16px', fontWeight: '600', cursor: 'pointer' }}
                  onClick={() => setShowMilestoneModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 24px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
