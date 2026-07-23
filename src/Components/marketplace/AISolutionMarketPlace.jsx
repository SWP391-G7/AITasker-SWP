/**
 * Frontend module: Components/marketplace/AISolutionMarketPlace.jsx
 *
 * Vai trò: Component AISolution Market Place: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */

import MarketplaceGrid from './MarketplaceGrid';
import './Marketplace.css';

// React component “AISolution Market Place” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const AISolutionMarketPlace = () => {
  return (
    <div className="marketplace-container">
      <MarketplaceGrid />
    </div>
  );
};

export default AISolutionMarketPlace;
