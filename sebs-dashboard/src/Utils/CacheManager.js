/**
 * Universal Cache Manager for SEBS Dashboard
 * Supports multiple storage mechanisms with TTL and event-based invalidation
 */

class CacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.defaultTTL = {
      // Analytics data - frequently changing
      analytics: 5 * 60 * 1000,      // 5 minutes
      'analytics-short': 2 * 60 * 1000, // 2 minutes for real-time data
      
      // Gallery data - semi-static
      highlights: 30 * 60 * 1000,    // 30 minutes
      'gallery-public': 60 * 60 * 1000, // 1 hour for public galleries
      'gallery-events': 15 * 60 * 1000,  // 15 minutes for event galleries
      
      // Booking data - dynamic
      bookings: 2 * 60 * 1000,       // 2 minutes
      'booking-enums': 6 * 60 * 60 * 1000, // 6 hours for enum data
      
      // Service listings - very static
      services: 4 * 60 * 60 * 1000,  // 4 hours
      
      // Authentication
      auth: 24 * 60 * 60 * 1000,     // 24 hours
      
      // Default fallback
      default: 10 * 60 * 1000        // 10 minutes
    };
    
    // Event listeners for cache invalidation
    this.setupEventListeners();
  }

  /**
   * Generate cache key with namespace and parameters
   */
  generateKey(namespace, identifier, params = {}) {
    const paramString = Object.keys(params).length 
      ? `_${Object.entries(params).map(([k, v]) => `${k}:${v}`).join('_')}`
      : '';
    return `${namespace}_${identifier}${paramString}`;
  }

  /**
   * Get item from cache with TTL check
   */
  get(key, storageType = 'memory') {
    let cachedItem;
    
    try {
      switch (storageType) {
        case 'memory':
          cachedItem = this.memoryCache.get(key);
          break;
        case 'session':
          const sessionData = sessionStorage.getItem(`cache_${key}`);
          cachedItem = sessionData ? JSON.parse(sessionData) : null;
          break;
        case 'local':
          const localData = localStorage.getItem(`cache_${key}`);
          cachedItem = localData ? JSON.parse(localData) : null;
          break;
        default:
          cachedItem = this.memoryCache.get(key);
      }

      if (!cachedItem) return null;

      // Check TTL
      if (Date.now() > cachedItem.expiry) {
        this.delete(key, storageType);
        return null;
      }

      // Update access time for LRU-like behavior
      cachedItem.lastAccess = Date.now();
      
      if (storageType === 'memory') {
        this.memoryCache.set(key, cachedItem);
      }

      return cachedItem.data;
    } catch (error) {
      console.warn(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set item in cache with TTL
   */
  set(key, data, options = {}) {
    const {
      ttl = this.defaultTTL.default,
      storageType = 'memory',
      namespace = 'default'
    } = options;

    const actualTTL = this.defaultTTL[namespace] || ttl;
    const cacheItem = {
      data,
      expiry: Date.now() + actualTTL,
      created: Date.now(),
      lastAccess: Date.now(),
      namespace
    };

    try {
      switch (storageType) {
        case 'memory':
          this.memoryCache.set(key, cacheItem);
          break;
        case 'session':
          sessionStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
          break;
        case 'local':
          localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
          break;
        default:
          this.memoryCache.set(key, cacheItem);
      }
    } catch (error) {
      console.warn(`Cache set error for key ${key}:`, error);
      // Fall back to memory cache if storage fails
      if (storageType !== 'memory') {
        this.memoryCache.set(key, cacheItem);
      }
    }
  }

  /**
   * Delete item from cache
   */
  delete(key, storageType = 'memory') {
    try {
      switch (storageType) {
        case 'memory':
          this.memoryCache.delete(key);
          break;
        case 'session':
          sessionStorage.removeItem(`cache_${key}`);
          break;
        case 'local':
          localStorage.removeItem(`cache_${key}`);
          break;
        default:
          this.memoryCache.delete(key);
      }
    } catch (error) {
      console.warn(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Clear cache by namespace or pattern
   */
  invalidate(pattern) {
    try {
      // Clear memory cache
      for (const [key, value] of this.memoryCache.entries()) {
        if (this.matchesPattern(key, pattern) || 
            (value.namespace && this.matchesPattern(value.namespace, pattern))) {
          this.memoryCache.delete(key);
        }
      }

      // Clear session storage
      this.clearStorageByPattern('session', pattern);
      
      // Clear local storage
      this.clearStorageByPattern('local', pattern);
      
      console.log(`Cache invalidated for pattern: ${pattern}`);
    } catch (error) {
      console.warn(`Cache invalidation error for pattern ${pattern}:`, error);
    }
  }

  /**
   * Clear storage by pattern
   */
  clearStorageByPattern(storageType, pattern) {
    const storage = storageType === 'session' ? sessionStorage : localStorage;
    const keysToDelete = [];

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith('cache_')) {
        const cacheKey = key.replace('cache_', '');
        if (this.matchesPattern(cacheKey, pattern)) {
          keysToDelete.push(key);
        } else {
          // Check namespace in stored data
          try {
            const item = JSON.parse(storage.getItem(key));
            if (item.namespace && this.matchesPattern(item.namespace, pattern)) {
              keysToDelete.push(key);
            }
          } catch (e) {
            // Invalid JSON, remove it
            keysToDelete.push(key);
          }
        }
      }
    }

    keysToDelete.forEach(key => storage.removeItem(key));
  }

  /**
   * Check if key matches pattern (supports wildcards)
   */
  matchesPattern(key, pattern) {
    if (pattern === '*') return true;
    if (typeof pattern === 'string') {
      return key.includes(pattern) || new RegExp(pattern.replace(/\*/g, '.*')).test(key);
    }
    return false;
  }

  /**
   * Get or set with automatic caching
   */
  async getOrSet(key, fetchFunction, options = {}) {
    const cached = this.get(key, options.storageType);
    if (cached !== null) {
      return cached;
    }

    try {
      const data = await fetchFunction();
      this.set(key, data, options);
      return data;
    } catch (error) {
      console.error(`Failed to fetch data for cache key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Setup event listeners for cache invalidation
   */
  setupEventListeners() {
    // Gallery events
    window.addEventListener('galleryUpload', () => {
      this.invalidate('gallery');
      this.invalidate('highlights');
    });

    window.addEventListener('galleryDelete', () => {
      this.invalidate('gallery');
      this.invalidate('highlights');
    });

    window.addEventListener('galleryPublish', () => {
      this.invalidate('gallery-public');
    });

    // Booking events
    window.addEventListener('bookingStatusUpdate', () => {
      this.invalidate('bookings');
      this.invalidate('analytics');
    });

    window.addEventListener('bookingCreate', () => {
      this.invalidate('bookings');
      this.invalidate('analytics');
    });

    window.addEventListener('bookingDeclined', () => {
      this.invalidate('bookings');
      this.invalidate('analytics');
    });

    // Auth events
    window.addEventListener('userLogout', () => {
      this.clear();
    });

    window.addEventListener('userLogin', () => {
      this.invalidate('auth');
    });
  }

  /**
   * Clear all cache
   */
  clear() {
    this.memoryCache.clear();
    
    // Clear session storage
    const sessionKeys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('cache_')) {
        sessionKeys.push(key);
      }
    }
    sessionKeys.forEach(key => sessionStorage.removeItem(key));

    // Clear local storage
    const localKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        localKeys.push(key);
      }
    }
    localKeys.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const memorySize = this.memoryCache.size;
    const sessionSize = Object.keys(sessionStorage).filter(key => key.startsWith('cache_')).length;
    const localSize = Object.keys(localStorage).filter(key => key.startsWith('cache_')).length;

    return {
      memory: memorySize,
      session: sessionSize,
      local: localSize,
      total: memorySize + sessionSize + localSize
    };
  }

  /**
   * Cleanup expired items (useful for periodic maintenance)
   */
  cleanup() {
    const now = Date.now();
    
    // Cleanup memory cache
    for (const [key, item] of this.memoryCache.entries()) {
      if (now > item.expiry) {
        this.memoryCache.delete(key);
      }
    }

    // Cleanup session storage
    this.cleanupStorage('session');
    
    // Cleanup local storage
    this.cleanupStorage('local');
  }

  cleanupStorage(storageType) {
    const storage = storageType === 'session' ? sessionStorage : localStorage;
    const keysToDelete = [];
    const now = Date.now();

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith('cache_')) {
        try {
          const item = JSON.parse(storage.getItem(key));
          if (now > item.expiry) {
            keysToDelete.push(key);
          }
        } catch (e) {
          // Invalid JSON, remove it
          keysToDelete.push(key);
        }
      }
    }

    keysToDelete.forEach(key => storage.removeItem(key));
  }
}

// Create singleton instance
export const cacheManager = new CacheManager();

// Setup periodic cleanup (every 5 minutes)
setInterval(() => {
  cacheManager.cleanup();
}, 5 * 60 * 1000);

export default cacheManager;
