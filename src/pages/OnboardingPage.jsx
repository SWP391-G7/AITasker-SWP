import { useState } from "react";
import RoleSelection from "../Components/onboarding/RoleSelection";
import ClientOnboardingForm from "../Components/onboarding/ClientOnboardingForm";
import ExpertOnboardingForm from "../Components/onboarding/ExpertOnboardingForm";
import "../Components/onboarding/Onboarding.css";

function OnboardingPage() {
  const [selectedRole, setSelectedRole] = useState("");

  const handleBackToRoleSelection = () => {
    setSelectedRole("");
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        {!selectedRole && (
          <RoleSelection onSelectRole={setSelectedRole} />
        )}

        {selectedRole === "client" && (
          <ClientOnboardingForm selectedRole={selectedRole} onBack={handleBackToRoleSelection} />
        )}

        {selectedRole === "expert" && (
          <ExpertOnboardingForm selectedRole={selectedRole} onBack={handleBackToRoleSelection} />
        )}
      </div>
    </div>
  );
}

export default OnboardingPage;