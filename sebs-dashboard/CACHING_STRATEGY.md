# SEBS Dashboard Caching Strategy

## Overview

This comprehensive caching strategy implements a multi-layered approach to improve performance and user experience across the SEBS Dashboard application.

## Architecture

### Core Components

1. **CacheManager** (`src/Utils/CacheManager.js`)
   - Universal cache utility with TTL support
   - Multiple storage backends (memory, sessionStorage, localStorage)
   - Event-based cache invalidation
   - Automatic cleanup and maintenance

2. **Enhanced Services** 
   - `AnalyticsService.js` - Cached analytics data
   - `GalleryService.js` - Cached image metadata and galleries
   - `BookingService.js` - Cached booking data with short TTL

3. **Smart Hooks**
   - `useAnalytics.js` - Analytics data with auto-refresh
   - `useGallery.js` - Gallery operations with cache management
   - `useApi.js` - Universal API hook with intelligent caching

4. **Debug Tools**
   - `CacheDebugger.jsx` - Visual cache monitoring and management
   - Cache status indicator in header

## Cache Configuration

### Data Types & TTL Settings

| Data Type | TTL | Storage | Rationale |
|-----------|-----|---------|-----------|
| Analytics | 5 minutes | Memory | Changes frequently, needs fresh data |
| Gallery Highlights | 30 minutes | Session | Semi-static, medium persistence |
| Public Galleries | 1 hour | Local | Static, can persist across sessions |
| Event Galleries | 15 minutes | Session | Moderate changes, session-scoped |
| Booking Data | 2 minutes | Memory | Dynamic, needs fresh data |
| Enum Data | 6 hours | Session | Very static, rarely changes |
| Service Listings | 4 hours | Local | Static content |

### Storage Strategy

- **Memory Cache**: Fast access, lost on page refresh
  - Analytics data (frequent access, temporary)
  - Booking data (real-time needs)

- **Session Storage**: Persistent during session
  - Gallery metadata
  - User-specific data
  - Enum data

- **Local Storage**: Persistent across sessions  
  - Public gallery data
  - Static service listings
  - Non-sensitive cached data

## Cache Invalidation

### Event-Based Invalidation

Automatic cache clearing based on user actions:

```javascript
// Gallery operations
window.dispatchEvent(new CustomEvent('galleryUpload'));
window.dispatchEvent(new CustomEvent('galleryDelete'));
window.dispatchEvent(new CustomEvent('galleryPublish'));

// Booking operations  
window.dispatchEvent(new CustomEvent('bookingStatusUpdate'));
window.dispatchEvent(new CustomEvent('bookingCreate'));
window.dispatchEvent(new CustomEvent('bookingDeclined'));

// Authentication
window.dispatchEvent(new CustomEvent('userLogin'));
window.dispatchEvent(new CustomEvent('userLogout'));
```

### Manual Invalidation

```javascript
// Clear specific namespace
cacheManager.invalidate('analytics');
cacheManager.invalidate('gallery');
cacheManager.invalidate('bookings');

// Clear all cache
cacheManager.clear();
```

## Usage Examples

### Basic Service Usage

```javascript
// Automatic caching in services
const highlights = await galleryService.fetchHighlights();
const analytics = await analyticsService.fetchAllAnalytics('year');
const bookings = await bookingService.fetchBookingRequests();
```

### Hook Usage with Cache Control

```javascript
// Analytics with cache options
const { 
  analytics, 
  loading, 
  refresh, 
  clearCache 
} = useAnalytics('year', {
  autoRefresh: true,
  refreshInterval: 5 * 60 * 1000
});

// Gallery with cache management
const { 
  fetchHighlights,
  refreshGalleryCache,
  clearGalleryCache 
} = useGallery();

// Force refresh (bypass cache)
const highlights = await fetchHighlights(false);
```

### Universal API Hook

```javascript
// Specialized API hooks
const analyticsApi = useAnalyticsApi();
const galleryApi = useGalleryApi();
const bookingApi = useBookingApi();

// Custom caching
const { data } = await analyticsApi.get('/api/custom-endpoint', {
  ttl: 10 * 60 * 1000, // 10 minutes
  forceRefresh: false
});
```

