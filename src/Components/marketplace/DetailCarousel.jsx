import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './DetailCarousel.css';

const VISUAL_CLASSES = [
  'service-visual-automation',
  'service-visual-analytics',
  'service-visual-network',
  'service-visual-purple',
  'service-visual-amber',
];

const getVisualClass = (id) => {
  if (!id) return VISUAL_CLASSES[0];
  const num = typeof id === 'number' ? id : String(id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return VISUAL_CLASSES[num % VISUAL_CLASSES.length];
};

const parseImages = (imagesData) => {
  if (!imagesData) return [];
  if (Array.isArray(imagesData)) return imagesData;
  if (typeof imagesData === 'string') {
    try {
      const parsed = JSON.parse(imagesData);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === 'string') return [parsed];
    } catch (e) {
      if (!imagesData.startsWith('[') && !imagesData.startsWith('{')) {
        return imagesData.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
  }
  return [];
};

export default function DetailCarousel({ itemId, images, title }) {
  const imageList = parseImages(images);
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  };

  const visualClass = getVisualClass(itemId);

  if (imageList.length === 0) {
    return (
      <div className="detail-carousel-wrapper fallback-mode">
        <div className={`detail-carousel-fallback profile-side-visual ${visualClass}`}>
          <div className="fallback-glow-overlay" />
        </div>
      </div>
    );
  }

  return (
    <div className="detail-carousel-wrapper">
      <div className="detail-carousel-slides" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
        {imageList.map((imgUrl, index) => (
          <div className="detail-carousel-slide" key={index}>
            <img src={imgUrl} alt={`${title} - visual ${index + 1}`} className="detail-carousel-image" />
          </div>
        ))}
      </div>

      {imageList.length > 1 && (
        <>
          <button className="detail-carousel-btn prev" onClick={handlePrev} aria-label="Previous image" type="button">
            <ChevronLeft size={20} />
          </button>
          <button className="detail-carousel-btn next" onClick={handleNext} aria-label="Next image" type="button">
            <ChevronRight size={20} />
          </button>

          <div className="detail-carousel-indicators">
            {imageList.map((_, index) => (
              <button
                key={index}
                className={`detail-carousel-indicator-dot ${index === activeIndex ? 'active' : ''}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                type="button"
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
