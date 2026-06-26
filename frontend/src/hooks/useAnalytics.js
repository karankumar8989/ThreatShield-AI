import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../services/analyticsService';
import { countByScanType, mergeTrendData } from '../utils/helpers';

export function useAnalytics(limit = 50) {
  const [data, setData] = useState({ stats: {}, activities: [], trends: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [threats, accuracy, recent, urlTrends, smsTrends, emailTrends, safe] = await Promise.all([
        analyticsService.getThreatsDetected(),
        analyticsService.getDetectionAccuracy(),
        analyticsService.getRecentActivities(limit),
        analyticsService.getUrlTrends(30),
        analyticsService.getSmsTrends(30),
        analyticsService.getEmailTrends(30),
        analyticsService.getSafeRequests(),
      ]);

      setData({
        stats: {
          threats: threats.data.total,
          accuracy: accuracy.data.total,
          safe: safe.data.total,
          scanCounts: countByScanType(recent.data),
        },
        activities: recent.data,
        trends: mergeTrendData(urlTrends.data, smsTrends.data, emailTrends.data),
      });
    } catch {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { ...data, loading, error, refetch: fetchData };
}
