import React, { useState, useEffect } from 'react';
import { RefreshCw, Database, Clock } from 'lucide-react';
import { useTheme } from '../../Contexts/ThemeContext.jsx';
import { useAnalytics } from '../../Hooks/useAnalytics.js';
import { useGallery } from '../../Hooks/useGallery.js';
import { cacheManager } from '../../Utils/CacheManager.js';

/**
 * Example component demonstrating the new caching system
 * Shows cache usage, benefits, and controls
 */
export default function CacheExample() {
  const { isDarkTheme } = useTheme();
  const [cacheStats, setCacheStats] = useState({});
  const [refreshCount, setRefreshCount] = useState(0);
  
  // Use cached analytics with auto-refresh
  const { 
    analytics, 
    loading: analyticsLoading, 
    cacheStatus,
    refresh: refreshAnalytics,
    clearCache: clearAnalyticsCache
  } = useAnalytics('year', {
    autoRefresh: true,
    refreshInterval: 30000 // 30 seconds for demo
  });

  // Use cached gallery data
  const { 
    fetchHighlights,
    refreshGalleryCache,
    clearGalleryCache
  } = useGallery();

  // Update cache statistics
  useEffect(() => {
    const updateStats = () => {
      setCacheStats(cacheManager.getStats());
    };
    
    updateStats();
    const interval = setInterval(updateStats, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRefreshAll = () => {
    setRefreshCount(prev => prev + 1);
    refreshAnalytics();
    refreshGalleryCache();
  };

  const handleClearAll = () => {
    cacheManager.clear();
    setCacheStats(cacheManager.getStats());
  };

  const getCacheStatusColor = (status) => {
    switch (status) {
      case 'hit': return 'text-green-500';
      case 'miss': return 'text-yellow-500';
      case 'refresh': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className={`p-6 rounded-lg shadow-lg ${
      isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-base-100'
    }`}>
      <div className="flex items-center gap-3 mb-6">
        <Database size={24} className="text-primary" />
        <div>
          <h3 className={`text-xl font-bold ${
            isDarkTheme ? 'text-white' : 'text-base-content'
          }`}>
            Caching System Demo
          </h3>
          <p className={`text-sm ${
            isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
          }`}>
            Intelligent caching improves performance and user experience
          </p>
        </div>
      </div>

      {/* Cache Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`stat bg-primary/10 rounded-lg p-4 ${
          isDarkTheme ? 'bg-gray-700' : ''
        }`}>
          <div className="stat-title text-primary">Total Cached Items</div>
          <div className="stat-value text-primary text-2xl">
            {cacheStats.total || 0}
          </div>
          <div className="stat-desc">
            Memory: {cacheStats.memory || 0} | Session: {cacheStats.session || 0}
          </div>
        </div>

        <div className={`stat bg-secondary/10 rounded-lg p-4 ${
          isDarkTheme ? 'bg-gray-700' : ''
        }`}>
          <div className="stat-title text-secondary">Analytics Cache</div>
          <div className={`stat-value text-lg ${getCacheStatusColor(cacheStatus)}`}>
            {cacheStatus || 'Unknown'}
          </div>
          <div className="stat-desc">
            {analyticsLoading ? 'Loading...' : 'Ready'}
          </div>
        </div>

        <div className={`stat bg-accent/10 rounded-lg p-4 ${
          isDarkTheme ? 'bg-gray-700' : ''
        }`}>
          <div className="stat-title text-accent">Refresh Count</div>
          <div className="stat-value text-accent text-2xl">
            {refreshCount}
          </div>
          <div className="stat-desc">Manual refreshes performed</div>
        </div>
      </div>

      {/* Cache Benefits Display */}
      <div className={`alert shadow-sm mb-6 ${
        isDarkTheme ? 'bg-gray-700 border-gray-600' : 'alert-info'
      }`}>
        <Database size={20} />
        <div>
          <h4 className="font-semibold">Cache Benefits Active</h4>
          <ul className="text-sm mt-2 space-y-1">
            <li>✅ Analytics data cached for 5 minutes (faster dashboard loading)</li>
            <li>✅ Gallery metadata cached for 30 minutes (instant image browsing)</li>
            <li>✅ Static data cached for hours (enum values, service listings)</li>
            <li>✅ Automatic invalidation on data changes</li>
          </ul>
        </div>
      </div>

      {/* Analytics Data Preview */}
      {analytics && (
        <div className={`card shadow-sm mb-6 ${
          isDarkTheme ? 'bg-gray-700 border border-gray-600' : 'bg-base-200'
        }`}>
          <div className="card-body p-4">
            <h5 className="card-title text-lg">Cached Analytics Data</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {analytics.totalBookings}
                </div>
                <div className="text-xs opacity-70">Total Bookings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">
                  {analytics.totalSiteVisits}
                </div>
                <div className="text-xs opacity-70">Site Visits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {analytics.monthlyBookings}
                </div>
                <div className="text-xs opacity-70">Monthly Bookings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">
                  {analytics.monthlySiteVisits}
                </div>
                <div className="text-xs opacity-70">Monthly Visits</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Comparison */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-6`}>
        <div className={`card shadow-sm ${
          isDarkTheme ? 'bg-gray-700' : 'bg-red-50'
        }`}>
          <div className="card-body p-4">
            <h6 className="font-semibold text-red-500 mb-2">Without Caching</h6>
            <ul className="text-sm space-y-1">
              <li>• API call on every page load</li>
              <li>• 500-2000ms loading time</li>
              <li>• High server load</li>
              <li>• Poor offline experience</li>
              <li>• Constant loading spinners</li>
            </ul>
          </div>
        </div>

        <div className={`card shadow-sm ${
          isDarkTheme ? 'bg-gray-700' : 'bg-green-50'
        }`}>
          <div className="card-body p-4">
            <h6 className="font-semibold text-green-500 mb-2">With Caching</h6>
            <ul className="text-sm space-y-1">
              <li>• Instant data from cache</li>
              <li>• &lt;50ms response time</li>
              <li>• Reduced server load</li>
              <li>• Works offline</li>
              <li>• Smooth user experience</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          className="btn btn-primary btn-sm gap-2"
          onClick={handleRefreshAll}
        >
          <RefreshCw size={16} />
          Refresh Data
        </button>
        
        <button
          className="btn btn-secondary btn-sm gap-2"
          onClick={clearAnalyticsCache}
        >
          <Clock size={16} />
          Clear Analytics
        </button>
        
        <button
          className="btn btn-accent btn-sm gap-2"
          onClick={clearGalleryCache}
        >
          <Database size={16} />
          Clear Gallery
        </button>
        
        <button
          className="btn btn-error btn-sm gap-2"
          onClick={handleClearAll}
        >
          <Database size={16} />
          Clear All Cache
        </button>
      </div>

      {/* Cache Implementation Code Example */}
      <div className="mt-6">
        <details className="collapse bg-base-200">
          <summary className="collapse-title text-lg font-medium">
            Implementation Example
          </summary>
          <div className="collapse-content">
            <pre className="text-sm overflow-x-auto p-4 bg-base-300 rounded">
{`// Automatic caching in services
const highlights = await galleryService.fetchHighlights();

// Hook with cache control
const { analytics, refresh, clearCache } = useAnalytics('year', {
  autoRefresh: true,
  refreshInterval: 5 * 60 * 1000 // 5 minutes
});

// Manual cache operations
cacheManager.invalidate('analytics');
cacheManager.set('custom-key', data, { ttl: 600000 });
const cached = cacheManager.get('namespace_key');`}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
}
