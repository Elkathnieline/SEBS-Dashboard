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
    const response = await fetch(`${this.apiUrl}/api/admin/booking`, {
      method: "GET",
      headers: this.getAuthHeaders(),
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error("Failed to fetch booking requests");
    }

    return response.json();
  }

  async fetchBookingStatuses() {
    const response = await fetch(`${this.apiUrl}/api/Enum/booking-statuses`, {
      method: "GET",
      headers: this.getAuthHeaders(),
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error("Failed to fetch booking statuses");
    }

    return response.json();
  }

  async fetchEventTypes() {
    const response = await fetch(`${this.apiUrl}/api/Enum/event-types`, {
      method: "GET",
      headers: this.getAuthHeaders(),
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error("Failed to fetch event types");
    }

    return response.json();
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

    return true;
  }

  async fetchDeclinedBookings() {
    const response = await fetch(`${this.apiUrl}/api/admin/booking?status=3`, {
      method: "GET",
      headers: this.getAuthHeaders(),
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error("Failed to fetch declined bookings");
    }

    return response.json();
  }
}

export const bookingService = new BookingService();

