import { Sparkles } from 'lucide-react';
import './AISkeletonLoader.css';

/**
 * Overlay dùng chung trong thời gian chờ AI.
 * `message` cho phép từng màn hình mô tả đúng loại nội dung đang được tạo.
 * Component chỉ trình bày trạng thái; request thật được quản lý ở form cha.
 */
const AISkeletonLoader = ({ message = 'AI Engine is designing your scope...' }) => {
  return (
    <div className="ai-skeleton-overlay">
      <div className="ai-skeleton-card">
        <div className="ai-skeleton-header">
          <div className="ai-pulse-icon">
            <Sparkles className="sparkles-shimmer" size={24} />
          </div>
          <div className="ai-skeleton-message">{message}</div>
        </div>
        
        <div className="ai-skeleton-body">
          {/* Các khối giả lập input/textarea/tag giúp người dùng nhận biết form đang được xử lý. */}
          <div className="skeleton-field-block">
            <div className="skeleton-label shimmer"></div>
            <div className="skeleton-input shimmer" style={{ width: '60%' }}></div>
          </div>
          
          <div className="skeleton-field-block">
            <div className="skeleton-label shimmer" style={{ width: '25%' }}></div>
            <div className="skeleton-textarea shimmer"></div>
          </div>
          
          <div className="skeleton-field-block">
            <div className="skeleton-label shimmer" style={{ width: '20%' }}></div>
            <div className="skeleton-tags-row">
              <div className="skeleton-tag-pill shimmer"></div>
              <div className="skeleton-tag-pill shimmer" style={{ width: '70px' }}></div>
              <div className="skeleton-tag-pill shimmer" style={{ width: '90px' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISkeletonLoader;
