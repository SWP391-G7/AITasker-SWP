import { Search } from "lucide-react";

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
