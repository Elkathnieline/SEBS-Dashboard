const API_BASE = import.meta.env.VITE_DEV_API_URL || import.meta.env.VITE_API_URL;

// Fetch booking requests from API
export function fetchBookingRequests(signal) {
  const token = sessionStorage.getItem("backend-token");
  return fetch(`${API_BASE}/api/admin/booking`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    signal,
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch booking requests");
    return res.json();
  });
}

// Fetch booking statuses enum
export function fetchBookingStatuses(signal) {
  const token = sessionStorage.getItem("backend-token");
  return fetch(`${API_BASE}/api/Enum/booking-statuses`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    signal,
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch booking statuses");
    return res.json();
  });
}

// Fetch event types enum
export function fetchEventTypes(signal) {
  const token = sessionStorage.getItem("backend-token");
  return fetch(`${API_BASE}/api/Enum/event-types`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    signal,
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch event types");
    return res.json();
  });
}

// Update booking status
export function updateBookingStatus(bookingId, status, signal) {
  const token = sessionStorage.getItem("backend-token");
  return fetch(`${API_BASE}/api/admin/booking/${bookingId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ status }),
    credentials: "include",
    signal,
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to update booking status");
    return res.json();
  });
}

// Helper class to manage enum mappings
export class EnumMapper {
  constructor() {
    this.bookingStatuses = new Map();
    this.eventTypes = new Map();
  }

  // Load enums and create mappings
  async loadEnums(signal) {
    try {
      const [statusesData, eventTypesData] = await Promise.all([
        fetchBookingStatuses(signal),
        fetchEventTypes(signal)
      ]);

      // Create status mappings
      statusesData.forEach(status => {
        this.bookingStatuses.set(status.value, {
          name: status.name,
          displayName: status.displayName
        });
      });

      // Create event type mappings
      eventTypesData.forEach(eventType => {
        this.eventTypes.set(eventType.value, {
          name: eventType.name,
          displayName: eventType.displayName
        });
      });

      return true;
    } catch (error) {
      console.error('Failed to load enums:', error);
      return false;
    }
  }

  getBookingStatus(value) {
    return this.bookingStatuses.get(value) || { name: 'Unknown', displayName: 'Unknown' };
  }

  getEventType(value) {
    return this.eventTypes.get(value) || { name: 'Unknown', displayName: 'Unknown' };
  }

  // Get status value by name (for reverse mapping)
  getStatusValue(name) {
    for (const [value, status] of this.bookingStatuses) {
      if (status.name.toLowerCase() === name.toLowerCase()) {
        return value;
      }
    }
    return null;
  }
}

// Create global enum mapper instance
export const enumMapper = new EnumMapper();

// Transform API booking data to component format
export function transformBookingData(apiData) {
  return apiData.map(booking => {
    // Handle null/undefined eventDetails
    const eventDetails = booking.eventDetails || {};
    
    // Get enum display names with fallbacks
    const statusInfo = enumMapper.getBookingStatus(booking.status);
    const eventTypeInfo = enumMapper.getEventType(eventDetails.eventType || 0);

    // Format date with fallback
    let dateTime = 'No date set';
    if (eventDetails.eventDate) {
      try {
        const eventDate = new Date(eventDetails.eventDate);
        dateTime = eventDate.toLocaleString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        });
      } catch (error) {
        console.warn('Invalid event date:', eventDetails.eventDate);
        dateTime = 'Invalid date';
      }
    }

    // Process event services with fallback
    const services = eventDetails.eventServices || [];
    const servicesSummary = services.length > 0 
      ? `${services.length} service${services.length !== 1 ? 's' : ''}`
      : 'No services';

    // Calculate total price from services with fallbacks
    const totalPrice = services.reduce((sum, service) => {
      if (!service) return sum;
      return sum + (service.customPrice || service.serviceBasePrice || 0) * (service.quantity || 1);
    }, 0);

    // Format booking date for display with fallback
    let formattedBookingDate = 'Unknown';
    if (booking.bookingDate) {
      try {
        const bookingDate = new Date(booking.bookingDate);
        formattedBookingDate = bookingDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch (error) {
        console.warn('Invalid booking date:', booking.bookingDate);
        formattedBookingDate = 'Invalid date';
      }
    }

    // Use enum status directly - no more pending mapping
    let mappedStatus = statusInfo.name ? statusInfo.name.toLowerCase() : 'unknown';

    return {
      id: booking.bookingID || booking.id || 0,
      reference: booking.bookingReference || 'No reference',
      bookingDate: formattedBookingDate,
      client: {
        name: booking.customerName || 'Unknown customer',
        email: booking.customerEmail || 'No email',
        phone: booking.customerPhone || 'No phone'
      },
      dateTime: dateTime,
      address: eventDetails.location || 'No location',
      eventType: eventTypeInfo.displayName || 'Unknown type',
      package: {
        name: eventDetails.name || 'Custom Event',
        duration: servicesSummary,
        totalPrice: totalPrice
      },
      status: mappedStatus,
      statusDisplay: statusInfo.displayName || 'Unknown status',
      notes: eventDetails.notes || '',
      approvedBy: booking.approvedByName || null,
      approvedDate: booking.approvedDate ? 
        (() => {
          try {
            return new Date(booking.approvedDate).toLocaleDateString('en-US');
          } catch (error) {
            console.warn('Invalid approved date:', booking.approvedDate);
            return null;
          }
        })() : null,
      // Keep original data for modal/preview
      originalData: booking,
      services: services
    };
  });
}

