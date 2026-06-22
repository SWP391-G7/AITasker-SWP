import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Heart, Star } from 'lucide-react';
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

  return (
    <div className={`service-card ${isJob ? 'job-card' : ''}`}>
      <div className="card-image-area">
        <button 
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={() => setIsWishlisted(!isWishlisted)}
          aria-label="Add to wishlist"
        >
          <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
        
        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="service-card-image"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = "https://images.unsplash.com/photo-1620712943543-bcc4628c6bb5?auto=format&fit=crop&q=80&w=400";
            }}
          />
        ) : (
          <div className="image-placeholder"></div>
        )}
        <span className="category-tag">{tag}</span>
      </div>
      <div className="card-body">
        <div className="expert-info">
          <div className="expert-avatar-small"></div>
          <span className="expert-name">{expert}</span>
          <div className="rating">
            {isJob ? <Briefcase size={12} /> : <Star size={12} fill="#10b981" />}
            <span>{rating}</span>
          </div>
        </div>
        <h3 className="card-title">{title}</h3>
        {description && <p className="card-description">{description}</p>}
      </div>
      <div className="card-footer">
        <div className="price-info">
          <span className="starting-price">{isJob ? 'BUDGET' : 'STARTING AT'}</span>
          <span className="price-value">{price}</span>
        </div>
        <button 
          className="view-details-btn" 
          onClick={handleViewDetails}
        >
          {isJob ? 'View Task' : 'View Details'}
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;


