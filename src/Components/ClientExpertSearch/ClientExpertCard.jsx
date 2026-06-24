import { CheckCircle2, Clock3, Heart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ClientExpertCard = ({ person, isExpertMode }) => {
  const navigate = useNavigate();

  return (
    <article className="expert-card">
      <div className="expert-card-top">
        <div className="expert-avatar-wrap">
          <img src={person.avatar} alt={person.name} />
          {person.available && <span className="online-dot"></span>}
        </div>
        <div className="expert-rating">
          <div>
            <Star size={18} fill="currentColor" />
            <strong>{person.rating}</strong>
            <span>({person.reviews})</span>
          </div>
          <strong>
            {isExpertMode ? "Client" : `$${person.rate}/hr`}
          </strong>
        </div>
      </div>

      <h2>{person.name}</h2>
      <h4>{person.title}</h4>

      <div className="expert-tags">
        {person.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>

      <p>{person.description}</p>

      <div className="expert-stats">
        <span>
          <CheckCircle2 size={18} />
          {person.projects} {isExpertMode ? "Projects Posted" : "Projects"}
        </span>
        <span>
          <Clock3 size={18} />
          {isExpertMode ? "Verified Client" : `${person.success}% Job Success`}
        </span>
      </div>

      <div className="expert-actions">
        <button
          type="button"
          onClick={() =>
            navigate(isExpertMode ? `/client/clients/${person.id}` : `/client/experts/${person.id}`)
          }
        >
          {isExpertMode ? "View Client" : "View Profile"}
        </button>
        <button className="favorite-btn" type="button">
          <Heart size={24} />
        </button>
      </div>
    </article>
  );
};

export default ClientExpertCard;
