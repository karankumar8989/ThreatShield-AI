import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pie, Bar, Line } from 'react-chartjs-2';
import Header from '../components/Header';
import ChartCard from '../components/ChartCard';
import Table, { SeverityBadge, ScanTypeBadge, truncateText, formatDate } from '../components/Table';
import Loader from '../components/Loader';
import ErrorState from '../components/ErrorState';
import { analyticsService } from '../services/analyticsService';
import { countByScanType, mergeTrendData } from '../utils/helpers';
import { chartPalette, defaultChartOptions, pieChartOptions } from '../utils/chartConfig';

export default function Analytics() {
  const [activities, setActivities] = useState([]);
  const [trends, setTrends] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [recent, urlTrends, smsTrends, emailTrends, threats, safe, avgRisk] = await Promise.all([
        analyticsService.getRecentActivities(100),
        analyticsService.getUrlTrends(30),
        analyticsService.getSmsTrends(30),
        analyticsService.getEmailTrends(30),
        analyticsService.getThreatsDetected(),
        analyticsService.getSafeRequests(),
        analyticsService.getAverageRiskScore(),
      ]);

      setActivities(recent.data);
      setTrends(mergeTrendData(urlTrends.data, smsTrends.data, emailTrends.data));
      setStats({
        threats: threats.data.total,
        safe: safe.data.total,
        avgRisk: avgRisk.data.total,
        scanCounts: countByScanType(recent.data),
      });
    } catch {
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const pieData = {
    labels: ['Threats', 'Safe'],
    datasets: [{
      data: [stats.threats || 0, stats.safe || 0],
      backgroundColor: [chartPalette[3], chartPalette[4]],
      borderWidth: 0,
    }],
  };

  const barData = {
    labels: ['URL', 'Email', 'SMS'],
    datasets: [{
      label: 'Scans',
      data: [stats.scanCounts?.url || 0, stats.scanCounts?.email || 0, stats.scanCounts?.sms || 0],
      backgroundColor: chartPalette.slice(0, 3),
      borderRadius: 6,
    }],
  };

  const lineData = {
    labels: trends.map(t => t.date?.slice(5) || ''),
    datasets: [
      { label: 'URL', data: trends.map(t => t.url), borderColor: chartPalette[0], tension: 0.4 },
      { label: 'Email', data: trends.map(t => t.email), borderColor: chartPalette[1], tension: 0.4 },
      { label: 'SMS', data: trends.map(t => t.sms), borderColor: chartPalette[2], tension: 0.4 },
    ],
  };

  const areaData = {
    labels: trends.map(t => t.date?.slice(5) || ''),
    datasets: [{
      label: 'Total Detections',
      data: trends.map(t => t.total),
      borderColor: chartPalette[0],
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      fill: true,
      tension: 0.4,
    }],
  };

  const columns = [
    { key: 'scan_type', label: 'Type', render: (row) => <ScanTypeBadge type={row.scan_type} /> },
    { key: 'input_data', label: 'Input', render: (row) => truncateText(row.input_data, 35) },
    { key: 'prediction', label: 'Category' },
    { key: 'risk_score', label: 'Risk', render: (row) => `${row.risk_score}%` },
    { key: 'severity', label: 'Severity', render: (row) => <SeverityBadge severity={row.risk_score > 80 ? 'Critical' : row.risk_score > 60 ? 'High' : row.risk_score > 30 ? 'Medium' : 'Safe'} /> },
    { key: 'timestamp', label: 'Date', render: (row) => formatDate(row.timestamp) },
  ];

  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Header title="Analytics" subtitle="Threat intelligence and detection trends" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Threat Categories" subtitle="Threats vs safe requests">
          {loading ? <Loader size="sm" text="" /> : (
            <div className="h-[250px]"><Pie data={pieData} options={pieChartOptions} /></div>
          )}
        </ChartCard>
        <ChartCard title="Scan Types" subtitle="Threat categories breakdown">
          {loading ? <Loader size="sm" text="" /> : (
            <div className="h-[250px]"><Bar data={barData} options={defaultChartOptions} /></div>
          )}
        </ChartCard>
        <ChartCard title="Monthly Detection Trend" subtitle="Scan activity over 30 days">
          {loading ? <Loader size="sm" text="" /> : (
            <div className="h-[250px]"><Line data={lineData} options={defaultChartOptions} /></div>
          )}
        </ChartCard>
        <ChartCard title="Detection Volume" subtitle="Total detections area chart">
          {loading ? <Loader size="sm" text="" /> : (
            <div className="h-[250px]"><Line data={areaData} options={defaultChartOptions} /></div>
          )}
        </ChartCard>
      </div>

      <ChartCard title="Recent Threats" subtitle="Latest detected threats and scans">
        {loading ? <Loader /> : activities.length ? (
          <Table columns={columns} data={activities.slice(0, 15)} />
        ) : (
          <p className="text-sm text-slate-500 text-center py-8">No threat data available yet.</p>
        )}
      </ChartCard>
    </motion.div>
  );
}
