import { motion } from 'framer-motion';
import Card from './Card';

export default function StatCard({ title, value, icon: Icon, color = 'primary', suffix = '', loading = false }) {
  const colorMap = {
    primary: 'from-primary/20 to-primary/5 text-primary',
    secondary: 'from-secondary/20 to-secondary/5 text-secondary',
    danger: 'from-danger/20 to-danger/5 text-danger',
    success: 'from-success/20 to-success/5 text-success',
    accent: 'from-accent/20 to-accent/5 text-accent',
  };

  return (
    <Card hover className="relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${colorMap[color]} rounded-bl-full opacity-50`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-20 skeleton rounded" />
          ) : (
            <motion.p
              key={value}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-2xl md:text-3xl font-bold text-white"
            >
              {value}{suffix}
            </motion.p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg bg-gradient-to-br ${colorMap[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </Card>
  );
}
