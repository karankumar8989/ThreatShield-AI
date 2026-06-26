import { motion } from 'framer-motion';
import {
  FiShield, FiAlertTriangle, FiCheckCircle, FiActivity,
} from 'react-icons/fi';
import Card from './Card';
import { SeverityBadge } from './Table';
import { getSuggestedAction } from '../utils/helpers';

export default function PredictionResult({ result, loading }) {
  if (loading) {
    return (
      <Card className="space-y-4">
        <div className="h-6 w-40 skeleton rounded" />
        <div className="h-4 w-full skeleton rounded" />
        <div className="h-4 w-3/4 skeleton rounded" />
        <div className="h-3 w-full skeleton rounded-full mt-4" />
      </Card>
    );
  }

  if (!result) return null;

  const { prediction, confidence, risk_score, severity } = result;
  const confidencePercent = Math.round(confidence * 100);
  const isSafe = severity === 'Safe';
  const suggestedAction = getSuggestedAction(severity, prediction);

  const iconMap = {
    Critical: FiAlertTriangle,
    High: FiAlertTriangle,
    Medium: FiActivity,
    Safe: FiCheckCircle,
  };
  const ResultIcon = iconMap[severity] || FiShield;

  const barColor = isSafe ? 'bg-success' : severity === 'Critical' ? 'bg-danger' : severity === 'High' ? 'bg-orange-500' : 'bg-yellow-500';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 20 }}
    >
      <Card className={`relative overflow-hidden ${isSafe ? 'border-success/20' : 'border-danger/20'}`}>
        <div className={`absolute top-0 left-0 w-full h-1 ${barColor}`} />

        <div className="flex items-start gap-4 mb-6">
          <div className={`p-3 rounded-xl ${isSafe ? 'bg-success/10' : 'bg-danger/10'}`}>
            <ResultIcon className={`w-8 h-8 ${isSafe ? 'text-success' : 'text-danger'}`} />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-white">{prediction}</h3>
              <SeverityBadge severity={severity} />
            </div>
            <p className="text-sm text-slate-400">Threat Type: {prediction}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="glass-light rounded-lg p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Confidence</p>
            <p className="text-2xl font-bold text-white">{confidencePercent}%</p>
          </div>
          <div className="glass-light rounded-lg p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Risk Level</p>
            <p className="text-2xl font-bold text-white">{risk_score}/100</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Probability Meter</span>
            <span className="text-white font-medium">{risk_score}%</span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${risk_score}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${barColor}`}
            />
          </div>
        </div>

        <div className="glass-light rounded-lg p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Suggested Action</p>
          <p className="text-sm text-slate-300">{suggestedAction}</p>
        </div>
      </Card>
    </motion.div>
  );
}
