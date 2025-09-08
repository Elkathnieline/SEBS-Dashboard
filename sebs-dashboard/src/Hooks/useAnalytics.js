import { useState, useEffect, useCallback } from 'react';
import analyticsService from '../Services/AnalyticsService.js';
import { cacheManager } from '../Utils/CacheManager.js';

export const useAnalytics = (dateRange = 'year', options = {}) => {
  const {
    autoRefresh = false,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
    enableCaching = true
  } = options;

  const [analytics, setAnalytics] = useState({
    totalBookings: 0,
    totalSiteVisits: 0,
    monthlyBookings: 0,
    monthlySiteVisits: 0,
    chartData: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [cacheStatus, setCacheStatus] = useState('miss');

  const fetchAnalytics = useCallback(async (range = dateRange, forceRefresh = false) => {
    setLoading(true);
    setError(null);
    
    try {
      let data;
      
      if (enableCaching && !forceRefresh) {
        // Try to get cached data first
        data = await analyticsService.getCachedAnalytics(range);
        setCacheStatus(data ? 'hit' : 'miss');
      } else {
        // Force fresh data
        data = await analyticsService.fetchAllAnalytics(range);
        setCacheStatus('refresh');
      }
      
      const [totalBookings, totalSiteVisits, monthlyBookings, monthlySiteVisits, chartData] = data;
      
      setAnalytics({
        totalBookings,
        totalSiteVisits,
        monthlyBookings,
        monthlySiteVisits,
        chartData
      });
      
      setLastFetch(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [dateRange, enableCaching]);

  // Force refresh analytics data
  const refreshAnalytics = useCallback(async (range = dateRange) => {
    return fetchAnalytics(range, true);
  }, [fetchAnalytics, dateRange]);

  // Get cache statistics
  const getCacheInfo = useCallback(() => {
    return {
      status: cacheStatus,
      lastFetch,
      stats: cacheManager.getStats(),
      keys: [
        cacheManager.generateKey('analytics', 'total-bookings'),
        cacheManager.generateKey('analytics', 'total-site-visits'),
        cacheManager.generateKey('analytics', 'monthly-bookings'),
        cacheManager.generateKey('analytics', 'monthly-site-visits'),
        cacheManager.generateKey('analytics', 'booking-chart', { dateRange })
      ]
    };
  }, [cacheStatus, lastFetch, dateRange]);

  // Clear analytics cache
  const clearCache = useCallback(() => {
    cacheManager.invalidate('analytics');
    setCacheStatus('cleared');
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAnalytics();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchAnalytics]);

  // Listen for booking events to refresh analytics
  useEffect(() => {
    const handleBookingUpdate = () => {
      // Delay refresh to allow backend to process
      setTimeout(() => fetchAnalytics(), 1000);
    };

    window.addEventListener('bookingStatusUpdate', handleBookingUpdate);
    window.addEventListener('bookingDeclined', handleBookingUpdate);
    window.addEventListener('bookingCreate', handleBookingUpdate);

    return () => {
      window.removeEventListener('bookingStatusUpdate', handleBookingUpdate);
      window.removeEventListener('bookingDeclined', handleBookingUpdate);
      window.removeEventListener('bookingCreate', handleBookingUpdate);
    };
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    lastFetch,
    cacheStatus,
    refetch: fetchAnalytics,
    refresh: refreshAnalytics,
    clearCache,
    getCacheInfo
  };
};