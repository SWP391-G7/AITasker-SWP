/**
 * Frontend module: Components/ClientExpertSearch/ClientExpertPagination.jsx
 *
 * Vai trò: Component Client Expert Pagination: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { ChevronLeft, ChevronRight } from "lucide-react";

// React component “Client Expert Pagination” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const ClientExpertPagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => {
          onPageChange(Math.max(1, page - 1));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        <ChevronLeft size={22} />
      </button>

      {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((item) => (
        <button
          type="button"
          key={item}
          className={page === item ? "active" : ""}
          onClick={() => {
            onPageChange(item);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          {item}
        </button>
      ))}

      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => {
          onPageChange(Math.min(totalPages, page + 1));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        <ChevronRight size={22} />
      </button>
    </div>
  );
};

export default ClientExpertPagination;
