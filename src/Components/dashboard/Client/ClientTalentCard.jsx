import { Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ClientTalentCard() {
  const navigate = useNavigate();

  return (
    <div className="talent-cta-card">
      <div className="talent-icon-box">
        <Lightbulb size={24} />
      </div>

      <h2>Need specialized AI talent?</h2>

      <p>
        Post a new task to get matched with top-tier AI engineers within 24
        hours.
      </p>

      <button onClick={() => navigate("/client/post-job")}>
        Post a Task Now
      </button>
    </div>
  );
}

export default ClientTalentCard;