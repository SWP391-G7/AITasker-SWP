import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CalendarDays, ChevronRight, DollarSign, Layers, UserRound, X } from "lucide-react";
import { getUserProfile } from "../../Services/profileService";
import { getStoredUser } from "../../Services/checkLogin";
import { getClientProjectsFromApi } from "../../Components/Profile/Client/ClientProject";
import "./ProfilePage.css";
import "./ViewAllProfileItems.css";

function ViewAllProjectPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getStoredUser();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentRole = String(currentUser?.role || "").toLowerCase();
  const profileRole = String(profileData?.user?.role || "").toLowerCase();
  const isSameRole = currentRole && profileRole && currentRole === profileRole;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError("");

        // API data: load the profile owner and all of their projects from GET /api/profile/:userId.
        const data = await getUserProfile(userId);
        setProfileData(data);
      } catch (err) {
        setError(err.message || "Failed to load projects.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [userId]);

  const closeModal = () => {
    if (location.state?.backgroundLocation) {
      navigate(-1);
      return;
    }

    navigate(`/profile/${userId}`);
  };

  const formatCurrency = (value) => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return value ? String(value) : "Not specified";

    return amount.toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  };

  const formatBudget = (project) => {
    const min = project.budgetMin;
    const max = project.budgetMax;

    if (min && max) return `${formatCurrency(min)} - ${formatCurrency(max)}`;
    if (min) return formatCurrency(min);
    if (max) return formatCurrency(max);
    return "Not specified";
  };

  const handleProjectAction = (projectId) => {
    if (!projectId) return;
    navigate(`/marketplace/task/${projectId}`);
  };

  const projects = getClientProjectsFromApi(profileData?.projects || []);
  const rawProjects = profileData?.projects || [];
  const actionLabel = "View Detail";

  return (
    <div className="view-all-modal-backdrop" role="dialog" aria-modal="true">
      <section className="view-all-modal">
        <header className="view-all-modal-header">
          <div>
            <h1>All Projects</h1>
            <p>{profileData?.user?.fullName || "Client"} posted projects</p>
          </div>

          <button className="view-all-close-btn" type="button" onClick={closeModal} aria-label="Close">
            <X size={20} />
          </button>
        </header>

        <div className="view-all-modal-body">
          {loading && <div className="view-all-state">Loading projects...</div>}
          {error && <div className="view-all-state">{error}</div>}

          {!loading && !error && projects.length === 0 && (
            <div className="view-all-empty">This client has not posted any projects yet.</div>
          )}

          {!loading && !error && projects.length > 0 && (
            <div className="view-all-list">
              {projects.map((project, index) => {
                const rawProject = rawProjects[index] || {};
                const duration = Number(rawProject.durationDays) || 1;
                const progress = String(rawProject.status || "").toLowerCase() === "completed" ? 100 : 0;

                return (
                  <article className="view-all-item-card" key={project.id}>
                    <div className={`view-all-visual ${project.imageClass}`} />

                    <div className="view-all-item-body">
                      <div className="view-all-title-block">
                        <h2>{project.title}</h2>
                        <p>
                          <UserRound size={14} />
                          {profileData?.user?.fullName || "Client"}
                          {rawProject.requiredSkill ? ` (${rawProject.requiredSkill})` : ""}
                        </p>
                      </div>

                      <div className="view-all-inline-meta">
                        <span>
                          <Layers size={15} />
                          Milestone 0/{duration}
                        </span>
                        <span>
                          <CalendarDays size={15} />
                          {rawProject.deadline ? new Date(rawProject.deadline).toLocaleDateString() : "No deadline"}
                        </span>
                        <span>
                          <DollarSign size={15} />
                          {formatBudget(rawProject)}
                        </span>
                      </div>

                      <div className="view-all-progress-wrap">
                        <div className="view-all-progress-label">
                          <span>Progress</span>
                          <strong>{progress}%</strong>
                        </div>
                        <div className="view-all-progress-track">
                          <span style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="view-all-side-actions">
                      <span className="view-all-status-pill">{project.status}</span>
                      <button
                        className="view-all-action-btn"
                        type="button"
                        onClick={() => handleProjectAction(project.id)}
                      >
                        {actionLabel}
                      </button>
                      <ChevronRight size={24} className="view-all-chevron" />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default ViewAllProjectPage;

