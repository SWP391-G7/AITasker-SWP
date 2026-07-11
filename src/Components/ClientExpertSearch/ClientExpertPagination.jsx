import { ChevronLeft, ChevronRight } from "lucide-react";

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
