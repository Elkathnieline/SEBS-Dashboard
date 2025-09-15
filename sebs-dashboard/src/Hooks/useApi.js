import { useState, useCallback, useRef } from 'react';
import { cacheManager } from '../Utils/CacheManager.js';

/**
 * Universal API hook with intelligent caching
 * Automatically manages cache based on data type and usage patterns
 */
export const useApi = (options = {}) => {
  const {
    namespace = 'api',
    defaultTTL = 10 * 60 * 1000, // 10 minutes
    storageType = 'memory',
    retryCount = 2,
    retryDelay = 1000
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortController = useRef(null);

  /**
   * Generic fetch with caching
   */
  const fetch = useCallback(async (url, fetchOptions = {}, cacheOptions = {}) => {
    const {
      useCache = true,
      forceRefresh = false,
      ttl = defaultTTL,
      cacheKey = url,
      ...restCacheOptions
    } = cacheOptions;

    setLoading(true);
    setError(null);

    // Cancel previous request
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    const fullCacheKey = cacheManager.generateKey(namespace, cacheKey);
    
    try {
      let data;

      if (useCache && !forceRefresh) {
        // Try cache first
        data = cacheManager.get(fullCacheKey, storageType);
        if (data !== null) {
          setLoading(false);
          return { data, fromCache: true };
        }
      }

      // Fetch from API with retry logic
      data = await fetchWithRetry(url, {
        ...fetchOptions,
        signal: abortController.current.signal
      });

      // Cache the result
      if (useCache) {
        cacheManager.set(fullCacheKey, data, {
          ttl,
          storageType,
          namespace,
          ...restCacheOptions
        });
      }

      setLoading(false);
      return { data, fromCache: false };

    } catch (err) {
      if (err.name === 'AbortError') {
        return { data: null, fromCache: false, aborted: true };
      }
      
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [namespace, defaultTTL, storageType]);

  /**
   * Fetch with automatic retry
   */
  const fetchWithRetry = async (url, options, attempt = 1) => {
    try {
      const response = await window.fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (attempt < retryCount && error.name !== 'AbortError') {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        return fetchWithRetry(url, options, attempt + 1);
      }
      throw error;
    }
  };

  /**
   * GET request with caching
   */
  const get = useCallback(async (url, options = {}) => {
    const { headers = {}, ...cacheOptions } = options;
    
    return fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }, cacheOptions);
  }, [fetch]);

  /**
   * POST request (typically doesn't cache)
   */
  const post = useCallback(async (url, data, options = {}) => {
    const { headers = {}, invalidatePatterns = [], ...cacheOptions } = options;
    
    const result = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(data)
    }, { useCache: false, ...cacheOptions });

    // Invalidate related caches
    invalidatePatterns.forEach(pattern => {
      cacheManager.invalidate(pattern);
    });

    return result;
  }, [fetch]);

  /**
   * PUT request (typically doesn't cache)
   */
  const put = useCallback(async (url, data, options = {}) => {
    const { headers = {}, invalidatePatterns = [], ...cacheOptions } = options;
    
    const result = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(data)
    }, { useCache: false, ...cacheOptions });

    // Invalidate related caches
    invalidatePatterns.forEach(pattern => {
      cacheManager.invalidate(pattern);
    });

    return result;
  }, [fetch]);

  /**
   * DELETE request (typically doesn't cache)
   */
  const del = useCallback(async (url, options = {}) => {
    const { headers = {}, invalidatePatterns = [], ...cacheOptions } = options;
    
    const result = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }, { useCache: false, ...cacheOptions });

    // Invalidate related caches
    invalidatePatterns.forEach(pattern => {
      cacheManager.invalidate(pattern);
    });

    return result;
  }, [fetch]);

  /**
   * Invalidate cache for this namespace
   */
  const invalidateCache = useCallback((pattern) => {
    const fullPattern = pattern ? `${namespace}_${pattern}` : namespace;
    cacheManager.invalidate(fullPattern);
  }, [namespace]);

  /**
   * Get cached data without making a request
   */
  const getCached = useCallback((cacheKey) => {
    const fullCacheKey = cacheManager.generateKey(namespace, cacheKey);
    return cacheManager.get(fullCacheKey, storageType);
  }, [namespace, storageType]);

  /**
   * Cancel ongoing request
   */
  const cancel = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
  }, []);

  return {
    // Request methods
    fetch,
    get,
    post,
    put,
    del,
    
    // State
    loading,
    error,
    
    // Cache utilities
    invalidateCache,
    getCached,
    cancel,
    
    // Utilities
    clearError: useCallback(() => setError(null), [])
  };
};

/**
 * Specialized hooks for different data types
 */

// Analytics data hook
export const useAnalyticsApi = () => {
  return useApi({
    namespace: 'analytics',
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    storageType: 'memory'
  });
};

// Gallery data hook  
export const useGalleryApi = () => {
  return useApi({
    namespace: 'gallery',
    defaultTTL: 30 * 60 * 1000, // 30 minutes
    storageType: 'session'
  });
};

// Booking data hook
export const useBookingApi = () => {
  return useApi({
    namespace: 'bookings',
    defaultTTL: 2 * 60 * 1000, // 2 minutes
    storageType: 'memory'
  });
};

// Static data hook (enums, services)
export const useStaticApi = () => {
  return useApi({
    namespace: 'static',
    defaultTTL: 6 * 60 * 60 * 1000, // 6 hours
    storageType: 'local'
  });
};
