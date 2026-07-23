/**
 * Frontend module: pages/clients-experts/ClientExpertSearchPage.jsx
 *
 * Vai trò: Page Client Expert Search Page: màn hình cấp route, điều phối dữ liệu và các component con cho một luồng nghiệp vụ hoàn chỉnh.
 * Luồng chính: Đọc route/location, gọi service trong effect/handler, quản lý loading/error/form rồi truyền props xuống UI con.
 * Lưu ý bảo trì: Giữ side effect trong handler/effect và không mutate trực tiếp state hoặc dữ liệu API.
 */
import HeaderCom from "../../Components/Navbar/HeaderCom";
import Footer from "../../Components/Footer/Footer";
import ClientExpertSearch from "../../Components/ClientExpertSearch/ClientExpertSearch";
import "./ClientExpertSearchPage.css";

// React component “Client Expert Search Page” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
function ClientExpertSearchPage() {
  return (
    <div className="marketplace-page-wrapper">
      <HeaderCom />
      <ClientExpertSearch />
      <Footer />
    </div>
  );
}

export default ClientExpertSearchPage;

