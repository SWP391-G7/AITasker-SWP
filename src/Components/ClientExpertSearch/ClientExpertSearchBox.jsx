/**
 * Frontend module: Components/ClientExpertSearch/ClientExpertSearchBox.jsx
 *
 * Vai trò: Component Client Expert Search Box: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { Search } from "lucide-react";

// React component “Client Expert Search Box” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const ClientExpertSearchBox = ({ isExpertMode, search, onSearchChange, onSearch }) => (
  <div className="expert-search-box">
    <Search size={22} style={{ cursor: "pointer" }} onClick={() => onSearch(search)} />
    <input
      value={search}
      onChange={(e) => onSearchChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSearch(search);
      }}
      placeholder={isExpertMode ? "Search clients..." : "Search specialists..."}
    />
    <span style={{ cursor: "pointer" }} onClick={() => onSearch(search)}>Enter</span>
  </div>
);

export default ClientExpertSearchBox;
