import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Award,
  AlertCircle,
  Briefcase,
  Building2,
  Edit2,
  GraduationCap,
  Loader2,
  Mail,
  Send,
  ShieldAlert,
  ShieldCheck,
  Star,
  BadgeCheck,
  Trash2,
  X,
} from "lucide-react";
import HeaderCom from "../../Components/Navbar/HeaderCom";
import Footer from "../../Components/Footer/Footer";
import { getUserProfile } from "../../Services/profileService";
import { getStoredUser } from "../../Services/checkLogin";
import { getExpertServicesFromApi } from "../../Components/Profile/Expert/ExpertService";
import { getClientProjectsFromApi } from "../../Components/Profile/Client/ClientProject";
import { getOrCreateConversation } from "../../Services/messageService";
import {
  adminUpdateUser,
  adminDeleteUser,
  adminDeactivateUser,
} from "../../Services/adminDashboardService";
import "./ProfilePage.css";

function ProfilePage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = getStoredUser()
  const fromLanding = location.state?.fromLanding
  const fromMarketplace = location.state?.fromMarketplace
  const marketplaceTarget = location.state?.marketplaceTarget
  const backLabel = fromLanding ? "Back to Home" : fromMarketplace ? (marketplaceTarget === "clients" ? "Back to Clients List" : "Back to Experts List") : "Back to Profile"

  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("") // "client" or "expert"
  const [showAdminEditModal, setShowAdminEditModal] = useState(false)
  const [adminEditForm, setAdminEditForm] = useState({
    fullName: "",
    email: "",
    role: "client",
    acc_status: true,
  })
  const [adminActionError, setAdminActionError] = useState("")
  const [adminActionLoading, setAdminActionLoading] = useState("")
  const [confirmAction, setConfirmAction] = useState(null)

  const isOwnProfile = currentUser && String(currentUser.id) === String(userId)
  const currentRole = String(currentUser?.role || "").toLowerCase()
  const isAdminViewer = currentRole === "admin"
  const isAdminProfile = String(profileData?.user?.role || currentUser?.role || "").toLowerCase() === "admin"

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError("")
        // API call: lấy toàn bộ profile, services, projects của đúng userId trên URL.
        const data = await getUserProfile(userId)
        setProfileData(data)

        if (data.hasExpertProfile && data.hasClientProfile) {
          // Both profiles exist: default to the registered role or expert
          setActiveTab(data.user.role === "expert" ? "expert" : "client")
        } else if (data.hasExpertProfile) {
          setActiveTab("expert")
        } else if (data.hasClientProfile) {
          setActiveTab("client")
        } else {
          // Neither profile is completed yet: default to registered role
          setActiveTab(data.user.role === "expert" ? "expert" : "client")
        }
      } catch (err) {
        setError(err.message || "Failed to load profile details.")
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchProfile()
    }
  }, [userId])

  const getRoleDashboardPath = (role) => {
    const normalizedRole = String(role || "").toLowerCase();

    if (normalizedRole.includes("admin")) {
      return "/admin/dashboard";
    }

    if (normalizedRole.includes("expert")) {
      return "/expert/dashboard";
    }

    return "/client/dashboard";
  };

  const getMessagesPath = () => {
    const normalizedRole = String(currentUser?.role || "").toLowerCase();
    return normalizedRole.includes("expert") ? "/expert/messages" : "/client/messages";
  };

  const handleBack = () => {
    if (currentUser) {
      navigate(getRoleDashboardPath(currentUser.role));
    } else {
      navigate("/")
    }
  }

  const handleContact = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      const conversation = await getOrCreateConversation(userId);
      const targetPath = getMessagesPath();
      navigate(targetPath, { state: { activeConversationId: conversation.id } });
    } catch (err) {
      console.error("Failed to start conversation:", err);
      navigate(getMessagesPath());
    }
  }

  const handleViewAllProfileItems = () => {
    if (isOwnProfile) {
      navigate(activeTab === "expert" ? "/expert/projects" : "/client/projects");
      return;
    }

    navigate(`/profile/${userId}/${activeTab === "expert" ? "services" : "projects"}`, {
      state: { backgroundLocation: location },
    });
  }

  const refreshProfileData = async () => {
    const data = await getUserProfile(userId)
    setProfileData(data)
  }

  const getProfileRoleValue = (role) => {
    const normalizedRole = String(role || "").toLowerCase()
    if (normalizedRole === "expert") return "expert"
    if (normalizedRole === "admin") return "admin"
    return "client"
  }

  const openAdminEditModal = () => {
    const targetUser = profileData?.user
    if (!targetUser) return

    setAdminEditForm({
      fullName: targetUser.fullName || "",
      email: targetUser.email || "",
      role: getProfileRoleValue(targetUser.role),
      acc_status: targetUser.accStatus !== false,
    })
    setAdminActionError("")
    setShowAdminEditModal(true)
  }

  const handleAdminUpdateUser = async (event) => {
    event.preventDefault()

    try {
      setAdminActionError("")
      setAdminActionLoading("edit")
      await adminUpdateUser(userId, adminEditForm)
      setShowAdminEditModal(false)
      await refreshProfileData()
    } catch (err) {
      setAdminActionError(err.message || "Failed to update user")
    } finally {
      setAdminActionLoading("")
    }
  }

  const handleAdminActivateUser = async () => {
    try {
      setAdminActionError("")
      setAdminActionLoading("activate")
      await adminDeactivateUser(userId, true)
      await refreshProfileData()
    } catch (err) {
      setAdminActionError(err.message || "Failed to activate account")
    } finally {
      setAdminActionLoading("")
    }
  }

  const openAdminConfirm = (type) => {
    setAdminActionError("")
    setConfirmAction(type)
  }

  const closeAdminConfirm = () => {
    if (adminActionLoading) return
    setConfirmAction(null)
    setAdminActionError("")
  }

  const handleAdminConfirmAction = async () => {
    try {
      setAdminActionError("")
      setAdminActionLoading(confirmAction)

      if (confirmAction === "deactivate") {
        await adminDeactivateUser(userId, false)
        setConfirmAction(null)
        await refreshProfileData()
        return
      }

      if (confirmAction === "delete") {
        await adminDeleteUser(userId)
        setConfirmAction(null)
        navigate("/admin/users")
      }
    } catch (err) {
      setAdminActionError(err.message || "Failed to complete action")
    } finally {
      setAdminActionLoading("")
    }
  }

  const getExperienceLabel = (exp) => {
    switch (exp) {
      case "0-1":
        return "0 - 1 year"
      case "1-3":
        return "1 - 3 years"
      case "3-5":
        return "3 - 5 years"
      case "over-5":
        return "Over 5 years"
      default:
        return exp || "Not specified"
    }
  }

  const getSkills = (skills) => {
    if (!skills) {
      return [];
    }

    return skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  };

  const formatDate = (date) => {
    if (!date) {
      return "Recently";
    }

    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (value) => {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
      return "Not specified";
    }

    return amount.toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  };

  const formatHourlyRate = (value) => {
    if (!value) {
      return "Not specified";
    }

    const amount = Number(String(value).replace(/[^0-9.]/g, ""));

    if (!Number.isFinite(amount)) {
      return String(value);
    }

    return `${formatCurrency(amount)}/hr`;
  };

  const getAverageProjectBudget = (project) => {
    const min = Number(project.budgetMin);
    const max = Number(project.budgetMax);

    if (Number.isFinite(min) && Number.isFinite(max)) {
      return (min + max) / 2;
    }

    if (Number.isFinite(min)) {
      return min;
    }

    if (Number.isFinite(max)) {
      return max;
    }

    return null;
  };

  const sumNumbers = (items, getValue) =>
    items.reduce((total, item) => {
      const value = getValue(item);
      return Number.isFinite(value) ? total + value : total;
    }, 0);

  const renderStat = (value, label) => (
    <div className="profile-stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );

  const renderServiceCard = (item) => (
    <article
      className="profile-side-item"
      key={item.id}
      onClick={() => navigate(`/marketplace/service/${item.id}`, { state: { fromProfile: true } })}
      style={{ cursor: 'pointer' }}
    >
      <div className={`profile-side-visual ${item.imageClass}`} />
      <div className="profile-side-item-body">
        <h4>{item.title}</h4>
        <div className="profile-side-meta">
          <span>
            <Star size={12} />
            {item.rating || item.status}
          </span>
          <strong>From {item.price || item.budget}</strong>
        </div>
      </div>
    </article>
  );

  const renderProjectCard = (item) => (
    <article
      className="profile-side-item"
      key={item.id}
      onClick={() => navigate(`/marketplace/task/${item.id}`, { state: { fromProfile: true } })}
      style={{ cursor: 'pointer' }}
    >
      <div className={`profile-side-visual ${item.imageClass}`} />
      <div className="profile-side-item-body">
        <h4>{item.title}</h4>
        <div className="profile-side-meta">
          <span>
            <Briefcase size={12} />
            {item.status}
          </span>
          <strong>{item.budget}</strong>
        </div>
      </div>  
    </article>
  );


  if (loading) {
    return (
      <div className="profile-shell">
        <HeaderCom />
        <main className="profile-container">
          <header className="profile-nav-header">
            <button className="back-link-btn" onClick={() => navigate(-1)}>
              {backLabel}
            </button>
          </header>
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Retrieving secure profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-shell">
        <HeaderCom />
        <main className="profile-container">
          <header className="profile-nav-header">
            <button className="back-link-btn" onClick={() => navigate(-1)}>
              {backLabel}
            </button>
          </header>
          <div className="error-card">
            <h2>Oops! Profile Not Found</h2>
            <p>{error}</p>
            <button className="primary-btn" onClick={() => navigate(-1)}>
              {backLabel}
            </button>
          </div>
        </main>
      </div>
    );
  }

  const { user, clientProfile, expertProfile, hasClientProfile, hasExpertProfile } = profileData;
  
  // If user is suspended, only allow admin to view
  if (user?.status === 'Suspended' && currentUser?.role !== 'admin') {
    return (
      <div className="profile-shell">
        <HeaderCom />
        <main className="profile-container">
          <header className="profile-nav-header">
            <button className="back-link-btn" onClick={() => navigate(-1)}>
              {backLabel}
            </button>
          </header>
          <div className="error-card" style={{ borderColor: '#ef4444' }}>
            <AlertCircle size={48} className="text-danger mb-3" />
            <h2>User Account Suspended</h2>
            <p className="text-muted">This user profile is no longer available because the account has been suspended for violating AITasker's terms of service.</p>
            <button className="primary-btn mt-3" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  const isExpertView = activeTab === "expert";
  const activeProfile = isExpertView ? expertProfile : clientProfile;
  // API data: profile page calls API once, then pushes response lists through Profile helpers.
  const sortedServices = [...(profileData.services || [])].sort((a, b) => {
    const priceA = Number(a.price) || 0;
    const priceB = Number(b.price) || 0;
    return priceB - priceA;
  });
  const profileServices = getExpertServicesFromApi(sortedServices);
  const sortedProjects = [...(profileData.projects || [])].sort((a, b) => {
    const avgBudget = (p) => {
      const min = Number(p.budgetMin);
      const max = Number(p.budgetMax);
      if (Number.isFinite(min) && Number.isFinite(max)) return (min + max) / 2;
      if (Number.isFinite(min)) return min;
      if (Number.isFinite(max)) return max;
      return 0;
    };
    return avgBudget(b) - avgBudget(a);
  });
  const profileProjects = getClientProjectsFromApi(sortedProjects);
  const visibleProfileServices = profileServices.slice(0, 2);
  const visibleProfileProjects = profileProjects.slice(0, 2);
  const hasMoreProfileItems = isExpertView ? profileServices.length > 2 : profileProjects.length > 2;
  const skills = isExpertView ? getSkills(expertProfile?.skills) : [];
  const expertRating = Number(expertProfile?.avgRating);
  const displayRating = Number.isFinite(expertRating) ? expertRating.toFixed(1) : "Not rated";
  const isTopRated = Number.isFinite(expertRating) && expertRating >= 4.8;
  const serviceTotal = sumNumbers(profileData.services || [], (service) => Number(service.price));
  const projectBudgetTotal = sumNumbers(profileData.projects || [], getAverageProjectBudget);
  const averageProjectBudget = profileData.projects?.length
    ? projectBudgetTotal / profileData.projects.length
    : null;
  const openProjectCount = (profileData.projects || []).filter((project) =>
    String(project.status || "").toLowerCase().includes("open")
  ).length;
  const requiredSkills = [
    ...new Set((profileData.projects || []).map((project) => project.requiredSkill).filter(Boolean)),
  ];
  const displayTitle = isExpertView
    ? expertProfile?.professionalTitle || "Professional title not specified"
    : clientProfile?.companyName || "Company not specified";
  const locationText = isExpertView
    ? getExperienceLabel(expertProfile?.experience)
    : clientProfile?.industry || "Industry not specified";
  const aboutText = isExpertView
    ? expertProfile?.bio
    : clientProfile?.bio;
  const targetRole = String(user.role || "").toLowerCase();
  const isTargetAdmin = targetRole === "admin";
  const isTargetSuspended = user.accStatus === false || user.status === "Suspended";
  const showAdminActions = isAdminViewer && !isOwnProfile && !isTargetAdmin;

  return (
    <div className="profile-shell">
      <HeaderCom />

      <main className="profile-container">
        <header className="profile-nav-header">
          <button className="back-link-btn" onClick={() => navigate(-1)}>
            {backLabel}
          </button>
        </header>
        {(hasClientProfile || hasExpertProfile) ? (
          <>
            {hasClientProfile && hasExpertProfile && (
              <section className="profile-view-switch" aria-label="Select profile view">
                <button
                  className={`profile-switch-btn ${activeTab === "client" ? "active" : ""}`}
                  onClick={() => setActiveTab("client")}
                >
                  Client Profile
                </button>
                <button
                  className={`profile-switch-btn ${activeTab === "expert" ? "active" : ""}`}
                  onClick={() => setActiveTab("expert")}
                >
                  Expert Profile
                </button>
              </section>
            )}

            <div className="profile-layout">
              <section className="profile-main-column">
                <article className="profile-hero-card">
                  <div className="avatar-large">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.fullName} className="avatar-large-img" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      user.fullName ? user.fullName.charAt(0).toUpperCase() : "?"
                    )}
                    <span className="avatar-status" />
                  </div>

                  <div className="hero-details">
                    <div className="hero-title-row">
                      <div>
                        <h1>{user.fullName}</h1>
                        <p className="profile-hero-title">{displayTitle}</p>
                      </div>
                      {isExpertView && isTopRated && (
                        <span className="top-rated-badge">
                          <BadgeCheck size={13} />
                          Top Rated
                        </span>
                      )}
                    </div>

                    <p className="hero-location">
                      {isExpertView ? <Briefcase size={14} /> : <Building2 size={14} />}
                      {locationText}
                    </p>

                    <div className="profile-stats-grid">
                      {isExpertView ? (
                        <>
                          {renderStat(displayRating, "Rating")}
                          {renderStat(profileServices.length, "Services")}
                          {renderStat(skills.length, "Skills")}
                        </>
                      ) : (
                        <>
                          {renderStat(profileProjects.length, "Projects Posted")}
                          {renderStat(openProjectCount, "Open Projects")}
                          {renderStat(requiredSkills.length, "Required Skills")}
                        </>
                      )}
                    </div>
                  </div>
                </article>

                <article className="profile-info-card about-card">
                  <h2>{isExpertView ? "About Me" : "About Company"}</h2>
                  <p>
                    {aboutText ||
                      (isExpertView
                        ? "This expert has not added a short bio yet."
                        : "This client has not added a company overview yet.")}
                  </p>

                  {isExpertView && skills.length > 0 && (
                    <div className="skills-block">
                      <h3>Technical Skills</h3>
                      <div className="skills-container">
                        {skills.map((skill, index) => (
                          <span key={`${skill}-${index}`} className="skill-pill">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </article>

                <div className="profile-detail-grid">
                  <article className="profile-info-card compact-card">
                    <h2>
                      {isExpertView ? <GraduationCap size={17} /> : <Building2 size={17} />}
                      {isExpertView ? "Expert Details" : "Company"}
                    </h2>
                    {isExpertView ? (
                      <>
                        <p>Professional Title</p>
                        <span>{expertProfile?.professionalTitle || "Not specified"}</span>
                        <p>Portfolio</p>
                        <span>{expertProfile?.portfolioUrl || "Not specified"}</span>
                        <p>Member since</p>
                        <span>{formatDate(user.createdAt)}</span>
                      </>
                    ) : (
                      <>
                        <p>{clientProfile?.companyName || user.fullName}</p>
                        <span>{clientProfile?.industry || "Not specified"}</span>
                        <p>Member since</p>
                        <span>{formatDate(user.createdAt)}</span>
                      </>
                    )}
                  </article>

                  <article className="profile-info-card compact-card">
                    <h2>
                      {isExpertView ? <Award size={17} /> : <Briefcase size={17} />}
                      {isExpertView ? "Skills & Rating" : "Hiring Details"}
                    </h2>
                    {isExpertView ? (
                      <>
                        <p>Listed Skills</p>
                        <span>{skills.length ? skills.join(", ") : "Not specified"}</span>
                        <p>Profile Rating</p>
                        <span>{displayRating}</span>
                      </>
                    ) : (
                      <>
                        <p>Project Focus</p>
                        <span>{requiredSkills.length ? requiredSkills.join(", ") : "Not specified"}</span>
                        <p>Client Profile</p>
                        <span>{activeProfile ? "Onboarded" : "Pending details"}</span>
                      </>
                    )}
                  </article>
                </div>
              </section>

              <aside className="profile-side-column">
                <article className="profile-contact-card">
                  <div className="availability-row">
                    <span>
                      <i />
                      {user.isVerified ? "Verified Account" : "Unverified Account"}
                    </span>
                    <small>{user.role}</small>
                  </div>
                  
                  {showAdminActions ? (
                    <div className="profile-admin-actions">
                      {adminActionError && <p className="profile-admin-error">{adminActionError}</p>}
                      <button className="profile-admin-action is-edit" type="button" onClick={openAdminEditModal}>
                        <Edit2 size={16} />
                        Edit User
                      </button>
                      {isTargetSuspended ? (
                        <button
                          className="profile-admin-action is-activate"
                          type="button"
                          onClick={handleAdminActivateUser}
                          disabled={adminActionLoading === "activate"}
                        >
                          {adminActionLoading === "activate" ? <Loader2 size={16} /> : <ShieldCheck size={16} />}
                          {adminActionLoading === "activate" ? "Activating..." : "Activate Account"}
                        </button>
                      ) : (
                        <button
                          className="profile-admin-action is-deactivate"
                          type="button"
                          onClick={() => openAdminConfirm("deactivate")}
                        >
                          <ShieldAlert size={16} />
                          Deactivate Account
                        </button>
                      )}
                      <button
                        className="profile-admin-action is-delete"
                        type="button"
                        onClick={() => openAdminConfirm("delete")}
                      >
                        <Trash2 size={16} />
                        Delete User
                      </button>
                    </div>
                  ) : !isOwnProfile && (
                    <button className="contact-btn" onClick={handleContact}>
                      <Mail size={16} />
                      {isExpertView ? "Contact Expert" : "Contact Client"}
                    </button>
                  )}

                  {isOwnProfile ? (
                    <button
                      className="secondary-action-btn"
                      type="button"
                      onClick={handleBack}
                    >
                      <Send size={15} />
                      Go to Dashboard
                    </button>
                  ) : null}

                  <div className="rate-list">
                    <div>
                      <span>{isExpertView ? "Hourly Rate" : "Average Budget"}</span>
                      <strong>
                        {isExpertView
                          ? formatHourlyRate(expertProfile?.hourlyRate)
                          : (Number.isFinite(averageProjectBudget) ? formatCurrency(averageProjectBudget) : "Not specified")}
                      </strong>
                    </div>
                    <div>
                      <span>{isExpertView ? "Listed Service Value" : "Posted Budget Total"}</span>
                      <strong>{formatCurrency(isExpertView ? serviceTotal : projectBudgetTotal)}</strong>
                    </div>
                    {isExpertView && (
                      <div>
                        <span>Experience</span>
                        <strong>{getExperienceLabel(expertProfile?.experience)}</strong>
                      </div>
                    )}
                  </div>
                </article>

                <article className="profile-side-list-card">
                  <h2>{isExpertView ? "Services" : "Projects"}</h2>
                  <div className="profile-side-list">
                    {/* API data: render only the services/projects owned by this profile user. */}
                    {isExpertView && visibleProfileServices.length > 0 && visibleProfileServices.map(renderServiceCard)}
                    {!isExpertView && visibleProfileProjects.length > 0 && visibleProfileProjects.map(renderProjectCard)}
                    {hasMoreProfileItems && <p className="profile-more-indicator">...</p>}
                    {isExpertView && profileServices.length === 0 && (
                      <p>This expert has not published any services yet.</p>
                    )}
                    {!isExpertView && profileProjects.length === 0 && (
                      <p>This client has not posted any projects yet.</p>
                    )}
                  </div>
                  <button className="view-all-btn" type="button" onClick={handleViewAllProfileItems}>
                    {isExpertView ? "View All Services" : "View All Projects"}
                  </button>
                </article>
              </aside>
            </div>
          </>
        ) : isAdminProfile ? (
          <section className="no-profile-card">
            <div className="no-profile-content">
              <h3>Admin Profile</h3>
              <p>
                Admin accounts do not need client or expert onboarding details.
              </p>
              {isOwnProfile && (
                <button className="primary-btn complete-btn" onClick={handleBack}>
                  Go to Admin Dashboard
                </button>
              )}
            </div>
          </section>
        ) : (
          <section className="no-profile-card">
            <div className="no-profile-content">
              <h3>No Profiles Onboarded Yet</h3>
              <p>
                {isOwnProfile
                  ? "You haven't completed onboarding yet. Fill out your details to publish your profile."
                  : "This user hasn't filled out their profile details yet."}
              </p>
              {isOwnProfile && (
                <button className="primary-btn complete-btn" onClick={() => navigate("/onboarding")}>
                  Complete Onboarding Now
                </button>
              )}
            </div>
          </section>
        )}

        {showAdminEditModal && (
          <div className="profile-admin-modal-overlay" onClick={() => setShowAdminEditModal(false)}>
            <div className="profile-admin-modal" onClick={(event) => event.stopPropagation()}>
              <div className="profile-admin-modal-header">
                <h3>Edit User Settings</h3>
                <button type="button" onClick={() => setShowAdminEditModal(false)}>
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleAdminUpdateUser}>
                {adminActionError && <p className="profile-admin-error">{adminActionError}</p>}
                <label>
                  Full Name
                  <input
                    type="text"
                    required
                    value={adminEditForm.fullName}
                    onChange={(event) => setAdminEditForm({ ...adminEditForm, fullName: event.target.value })}
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    required
                    value={adminEditForm.email}
                    onChange={(event) => setAdminEditForm({ ...adminEditForm, email: event.target.value })}
                  />
                </label>
                <label>
                  Role
                  <select
                    value={adminEditForm.role}
                    onChange={(event) => setAdminEditForm({ ...adminEditForm, role: event.target.value })}
                  >
                    <option value="client">Client</option>
                    <option value="expert">AI Expert</option>
                    <option value="admin">Global Admin</option>
                  </select>
                </label>
                <label>
                  Account Status
                  <select
                    value={adminEditForm.acc_status ? "true" : "false"}
                    onChange={(event) => setAdminEditForm({ ...adminEditForm, acc_status: event.target.value === "true" })}
                  >
                    <option value="true">Active</option>
                    <option value="false">Suspended</option>
                  </select>
                </label>
                <div className="profile-admin-modal-actions">
                  <button type="button" className="profile-modal-secondary" onClick={() => setShowAdminEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="profile-modal-primary" disabled={adminActionLoading === "edit"}>
                    {adminActionLoading === "edit" ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {confirmAction && (
          <div className="profile-admin-modal-overlay" onClick={closeAdminConfirm}>
            <div className="profile-admin-modal" onClick={(event) => event.stopPropagation()}>
              <div className="profile-admin-modal-header">
                <h3>{confirmAction === "delete" ? "Delete User" : "Deactivate Account"}</h3>
                <button type="button" onClick={closeAdminConfirm}>
                  <X size={18} />
                </button>
              </div>
              {adminActionError && <p className="profile-admin-error">{adminActionError}</p>}
              <p className="profile-admin-confirm-text">
                {confirmAction === "delete"
                  ? `Are you sure you want to permanently delete ${user.fullName}?`
                  : `Are you sure you want to deactivate ${user.fullName}?`}
              </p>
              <div className="profile-admin-modal-actions">
                <button type="button" className="profile-modal-secondary" onClick={closeAdminConfirm}>
                  Cancel
                </button>
                <button
                  type="button"
                  className={confirmAction === "delete" ? "profile-modal-danger" : "profile-modal-warning"}
                  onClick={handleAdminConfirmAction}
                  disabled={adminActionLoading === confirmAction}
                >
                  {adminActionLoading === confirmAction
                    ? (confirmAction === "delete" ? "Deleting..." : "Deactivating...")
                    : (confirmAction === "delete" ? "Delete" : "Deactivate")}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default ProfilePage

