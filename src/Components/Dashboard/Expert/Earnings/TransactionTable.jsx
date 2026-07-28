/**
 * Frontend module: Components/Dashboard/Expert/Earnings/TransactionTable.jsx
 *
 * Vai trò: Component Transaction Table: khối giao diện hiển thị lịch sử giao dịch dùng chung cho Dashboard.
 * Luồng chính: Nhận danh sách transactions, hỗ trợ tìm kiếm, định dạng icon/status/số tiền và render table.
 * Lưu ý bảo trì: Thống nhất class CSS và cấu trúc HTML với ClientBillingPage table.
 */
import React, { useState } from 'react';
import { Search, Landmark, ArrowDownLeft, ShieldCheck, CheckCircle2, Clock3, AlertCircle } from 'lucide-react';

const TYPE_LABELS = {
  escrow_deposit: 'Escrow deposit',
  escrow_release: 'Escrow release',
  refund: 'Refund',
  payout: 'Payout',
};

const TransactionTable = ({ transactions = [], searchQuery = '', onSearchChange }) => {
  const [localSearch, setLocalSearch] = useState('');

  const query = (onSearchChange ? searchQuery : localSearch).trim().toLowerCase();

  const filtered = (Array.isArray(transactions) ? transactions : []).filter((tx) => {
    if (!query) return true;
    const projectText = (tx.project || tx.project_title || '').toLowerCase();
    const idText = (tx.id || '').toLowerCase();
    const statusText = (tx.status || '').toLowerCase();
    return projectText.includes(query) || idText.includes(query) || statusText.includes(query);
  });

  const getIcon = (tx) => {
    const type = (tx.type || tx.normalizedType || '').toLowerCase();
    if (type === 'refund') return <ArrowDownLeft size={18} />;
    if (type === 'escrow_release') return <ShieldCheck size={18} />;
    return <Landmark size={18} />;
  };

  const getStatusClass = (statusType, status) => {
    const s = (status || '').toLowerCase();
    if (statusType === 'success' || s === 'completed' || s === 'secured') return 'status-success';
    if (s === 'failed') return 'status-failed';
    return 'status-active';
  };

  return (
    <div className="transactions-card">
      <div className="table-header">
        <h4 className="card-title">Recent Transactions</h4>
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="search"
            value={onSearchChange ? searchQuery : localSearch}
            onChange={(e) => (onSearchChange ? onSearchChange(e.target.value) : setLocalSearch(e.target.value))}
            placeholder="Search transactions..."
          />
        </div>
      </div>

      <div className="client-billing-table-wrap">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Project & Transaction</th>
              <th>Type</th>
              <th>Date</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((tx) => (
                <tr key={tx.id}>
                  <td>
                    <div className="project-cell">
                      <div className="project-icon-box">{getIcon(tx)}</div>
                      <div className="project-info">
                        <span className="project-name-text">{tx.project || tx.project_title || 'Transaction'}</span>
                        <span className="project-id-text">{tx.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="billing-type-tag">
                      {TYPE_LABELS[tx.type || tx.normalizedType] || tx.type || 'Transaction'}
                    </span>
                  </td>
                  <td>{tx.date || (tx.complete_at ? new Date(tx.complete_at).toLocaleDateString() : 'N/A')}</td>
                  <td>
                    <span className={`status-pill ${getStatusClass(tx.statusType, tx.status)}`}>
                      {(tx.status || 'COMPLETED').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className="amount-text">{tx.amount}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
                  No transaction history found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
