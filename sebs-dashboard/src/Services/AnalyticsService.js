class AnalyticsService {
  constructor() {
    this.apiUrl = import.meta.env.VITE_DEV_API_URL || "http://localhost:8000";
  }

  getAuthHeaders() {
    const token = sessionStorage.getItem("backend-token");
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
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
    .then((data) => data.total ?? 0)
    .catch((error) => {
      console.error('Error fetching total bookings:', error);
      return 182; // fallback value
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
    .then((data) => data.total ?? 0)
    .catch((error) => {
      console.error('Error fetching total site visits:', error);
      return 400; // fallback value
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