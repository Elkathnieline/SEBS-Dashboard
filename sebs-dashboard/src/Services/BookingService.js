import { enumMapper } from '../Utils/EnumMapper.js';
import { transformBookingData } from '../Utils/BookingTransformer.js';
import { cacheManager } from '../Utils/CacheManager.js';

class BookingService {
  constructor() {
    this.apiUrl = import.meta.env.VITE_DEV_API_URL || import.meta.env.VITE_API_URL;
  }

  getAuthHeaders() {
    const token = sessionStorage.getItem("backend-token");
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async fetchBookingRequests() {
    const cacheKey = cacheManager.generateKey('bookings', 'requests');
    
    return cacheManager.getOrSet(
      cacheKey,
      async () => {
        const response = await fetch(`${this.apiUrl}/api/admin/booking`, {
          method: "GET",
          headers: this.getAuthHeaders(),
          credentials: "include"
        });

        if (!response.ok) {
          throw new Error("Failed to fetch booking requests");
        }

        return response.json();
      },
      { 
        namespace: 'bookings',
        storageType: 'memory' // Booking data changes frequently
      }
    );
  }

  async fetchBookingStatuses() {
    const cacheKey = cacheManager.generateKey('bookings', 'statuses');
    
    return cacheManager.getOrSet(
      cacheKey,
      async () => {
        const response = await fetch(`${this.apiUrl}/api/Enum/booking-statuses`, {
          method: "GET",
          headers: this.getAuthHeaders(),
          credentials: "include"
        });

        if (!response.ok) {
          throw new Error("Failed to fetch booking statuses");
        }

        return response.json();
      },
      { 
        namespace: 'booking-enums',
        storageType: 'session' // Enum data changes rarely
      }
    );
  }

  async fetchEventTypes() {
    const cacheKey = cacheManager.generateKey('bookings', 'event-types');
    
    return cacheManager.getOrSet(
      cacheKey,
      async () => {
        const response = await fetch(`${this.apiUrl}/api/Enum/event-types`, {
          method: "GET",
          headers: this.getAuthHeaders(),
          credentials: "include"
        });

        if (!response.ok) {
          throw new Error("Failed to fetch event types");
        }

        return response.json();
      },
      { 
        namespace: 'booking-enums',
        storageType: 'session' // Enum data changes rarely
      }
    );
  }

  async updateBookingStatus(bookingId, status) {
    const response = await fetch(`${this.apiUrl}/api/admin/booking/${bookingId}/status`, {
      method: "PATCH",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error("Failed to update booking status");
    }

    // Invalidate booking and analytics caches
    cacheManager.invalidate('bookings');
    cacheManager.invalidate('analytics');
    
    // Dispatch event for external components
    window.dispatchEvent(new CustomEvent('bookingStatusUpdate', {
      detail: { bookingId, status }
    }));

    return response.json();
  }

  async deleteBooking(bookingId) {
    const response = await fetch(`${this.apiUrl}/api/admin/booking/${bookingId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error("Failed to delete booking");
    }

    // Invalidate booking and analytics caches
    cacheManager.invalidate('bookings');
    cacheManager.invalidate('analytics');
    
    // Dispatch event for external components
    window.dispatchEvent(new CustomEvent('bookingDeclined', {
      detail: { bookingId }
    }));

    return true;
  }

  async fetchDeclinedBookings() {
    const cacheKey = cacheManager.generateKey('bookings', 'declined');
    
    return cacheManager.getOrSet(
      cacheKey,
      async () => {
        const response = await fetch(`${this.apiUrl}/api/admin/booking?status=3`, {
          method: "GET",
          headers: this.getAuthHeaders(),
          credentials: "include"
        });

        if (!response.ok) {
          throw new Error("Failed to fetch declined bookings");
        }

        return response.json();
      },
      { 
        namespace: 'bookings',
        storageType: 'memory'
      }
    );
  }

  // Utility method to refresh booking caches
  refreshBookingCaches() {
    cacheManager.invalidate('bookings');
    cacheManager.invalidate('booking-enums');
    cacheManager.invalidate('analytics');
  }
}

export const bookingService = new BookingService();

