import { FiInbox } from 'react-icons/fi';

export default function EmptyState({ title = 'No data found', message = 'There is nothing to display yet.', icon: Icon = FiInbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-full bg-white/5 mb-4">
        <Icon className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-lg font-medium text-slate-300">{title}</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">{message}</p>
    </div>
  );
}
