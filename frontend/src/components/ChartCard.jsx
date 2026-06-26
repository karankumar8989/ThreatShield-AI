import Card from './Card';

export default function ChartCard({ title, subtitle, children, action, className = '' }) {
  return (
    <Card className={`${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="relative min-h-[200px]">{children}</div>
    </Card>
  );
}
