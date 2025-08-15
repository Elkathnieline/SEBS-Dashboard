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
    // Get enum display names
    const statusInfo = enumMapper.getBookingStatus(booking.status);
    const eventTypeInfo = enumMapper.getEventType(booking.eventDetails.eventType);

    // Format date to match existing format: "2:00 PM, Tue, 13 Nov"
    const eventDate = new Date(booking.eventDetails.eventDate);
    const dateTime = eventDate.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });

    // Process event services - create a summary of services
    const services = booking.eventDetails.eventServices || [];
    const servicesSummary = services.length > 0 
      ? `${services.length} service${services.length !== 1 ? 's' : ''}`
      : 'No services';

    // Calculate total price from services
    const totalPrice = services.reduce((sum, service) => {
      return sum + (service.customPrice || service.serviceBasePrice || 0) * (service.quantity || 1);
    }, 0);

    // Format booking date for display
    const bookingDate = new Date(booking.bookingDate);
    const formattedBookingDate = bookingDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    return {
      id: booking.bookingID,
      reference: booking.bookingReference,
      bookingDate: formattedBookingDate,
      client: {
        name: booking.customerName,
        email: booking.customerEmail,
        phone: booking.customerPhone
      },
      dateTime: dateTime,
      address: booking.eventDetails.location,
      eventType: eventTypeInfo.displayName,
      package: {
        name: booking.eventDetails.name || 'Custom Event',
        duration: servicesSummary,
        totalPrice: totalPrice
      },
      status: statusInfo.name.toLowerCase(), // Convert to lowercase for existing component logic
      statusDisplay: statusInfo.displayName,
      notes: booking.eventDetails.notes,
      approvedBy: booking.approvedByName,
      approvedDate: booking.approvedDate ? new Date(booking.approvedDate).toLocaleDateString('en-US') : null,
      // Keep original data for modal/preview
      originalData: booking,
      services: services
    };
  });
}

