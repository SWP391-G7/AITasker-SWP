import React from 'react';
import { Search, Share2, Database, BarChart3 } from 'lucide-react';

const TransactionTable = ({ transactions }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'neural': return <Share2 size={18} />;
      case 'database': return <Database size={18} />;
      case 'chart': return <BarChart3 size={18} />;
      default: return <Share2 size={18} />;
    }
  };

  return (
    <div className="transactions-card">
      <div className="table-header">
        <h4 className="card-title">Recent Transactions</h4>
        <div className="search-input-wrapper">
          <Search size={16} />
          <input type="text" placeholder="Search tasks..." />
        </div>
      </div>

      <table className="transactions-table">
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Date</th>
            <th>Status</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(transactions) && transactions.length > 0 ? (
            transactions.map((tx) => (
            <tr key={tx.id}>
              <td>
                <div className="project-cell">
                  <div className="project-icon-box">
                    {getIcon(tx.iconType)}
                  </div>
                  <div className="project-info">
                    <span className="project-name-text">{tx.project}</span>
                    <span className="project-id-text">{tx.id}</span>
                  </div>
                </div>
              </td>
              <td>{tx.date}</td>
              <td>
                <span className={`status-pill ${tx.statusType === 'success' ? 'status-success' : 'status-active'}`}>
                  {tx.status}
                </span>
              </td>
              <td>
                <span className="amount-text">{tx.amount}</span>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4" className="text-center py-4 text-muted small">No transactions found</td>
          </tr>
        )}
        </tbody>
      </table>

      <a href="#" className="view-all-link">View All Transactions</a>
    </div>
  );
};

export default TransactionTable;
