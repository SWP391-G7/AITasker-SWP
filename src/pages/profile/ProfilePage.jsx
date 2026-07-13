import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Award,
  Briefcase,
  Building2,
  GraduationCap,
  Mail,
  Send,
  Star,
  BadgeCheck,
} from "lucide-react";
import HeaderCom from "../../Components/Navbar/HeaderCom";
import Footer from "../../Components/Footer/Footer";
import { getUserProfile } from "../../Services/profileService";
import { getStoredUser } from "../../Services/checkLogin";
import { getExpertServicesFromApi } from "../../Components/Profile/Expert/ExpertService";
import { getClientProjectsFromApi } from "../../Components/Profile/Client/ClientProject";
import { getOrCreateConversation } from "../../Services/messageService";
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

  const isOwnProfile = currentUser && currentUser.id === userId
  const currentRole = String(currentUser?.role || "").toLowerCase()

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
  const visibleProfileServices = profileServices.slice(0, 5);
  const visibleProfileProjects = profileProjects.slice(0, 5);
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
                  
                  {!isOwnProfile && (  
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
                    {isExpertView && profileServices.length === 0 && (
                      <p>This expert has not published any services yet.</p>
                    )}
                    {!isExpertView && profileProjects.length === 0 && (
                      <p>This client has not posted any projects yet.</p>
                    )}
                  </div>
                </article>
              </aside>
            </div>
          </>
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
      </main>

      <Footer />
    </div>
  )
}

export default ProfilePage

