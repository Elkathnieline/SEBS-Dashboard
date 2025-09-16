import { useState, useEffect, useCallback } from 'react';
import analyticsService from '../Services/AnalyticsService.js';

export const useAnalytics = (dateRange = 'year') => {
  const [analytics, setAnalytics] = useState({
    totalBookings: 0,
    totalSiteVisits: 0,
    monthlyBookings: 0,
    monthlySiteVisits: 0,
    chartData: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async (range = dateRange) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await analyticsService.fetchAllAnalytics(range);
      const [totalBookings, totalSiteVisits, monthlyBookings, monthlySiteVisits, chartData] = data;
      
      setAnalytics({
        totalBookings,
        totalSiteVisits,
        monthlyBookings,
        monthlySiteVisits,
        chartData
      });
    } catch (err) {
      setError(err.message);
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  };
};