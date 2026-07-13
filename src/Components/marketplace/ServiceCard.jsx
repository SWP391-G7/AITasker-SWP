import { useNavigate } from 'react-router-dom';
import { Heart, Star, Clock } from 'lucide-react';
import './Marketplace.css';

/**
 * Deterministically pick one of the profile-side-visual gradient classes
 * based on the item id, so each card consistently gets the same gradient.
 */
const VISUAL_CLASSES = [
  'service-visual-automation',
  'service-visual-analytics',
  'service-visual-network',
  'service-visual-purple',
  'service-visual-amber',
];

const getVisualClass = (id) => {
  if (!id) return VISUAL_CLASSES[0];
  // Use the numeric part or string hash
  const num = typeof id === 'number' ? id : String(id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return VISUAL_CLASSES[num % VISUAL_CLASSES.length];
};

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
  deliveryDays,
  isFavorited,
  onToggleFavorite,
}) => {
  const navigate = useNavigate();
  const isJob = type === 'job';

  const handleViewDetails = () => {
    if (isJob) {
      navigate('/marketplace/task/' + id);
      return;
    }
    navigate(`/marketplace/service/${id}`);
  };

  const getInitials = (name) =>
    name
      ? name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
      : '?';

  const hasImage = !!image;
  const visualClass = getVisualClass(id);

  return (
    <article className="mp-service-card" onClick={handleViewDetails}>
      {/* ── Image / Profile-side-visual ─────────────────── */}
      <div className="mp-card-image-area">
        {hasImage ? (
          <img
            className="mp-card-image"
            src={image}
            alt={title}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
        ) : null}
        {/* Profile-side-visual fallback — always rendered, hidden when image exists */}
        <div
          className={`mp-card-visual-fallback profile-side-visual ${visualClass}`}
          style={{ display: hasImage ? 'none' : 'block' }}
        />

        {/* Category / tag badge */}
        <span className="mp-card-tag">{tag}</span>

        {/* Favorite button */}
        <button
          type="button"
          className={`mp-favorite-btn ${isFavorited ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(id);
          }}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={15} fill={isFavorited ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* ── Card body ────────────────────────────────────── */}
      <div className="mp-card-body">
        {/* Expert / poster row */}
        <div className="mp-card-expert-row">
          <div className="mp-card-avatar">
            {getInitials(expert)}
          </div>
          <span className="mp-card-expert-name">
            {isJob ? expert : expert}
          </span>
          {!isJob && rating && Number(rating) > 0 && (
            <div className="mp-card-rating">
              <Star size={11} fill="currentColor" />
              {Number(rating).toFixed(1)}
            </div>
          )}
          {isJob && status && (
            <span className={`mp-status-badge mp-status-${status?.toLowerCase()}`}>
              {status}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="mp-card-title">
          {isJob ? title : `I will ${title}`}
        </h3>

        {/* Description */}
        <p className="mp-card-description">
          {(description || 'No description provided.')
            .replace(/([A-Za-zÀ-ỹ\s]+:)\s*\n\s*/g, '$1 ')}
        </p>
      </div>

      {/* ── Card footer ──────────────────────────────────── */}
      <div className="mp-card-footer">
        <div className="mp-card-price">
          <small>{isJob ? 'BUDGET' : 'STARTING AT'}</small>
          <strong>{price}</strong>
        </div>
        {deliveryDays && !isJob && (
          <div className="mp-card-delivery">
            <Clock size={12} />
            {deliveryDays}d delivery
          </div>
        )}
        <div className="mp-view-btn">
          {isJob ? 'View Task' : 'View Details'}
        </div>
      </div>
    </article>
  );
};

export default ServiceCard;
