import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Heart, Star, CheckCircle, Clock } from 'lucide-react';
import './Marketplace.css';

const ServiceCard = ({
  id,
  tag,
  expert,
  rating,
  title,
  price,
  image,
  type = 'service',
  description,
  status,
}) => {
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const isJob = type === 'job';

  const handleViewDetails = () => {
    if (isJob) {
      navigate('/marketplace/task/' + id);
      return;
    }

    navigate(`/marketplace/service/${id}`);
  };

  const getInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((word) => word[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "?";
  };

  const defaultClientAvatar = "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200&h=200&fit=crop";
  const defaultExpertAvatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop";
  const avatarUrl = image || (isJob ? defaultClientAvatar : defaultExpertAvatar);

  return (
    <article className="expert-card">
      <div className="expert-card-top">
        <div className="expert-avatar-wrap">
          <img 
            src={avatarUrl} 
            alt={expert} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = isJob ? defaultClientAvatar : defaultExpertAvatar;
            }}
          />
          <span className="online-dot"></span>
        </div>

        <div className="expert-rating">
          <div>
            <Star size={18} fill={isJob ? "none" : "currentColor"} className={isJob ? "text-muted" : "text-success"} />
            <strong>{isJob ? 'Task' : rating}</strong>
          </div>
          <strong>
            {price}
          </strong>
        </div>
      </div>

      <h2>{title}</h2>
      <h4>{isJob ? `Posted by ${expert}` : `Offered by ${expert}`}</h4>

      <div className="expert-tags">
        <span>{tag}</span>
      </div>

      <p style={{ minHeight: '60px' }}>
        {description || (isJob ? "Collaborate with this client on their custom AI task requirements." : "Get premium AI solutions delivered by vetted machine learning experts.")}
      </p>

      <div className="expert-stats">
        <span>
          <Briefcase size={18} />
          {isJob ? "Open Contract" : "Service Gig"}
        </span>

        <span>
          {isJob ? <Clock size={18} /> : <CheckCircle size={18} />}
          {isJob ? `Duration: ${rating}` : "Vetted Expert"}
        </span>

        {isJob && status && status !== 'open' && (
          <span className={`status-badge ${status}`}>
            {status === 'active' ? 'In Progress' : status}
          </span>
        )}
      </div>

      <div className="expert-actions">
        <button
          type="button"
          onClick={handleViewDetails}
        >
          {isJob ? "View Task" : "View Details"}
        </button>

        <button 
          className={`favorite-btn ${isWishlisted ? 'active' : ''}`} 
          style={{ color: isWishlisted ? 'var(--accent-red)' : '' }}
          type="button"
          onClick={() => setIsWishlisted(!isWishlisted)}
        >
          <Heart size={24} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      </div>
    </article>
  );
};

export default ServiceCard;
