import { apiService } from './ApiService.js';

class AnalyticsService {
  constructor() {
    this.apiUrl = apiService.getBaseUrl();
  }

  getAuthHeaders() {
    return apiService.getAuthHeaders();
  }

  fetchTotalBookings() {
    return fetch(`${this.apiUrl}/api/Analytics/total-bookings`, {
      headers: this.getAuthHeaders(),
    })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      console.log('AnalyticsService - Total Bookings Response:', data);
      // Handle both { total: X } and direct number response
      if (typeof data === 'number') {
        return data;
      }
      return data.total ?? 0;
    })
    .catch((error) => {
      console.error('Error fetching total bookings:', error);
      return 0; // Return 0 instead of fallback to show real error
    });
  }

  fetchTotalSiteVisits() {
    return fetch(`${this.apiUrl}/api/Analytics/total-site-visits`, {
      headers: this.getAuthHeaders(),
    })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      console.log('AnalyticsService - Total Site Visits Response:', data);
      // Handle both { total: X } and direct number response
      if (typeof data === 'number') {
        return data;
      }
      return data.total ?? 0;
    })
    .catch((error) => {
      console.error('Error fetching total site visits:', error);
      return 0; // Return 0 instead of fallback to show real error
    });
  }

  fetchMonthlyBookings() {
    return fetch(`${this.apiUrl}/api/Analytics/monthly-bookings`, {
      headers: this.getAuthHeaders(),
    })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => data.total ?? 0)
    .catch((error) => {
      console.error('Error fetching monthly bookings:', error);
      return 8; // fallback value
    });
  }

  fetchMonthlySiteVisits() {
    return fetch(`${this.apiUrl}/api/Analytics/monthly-site-visits`, {
      headers: this.getAuthHeaders(),
    })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => data.total ?? 0)
    .catch((error) => {
      console.error('Error fetching monthly site visits:', error);
      return 87; // fallback value
    });
  }

  fetchBookingChart(dateRange = 'year') {
    return fetch(`${this.apiUrl}/api/Analytics/booking-chart?period=${dateRange}`, {
      headers: this.getAuthHeaders(),
    })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => data)
    .catch((error) => {
      console.error('Error fetching booking chart data:', error);
      // Return fallback chart data
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        bookings: [12, 19, 3, 5, 2, 3],
        visits: [65, 59, 80, 81, 56, 55]
      };
    });
  }

  fetchBookingChartByYear(year = '2025') {
    return fetch(`${this.apiUrl}/api/Analytics/booking-chart?year=${year}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      console.log('AnalyticsService - Booking Chart Response:', data);
      return Array.isArray(data) ? data : [];
    })
    .catch((error) => {
      console.error('Error fetching booking chart by year:', error);
      return [];
    });
  }

  fetchBookingStats() {
    return fetch(`${this.apiUrl}/api/Analytics/booking-stats`, {
      headers: this.getAuthHeaders(),
    })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      console.log('AnalyticsService - Booking Stats Response:', data);
      return {
        accepted: data.accepted ?? 0,
        pending: data.pending ?? 0,
        declined: data.declined ?? 0,
      };
    })
    .catch((error) => {
      console.error('Error fetching booking stats:', error);
      throw error;
    });
  }

  fetchCalendarEvents() {
    return fetch(`${this.apiUrl}/api/Analytics/calendar`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      console.log('AnalyticsService - Calendar Events Response:', data);
      return Array.isArray(data) ? data : [];
    })
    .catch((error) => {
      console.error('Error fetching calendar events:', error);
      throw error;
    });
  }

  fetchAllAnalytics(dateRange = 'year') {
    return Promise.all([
      this.fetchTotalBookings(),
      this.fetchTotalSiteVisits(),
      this.fetchMonthlyBookings(),
      this.fetchMonthlySiteVisits(),
      this.fetchBookingChart(dateRange)
    ]);
  }
}

export default new AnalyticsService();