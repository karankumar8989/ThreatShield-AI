import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pie, Line } from 'react-chartjs-2';
import {
  FiShield, FiMail, FiLink, FiTarget, FiFileText,
} from 'react-icons/fi';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import Table, { SeverityBadge, ScanTypeBadge, truncateText, formatDate } from '../components/Table';
import Loader from '../components/Loader';
import ErrorState from '../components/ErrorState';
import { analyticsService } from '../services/analyticsService';
import { countByScanType, mergeTrendData } from '../utils/helpers';
import { chartPalette, defaultChartOptions, pieChartOptions } from '../utils/chartConfig';

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [activities, setActivities] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [threats, accuracy, recent, urlTrends, smsTrends, emailTrends] = await Promise.all([
        analyticsService.getThreatsDetected(),
        analyticsService.getDetectionAccuracy(),
        analyticsService.getRecentActivities(50),
        analyticsService.getUrlTrends(30),
        analyticsService.getSmsTrends(30),
        analyticsService.getEmailTrends(30),
      ]);

      const scanCounts = countByScanType(recent.data);
      const reportsCount = JSON.parse(localStorage.getItem('threatshield_reports') || '[]').length;

      setStats({
        threats: threats.data.total,
        emails: scanCounts.email,
        urls: scanCounts.url,
        accuracy: accuracy.data.total,
        reports: reportsCount,
      });
      setActivities(recent.data);
      setTrends(mergeTrendData(urlTrends.data, smsTrends.data, emailTrends.data));
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const threatDistribution = {
    labels: ['URL', 'Email', 'SMS'],
    datasets: [{
      data: [stats.urls || 0, stats.emails || 0, activities.filter(a => a.scan_type === 'sms').length],
      backgroundColor: chartPalette.slice(0, 3),
      borderWidth: 0,
    }],
  };

  const monthlyData = {
    labels: trends.map(t => t.date?.slice(5) || ''),
    datasets: [{
      label: 'Detections',
      data: trends.map(t => t.total),
      borderColor: chartPalette[0],
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  const columns = [
    { key: 'scan_type', label: 'Type', render: (row) => <ScanTypeBadge type={row.scan_type} /> },
    { key: 'input_data', label: 'Input', render: (row) => truncateText(row.input_data, 40) },
    { key: 'prediction', label: 'Prediction' },
    { key: 'risk_score', label: 'Risk', render: (row) => `${row.risk_score}%` },
    { key: 'severity', label: 'Severity', render: (row) => <SeverityBadge severity={row.risk_score > 80 ? 'Critical' : row.risk_score > 60 ? 'High' : row.risk_score > 30 ? 'Medium' : 'Safe'} /> },
    { key: 'timestamp', label: 'Time', render: (row) => formatDate(row.timestamp) },
  ];

  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Header
        title="Security Dashboard"
        subtitle="Real-time threat intelligence overview"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <StatCard title="Threats Detected" value={stats.threats ?? 0} icon={FiShield} color="danger" loading={loading} />
        <StatCard title="Emails Scanned" value={stats.emails ?? 0} icon={FiMail} color="secondary" loading={loading} />
        <StatCard title="URLs Scanned" value={stats.urls ?? 0} icon={FiLink} color="accent" loading={loading} />
        <StatCard title="Accuracy" value={stats.accuracy ?? 0} icon={FiTarget} color="success" suffix="%" loading={loading} />
        <StatCard title="Reports Generated" value={stats.reports ?? 0} icon={FiFileText} color="primary" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Threat Distribution" subtitle="Scans by category">
          {loading ? <Loader size="sm" text="" /> : (
            <div className="h-[250px]">
              <Pie data={threatDistribution} options={pieChartOptions} />
            </div>
          )}
        </ChartCard>
        <ChartCard title="Monthly Analytics" subtitle="Detection trend (30 days)">
          {loading ? <Loader size="sm" text="" /> : (
            <div className="h-[250px]">
              <Line data={monthlyData} options={defaultChartOptions} />
            </div>
          )}
        </ChartCard>
      </div>

      <ChartCard title="Recent Activity" subtitle="Latest security scans">
        {loading ? <Loader /> : activities.length ? (
          <Table columns={columns} data={activities.slice(0, 10)} />
        ) : (
          <p className="text-sm text-slate-500 text-center py-8">No recent activity. Run a scan to get started.</p>
        )}
      </ChartCard>
    </motion.div>
  );
}
