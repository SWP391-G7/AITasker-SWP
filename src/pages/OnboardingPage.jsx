import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import RoleSelection from "../Components/onboarding/RoleSelection";
import ClientOnboardingForm from "../Components/onboarding/ClientOnboardingForm";
import ExpertOnboardingForm from "../Components/onboarding/ExpertOnboardingForm";
import { isLoggedIn } from "../Services/checkLogin";
import { updateUserRole } from "../Services/onboardingService";
import "../Components/onboarding/Onboarding.css";

function OnboardingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRole, setSelectedRole] = useState(() => {
    const stateRole = location.state?.role;
    const paramsRole = new URLSearchParams(location.search).get("role");
    return stateRole || paramsRole || "";
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
    }
  }, [navigate]);

  const handleSelectRole = async (role) => {
    try {
      setError("");
      await updateUserRole(role);
      setSelectedRole(role);
    } catch (err) {
      setError(err.message || "Failed to update role. Please try again.");
    }
  };

  const handleBackToRoleSelection = () => {
    setSelectedRole("");
    setError("");
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        {error && <p className="error-message text-center mb-3" style={{ color: "#ef4444" }}>{error}</p>}

        {!selectedRole && (
          <RoleSelection onSelectRole={handleSelectRole} />
        )}

        {selectedRole === "client" && (
          <ClientOnboardingForm onBack={handleBackToRoleSelection} />
        )}

        {selectedRole === "expert" && (
          <ExpertOnboardingForm onBack={handleBackToRoleSelection} />
        )}
      </div>
    </div>
  );
}

export default OnboardingPage;