## Performance Benefits

### Expected Improvements

1. **Dashboard Load Time**: 60-80% reduction in API calls
2. **Navigation Speed**: Instant data display from cache
3. **User Experience**: Reduced loading states and spinners
4. **Server Load**: Significant reduction in redundant requests
5. **Offline Resilience**: Cached data available during network issues

### Metrics to Monitor

- Cache hit/miss ratios
- API request reduction
- Page load times
- User experience scores

## Debug and Monitoring

### Cache Debugger

Access via header database icon or directly:

```javascript
import CacheDebugger from './Components/Common/CacheDebugger';

// Shows:
// - Cache statistics
// - Namespace breakdown
// - Memory usage
// - Last update times
// - Manual cache clearing
```

### Development Tools

```javascript
// Get cache statistics
const stats = cacheManager.getStats();
console.log('Cache stats:', stats);

// Monitor cache events
window.addEventListener('cacheHit', (e) => {
  console.log('Cache hit:', e.detail);
});

window.addEventListener('cacheMiss', (e) => {
  console.log('Cache miss:', e.detail);
});
```

## Best Practices

### Do's

1. **Use appropriate TTL** for data type
2. **Invalidate cache** after mutations
3. **Monitor cache performance** regularly
4. **Test cache behavior** in different scenarios
5. **Handle cache failures** gracefully

### Don'ts

1. **Don't cache sensitive data** in localStorage
2. **Don't cache real-time financial data**
3. **Don't ignore cache invalidation** after updates
4. **Don't rely solely on cache** without fallbacks
5. **Don't cache large binary data** in memory

## Configuration

### Environment Variables

```env
# Cache settings (optional)
VITE_CACHE_DEFAULT_TTL=600000
VITE_CACHE_ANALYTICS_TTL=300000
VITE_CACHE_GALLERY_TTL=1800000
VITE_CACHE_ENABLED=true
```

### Customization

```javascript
// Custom cache manager instance
const customCache = new CacheManager();
customCache.defaultTTL.analytics = 2 * 60 * 1000; // 2 minutes

// Custom TTL for specific operations
cacheManager.set('custom-key', data, {
  ttl: 15 * 60 * 1000, // 15 minutes
  storageType: 'session',
  namespace: 'custom'
});
```

## Migration Guide

### Existing Code

No breaking changes to existing functionality. Services maintain the same API while adding caching underneath.

### Gradual Adoption

1. **Phase 1**: Core services (Analytics, Gallery) ✅
2. **Phase 2**: Booking and user data ✅
3. **Phase 3**: Additional services and components
4. **Phase 4**: Performance optimization and monitoring

## Troubleshooting

### Common Issues

1. **Stale Data**: Check TTL settings and invalidation events
2. **Memory Issues**: Monitor cache size and implement cleanup
3. **Storage Quota**: Use appropriate storage types for data size
4. **Cache Misses**: Verify cache keys and namespace consistency

### Debug Commands

```javascript
// Clear problematic cache
cacheManager.invalidate('problematic-namespace');

// Check specific cache item
const item = cacheManager.get('namespace_key');
console.log('Cached item:', item);

// Force cleanup
cacheManager.cleanup();
```

## Future Enhancements

### Planned Features

1. **Intelligent Prefetching**: Predict and preload likely-needed data
2. **Background Refresh**: Update cache in background before expiry
3. **Compression**: Compress large cached objects
4. **Analytics**: Detailed cache performance metrics
5. **A/B Testing**: Compare cache strategies
6. **Service Worker**: Offline-first caching strategy

### Performance Optimizations

1. **LRU Eviction**: Remove least recently used items when memory is full
2. **Selective Caching**: Dynamic TTL based on data access patterns
3. **Cache Warming**: Preload essential data on app startup
4. **Smart Invalidation**: More granular cache invalidation patterns

## Conclusion

This caching strategy provides a robust foundation for improved application performance while maintaining data freshness and consistency. The multi-layered approach ensures optimal user experience across different usage patterns and network conditions.
