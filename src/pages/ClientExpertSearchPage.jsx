import HeaderCom from "../Components/Navbar/HeaderCom";
import Footer from "../Components/Footer/Footer";
import ClientExpertSearch from "../Components/ClientExpertSearch/ClientExpertSearch";
import "./ClientExpertSearchPage.css";

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
