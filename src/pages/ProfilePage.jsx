import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserProfile } from "../Services/profileService";
import { getStoredUser } from "../Services/checkLogin";
import "./ProfilePage.css";

function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUser = getStoredUser();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(""); // "client" or "expert"

  const isOwnProfile = currentUser && currentUser.id === userId;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getUserProfile(userId);
        setProfileData(data);

        // Decide which tab to display first
        if (data.hasExpertProfile && data.hasClientProfile) {
          // Both profiles exist: default to the registered role or expert
          setActiveTab(data.user.role === "expert" ? "expert" : "client");
        } else if (data.hasExpertProfile) {
          setActiveTab("expert");
        } else if (data.hasClientProfile) {
          setActiveTab("client");
        } else {
          // Neither profile is completed yet: default to registered role
          setActiveTab(data.user.role === "expert" ? "expert" : "client");
        }
      } catch (err) {
        setError(err.message || "Failed to load profile details.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const handleBack = () => {
    // Navigate back to dashboard based on role
    if (currentUser) {
      let x = currentUser.role;
      console.log(x);
      navigate("/"+x+"/dashboard");
    } else {
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="profile-container loading-container">
        <div className="spinner"></div>
        <p>Retrieving secure profile...</p>
      </div>
    );
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
    );
  }

  const { user, clientProfile, expertProfile, hasClientProfile, hasExpertProfile } = profileData;

  const renderStars = (rating) => {
    const stars = [];
    const r = rating || 0;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= r ? "star filled" : "star"}>
          ★
        </span>
      );
    }
    return <div className="stars-wrapper">{stars}</div>;
  };

  const getExperienceLabel = (exp) => {
    switch (exp) {
      case "0-1":
        return "0 - 1 year";
      case "1-3":
        return "1 - 3 years";
      case "3-5":
        return "3 - 5 years";
      case "over-5":
        return "Over 5 years";
      default:
        return exp || "Not specified";
    }
  };

  return (
    <div className="profile-page-wrapper">
      <div className="profile-container">
        {/* Navigation Header */}
        <header className="profile-nav-header">
          <button className="back-link-btn" onClick={handleBack}>
            ← Back to Dashboard
          </button>
        </header>

        {/* User Card */}
        <section className="profile-hero-card">
          <div className="avatar-large">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : "?"}
          </div>
          <div className="hero-details">
            <span className="role-tag">{user.role === "expert" ? "Expert" : user.role === "client" ? "Client" : "User"}</span>
            <h1>{user.fullName}</h1>
            <p className="hero-email">{user.email}</p>
            <p className="joined-date">
              Member since {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </section>

        {/* Mini Dashboard Tabs */}
        {(hasClientProfile || hasExpertProfile) ? (
          <section className="mini-dashboard">
            <div className="tabs-header">
              <h2>Select Profile View</h2>
              <div className="tabs-buttons">
                {hasClientProfile && (
                  <button
                    className={`tab-btn ${activeTab === "client" ? "active" : ""}`}
                    onClick={() => setActiveTab("client")}
                  >
                    💼 Client Profile
                  </button>
                )}
                {hasExpertProfile && (
                  <button
                    className={`tab-btn ${activeTab === "expert" ? "active" : ""}`}
                    onClick={() => setActiveTab("expert")}
                  >
                    💡 Expert Profile
                  </button>
                )}
              </div>
            </div>

            {/* Profile Content Body */}
            <div className="profile-content-body">
              {activeTab === "client" && clientProfile && (
                <div className="tab-pane client-pane animate-fade-in">
                  <div className="info-group">
                    <label>Company Name</label>
                    <p className="info-value">{clientProfile.companyName}</p>
                  </div>
                  <div className="info-group">
                    <label>Industry</label>
                    <p className="info-value">{clientProfile.industry}</p>
                  </div>
                  {clientProfile.bio && (
                    <div className="info-group">
                      <label>About Company</label>
                      <p className="info-value text-block">{clientProfile.bio}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "expert" && expertProfile && (
                <div className="tab-pane expert-pane animate-fade-in">
                  <div className="expert-header-row">
                    <div className="info-group">
                      <label>Professional Title</label>
                      <p className="info-value title-value">{expertProfile.professionalTitle}</p>
                    </div>
                    <div className="info-group rating-group">
                      <label>Rating</label>
                      {renderStars(expertProfile.avgRating)}
                    </div>
                  </div>

                  <div className="info-grid">
                    <div className="info-group">
                      <label>Hourly Rate</label>
                      <p className="info-value highlight-value">${expertProfile.hourlyRate} / hr</p>
                    </div>
                    <div className="info-group">
                      <label>Experience Level</label>
                      <p className="info-value">{getExperienceLabel(expertProfile.experience)}</p>
                    </div>
                  </div>

                  {expertProfile.portfolioUrl && (
                    <div className="info-group">
                      <label>Portfolio</label>
                      <p className="info-value">
                        <a
                          href={expertProfile.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="portfolio-link"
                        >
                          {expertProfile.portfolioUrl} ↗
                        </a>
                      </p>
                    </div>
                  )}

                  <div className="info-group">
                    <label>Skills & Specializations</label>
                    <div className="skills-container">
                      {expertProfile.skills.split(",").map((skill, index) => (
                        <span key={index} className="skill-pill">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {expertProfile.bio && (
                    <div className="info-group">
                      <label>Biography</label>
                      <p className="info-value text-block">{expertProfile.bio}</p>
                    </div>
                  )}
                </div>
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
                <button
                  className="primary-btn complete-btn"
                  onClick={() => navigate("/onboarding")}
                >
                  Complete Onboarding Now
                </button>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
