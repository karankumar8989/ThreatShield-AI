import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import Button from './Button';

export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-full bg-danger/10 mb-4">
        <FiAlertTriangle className="w-8 h-8 text-danger" />
      </div>
      <h3 className="text-lg font-medium text-slate-300">Error</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry} icon={FiRefreshCw}>
          Try Again
        </Button>
      )}
    </div>
  );
}
