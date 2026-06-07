import { BriefcaseBusiness, CircleDollarSign, Send } from "lucide-react"
import StatCard from "./StatCard"

function ClientStats() {
  return (
    <section className="stats-grid">
      <StatCard
        icon={<CircleDollarSign size={22} />}
        title="Total Spent"
        value="$24,500.00"
        badge="+12.5%"
        badgeType="success"
      />

      <StatCard
        icon={<BriefcaseBusiness size={22} />}
        title="Active Projects"
        value="8"
        subtitle="/ 12 Total"
        badge="Active"
      />

      <StatCard
        icon={<Send size={22} />}
        title="Pending Proposals"
        value="3"
        badge="Action Needed"
        badgeType="danger"
      />
    </section>
  )
}

export default ClientStats
