const API_BASE = import.meta.env.VITE_DEV_API_URL || "";

export function fetchNotifications(signal) {
  const token = sessionStorage.getItem("backend-token");
  return fetch(`${API_BASE}/api/Notification`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    signal,
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to load notifications");
    return res.json();
  });
}

// Mark a single notification as read (204 No Content expected)
export function markNotificationRead(id, signal) {
  const token = sessionStorage.getItem("backend-token");
  return fetch(`${API_BASE}/api/Notification/${id}/read`, {
    method: "PATCH",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    signal,
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to mark notification read");
    return null;
  });
}

// Mark many notifications as read (fallback loops per id)
export function markAllNotificationsRead(ids, signal) {
  return Promise.all(ids.map((id) => markNotificationRead(id, signal)));
}