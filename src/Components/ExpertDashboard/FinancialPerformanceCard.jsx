import AnimatedNumber from './AnimatedNumber';
import SimpleBarChart from './SimpleBarChart';
import MetricCard from './MetricCard';
import { EXPERT_CHART_DATA } from '../../services/expertDashboardData';

const FinancialPerformanceCard = ({ isReady }) => {
  return (
    <section className="card glass-card hover-card p-4 shadow-lg rounded-4 overflow-hidden">
      <div className="d-flex flex-column md:flex-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="small fw-bold text-secondary text-uppercase tracking-widest mb-1">
            Financial Performance
          </h2>
          <div className="d-flex align-items-baseline gap-2 glow-text">
            <span className="h1 fw-bold mb-0 text-primary">
              <AnimatedNumber value={24850.00} />
            </span>
            <span className="small text-secondary fw-medium">Total Lifetime Earnings</span>
          </div>
        </div>
        <button className="btn btn-primary px-4 py-2 rounded-3 fw-bold transition-all shadow-sm">
          Withdraw Funds
        </button>
      </div>

      <div className="row g-3 mb-4">
        <MetricCard label="Available Balance" value="$8,240.00" />
        <MetricCard label="Pending Clearance" value="$4,120.00" />
        <MetricCard label="Withdrawn" value="$12,490.00" />
      </div>

      <div className="w-100" style={{ height: '280px' }}>
        <SimpleBarChart data={EXPERT_CHART_DATA} isAnimate={isReady} />
      </div>
    </section>
  );
};

export default FinancialPerformanceCard;
