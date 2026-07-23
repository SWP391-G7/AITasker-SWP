/**
 * Frontend module: Components/ClientExpertSearch/ClientExpertCard.jsx
 *
 * Vai trò: Component Client Expert Card: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { CheckCircle2, Clock3, Heart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

// React component “Client Expert Card” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const ClientExpertCard = ({ person, isExpertMode, isFavorited, onToggleFavorite }) => {
  const navigate = useNavigate();

  return (
    <article className="expert-card">
      <div className="expert-card-top">
        <div className="expert-avatar-wrap">
          {person.avatar ? (
            <img src={person.avatar} alt={person.name} />
          ) : (
            <div className="avatar-initials-placeholder">
              {person.name ? person.name.trim().charAt(0).toUpperCase() : "?"}
            </div>
          )}
          {person.available && <span className="online-dot"></span>}
        </div>
        <div className="expert-rating">
          <div>
            <Star size={18} fill="currentColor" />
            <strong>{person.rating}</strong>
            {person.reviews > 0 && <span>({person.reviews})</span>}
          </div>
          <strong>
            {isExpertMode ? "Client" : `$${person.rate}/hr`}
          </strong>
        </div>
      </div>

      <h2>{person.name}</h2>
      <h4>{person.title}</h4>

      {person.tags.length > 0 && (
        <div className="expert-tags">
          {person.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}

      <p>{person.description}</p>

      <div className="expert-stats">
        <span>
          <CheckCircle2 size={18} />
          {person.projects > 0 || person.mode === 'client'
            ? `${person.projects || 0} ${isExpertMode ? "Projects Posted" : "Projects"}`
            : "No projects yet"}
        </span>
        <span>
          <Clock3 size={18} />
          {isExpertMode ? "Client Account" : `${person.projects || 0} Projects`}
        </span>
      </div>

      <div className="expert-actions">
        <button
          type="button"
          onClick={() =>
            navigate(isExpertMode ? `/client/clients/${person.id}` : `/client/experts/${person.id}`, { state: { fromMarketplace: true, marketplaceTarget: isExpertMode ? "clients" : "experts" } })
          }
        >
          {isExpertMode ? "View Client" : "View Profile"}
        </button>
        <button
          className={`favorite-btn ${isFavorited ? "active" : ""}`}
          type="button"
          onClick={() => onToggleFavorite(person.id)}
        >
          <Heart size={24} />
        </button>
      </div>
    </article>
  );
};

export default ClientExpertCard;
