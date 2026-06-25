import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CalendarDays, ChevronRight, DollarSign, Layers, Star, UserRound, X } from "lucide-react";
import { getUserProfile } from "../Services/profileService";
import { getStoredUser } from "../Services/checkLogin";
import { getExpertServicesFromApi } from "../Components/Profile/Expert/ExpertService";
import "./ProfilePage.css";
import "./ViewAllProfileItems.css";

function ViewAllServicePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getStoredUser();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentRole = String(currentUser?.role || "").toLowerCase();
  const profileRole = String(profileData?.user?.role || "").toLowerCase();
  const isSameRole = currentRole && profileRole && currentRole === profileRole;

  useEffect(() => {
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

  const closeModal = () => {
    if (location.state?.backgroundLocation) {
      navigate(-1);
      return;
    }

    navigate(`/profile/${userId}`);
  };

  const formatCurrency = (value) => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return value ? String(value) : "Not specified";

    return amount.toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  };

  const handleServiceAction = (serviceId) => {
    if (!serviceId) return;
    navigate(`/marketplace/service/${serviceId}`);
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
                    <div className="view-all-side-actions">
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
                      <ChevronRight size={24} className="view-all-chevron" />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default ViewAllServicePage;
