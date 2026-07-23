/**
 * Frontend module: pages/profile/ViewAllServicePage.jsx
 *
 * Vai trò: Page View All Service Page: màn hình cấp route, điều phối dữ liệu và các component con cho một luồng nghiệp vụ hoàn chỉnh.
 * Luồng chính: Đọc route/location, gọi service trong effect/handler, quản lý loading/error/form rồi truyền props xuống UI con.
 * Lưu ý bảo trì: Giữ side effect trong handler/effect và không mutate trực tiếp state hoặc dữ liệu API.
 */
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CalendarDays, ChevronRight, DollarSign, EyeOff, Layers, RefreshCcw, Star, UserRound, X } from "lucide-react";
import { getUserProfile } from "../../Services/profileService";
import { getStoredUser } from "../../Services/checkLogin";
import { getExpertServicesFromApi } from "../../Components/Profile/Expert/ExpertService";
import { updateContentStatus } from "../../Services/adminDashboardService";
import AdminModerationConfirmModal from "../../Components/Dashboard/Admin/AdminModerationConfirmModal";
import "./ProfilePage.css";
import "./ViewAllProfileItems.css";

// React component “View All Service Page” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
function ViewAllServicePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getStoredUser();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [unpublishingId, setUnpublishingId] = useState(null);
  const [unpublishConfirm, setUnpublishConfirm] = useState(null);

  const currentRole = String(currentUser?.role || "").toLowerCase();
  const profileRole = String(profileData?.user?.role || "").toLowerCase();
  const isSameRole = currentRole && profileRole && currentRole === profileRole;
  const isAdminViewer = currentRole.includes("admin");

  useEffect(() => {
    // Đọc hoặc suy ra dữ liệu cho nghiệp vụ “fetch services”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError("");

        // API data: load the profile owner and all of their services from GET /api/profile/:userId.
        const data = await getUserProfile(userId);
        setProfileData(data);
      } catch (err) {
        setError(err.message || "Failed to load services.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [userId]);

  // Handler “close modal” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const closeModal = () => {
    if (location.state?.backgroundLocation) {
      navigate(-1);
      return;
    }

    navigate(`/profile/${userId}`);
  };

  // Chuyển đổi dữ liệu cho “format currency” thành định dạng mà lớp gọi hoặc giao diện cần.
  const formatCurrency = (value) => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return value ? String(value) : "Not specified";

    return amount.toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  };

  // Handler “handle service action” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleServiceAction = (serviceId) => {
    if (!serviceId) return;
    navigate(`/marketplace/service/${serviceId}`);
  };

  // Handler “handle unpublish” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleUnpublish = async (serviceId, action = "unpublish") => {
    const nextStatus = action === "republish" ? "approved" : "removed";
    try {
      setActionError("");
      setUnpublishingId(serviceId);
      await updateContentStatus("service", serviceId, nextStatus);
      setProfileData((current) => ({
        ...current,
        services: (current?.services || []).map((service) =>
          service.id === serviceId ? { ...service, status: nextStatus } : service
        ),
      }));
      setUnpublishConfirm(null);
    } catch (err) {
      setActionError(err.message || "Failed to update service.");
      setUnpublishConfirm(null);
    } finally {
      setUnpublishingId(null);
    }
  };

  const services = getExpertServicesFromApi(profileData?.services || []);
  const rawServices = profileData?.services || [];
  const actionLabel = isSameRole ? "View Detail" : "Purchase";

  return (
    <div className="view-all-modal-backdrop" role="dialog" aria-modal="true">
      <section className="view-all-modal">
        <header className="view-all-modal-header">
          <div>
            <h1>All Services</h1>
            <p>{profileData?.user?.fullName || "Expert"} published services</p>
          </div>

          <button className="view-all-close-btn" type="button" onClick={closeModal} aria-label="Close">
            <X size={20} />
          </button>
        </header>

        <div className="view-all-modal-body">
          {loading && <div className="view-all-state">Loading services...</div>}
          {error && <div className="view-all-state">{error}</div>}
          {actionError && <div className="view-all-action-error">{actionError}</div>}

          {!loading && !error && services.length === 0 && (
            <div className="view-all-empty">This expert has not published any services yet.</div>
          )}

          {!loading && !error && services.length > 0 && (
            <div className="view-all-list">
              {services.map((service, index) => {
                const rawService = rawServices[index] || {};
                const deliveryDays = Number(rawService.deliveryDays) || 1;
                const ratingValue = Number(rawService.avgRating || service.rating) || 0;
                const progress = Math.min(100, Math.round(ratingValue * 20));

                return (
                  <article className="view-all-item-card" key={service.id}>
                    <div className={`view-all-visual ${service.imageClass}`} />

                    <div className="view-all-item-body">
                      <div className="view-all-title-block">
                        <h2>{service.title}</h2>
                        <p>
                          <UserRound size={14} />
                          {profileData?.user?.fullName || "Expert"}
                          {service.category ? ` (${service.category})` : ""}
                        </p>
                      </div>

                      <div className="view-all-inline-meta">
                        <span>
                          <Layers size={15} />
                          Package {rawService.pricingType || "fixed"}
                        </span>
                        <span>
                          <CalendarDays size={15} />
                          {deliveryDays} day{deliveryDays !== 1 ? "s" : ""}
                        </span>
                        <span>
                          <DollarSign size={15} />
                          {formatCurrency(rawService.price)}
                        </span>
                      </div>

                      <div className="view-all-progress-wrap">
                        <div className="view-all-progress-label">
                          <span>Rating</span>
                          <strong>{service.rating}</strong>
                        </div>
                        <div className="view-all-progress-track">
                          <span style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className={`view-all-side-actions ${isAdminViewer ? "has-admin-actions" : ""}`}>
                      <span className="view-all-status-pill">
                        <Star size={13} fill="currentColor" />
                        {service.rating}
                      </span>
                      <button
                        className="view-all-action-btn"
                        type="button"
                        onClick={() => handleServiceAction(service.id)}
                      >
                        {actionLabel}
                      </button>
                      {isAdminViewer && ["approved", "open"].includes(String(rawService.status || "").toLowerCase()) && (
                        <button
                          className="view-all-action-btn is-unpublish"
                          type="button"
                          onClick={() => setUnpublishConfirm({ action: "unpublish", id: service.id, title: service.title })}
                          disabled={unpublishingId === service.id}
                        >
                          <EyeOff size={14} />
                          {unpublishingId === service.id ? "Unpublishing..." : "Unpublish"}
                        </button>
                      )}
                      {isAdminViewer && ["removed", "rejected"].includes(String(rawService.status || "").toLowerCase()) && (
                        <button
                          className="view-all-action-btn is-republish"
                          type="button"
                          onClick={() => setUnpublishConfirm({ action: "republish", id: service.id, title: service.title })}
                          disabled={unpublishingId === service.id}
                        >
                          <RefreshCcw size={14} />
                          {unpublishingId === service.id ? "Publishing..." : "Publish Again"}
                        </button>
                      )}
                      <ChevronRight size={24} className="view-all-chevron" />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <AdminModerationConfirmModal
        action={unpublishConfirm?.action}
        contentTitle={unpublishConfirm?.title}
        loading={unpublishingId === unpublishConfirm?.id}
        onCancel={() => setUnpublishConfirm(null)}
        onConfirm={() => handleUnpublish(unpublishConfirm?.id, unpublishConfirm?.action)}
      />
    </div>
  );
}

export default ViewAllServicePage;

