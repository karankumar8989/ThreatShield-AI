import api from './api';

export const analyticsService = {
  getTotalScans: () => api.get('/analytics/total-scans'),
  getThreatsDetected: () => api.get('/analytics/threats-detected'),
  getSafeRequests: () => api.get('/analytics/safe-requests'),
  getAverageRiskScore: () => api.get('/analytics/average-risk-score'),
  getDetectionAccuracy: () => api.get('/analytics/detection-accuracy'),
  getRecentActivities: (limit = 10) =>
    api.get('/analytics/recent-activities', { params: { limit } }),
  getUrlTrends: (days = 30) =>
    api.get('/analytics/trends/url', { params: { days } }),
  getSmsTrends: (days = 30) =>
    api.get('/analytics/trends/sms', { params: { days } }),
  getEmailTrends: (days = 30) =>
    api.get('/analytics/trends/email', { params: { days } }),
};
