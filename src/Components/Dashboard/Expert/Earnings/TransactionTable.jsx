/**
 * Frontend module: Components/Dashboard/Expert/Earnings/TransactionTable.jsx
 *
 * Vai trò: Component Transaction Table: khối giao diện hiển thị lịch sử giao dịch dùng chung cho Dashboard.
 * Luồng chính: Nhận danh sách transactions, hỗ trợ tìm kiếm, định dạng icon/status/số tiền và render table.
 * Lưu ý bảo trì: Thống nhất class CSS và cấu trúc HTML với ClientBillingPage table.
 */
import React, { useState, useMemo } from 'react';
import { Search, Share2, Database, BarChart3 } from 'lucide-react';

// React component “Transaction Table” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const TransactionTable = ({ transactions }) => {
  const [filterText, setFilterText] = useState('');

  // Đọc hoặc suy ra dữ liệu cho nghiệp vụ “get icon”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
  const getIcon = (type) => {
    switch (type) {
      case 'neural': return <Share2 size={18} />;
      case 'database': return <Database size={18} />;
      case 'chart': return <BarChart3 size={18} />;
      default: return <Share2 size={18} />;
    }
  };

  const filteredTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    if (!filterText.trim()) return transactions;
    const query = filterText.toLowerCase();
    return transactions.filter(
      (tx) =>
        (tx.project || '').toLowerCase().includes(query) ||
        (tx.id || '').toLowerCase().includes(query) ||
        (tx.status || '').toLowerCase().includes(query)
    );
  }, [transactions, filterText]);

  return (
    <div className="transactions-card">
      <div className="table-header">
        <h4 className="card-title">Recent Transactions</h4>
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
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
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => (
              <tr key={tx.id}>
                <td>
                  <div className="project-cell">
                    <div className="project-icon-box">
                      {getIcon(tx.iconType)}
                    </div>
                    <div className="project-info">
                      <span className="project-name-text">{tx.project}</span>
                      <div className="id-badges-row">
                        <span className="project-id-text">{tx.id}</span>
                        {tx.escrowTxId && (
                          <span className="escrow-id-tag" title="Escrow.com Sandbox Transaction ID">
                            Escrow #{tx.escrowTxId}
                          </span>
                        )}
                      </div>
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
              <td colSpan="4" className="text-center py-4 text-muted small" style={{ textAlign: 'center' }}>No transactions found</td>
            </tr>
          )}
        </tbody>
      </table>

      {filterText && (
        <span
          className="view-all-link"
          style={{ cursor: 'pointer' }}
          onClick={() => setFilterText('')}
        >
          Reset Filter (Showing {filteredTransactions.length} of {transactions?.length || 0})
        </span>
      )}
    </div>
  );
};

export default TransactionTable;
