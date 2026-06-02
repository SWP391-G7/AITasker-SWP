const Dashboard = ({ email, onLogout }) => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow border-0 rounded-4">
            <div className="card-body p-5 text-center">
              <div className="mb-4">
                <div className="display-4 text-primary">
                  <i className="bi bi-speedometer2"></i>
                </div>
              </div>
              <h1 className="fw-bold mb-3">Welcome to Dashboard!</h1>
              <p className="lead text-muted mb-4">
                Hello <span className="text-dark fw-bold">{email}</span>, 
                you have successfully logged into the AI Tasker system.
              </p>
              <div className="row g-3">
                <div className="col-sm-4">
                  <div className="p-3 bg-light rounded-3">
                    <h3 className="fw-bold mb-0">12</h3>
                    <p className="small text-muted mb-0">Tasks Pending</p>
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="p-3 bg-light rounded-3">
                    <h3 className="fw-bold mb-0">5</h3>
                    <p className="small text-muted mb-0">In Progress</p>
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="p-3 bg-light rounded-3">
                    <h3 className="fw-bold mb-0">28</h3>
                    <p className="small text-muted mb-0">Completed</p>
                  </div>
                </div>
              </div>
              <button 
                className="btn btn-outline-danger mt-5 rounded-pill px-4" 
                onClick={onLogout || (() => window.location.reload())}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;