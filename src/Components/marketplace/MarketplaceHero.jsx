/**
 * Frontend module: Components/marketplace/MarketplaceHero.jsx
 *
 * Vai trò: Component Marketplace Hero: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */

import './Marketplace.css';

// Đọc hoặc suy ra dữ liệu cho nghiệp vụ “get current role”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
const getCurrentRole = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')?.role || 'client';
  } catch {
    return 'client';
  }
};

// React component “Marketplace Hero” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const MarketplaceHero = () => {
  const isExpert = getCurrentRole() === 'expert';

  return (
    <section className="marketplace-hero">
      <div className="container">
        <h1>
          {isExpert ? 'Browse Client ' : 'Explore the '}
          <span>{isExpert ? 'AI Tasks' : 'AI Marketplace'}</span>
        </h1>
        <p>
          {isExpert
            ? 'Find client projects that need AI expertise, review the task scope, and choose work that matches your skills.'
            : 'Discover high-performance AI services from vetted experts to accelerate your product development and automate complex workflows.'}
        </p>
      </div>
    </section>
  );
};

export default MarketplaceHero;
