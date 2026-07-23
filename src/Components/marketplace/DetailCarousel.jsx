/**
 * Frontend module: Components/marketplace/DetailCarousel.jsx
 *
 * Vai trò: Component Detail Carousel: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
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

// Đọc hoặc suy ra dữ liệu cho nghiệp vụ “get visual class”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
const getVisualClass = (id) => {
  if (!id) return VISUAL_CLASSES[0];
  const num = typeof id === 'number' ? id : String(id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return VISUAL_CLASSES[num % VISUAL_CLASSES.length];
};

// Chuyển đổi dữ liệu cho “parse images” thành định dạng mà lớp gọi hoặc giao diện cần.
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

// React component “Detail Carousel” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
export default function DetailCarousel({ itemId, images, title }) {
  const imageList = parseImages(images);
  const [activeIndex, setActiveIndex] = useState(0);

  // Handler “handle prev” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  // Handler “handle next” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
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
