import { getSeverityBadgeClass, truncateText, formatDate } from '../utils/helpers';

export default function Table({ columns, data, onRowClick }) {
  if (!data?.length) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-white/5">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5 bg-white/[0.02]">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row.id || idx}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-white/5 last:border-0 transition-colors
                ${onRowClick ? 'cursor-pointer hover:bg-white/[0.03]' : ''}`}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-slate-300 whitespace-nowrap">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SeverityBadge({ severity }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityBadgeClass(severity)}`}>
      {severity}
    </span>
  );
}

export function ScanTypeBadge({ type }) {
  const colors = {
    url: 'bg-accent/20 text-accent',
    email: 'bg-secondary/20 text-secondary',
    sms: 'bg-primary/20 text-primary',
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${colors[type] || 'bg-white/10 text-slate-400'}`}>
      {type}
    </span>
  );
}

export { truncateText, formatDate };
