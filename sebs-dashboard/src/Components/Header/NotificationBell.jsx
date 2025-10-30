import { useEffect, useState } from "react";
import { Bell, CheckCheck, Loader2, RefreshCw } from "lucide-react";
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from "../../Services/NotificationServices";

export default function NotificationBell() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const load = () => {
    setLoading(true);
    const controller = new AbortController();
    fetchNotifications(controller.signal)
      .then((data) => {
        const list = Array.isArray(data)
          ? data.map((n, i) => ({
              id: n.id ?? n.notificationId ?? i,
              title: n.title ?? n.message ?? "Notification",
              message: n.message ?? "",
              createdAt: n.createdAt ?? n.date ?? null,
              read: Boolean(n.read ?? n.isRead ?? false),
            }))
          : [];
        setItems(list);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          // Optionally handle error (toast/log)
        }
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  };

  useEffect(() => {
    const cleanup = load();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markRead = (id) => {
    // Optimistic update so badge decrements immediately
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    const controller = new AbortController();
    markNotificationRead(id, controller.signal).catch((err) => {
      if (err.name !== "AbortError") {
        // Revert on failure
        setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
      }
    });
    return () => controller.abort();
  };

  const markAll = () => {
    const unreadIds = items.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    // Optimistic: set all read
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setBulkLoading(true);
    const controller = new AbortController();
    markAllNotificationsRead(unreadIds, controller.signal)
      .catch((err) => {
        if (err.name !== "AbortError") {
          // Revert on failure
          setItems((prev) =>
            prev.map((n) => (unreadIds.includes(n.id) ? { ...n, read: false } : n))
          );
        }
      })
      .finally(() => setBulkLoading(false));
    return () => controller.abort();
  };

  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="dropdown dropdown-end">
      <button
        tabIndex={0}
        role="button"
        aria-label="Notifications"
        className="btn btn-ghost btn-circle hover:bg-base-200"
      >
        <div className="indicator">
          <Bell size={20} className="text-base-content/70" />
          {unread > 0 && (
            <span className="badge badge-sm badge-primary indicator-item">
              {unread}
            </span>
          )}
        </div>
      </button>

      <div
        tabIndex={0}
        className="dropdown-content bg-base-100 rounded-box z-[1] w-80 p-0 shadow-lg border border-base-300 mt-3"
      >
        <div className="p-4 border-b border-base-300 flex items-center justify-between">
          <h3 className="font-semibold text-base-content">Notifications</h3>
          <div className="flex items-center gap-1">
            <button
              className="btn btn-ghost btn-xs"
              onClick={load}
              aria-label="Refresh"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
            <button
              className={`btn btn-ghost btn-xs ${unread === 0 ? "btn-disabled" : ""} ${bulkLoading ? "loading" : ""}`}
              onClick={markAll}
              disabled={unread === 0 || bulkLoading}
              aria-label="Mark all as read"
              title="Mark all as read"
            >
              <CheckCheck size={14} />
            </button>
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center p-4 text-base-content/60">
              <Loader2 size={16} className="animate-spin mr-2" />
              Loading…
            </div>
          ) : items.length === 0 ? (
            <div className="p-4 text-center text-base-content/60">
              No notifications
            </div>
          ) : (
            <ul className="menu menu-sm">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => markRead(n.id)}
                    className={`w-full text-left flex items-start gap-2 p-3 hover:bg-base-200 ${
                      !n.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <CheckCheck
                      size={16}
                      className={n.read ? "text-base-content/40" : "text-primary"}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{n.title}</div>
                      {n.message && (
                        <div className="text-xs text-base-content/70">{n.message}</div>
                      )}
                      {n.createdAt && (
                        <div className="text-[10px] text-base-content/50 mt-0.5">
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}