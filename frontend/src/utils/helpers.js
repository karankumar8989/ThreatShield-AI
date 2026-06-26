import { SEVERITY_COLORS } from './constants';

export function getSuggestedAction(severity, prediction) {
  const isThreat = prediction?.toLowerCase() !== 'safe' &&
    prediction?.toLowerCase() !== 'legitimate' &&
    prediction?.toLowerCase() !== 'ham';

  if (!isThreat || severity === 'Safe') {
    return 'No action required. Content appears safe.';
  }
  switch (severity) {
    case 'Critical':
      return 'Block immediately and report to security team.';
    case 'High':
      return 'Quarantine content and investigate the source.';
    case 'Medium':
      return 'Review carefully before taking any action.';
    default:
      return 'Monitor and verify with additional checks.';
  }
}

export function getSeverityBadgeClass(severity) {
  return SEVERITY_COLORS[severity] || SEVERITY_COLORS.Medium;
}

export function truncateText(text, maxLength = 60) {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  const decoded = decodeJwt(token);
  if (!decoded?.exp) return false;
  return Date.now() >= decoded.exp * 1000;
}

export function countByScanType(activities) {
  return activities.reduce(
    (acc, item) => {
      const type = item.scan_type?.toLowerCase() || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    { url: 0, email: 0, sms: 0 }
  );
}

export function mergeTrendData(urlTrends, smsTrends, emailTrends) {
  const dateMap = {};

  const addToMap = (data, key) => {
    data.forEach(({ date, count }) => {
      if (!dateMap[date]) dateMap[date] = { date, url: 0, sms: 0, email: 0, total: 0 };
      dateMap[date][key] = count;
      dateMap[date].total += count;
    });
  };

  addToMap(urlTrends, 'url');
  addToMap(smsTrends, 'sms');
  addToMap(emailTrends, 'email');

  return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
}

export function getReportsHistory() {
  try {
    return JSON.parse(localStorage.getItem('threatshield_reports') || '[]');
  } catch {
    return [];
  }
}

export function saveReportToHistory(report) {
  const history = getReportsHistory();
  history.unshift({ ...report, id: Date.now(), createdAt: new Date().toISOString() });
  localStorage.setItem('threatshield_reports', JSON.stringify(history.slice(0, 50)));
}

export function paginate(items, page, pageSize) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
