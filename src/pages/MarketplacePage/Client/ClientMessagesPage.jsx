import ClientSidebar from "../../../Components/Dashboard/Client/ClientSidebar";
import Header from "../../../Components/Dashboard/Client/Messages/Header";
import "./ClientMarketplace.css";
import ConversationPanel from "../../../Components/Dashboard/Client/Messages/ConversationPanel";
import ChatPanel from "../../../Components/Dashboard/Client/Messages/ChatPanel";


function ClientMessagesPage() {
  return (
    <div className="market-client-layout">
      <ClientSidebar activeTab="messages" />

      <main className="messages-main">
        <Header />

        <section className="messages-layout">
          <ConversationPanel />
          <ChatPanel />
        </section>

      </main>
    </div>
  );
}

export default ClientMessagesPage;
