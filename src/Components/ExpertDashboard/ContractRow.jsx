import { ExternalLink } from 'lucide-react';

const ContractRow = ({ name, client, progress, deadline, urgent = false }) => (
  <tr className="border-bottom border-white-5 transition-all cursor-pointer">
    <td className="px-4 py-4 fw-bold text-primary">{name}</td>
    <td className="px-4 py-4 text-secondary">{client}</td>
    <td className="px-4 py-4 text-center">
      <span className="badge bg-dark border border-white-10 p-2 rounded-3 text-secondary">
        {progress}
      </span>
    </td>
    <td className="px-4 py-4">
      <span 
        className={`badge rounded-3 p-2 fw-bold ${
          urgent 
            ? 'bg-danger-subtle text-danger border border-danger-subtle' 
            : 'bg-primary-subtle text-primary border border-primary-subtle'
        }`} 
        style={{ fontSize: '11px' }}
      >
        {deadline}
      </span>
    </td>
    <td className="px-4 py-4 text-end text-secondary">
      <button className="btn btn-link text-secondary p-1">
        <ExternalLink size={16} />
      </button>
    </td>
  </tr>
);

export default ContractRow;
