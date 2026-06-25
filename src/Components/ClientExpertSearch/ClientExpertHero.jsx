const ClientExpertHero = ({ isExpertMode }) => (
  <section className="expert-hero">
    <div>
      <h2>
        {isExpertMode ? "Discover " : "Hire "}
        <span style={{
          background: 'linear-gradient(to right, #60a5fa, #a855f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {isExpertMode ? "Clients" : "World-Class AI Experts"}
        </span>
      </h2>
      <p>
        {isExpertMode
          ? "Browse clients and companies looking for AI specialists, project partners, and technical delivery support."
          : "Connect with machine learning engineers, data scientists, and AI architects to accelerate your innovation."}
      </p>
    </div>
  </section>
);

export default ClientExpertHero;
