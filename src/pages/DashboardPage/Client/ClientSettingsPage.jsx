import ClientSidebar from "../../../Components/Dashboard/Client/ClientSidebar";
import Footer from "../../../Components/Footer/Footer";
import "./ClientMarketplace.css";

function ClientSettingsPage() {
  return (
    <div className="market-client-layout">
      <ClientSidebar activeTab="settings" />

      <main className="market-main">
        <header className="market-topbar">
          <div>
            <h1>Settings</h1>
            <p>This page allows client to update account settings.</p>
          </div>
        </header>

        <section className="client-settings-panel">
          <h2>Account Preferences</h2>
          <p>Profile, notification, and workspace settings will be managed here.</p>
        </section>

        <Footer variant="dashboard" />
      </main>
    </div>
  );
}

export default ClientSettingsPage;
