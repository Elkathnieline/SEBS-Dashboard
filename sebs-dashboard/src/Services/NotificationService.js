class NotificationService {
  constructor() {
    this.apiUrl = import.meta.env.VITE_DEV_API_URL || "";
  }

  getAuthHeaders() {
    const token = sessionStorage.getItem("backend-token");
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async fetchNotifications() {
    const response = await fetch(`${this.apiUrl}/api/Notification`, {
      method: "GET",
      headers: this.getAuthHeaders(),
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error("Failed to load notifications");
    }

    return response.json();
  }

  async markNotificationRead(id) {
    const response = await fetch(`${this.apiUrl}/api/Notification/${id}/read`, {
      method: "PATCH",
      headers: this.getAuthHeaders(),
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error("Failed to mark notification read");
    }

    return true;
  }

  async markAllNotificationsRead(ids) {
    // Use Promise.allSettled to handle partial failures gracefully
    const results = await Promise.allSettled(
      ids.map(id => this.markNotificationRead(id))
    );

    const failures = results.filter(result => result.status === 'rejected');
    if (failures.length > 0) {
      console.warn(`${failures.length} notifications failed to mark as read`);
    }

    return {
      success: results.filter(r => r.status === 'fulfilled').length,
      failed: failures.length
    };
  }
}

export const notificationService = new NotificationService();