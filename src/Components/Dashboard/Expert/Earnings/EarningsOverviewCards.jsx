/**
 * Frontend module: Components/Dashboard/Expert/Earnings/EarningsOverviewCards.jsx
 *
 * Vai trò: Component Earnings Overview Cards: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import React from 'react';
import { Landmark, Lock, BarChart3 } from 'lucide-react';

// React component “Earnings Overview Cards” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const EarningsOverviewCards = ({ stats }) => {
  // Đọc hoặc suy ra dữ liệu cho nghiệp vụ “get icon”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
  const getIcon = (type) => {
    switch (type) {
      case 'bank': return <Landmark size={20} />;
      case 'lock': return <Lock size={20} />;
      case 'chart': return <BarChart3 size={20} />;
      default: return <Landmark size={20} />;
    }
  };

  return (
    <div className="earnings-stats-grid">
      {stats.map((stat) => (
        <div key={stat.id} className="earnings-stat-card">
          <div className="stat-top-info">
            <div className="stat-icon-wrapper">
              {getIcon(stat.icon)}
            </div>
            {stat.trend && (
              <span className={`stat-trend-badge ${stat.trendType === 'up' ? 'trend-up' : 'trend-neutral'}`}>
                {stat.trend}
              </span>
            )}
          </div>
          <h3>{stat.label}</h3>
          <p className="stat-value">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default EarningsOverviewCards;
