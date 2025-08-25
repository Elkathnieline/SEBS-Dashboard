import { useState, useEffect } from 'react';
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

  const fetchAnalytics = async (range = dateRange) => {
    setLoading(true);
    setError(null);
    
    try {
      const [totalBookings, totalSiteVisits, monthlyBookings, monthlySiteVisits, chartData] = 
        await analyticsService.fetchAllAnalytics(range);
      
      setAnalytics({
        totalBookings,
        totalSiteVisits,
        monthlyBookings,
        monthlySiteVisits,
        chartData
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  };
};