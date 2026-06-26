export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const TOKEN_KEY = 'threatshield_token';
export const USER_EMAIL_KEY = 'threatshield_email';
export const REPORTS_HISTORY_KEY = 'threatshield_reports';
export const THEME_KEY = 'threatshield_theme';
export const NOTIFICATIONS_KEY = 'threatshield_notifications';

export const SEVERITY_COLORS = {
  Critical: 'bg-danger/20 text-danger border-danger/30',
  High: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Safe: 'bg-success/20 text-success border-success/30',
};

export const SCAN_TYPES = [
  { id: 'url', label: 'URL', endpoint: '/predict/url' },
  { id: 'sms', label: 'SMS', endpoint: '/predict/sms' },
  { id: 'email', label: 'Email', endpoint: '/predict/email' },
  { id: 'custom', label: 'Custom Text', endpoint: '/predict/sms' },
];

export const SIDEBAR_LINKS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'FiGrid' },
  { path: '/prediction', label: 'Threat Detection', icon: 'FiShield' },
  { path: '/email-scanner', label: 'Email Scanner', icon: 'FiMail' },
  { path: '/url-scanner', label: 'URL Scanner', icon: 'FiLink' },
  { path: '/analytics', label: 'Analytics', icon: 'FiBarChart2' },
  { path: '/reports', label: 'Reports', icon: 'FiFileText' },
  { path: '/settings', label: 'Settings', icon: 'FiSettings' },
];

export const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  accent: '#06B6D4',
  danger: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
};
