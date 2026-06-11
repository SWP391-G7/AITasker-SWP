import ClientSidebar from "../../../Components/Dashboard/Client/ClientSidebar";
import "./ClientMarketplace.css";

const projects = [
  {
    id: "#AI-9021",
    priority: "CRITICAL",
    title: "Enterprise LLM Fine-tuning for Legal Analysis",
    expert: "Dr. Julian V.",
    milestone: "Validation Dataset Export",
    deadline: "Oct 24, 2024",
    progress: 75,
  },
  {
    id: "#AI-4432",
    priority: "STANDARD",
    title: "Auto-documentation for Legacy Codebase",
    expert: "Nexus Dev Labs",
    milestone: "Function Mapping",
    deadline: "Oct 30, 2024",
    progress: 45,
  },
];

function ClientProjectsPage() {
  return (
    <div className="market-client-layout">
      <ClientSidebar activeTab="projects" />

      <main className="market-main">
        <header className="market-topbar">
          <div>
            <h1>My Projects</h1>
          </div>

          <input
            className="market-search"
            placeholder="Filter projects..."
          />

          <div className="market-icons">
            <span>🔔</span>
            <span>✉️</span>
            <span className="market-avatar">A</span>
          </div>
        </header>

        <section className="project-stats">
          <div className="project-stat-card">
            <span>ACTIVE TASKS</span>
            <strong>12</strong>
            <em>↗ +2</em>
          </div>

          <div className="project-stat-card">
            <span>IN REVIEW</span>
            <strong>04</strong>
            <em>Pending</em>
          </div>

          <div className="project-stat-card">
            <span>COMPLETED</span>
            <strong>89</strong>
            <em>98% Success</em>
          </div>

          <div className="project-stat-card">
            <span>TOTAL SPEND</span>
            <strong>$14.2k</strong>
            <em>USD</em>
          </div>
        </section>

        <nav className="project-tabs">
          <button className="active">Active Projects (4)</button>
          <button>Past Projects</button>
          <button>Drafts</button>
          <button>Archived</button>
        </nav>

        <section className="project-grid">
          <article className="project-large-card">
            <div className="project-card-head">
              <span className="badge critical">CRITICAL</span>
              <span>ID: {projects[0].id}</span>
              <button>⋮</button>
            </div>

            <h2>{projects[0].title}</h2>

            <div className="project-info-row">
              <div>
                <span>Assigned Expert</span>
                <strong>{projects[0].expert}</strong>
              </div>

              <div>
                <span>Next Milestone</span>
                <strong className="green">{projects[0].milestone}</strong>
              </div>

              <div>
                <span>Deadline</span>
                <strong>{projects[0].deadline}</strong>
              </div>
            </div>

            <div className="progress-block">
              <div>
                <span>Overall Progress</span>
                <strong>{projects[0].progress}%</strong>
              </div>

              <div className="progress-line">
                <div style={{ width: `${projects[0].progress}%` }}></div>
              </div>
            </div>

            <div className="project-actions">
              <div className="tiny-avatars">
                <span>👩</span>
                <span>👨</span>
                <span>+2</span>
              </div>

              <button className="ghost-btn">View Details</button>
              <button className="blue-btn">Chat with Expert</button>
            </div>
          </article>

          <article className="project-small-card">
            <span className="badge green-badge">ON TRACK</span>
            <h2>Neural Voice Synthesis for App UI</h2>
            <p>Creating a custom emotional voice model for our mobile...</p>

            <div className="progress-line small">
              <div style={{ width: "42%" }}></div>
            </div>

            <div className="small-card-footer">
              <span>Sarah K.</span>
              <span>Due in 4d</span>
            </div>
          </article>

          <article className="project-small-card">
            <span className="badge">QA PHASE</span>
            <h2>Predictive Churn Model v2</h2>
            <p>Optimizing the existing churn prediction algorithm with new...</p>

            <div className="progress-line small">
              <div style={{ width: "85%" }}></div>
            </div>

            <div className="small-card-footer">
              <span>Marcus T.</span>
              <span>Due Today</span>
            </div>
          </article>

          <article className="project-wide-card">
            <div>
              <span className="badge">STANDARD</span>
              <span>ID: {projects[1].id}</span>
            </div>

            <h2>{projects[1].title}</h2>

            <div className="project-tags">
              <span>AI-Verified Code</span>
              <span>NDA Active</span>
            </div>

            <div className="progress-block">
              <div>
                <span>Milestone 2/5: Function Mapping</span>
                <strong>{projects[1].progress}%</strong>
              </div>

              <div className="progress-line">
                <div style={{ width: `${projects[1].progress}%` }}></div>
              </div>
            </div>

            <button className="review-btn">REVIEW FILES</button>
          </article>
        </section>

        <footer className="market-footer">
          <div>
            <strong>AITasker</strong>
            <p>© 2024 AITasker. All rights reserved.</p>
          </div>

          <div>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Help Center</span>
            <span>API Documentation</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default ClientProjectsPage;