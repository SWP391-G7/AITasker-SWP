import { ArrowLeft, Bot, Code2, Eye, MoreHorizontal, Database, Workflow } from "lucide-react";
import ClientSidebar from "../../../Components/Dashboard/Client/ClientSidebar";
import "./ClientMarketplace.css";

const categories = [
  {
    id: "nlp",
    title: "NLP & LLMs",
    icon: Bot,
  },
  {
    id: "vision",
    title: "Computer Vision",
    icon: Eye,
  },
  {
    id: "data",
    title: "Data Science",
    icon: Database,
  },
  {
    id: "automation",
    title: "Automation",
    icon: Workflow,
  },
  {
    id: "integration",
    title: "AI Integration",
    icon: Code2,
  },
  {
    id: "other",
    title: "Other",
    icon: MoreHorizontal,
  },
];

function PostJobPage() {
  return (
    <div className="market-client-layout">
      <ClientSidebar activeTab="post-job" />

      <main className="post-job-main">
        <header className="post-job-header">
          <button className="back-circle">
            <ArrowLeft size={28} />
          </button>

          <div>
            <h1>Post a New Task</h1>
            <p>Connect with elite AI experts to bring your vision to life.</p>
          </div>
        </header>

        <section className="post-stepper">
          <div className="step active">
            <span>1</span>
            <strong>BASICS</strong>
          </div>

          <div className="step-line"></div>

          <div className="step">
            <span>2</span>
            <strong>TECH STACK</strong>
          </div>

          <div className="step-line"></div>

          <div className="step">
            <span>3</span>
            <strong>BUDGET</strong>
          </div>
        </section>

        <section className="post-form-card">
          <div className="form-group">
            <label>PROJECT TITLE</label>
            <input
              type="text"
              placeholder="e.g., Develop a Custom LLM for Legal Research"
            />
            <p>Make it descriptive to attract specialized talent.</p>
          </div>

          <div className="form-group">
            <label>SERVICE CATEGORY</label>

            <div className="category-grid">
              {categories.map(({ id, title, icon: Icon }) => (
                <button className="category-card" key={id}>
                  <Icon size={28} />
                  <span>{title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>PROJECT DESCRIPTION</label>
            <textarea
              placeholder="Outline the problem you're solving, current infrastructure, and desired outcomes..."
            ></textarea>
          </div>
        </section>

        <section className="post-actions">
          <button className="draft-btn">Save as Draft</button>
          <button className="next-btn">Next: Tech Stack</button>
        </section>

        <footer className="market-footer post-footer">
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

export default PostJobPage;