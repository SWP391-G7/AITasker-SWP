import "./Onboarding.css";

function RoleSelection({ onSelectRole }) {
  return (
    <div className="role-selection">
      <h1>Welcome to AITasker</h1>
      <p>Choose your role to personalize your experience.</p>

      <div className="role-cards">
        <button
          type="button"
          className="role-card"
          onClick={() => onSelectRole("client")}
        >
          <div className="role-icon">💼</div>
          <h2>I'm a Client</h2>
          <p>I want to post AI tasks and hire experts for my projects.</p>
        </button>

        <button
          type="button"
          className="role-card"
          onClick={() => onSelectRole("expert")}
        >
          <div className="role-icon">🧠</div>
          <h2>I'm an Expert</h2>
          <p>I want to offer AI services and work on client projects.</p>
        </button>
      </div>
    </div>
  );
}

export default RoleSelection;