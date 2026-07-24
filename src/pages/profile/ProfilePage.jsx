import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Award,
  AlertCircle,
  Briefcase,
  Building2,
  Edit2,
  EyeOff,
  GraduationCap,
  Loader2,
  Mail,
  RefreshCcw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Star,
  BadgeCheck,
  Camera,
  Trash2,
  X,
} from "lucide-react";
import HeaderCom from "../../Components/Navbar/HeaderCom";
import Footer from "../../Components/Footer/Footer";
import AIExtendButton from "../../Components/AI/AIExtendButton";
import AISkeletonLoader from "../../Components/AI/AISkeletonLoader";
import Toast from "../../Components/Toast";
import AdminModerationConfirmModal from "../../Components/Dashboard/Admin/AdminModerationConfirmModal";
import { getUserProfile, updateOwnAvatar, updateOwnFullName } from "../../Services/profileService";
import { submitClientOnboarding, submitExpertOnboarding } from "../../Services/onboardingService";
import { uploadImage } from "../../Services/uploadService";
import { getStoredUser } from "../../Services/checkLogin";
import { getExpertServicesFromApi } from "../../Components/Profile/Expert/ExpertService";
import { getClientProjectsFromApi } from "../../Components/Profile/Client/ClientProject";
import { getOrCreateConversation } from "../../Services/messageService";
import {
  adminUpdateUser,
  adminDeleteUser,
  adminDeactivateUser,
  updateContentStatus,
} from "../../Services/adminDashboardService";
import "./ProfilePage.css";

/**
 * Trang hồ sơ dùng chung cho Client, Expert và Admin.
 *
 * Trách nhiệm chính:
 * - Tải hồ sơ theo `userId` trên URL và chọn đúng chế độ Client/Expert.
 * - Hiển thị thông tin, thống kê, service hoặc project thuộc người dùng.
 * - Cho chủ hồ sơ cập nhật thông tin, avatar và dùng AI để tối ưu profile.
 * - Cho Admin cập nhật tài khoản và kiểm duyệt nội dung của người dùng.
 */
