import HeaderCom from '../Components/Navbar/HeaderCom';
import Footer from '../Components/Footer/Footer';

function PageShell({ title, children }) {
  return (
    <>
      <HeaderCom />
      <main style={{
        maxWidth: 800, margin: '80px auto 0', padding: '2rem 1rem 4rem',
        color: '#e2e8f0', lineHeight: 1.8
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', background: 'linear-gradient(to right, #60a5fa, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {title}
        </h1>
        {children}
      </main>
      <Footer />
    </>
  );
}

export function PrivacyPolicy() {
  return (
    <PageShell title="Privacy Policy">
      <p>Your privacy is important to us. This policy outlines how AITasker collects, uses, and protects your personal information when you use our platform.</p>
      <p>We collect information you provide during registration (name, email, role) and usage data (projects, messages, transactions) to facilitate our marketplace services. We do not share your data with third parties except as required by law.</p>
      <p>You may request deletion of your account and associated data at any time by contacting our support team. Data is encrypted in transit and at rest.</p>
      <p>This policy may be updated periodically. Continued use of AITasker after changes constitutes acceptance of the revised policy.</p>
    </PageShell>
  );
}

export function TermsOfService() {
  return (
    <PageShell title="Terms of Service">
      <p>By using AITasker, you agree to these terms. AITasker connects clients seeking AI solutions with expert service providers.</p>
      <p>Clients agree to provide clear project requirements and timely payments. Experts agree to deliver high-quality work within agreed timelines. Both parties agree to communicate respectfully.</p>
      <p>AITasker facilitates transactions but is not responsible for the quality of work delivered. Disputes should first be resolved between parties; AITasker may mediate if necessary.</p>
      <p>Accounts found violating these terms may be suspended or terminated.</p>
    </PageShell>
  );
}

export function HelpCenter() {
  return (
    <PageShell title="Help Center">
      <h2 style={{ marginTop: '1.5rem' }}>Getting Started</h2>
      <p>Create an account, choose your role (Client or Expert), complete your profile, and start exploring the marketplace.</p>
      <h2 style={{ marginTop: '1.5rem' }}>For Clients</h2>
      <p>Post a job describing your AI needs, browse expert services, review proposals, and hire the right expert for your project.</p>
      <h2 style={{ marginTop: '1.5rem' }}>For Experts</h2>
      <p>List your AI services, browse open client tasks, submit proposals, and build your reputation through successful projects.</p>
      <h2 style={{ marginTop: '1.5rem' }}>Payments</h2>
      <p>Payments are processed through our secure platform. Funds are held in escrow and released upon milestone completion.</p>
    </PageShell>
  );
}

export function ApiDocs() {
  return (
    <PageShell title="API Documentation">
      <p>AITasker provides a RESTful API for programmatic access to our platform. Below are the key endpoints:</p>
      <h2 style={{ marginTop: '1.5rem' }}>Authentication</h2>
      <p><code>POST /api/auth/login</code> — Authenticate and receive a JWT token.</p>
      <p><code>POST /api/auth/register</code> — Create a new user account.</p>
      <h2 style={{ marginTop: '1.5rem' }}>Marketplace</h2>
      <p><code>GET /api/search</code> — Search services, jobs, experts, and clients with filters.</p>
      <h2 style={{ marginTop: '1.5rem' }}>Projects</h2>
      <p><code>GET /api/projects/:id</code> — Retrieve project details including milestones.</p>
      <p>Full API documentation is available at the <code>/api-docs</code> endpoint when running the server.</p>
    </PageShell>
  );
}
