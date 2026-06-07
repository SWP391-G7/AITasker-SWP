import { Lightbulb, Plus } from "lucide-react"

function TalentCard() {
  return (
    <section className="talent-card">
      <div className="talent-icon">
        <Lightbulb size={22} />
      </div>

      <h2>Need specialized AI talent?</h2>

      <p>
        Post a new task to get matched with top-tier AI engineers within
        24 hours.
      </p>

      <button>
        <Plus size={16} />
        Post a Task Now
      </button>
    </section>
  )
}

export default TalentCard
