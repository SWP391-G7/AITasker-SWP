/**
 * Frontend module: pages/onboarding/OnboardingPage.jsx
 *
 * Vai trò: Page Onboarding Page: màn hình cấp route, điều phối dữ liệu và các component con cho một luồng nghiệp vụ hoàn chỉnh.
 * Luồng chính: Đọc route/location, gọi service trong effect/handler, quản lý loading/error/form rồi truyền props xuống UI con.
 * Lưu ý bảo trì: Giữ side effect trong handler/effect và không mutate trực tiếp state hoặc dữ liệu API.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleSelection from "../../Components/onboarding/RoleSelection";
import ClientOnboardingForm from "../../Components/onboarding/ClientOnboardingForm";
import ExpertOnboardingForm from "../../Components/onboarding/ExpertOnboardingForm";
import { updateUserRole } from "../../Services/onboardingService";
import "../../Components/onboarding/Onboarding.css";

// React component “Onboarding Page” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
function OnboardingPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");
  const [error, setError] = useState("");

  // Handler “handle select role” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleSelectRole = async (role) => {
    try {
      setError("");
      await updateUserRole(role);
      setSelectedRole(role);
    } catch (err) {
      setError(err.message || "Failed to update role. Please try again.");
    }
  };

  // Handler “handle back to role selection” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
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