function ProfilePage() {
  // Thông tin điều hướng: URL quyết định hồ sơ cần xem, còn location.state
  // cho biết người dùng đi tới đây từ màn hình nào để hiển thị nút Back phù hợp.
  const { userId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = getStoredUser()
  const fromLanding = location.state?.fromLanding
  const fromMarketplace = location.state?.fromMarketplace
  const marketplaceTarget = location.state?.marketplaceTarget
  const backLabel = fromLanding ? "Back to Home" : fromMarketplace ? (marketplaceTarget === "clients" ? "Back to Clients List" : "Back to Experts List") : "Back to Profile"

  // Trạng thái tải dữ liệu chung của toàn trang.
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("") // "client" or "expert"

  // Trạng thái dành cho các thao tác quản trị tài khoản/nội dung.
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
  const [contentModerationConfirm, setContentModerationConfirm] = useState(null)

  // Trạng thái của modal Edit Profile dành cho chính chủ hồ sơ.
  // Một form được dùng chung; khi submit chỉ các trường thuộc activeTab được gửi.
  const [showOwnEditModal, setShowOwnEditModal] = useState(false)
  const [ownEditForm, setOwnEditForm] = useState({
    fullName: "",
    companyName: "",
    industry: "",
    professionalTitle: "",
    skills: "",
    experience: "",
    portfolioUrl: "",
    hourlyRate: "",
    bio: "",
  })
  const [ownAvatarFile, setOwnAvatarFile] = useState(null)
  const [ownAvatarPreview, setOwnAvatarPreview] = useState("")
  const [ownEditError, setOwnEditError] = useState("")
  const [ownEditLoading, setOwnEditLoading] = useState(false)

  // Trạng thái riêng của AI để không trộn lẫn với trạng thái đang lưu profile.
  // `ownEditAiOptimized` chỉ điều khiển badge; dữ liệu AI vẫn nằm trong form
  // và người dùng có thể sửa tiếp trước khi nhấn Save Changes.
  const [ownEditAiGenerating, setOwnEditAiGenerating] = useState(false)
  const [ownEditAiOptimized, setOwnEditAiOptimized] = useState(false)
  const [ownEditAiError, setOwnEditAiError] = useState("")

  // Các cờ phân quyền được tính từ người đang đăng nhập và hồ sơ đang xem.
  const isOwnProfile = currentUser && String(currentUser.id) === String(userId)
  const currentRole = String(currentUser?.role || "").toLowerCase()
  const isAdminViewer = currentRole.includes("admin")
  const isAdminProfile = String(profileData?.user?.role || currentUser?.role || "").toLowerCase().includes("admin")

  /**
   * Tải toàn bộ dữ liệu hồ sơ mỗi khi `userId` thay đổi.
   * API trả cả user, clientProfile, expertProfile, services và projects.
   */
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

  // Chuẩn hóa role thành đường dẫn dashboard tương ứng.
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

  // Expert và Client dùng hai route messages khác nhau.
  const getMessagesPath = () => {
    const normalizedRole = String(currentUser?.role || "").toLowerCase();
    return normalizedRole.includes("expert") ? "/expert/messages" : "/client/messages";
  };

  // Đưa người dùng đã đăng nhập về dashboard theo role; khách về landing page.
  const handleBack = () => {
    if (currentUser) {
      navigate(getRoleDashboardPath(currentUser.role));
    } else {
      navigate("/")
    }
  }

  /**
   * Tạo hoặc lấy conversation hiện có với chủ hồ sơ rồi mở màn hình chat.
   * Nếu API conversation lỗi, vẫn chuyển sang messages để người dùng không bị kẹt.
   */
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

  // Chính chủ xem danh sách trong dashboard; người khác xem route public của profile.
  const handleViewAllProfileItems = () => {
    if (isOwnProfile) {
      navigate(activeTab === "expert" ? "/expert/projects" : "/client/projects");
      return;
    }

    navigate(`/profile/${userId}/${activeTab === "expert" ? "services" : "projects"}`, {
      state: { backgroundLocation: location },
    });
  }

  // Tải lại dữ liệu sau mỗi thao tác cập nhật mà không reload toàn bộ trang.
  const refreshProfileData = async () => {
    const data = await getUserProfile(userId)
    setProfileData(data)
  }

  /**
   * Mở Edit Profile và sao chép dữ liệu API vào form cục bộ.
   * Việc dùng bản sao giúp Cancel không làm thay đổi dữ liệu đang hiển thị.
   */
  const openOwnEditModal = () => {
    const targetUser = profileData?.user
    const client = profileData?.clientProfile
    const expert = profileData?.expertProfile
    if (!targetUser) return

    setOwnEditForm({
      fullName: targetUser.fullName || "",
      companyName: client?.companyName || "",
      industry: client?.industry || "",
      professionalTitle: expert?.professionalTitle || "",
      skills: expert?.skills || "",
      experience: expert?.experience || "",
      portfolioUrl: expert?.portfolioUrl || "",
      hourlyRate: expert?.hourlyRate ? String(expert.hourlyRate).replace(/[^0-9.]/g, "") : "",
      bio: (activeTab === "expert" ? expert?.bio : client?.bio) || "",
    })
    setOwnAvatarFile(null)
    setOwnAvatarPreview(targetUser.avatarUrl || "")
    setOwnEditError("")
    setOwnEditAiGenerating(false)
    setOwnEditAiOptimized(false)
    setOwnEditAiError("")
    setShowOwnEditModal(true)
  }

  /**
   * Một số màn hình chuyển đến ProfilePage với cờ `openEditProfile`.
   * Effect này tự mở modal đúng một lần rồi xóa cờ khỏi history state,
   * tránh modal tự mở lại khi trang render hoặc người dùng Back/Forward.
   */
  useEffect(() => {
    if (!profileData || !isOwnProfile || !location.state?.openEditProfile) return

    const targetUser = profileData.user
    const client = profileData.clientProfile
    const expert = profileData.expertProfile
    const nextState = { ...location.state }
    delete nextState.openEditProfile

    const openModalTimer = window.setTimeout(() => {
      setOwnEditForm({
        fullName: targetUser.fullName || "",
        companyName: client?.companyName || "",
        industry: client?.industry || "",
        professionalTitle: expert?.professionalTitle || "",
        skills: expert?.skills || "",
        experience: expert?.experience || "",
        portfolioUrl: expert?.portfolioUrl || "",
        hourlyRate: expert?.hourlyRate ? String(expert.hourlyRate).replace(/[^0-9.]/g, "") : "",
        bio: (activeTab === "expert" ? expert?.bio : client?.bio) || "",
      })
      setOwnAvatarFile(null)
      setOwnAvatarPreview(targetUser.avatarUrl || "")
      setOwnEditError("")
      setOwnEditAiGenerating(false)
      setOwnEditAiOptimized(false)
      setOwnEditAiError("")
      setShowOwnEditModal(true)
      navigate(`${location.pathname}${location.search}`, {
        replace: true,
        state: nextState,
      })
    }, 0)

    return () => window.clearTimeout(openModalTimer)
  }, [
    activeTab,
    isOwnProfile,
    location.pathname,
    location.search,
    location.state,
    navigate,
    profileData,
  ])

  /**
   * Kiểm tra avatar ngay trên client trước khi upload:
   * chỉ nhận ảnh, tối đa 5 MB, sau đó tạo data URL để preview tức thì.
   */
  const handleOwnAvatarChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setOwnEditError("Please select an image file.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setOwnEditError("Avatar image must be 5MB or smaller.")
      return
    }

    setOwnAvatarFile(file)
    setOwnEditError("")
    const reader = new FileReader()
    reader.onload = () => setOwnAvatarPreview(String(reader.result || ""))
    reader.readAsDataURL(file)
  }

  /**
   * Hợp nhất phản hồi AI vào form hiện tại.
   * Dùng giá trị cũ làm fallback để một field thiếu trong phản hồi AI
   * không vô tình xóa nội dung mà người dùng đã nhập.
   */
  const handleOwnEditAiSuccess = (data) => {
    setOwnEditForm((previousForm) => (
      activeTab === "expert"
        ? {
            ...previousForm,
            professionalTitle: data.professionalTitle || previousForm.professionalTitle,
            skills: data.skills || previousForm.skills,
            bio: data.bio || previousForm.bio,
          }
        : {
            ...previousForm,
            companyName: data.companyName || previousForm.companyName,
            industry: data.industry || previousForm.industry,
            bio: data.bio || previousForm.bio,
          }
    ))
    setOwnEditAiGenerating(false)
    setOwnEditAiOptimized(true)
  }

  /**
   * Lưu Edit Profile:
   * 1. Validate các trường bắt buộc theo loại hồ sơ.
   * 2. Cập nhật profile và full name song song.
   * 3. Chỉ upload avatar nếu người dùng chọn file mới.
   * 4. Đồng bộ localStorage và tải lại dữ liệu mới nhất từ server.
   */
  const handleOwnProfileUpdate = async (event) => {
    event.preventDefault()
    const isEditingExpert = activeTab === "expert"

    if (!ownEditForm.fullName.trim()) {
      setOwnEditError("Full name is required.")
      return
    }
    if (isEditingExpert && (!ownEditForm.professionalTitle.trim() || !ownEditForm.skills.trim() || !ownEditForm.experience || Number(ownEditForm.hourlyRate) <= 0)) {
      setOwnEditError("Professional title, skills, experience, and a valid hourly rate are required.")
      return
    }
    if (!isEditingExpert && (!ownEditForm.companyName.trim() || !ownEditForm.industry.trim())) {
      setOwnEditError("Company name and industry are required.")
      return
    }

    try {
      setOwnEditLoading(true)
      setOwnEditError("")

      const profileUpdate = isEditingExpert
        ? submitExpertOnboarding({
            professionalTitle: ownEditForm.professionalTitle,
            skills: ownEditForm.skills,
            experience: ownEditForm.experience,
            portfolioUrl: ownEditForm.portfolioUrl,
            hourlyRate: ownEditForm.hourlyRate,
            bio: ownEditForm.bio,
          })
        : submitClientOnboarding({
            companyName: ownEditForm.companyName,
            industry: ownEditForm.industry,
            bio: ownEditForm.bio,
          })

      const [, updatedNameUser] = await Promise.all([
        profileUpdate,
        updateOwnFullName(ownEditForm.fullName.trim()),
      ])

      let updatedAvatarUser = null
      if (ownAvatarFile) {
        const avatarUrl = await uploadImage(ownAvatarFile)
        updatedAvatarUser = await updateOwnAvatar(avatarUrl)
      }

      const storedUser = JSON.parse(localStorage.getItem("user") || "{}")
      localStorage.setItem("user", JSON.stringify({
        ...storedUser,
        fullName: updatedNameUser?.fullName || ownEditForm.fullName.trim(),
        avatarUrl: updatedAvatarUser?.avatarUrl || storedUser.avatarUrl,
        isOnboarded: true,
      }))

      await refreshProfileData()
      setShowOwnEditModal(false)
    } catch (err) {
      setOwnEditError(err.message || "Failed to update profile.")
    } finally {
      setOwnEditLoading(false)
    }
  }

  // Chuyển mọi biến thể role từ API về đúng value mà select của Admin sử dụng.
  const getProfileRoleValue = (role) => {
    const normalizedRole = String(role || "").toLowerCase()
    if (normalizedRole === "expert") return "expert"
    if (normalizedRole === "admin") return "admin"
    return "client"
  }

  // Nạp dữ liệu tài khoản hiện tại vào form trước khi Admin chỉnh sửa.
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

  // Gửi toàn bộ form quản trị và refresh profile khi API thành công.
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

  // Kích hoạt lại tài khoản đang bị vô hiệu hóa.
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

  // `type` là "deactivate" hoặc "delete"; lưu vào state để modal dùng chung.
  const openAdminConfirm = (type) => {
    setAdminActionError("")
    setConfirmAction(type)
  }

  // Không cho đóng confirmation trong lúc request đang chạy.
  const closeAdminConfirm = () => {
    if (adminActionLoading) return
    setConfirmAction(null)
    setAdminActionError("")
  }

  /**
   * Thực thi hành động nguy hiểm sau khi Admin xác nhận.
   * Deactivate giữ người dùng ở lại trang để thấy trạng thái mới;
   * Delete điều hướng về danh sách vì hồ sơ không còn tồn tại.
   */
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

  // Biến mã kinh nghiệm lưu trong DB thành nhãn thân thiện với người đọc.
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

  // API lưu skills dạng chuỗi phân tách bằng dấu phẩy; UI cần mảng để render pill.
  const getSkills = (skills) => {
    if (!skills) {
      return [];
    }

    return skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  };

  // Format ngày theo locale của trình duyệt và cung cấp fallback nếu DB chưa có ngày.
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

  // Chuẩn hóa các giá trị tiền thành USD, đồng thời chặn NaN xuất hiện trên UI.
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

  // Hỗ trợ cả dữ liệu số và chuỗi cũ có ký hiệu tiền tệ.
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

  // Lấy trung bình khoảng ngân sách; nếu thiếu một đầu thì dùng đầu còn lại.
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

  // Hàm tổng quát để cộng giá trị hợp lệ và bỏ qua null/NaN.
  const sumNumbers = (items, getValue) =>
    items.reduce((total, item) => {
      const value = getValue(item);
      return Number.isFinite(value) ? total + value : total;
    }, 0);

  // Renderer nhỏ dùng chung cho ba ô thống kê ở hero.
  const renderStat = (value, label) => (
    <div className="profile-stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );

  // Gom các status nghiệp vụ về hai trạng thái UI: đang hiển thị hoặc đã gỡ.
  const isPublishedContent = (status) =>
    ["approved", "open"].includes(String(status || "").toLowerCase());
  const isRemovedContent = (status) =>
    ["removed", "rejected"].includes(String(status || "").toLowerCase());

  /**
   * Chuẩn bị modal kiểm duyệt service/job.
   * stopPropagation ngăn click nút kiểm duyệt kích hoạt điều hướng của cả card.
   */
  const openAdminContentConfirm = (event, action, contentType, item) => {
    event.stopPropagation();
    setAdminActionError("");
    setContentModerationConfirm({
      action,
      contentType,
      contentId: item.id,
      title: item.title,
    });
  };

  // Chuyển action giao diện thành status backend rồi refresh danh sách.
  const handleAdminContentAction = async () => {
    if (!contentModerationConfirm) return;
    const { action, contentType, contentId } = contentModerationConfirm;
    const loadingKey = `${action}-${contentType}-${contentId}`;
    const nextStatus = action === "republish" ? "approved" : "removed";

    try {
      setAdminActionError("");
      setAdminActionLoading(loadingKey);
      await updateContentStatus(contentType, contentId, nextStatus);
      await refreshProfileData();
      setContentModerationConfirm(null);
    } catch (err) {
      setAdminActionError(err.message || "Failed to update content");
      setContentModerationConfirm(null);
    } finally {
      setAdminActionLoading("");
    }
  };

  // Render service và các nút publish/unpublish chỉ dành cho Admin.
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
        {isAdminViewer && isPublishedContent(item.status) && (
          <button
            className="profile-content-unpublish-btn"
            type="button"
            onClick={(event) => openAdminContentConfirm(event, "unpublish", "service", item)}
            disabled={adminActionLoading === `unpublish-service-${item.id}`}
          >
            {adminActionLoading === `unpublish-service-${item.id}` ? <Loader2 size={14} /> : <EyeOff size={14} />}
            {adminActionLoading === `unpublish-service-${item.id}` ? "Unpublishing..." : "Unpublish"}
          </button>
        )}
        {isAdminViewer && isRemovedContent(item.status) && (
          <button
            className="profile-content-unpublish-btn is-republish"
            type="button"
            onClick={(event) => openAdminContentConfirm(event, "republish", "service", item)}
            disabled={adminActionLoading === `republish-service-${item.id}`}
          >
            {adminActionLoading === `republish-service-${item.id}` ? <Loader2 size={14} /> : <RefreshCcw size={14} />}
            {adminActionLoading === `republish-service-${item.id}` ? "Publishing..." : "Publish Again"}
          </button>
        )}
      </div>
    </article>
  );

  // Render project/job theo cùng pattern với service card.
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
        {isAdminViewer && isPublishedContent(item.status) && (
          <button
            className="profile-content-unpublish-btn"
            type="button"
            onClick={(event) => openAdminContentConfirm(event, "unpublish", "job", item)}
            disabled={adminActionLoading === `unpublish-job-${item.id}`}
          >
            {adminActionLoading === `unpublish-job-${item.id}` ? <Loader2 size={14} /> : <EyeOff size={14} />}
            {adminActionLoading === `unpublish-job-${item.id}` ? "Unpublishing..." : "Unpublish"}
          </button>
        )}
        {isAdminViewer && isRemovedContent(item.status) && (
          <button
            className="profile-content-unpublish-btn is-republish"
            type="button"
            onClick={(event) => openAdminContentConfirm(event, "republish", "job", item)}
            disabled={adminActionLoading === `republish-job-${item.id}`}
          >
            {adminActionLoading === `republish-job-${item.id}` ? <Loader2 size={14} /> : <RefreshCcw size={14} />}
            {adminActionLoading === `republish-job-${item.id}` ? "Publishing..." : "Publish Again"}
          </button>
        )}
      </div>  
    </article>
  );


  // Early return giúp phần giao diện chính không phải lồng thêm điều kiện loading.
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

  // Lỗi tải hồ sơ có màn hình riêng và cho phép quay lại route trước đó.
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

  // Từ đây profileData chắc chắn đã tồn tại vì loading/error đã return phía trên.
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

  // Các giá trị dẫn xuất dưới đây quyết định nội dung hiển thị của Client/Expert.
  const isExpertView = activeTab === "expert";
  const activeProfile = isExpertView ? expertProfile : clientProfile;
  // API data: profile page calls API once, then pushes response lists through Profile helpers.
  // Tạo bản sao trước khi sort để không mutate object dữ liệu lấy từ state.
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
  // Admin không được tự xóa chính mình hoặc thao tác lên một Admin khác tại đây.
  const targetRole = String(user.role || "").toLowerCase();
  const isTargetAdmin = targetRole === "admin";
  const isTargetSuspended = user.accStatus === false || user.status === "Suspended";
  const showAdminActions = isAdminViewer && !isOwnProfile && !isTargetAdmin;

  // Giao diện chính của trang profile sau khi dữ liệu đã sẵn sàng.
  return (
    <div className="profile-shell">
      <HeaderCom />

      <main className="profile-container">
        <header className="profile-nav-header">
          <button className="back-link-btn" onClick={() => navigate(-1)}>
            {backLabel}
          </button>
        </header>
        {/* Có ít nhất một profile thì render nội dung; nếu không hiển thị onboarding state. */}
        {(hasClientProfile || hasExpertProfile) ? (
          <>
            {/* Người dùng có cả hai role có thể đổi qua lại giữa hai profile. */}
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

            {/* Layout hai cột: nội dung hồ sơ bên trái, action và danh sách bên phải. */}
            <div className="profile-layout">
              <section className="profile-main-column">
                <article className="profile-hero-card">
                  <div className="avatar-large">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.fullName} className="avatar-large-img" />
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
                  
                  {/* Action thay đổi theo quan hệ giữa viewer và chủ hồ sơ. */}
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
                    <>
                      {!isAdminProfile && (
                        <button
                          className="profile-owner-edit-btn"
                          type="button"
                          onClick={openOwnEditModal}
                        >
                          <Edit2 size={15} />
                          Edit Profile
                        </button>
                      )}
                      <button
                        className="secondary-action-btn"
                        type="button"
                        onClick={handleBack}
                      >
                        <Send size={15} />
                        Go to Dashboard
                      </button>
                    </>
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
                  {adminActionError && isAdminViewer && (
                    <p className="profile-admin-error">{adminActionError}</p>
                  )}
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

        {/* Modal chỉnh sửa chỉ được mount khi chính chủ yêu cầu mở. */}
        {showOwnEditModal && (
          <div className="profile-admin-modal-overlay" onClick={() => !ownEditLoading && setShowOwnEditModal(false)}>
            <div className="profile-admin-modal profile-owner-edit-modal" onClick={(event) => event.stopPropagation()}>
              {/* Overlay AI chặn tương tác form trong lúc chờ nội dung từ Gemini. */}
              {ownEditAiGenerating && (
                <AISkeletonLoader
                  message={
                    activeTab === "expert"
                      ? "AI Engine is polishing your profile details..."
                      : "AI Engine is polishing your company details..."
                  }
                />
              )}
              <div className="profile-admin-modal-header">
                <h3>Edit Profile</h3>
                <button type="button" disabled={ownEditLoading} onClick={() => setShowOwnEditModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleOwnProfileUpdate}>
                {ownEditError && <p className="profile-admin-error">{ownEditError}</p>}

                <div className="profile-owner-avatar-editor">
                  <div className="profile-owner-avatar-preview">
                    {ownAvatarPreview ? (
                      <img src={ownAvatarPreview} alt="Avatar preview" />
                    ) : (
                      ownEditForm.fullName.trim().charAt(0).toUpperCase() || "?"
                    )}
                  </div>
                  <label className="profile-owner-avatar-upload">
                    <Camera size={16} />
                    Change Avatar
                    <input type="file" accept="image/*" onChange={handleOwnAvatarChange} />
                  </label>
                  <small>JPG, PNG or WebP. Maximum 5MB.</small>
                </div>

                <label>
                  Full Name
                  <input
                    type="text"
                    required
                    value={ownEditForm.fullName}
                    onChange={(event) => setOwnEditForm({ ...ownEditForm, fullName: event.target.value })}
                  />
                </label>

                {/* Mỗi loại profile có bộ trường và payload lưu khác nhau. */}
                {activeTab === "expert" ? (
                  <>
                    <label>
                      Professional Title
                      <input
                        type="text"
                        required
                        value={ownEditForm.professionalTitle}
                        onChange={(event) => setOwnEditForm({ ...ownEditForm, professionalTitle: event.target.value })}
                      />
                    </label>
                    <label>
                      Main Skills
                      <input
                        type="text"
                        required
                        value={ownEditForm.skills}
                        onChange={(event) => setOwnEditForm({ ...ownEditForm, skills: event.target.value })}
                      />
                    </label>
                    <label>
                      Years of Experience
                      <select
                        required
                        value={ownEditForm.experience}
                        onChange={(event) => setOwnEditForm({ ...ownEditForm, experience: event.target.value })}
                      >
                        <option value="">Select experience</option>
                        {!["0-1", "1-3", "3-5", "over-5", ""].includes(ownEditForm.experience) && (
                          <option value={ownEditForm.experience}>{ownEditForm.experience}</option>
                        )}
                        <option value="0-1">0 - 1 year</option>
                        <option value="1-3">1 - 3 years</option>
                        <option value="3-5">3 - 5 years</option>
                        <option value="over-5">Over 5 years</option>
                      </select>
                    </label>
                    <label>
                      Portfolio URL
                      <input
                        type="url"
                        value={ownEditForm.portfolioUrl}
                        onChange={(event) => setOwnEditForm({ ...ownEditForm, portfolioUrl: event.target.value })}
                      />
                    </label>
                    <label>
                      Hourly Rate
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        required
                        value={ownEditForm.hourlyRate}
                        onChange={(event) => setOwnEditForm({ ...ownEditForm, hourlyRate: event.target.value })}
                      />
                    </label>
                    <div className="profile-ai-edit-field">
                      <div className="profile-ai-edit-heading">
                        <label htmlFor="profile-expert-bio">Short Bio</label>
                        <div className="profile-ai-edit-actions">
                          {ownEditAiOptimized && (
                            <span className="ai-sparkle-badge">✨ AI Optimized</span>
                          )}
                          {/*
                            AIExtendButton ghép các draft field có dữ liệu và gọi /api/ai/generate.
                            Prefix tên field giúp model hiểu đúng ý nghĩa từng dòng đầu vào.
                          */}
                          <AIExtendButton
                            draftFields={[
                              ownEditForm.professionalTitle && `Professional title: ${ownEditForm.professionalTitle}`,
                              ownEditForm.skills && `Skills: ${ownEditForm.skills}`,
                              ownEditForm.bio && `Bio: ${ownEditForm.bio}`,
                            ]}
                            onExtendStart={() => {
                              setOwnEditAiGenerating(true)
                              setOwnEditAiOptimized(false)
                            }}
                            onExtendSuccess={handleOwnEditAiSuccess}
                            onExtendFailure={() => setOwnEditAiGenerating(false)}
                            type="profile_expert"
                            btnText="Improve with AI"
                            onErrorToast={setOwnEditAiError}
                          />
                        </div>
                      </div>
                      <textarea
                        id="profile-expert-bio"
                        rows="4"
                        value={ownEditForm.bio}
                        onChange={(event) => {
                          setOwnEditForm({ ...ownEditForm, bio: event.target.value })
                          setOwnEditAiOptimized(false)
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <label>
                      Company Name
                      <input
                        type="text"
                        required
                        value={ownEditForm.companyName}
                        onChange={(event) => setOwnEditForm({ ...ownEditForm, companyName: event.target.value })}
                      />
                    </label>
                    <label>
                      Industry
                      <input
                        type="text"
                        required
                        value={ownEditForm.industry}
                        onChange={(event) => setOwnEditForm({ ...ownEditForm, industry: event.target.value })}
                      />
                    </label>
                    <div className="profile-ai-edit-field">
                      <div className="profile-ai-edit-heading">
                        <label htmlFor="profile-client-bio">Company Bio</label>
                        <div className="profile-ai-edit-actions">
                          {ownEditAiOptimized && (
                            <span className="ai-sparkle-badge">✨ AI Optimized</span>
                          )}
                          {/* Client dùng prompt riêng để AI trả companyName, industry và bio. */}
                          <AIExtendButton
                            draftFields={[
                              ownEditForm.companyName && `Company name: ${ownEditForm.companyName}`,
                              ownEditForm.industry && `Industry: ${ownEditForm.industry}`,
                              ownEditForm.bio && `Company bio: ${ownEditForm.bio}`,
                            ]}
                            onExtendStart={() => {
                              setOwnEditAiGenerating(true)
                              setOwnEditAiOptimized(false)
                            }}
                            onExtendSuccess={handleOwnEditAiSuccess}
                            onExtendFailure={() => setOwnEditAiGenerating(false)}
                            type="profile_client"
                            btnText="Improve with AI"
                            onErrorToast={setOwnEditAiError}
                          />
                        </div>
                      </div>
                      <textarea
                        id="profile-client-bio"
                        rows="4"
                        value={ownEditForm.bio}
                        onChange={(event) => {
                          setOwnEditForm({ ...ownEditForm, bio: event.target.value })
                          setOwnEditAiOptimized(false)
                        }}
                      />
                    </div>
                  </>
                )}

                <div className="profile-admin-modal-actions">
                  <button
                    type="button"
                    className="profile-modal-secondary"
                    disabled={ownEditLoading}
                    onClick={() => setShowOwnEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="profile-modal-primary" disabled={ownEditLoading}>
                    {ownEditLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Toast nằm ngoài modal để luôn nổi trên overlay và tự đóng sau timeout. */}
        {ownEditAiError && (
          <Toast message={ownEditAiError} onClose={() => setOwnEditAiError("")} />
        )}

        {/* Modal cập nhật thông tin tài khoản dành riêng cho Admin viewer. */}
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

        {/* Modal xác nhận dùng chung cho deactivate và delete account. */}
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
        {/* Component xác nhận kiểm duyệt service/job được tách riêng để tái sử dụng. */}
        <AdminModerationConfirmModal
          action={contentModerationConfirm?.action}
          contentTitle={contentModerationConfirm?.title}
          loading={Boolean(contentModerationConfirm && adminActionLoading)}
          onCancel={() => setContentModerationConfirm(null)}
          onConfirm={handleAdminContentAction}
        />
      </main>

      <Footer />
    </div>
  )
}

export default ProfilePage

