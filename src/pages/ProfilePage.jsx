import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Award,
  BadgeCheck,
  Briefcase,
  Building2,
  GraduationCap,
  Mail,
  MapPin,
  Send,
  Star,
} from "lucide-react";
import HeaderCom from "../Components/Navbar/HeaderCom";
import Footer from "../Components/Footer/Footer";
import { getUserProfile } from "../Services/profileService";
import { getStoredUser } from "../Services/checkLogin";
import { expertServices } from "../Components/Profile/Expert/ExpertService";
import { clientProjects } from "../Components/Profile/Client/ClientProject";
import "./ProfilePage.css";

function ProfilePage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const currentUser = getStoredUser()

  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("") // "client" or "expert"

  const isOwnProfile = currentUser && currentUser.id === userId

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError("")
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
      return "/admin-dashboard";
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

  if (loading) {
    return (
      <div className="profile-container loading-container">
        <div className="spinner"></div>
        <p>Retrieving secure profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="profile-container error-container">
        <div className="error-card">
          <h2>Oops! Profile Not Found</h2>
          <p>{error}</p>
          <button className="primary-btn" onClick={handleBack}>
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const { user, clientProfile, expertProfile, hasClientProfile, hasExpertProfile } = profileData

  const renderStars = (rating) => {
    const stars = []
    const r = rating || 0
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= r ? "star filled" : "star"}>
          ★
        </span>
      )
    }
    return <div className="stars-wrapper">{stars}</div>
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

  const renderStat = (value, label) => (
    <div className="profile-stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );

  const renderServiceCard = (item) => (
    <article className="profile-side-item" key={item.id}>
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
    <article className="profile-side-item" key={item.id}>
      <div className={`profile-side-visual ${item.imageClass}`} />
      <div className="profile-side-item-body">
        <h4>{item.title}</h4>
        <div className="profile-side-meta">
          <span>
            <Briefcase size={12} />
            {item.status}
          </span>
          <strong>{item.proposals} proposals</strong>
        </div>
        <p className="project-budget">{item.budget} budget</p>
      </div>
    </article>
  );

  if (loading) {
    return (
      <div className="profile-shell">
        <HeaderCom />
        <main className="profile-container loading-container">
          <div className="spinner"></div>
          <p>Retrieving secure profile...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-shell">
        <HeaderCom />
        <main className="profile-container error-container">
          <div className="error-card">
            <h2>Oops! Profile Not Found</h2>
            <p>{error}</p>
            <button className="primary-btn" onClick={handleBack}>
              Return to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  const { user, clientProfile, expertProfile, hasClientProfile, hasExpertProfile } = profileData;
  const isExpertView = activeTab === "expert";
  const activeProfile = isExpertView ? expertProfile : clientProfile;
  const skills = isExpertView ? getSkills(expertProfile?.skills) : [];
  const displayTitle = isExpertView
    ? expertProfile?.professionalTitle || "AI Expert"
    : clientProfile?.companyName || "Client";
  const locationText = isExpertView
    ? expertProfile?.location || "San Francisco, CA"
    : clientProfile?.industry || "AI Solution Buyer";
  const aboutText = isExpertView
    ? expertProfile?.bio
    : clientProfile?.bio;

  return (
    <div className="profile-shell">
      <HeaderCom />

      <main className="profile-container">
        <header className="profile-nav-header">
          <button className="back-link-btn" onClick={handleBack}>
            Back to Dashboard
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
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : "?"}
                    <span className="avatar-status" />
                  </div>

                  <div className="hero-details">
                    <div className="hero-title-row">
                      <div>
                        <h1>{user.fullName}</h1>
                        <p className="profile-hero-title">{displayTitle}</p>
                      </div>
                      {isExpertView && (
                        <span className="top-rated-badge">
                          <BadgeCheck size={13} />
                          Top Rated
                        </span>
                      )}
                    </div>

                    <p className="hero-location">
                      {isExpertView ? <MapPin size={14} /> : <Building2 size={14} />}
                      {locationText}
                    </p>

                    <div className="profile-stats-grid">
                      {isExpertView ? (
                        <>
                          {renderStat((expertProfile?.avgRating || 5).toFixed ? (expertProfile?.avgRating || 5).toFixed(1) : expertProfile?.avgRating || "5.0", "Rating")}
                          {renderStat("98%", "Job Success")}
                          {renderStat("45+", "Projects Done")}
                        </>
                      ) : (
                        <>
                          {renderStat("12", "Projects Posted")}
                          {renderStat("8", "Hired Experts")}
                          {renderStat("96%", "Payment Rate")}
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
                      {isExpertView ? "Education" : "Company"}
                    </h2>
                    {isExpertView ? (
                      <>
                        <p>M.S. in Computer Science</p>
                        <span>Stanford University, 2018</span>
                        <p>B.S. in Software Engineering</p>
                        <span>UC Berkeley, 2016</span>
                      </>
                    ) : (
                      <>
                        <p>{clientProfile?.companyName || user.fullName}</p>
                        <span>{clientProfile?.industry || "AI and technology operations"}</span>
                        <p>Member since</p>
                        <span>{formatDate(user.createdAt)}</span>
                      </>
                    )}
                  </article>

                  <article className="profile-info-card compact-card">
                    <h2>
                      {isExpertView ? <Award size={17} /> : <Briefcase size={17} />}
                      {isExpertView ? "Certifications" : "Hiring Details"}
                    </h2>
                    {isExpertView ? (
                      <>
                        <p>AWS Certified Machine Learning</p>
                        <span>Specialty, 2023</span>
                        <p>Google Cloud Professional ML</p>
                        <span>Cloud Engineer, 2022</span>
                      </>
                    ) : (
                      <>
                        <p>Project Collaboration</p>
                        <span>Open to AI automation, NLP, and analytics work</span>
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
                      Available Now
                    </span>
                    <small>Responds in &lt; 1hr</small>
                  </div>

                  <button className="contact-btn" onClick={handleContact}>
                    <Mail size={16} />
                    Contact Me
                  </button>

                  <button className="secondary-action-btn" type="button">
                    <Send size={15} />
                    {isExpertView ? "Invite to Job" : "Apply to Project"}
                  </button>

                  <div className="rate-list">
                    <div>
                      <span>{isExpertView ? "Hourly Rate" : "Average Budget"}</span>
                      <strong>{isExpertView ? `$${expertProfile?.hourlyRate || 150}/hr` : "$2,500+"}</strong>
                    </div>
                    <div>
                      <span>{isExpertView ? "Total Earned" : "Total Spent"}</span>
                      <strong>{isExpertView ? "$200k+" : "$75k+"}</strong>
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
                  <h2>{isExpertView ? "My Services" : "My Projects"}</h2>
                  <div className="profile-side-list">
                    {isExpertView
                      ? expertServices.map(renderServiceCard)
                      : clientProjects.map(renderProjectCard)}
                  </div>
                  <button className="view-all-btn" type="button">
                    {isExpertView ? "View All Services" : "View All Projects"}
                  </button>
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
