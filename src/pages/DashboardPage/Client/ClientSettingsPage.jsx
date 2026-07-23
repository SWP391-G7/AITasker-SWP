/**
 * Frontend module: pages/DashboardPage/Client/ClientSettingsPage.jsx
 *
 * Vai trò: Page Client Settings Page: màn hình cấp route, điều phối dữ liệu và các component con cho một luồng nghiệp vụ hoàn chỉnh.
 * Luồng chính: Đọc route/location, gọi service trong effect/handler, quản lý loading/error/form rồi truyền props xuống UI con.
 * Lưu ý bảo trì: Giữ side effect trong handler/effect và không mutate trực tiếp state hoặc dữ liệu API.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClientSidebar from "../../../Components/Dashboard/Client/ClientSidebar";
import ClientHeader from "../../../Components/Dashboard/Client/ClientHeader";
import Footer from "../../../Components/Footer/Footer";
import { useClientUser } from "../../../Components/Dashboard/Client/user";
import { logout } from "../../../Services/authService";
import { getUserProfile } from "../../../Services/profileService";
import "../Style/AdminDashboardPage.css";
import "./ClientMarketplace.css";

// React component “Client Settings Page” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
function ClientSettingsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(2);
  const [profileData, setProfileData] = useState(null);
  const [profileError, setProfileError] = useState("");
  const user = useClientUser();

  useEffect(() => {
    // Đọc hoặc suy ra dữ liệu cho nghiệp vụ “fetch profile”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        setProfileError("");

        // API data: get current client profile from GET /api/profile/:userId.
        const data = await getUserProfile(user.id);
        setProfileData(data);
      } catch (err) {
        setProfileError(err.message || "Failed to load profile settings.");
      }
    };

    fetchProfile();
  }, [user?.id]);

  // Handler “handle logout” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="market-client-layout">
      <ClientSidebar activeTab="settings" />

      <main className="market-main">
        <ClientHeader
          title="Settings"
          subtitle="This page allows client to update account settings."
          notifications={notifications}
          onClearNotifications={() => setNotifications(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onLogout={handleLogout}
        />

        <section className="client-settings-panel">
          <h2>Account Preferences</h2>
          {profileError ? (
            <p>{profileError}</p>
          ) : (
            <>
              <p>{profileData?.user?.fullName || user?.fullName || "Client User"}</p>
              <p>{profileData?.user?.email || user?.email || "Email not available"}</p>
              <p>{profileData?.clientProfile?.companyName || "Company not specified"}</p>
              <p>{profileData?.clientProfile?.industry || "Industry not specified"}</p>
            </>
          )}
        </section>

        <Footer variant="dashboard" />
      </main>
    </div>
  );
}

export default ClientSettingsPage;

