import { useState, useEffect } from 'react';
import { RefreshCw, Trash2, Info, Database, Clock, Activity } from 'lucide-react';
import { useTheme } from '../../Contexts/ThemeContext.jsx';
import { cacheManager } from '../../Utils/CacheManager.js';
import { useAnalytics } from '../../Hooks/useAnalytics.js';
import { useGallery } from '../../Hooks/useGallery.js';
import PropTypes from 'prop-types';

export default function CacheDebugger({ isOpen, onClose }) {
  const { isDarkTheme } = useTheme();
  const { getCacheInfo: getAnalyticsCacheInfo, clearCache: clearAnalyticsCache } = useAnalytics();
  const { getGalleryCacheInfo, clearGalleryCache } = useGallery();
  
  const [cacheStats, setCacheStats] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const updateCacheStats = () => {
    const stats = cacheManager.getStats();
    const analyticsInfo = getAnalyticsCacheInfo();
    const galleryInfo = getGalleryCacheInfo();
    
    setCacheStats({
      overall: stats,
      analytics: analyticsInfo,
      gallery: galleryInfo,
      lastUpdate: new Date()
    });
  };

  useEffect(() => {
    if (isOpen) {
      updateCacheStats();
      const interval = setInterval(updateCacheStats, 2000); // Update every 2 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      // Clear all caches
      cacheManager.clear();
      updateCacheStats();
    } finally {
      setRefreshing(false);
    }
  };

  const handleClearSpecific = (namespace) => {
    cacheManager.invalidate(namespace);
    updateCacheStats();
  };

  const handleCleanup = () => {
    cacheManager.cleanup();
    updateCacheStats();
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (date) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className={`modal-box w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto ${
        isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-base-100'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Database size={24} className="text-primary" />
            <div>
              <h3 className={`text-xl font-bold ${
                isDarkTheme ? 'text-white' : 'text-base-content'
              }`}>
                Cache Manager
              </h3>
              <p className={`text-sm ${
                isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
              }`}>
                Monitor and manage application cache
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`btn btn-sm gap-2 ${refreshing ? 'loading' : ''}`}
              onClick={handleRefreshAll}
              disabled={refreshing}
            >
              <RefreshCw size={16} />
              Clear All
            </button>
            <button 
              className="btn btn-sm btn-circle"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`stat bg-primary/10 rounded-lg p-4 ${
            isDarkTheme ? 'bg-gray-700' : ''
          }`}>
            <div className="stat-title text-primary">Total Cached Items</div>
            <div className="stat-value text-primary">
              {cacheStats.overall?.total || 0}
            </div>
            <div className="stat-desc">
              Memory: {cacheStats.overall?.memory || 0} | 
              Session: {cacheStats.overall?.session || 0} | 
              Local: {cacheStats.overall?.local || 0}
            </div>
          </div>

          <div className={`stat bg-secondary/10 rounded-lg p-4 ${
            isDarkTheme ? 'bg-gray-700' : ''
          }`}>
            <div className="stat-title text-secondary">Last Update</div>
            <div className="stat-value text-secondary text-lg">
              {formatTime(cacheStats.lastUpdate)}
            </div>
            <div className="stat-desc">Auto-refreshing every 2s</div>
          </div>

          <div className={`stat bg-accent/10 rounded-lg p-4 ${
            isDarkTheme ? 'bg-gray-700' : ''
          }`}>
            <div className="stat-title text-accent">Analytics Cache</div>
            <div className="stat-value text-accent text-lg">
              {cacheStats.analytics?.status || 'Unknown'}
            </div>
            <div className="stat-desc">
              Last fetch: {formatTime(cacheStats.analytics?.lastFetch)}
            </div>
          </div>
        </div>

        {/* Cache Namespaces */}
        <div className="space-y-4">
          <h4 className={`text-lg font-semibold ${
            isDarkTheme ? 'text-white' : 'text-base-content'
          }`}>
            Cache Namespaces
          </h4>

          {/* Analytics Cache */}
          <div className={`card shadow-sm ${
            isDarkTheme ? 'bg-gray-700 border border-gray-600' : 'bg-base-200'
          }`}>
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity size={20} className="text-green-500" />
                  <div>
                    <h5 className="font-semibold">Analytics Cache</h5>
                    <p className="text-sm opacity-70">
                      Dashboard statistics and reports (TTL: 5 minutes)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="badge badge-success">
                    {cacheStats.analytics?.status || 'Unknown'}
                  </div>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={clearAnalyticsCache}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Cache */}
          <div className={`card shadow-sm ${
            isDarkTheme ? 'bg-gray-700 border border-gray-600' : 'bg-base-200'
          }`}>
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database size={20} className="text-blue-500" />
                  <div>
                    <h5 className="font-semibold">Gallery Cache</h5>
                    <p className="text-sm opacity-70">
                      Images, highlights, and event galleries (TTL: 15-60 minutes)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="badge badge-info">Active</div>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={clearGalleryCache}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Cache */}
          <div className={`card shadow-sm ${
            isDarkTheme ? 'bg-gray-700 border border-gray-600' : 'bg-base-200'
          }`}>
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-orange-500" />
                  <div>
                    <h5 className="font-semibold">Booking Cache</h5>
                    <p className="text-sm opacity-70">
                      Booking requests and status data (TTL: 2 minutes)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="badge badge-warning">Short TTL</div>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleClearSpecific('bookings')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cache Actions */}
        <div className="divider"></div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Info size={16} className="text-info" />
            <span className="text-sm opacity-70">
              Cache helps improve performance by storing frequently accessed data
            </span>
          </div>
          <div className="flex gap-2">
            <button
              className="btn btn-sm btn-outline"
              onClick={handleCleanup}
            >
              Cleanup Expired
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={updateCacheStats}
            >
              Refresh Stats
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}

CacheDebugger.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
