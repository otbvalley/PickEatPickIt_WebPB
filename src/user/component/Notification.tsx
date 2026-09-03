import React, { useState, useEffect } from "react";
import { Bell, ArrowLeft, CheckCheck } from "lucide-react";
import { Link } from "react-router-dom";
import {
  backendAuthService,
  type Notification as ApiNotification,
} from "../../services/backendAuthService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getOrdinalDate = (date: Date): string => {
  const day = date.getDate();
  const month = date.toLocaleDateString("en-GB", { month: "short" });
  const year = date.getFullYear();
  const s = ["th", "st", "nd", "rd"];
  const v = day % 100;
  const suffix = s[(v - 20) % 10] ?? s[v] ?? s[0];
  return `${day}${suffix} ${month} ${year}`;
};

const formatTime = (dateObj: Date): string =>
  dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// ─── Component ────────────────────────────────────────────────────────────────

const Notification: React.FC = () => {
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const items = await backendAuthService.getNotifications();
        setNotifications(items ?? []);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    try {
      await backendAuthService.markNotificationRead(id);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await backendAuthService.markAllNotificationsRead();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const groupedNotifications = notifications.reduce<
    Record<string, ApiNotification[]>
  >((groups, n) => {
    const date = getOrdinalDate(new Date(n.created_at));
    if (!groups[date]) groups[date] = [];
    groups[date].push(n);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link to="/user-dashboard">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              Notifications
            </h1>
            <div className="relative p-2">
              <Bell
                className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600"
                fill="currentColor"
              />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {!loading && notifications.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                : "You're all caught up"}
            </p>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all as read
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
            <Bell className="mx-auto w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-medium text-gray-900">No notifications yet</p>
            <p className="text-sm text-gray-400">
              Updates about your orders will appear here
            </p>
          </div>
        ) : (
          Object.keys(groupedNotifications).map((date) => (
            <div key={date} className="mb-8">
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-400">
                  {date}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
                {groupedNotifications[date].map((notification) => {
                  const dateObj = new Date(notification.created_at);
                  return (
                    <button
                      key={notification.id}
                      onClick={() => handleMarkRead(notification.id)}
                      className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 relative">
                          <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-emerald-50">
                            <Bell className="w-5 h-5 text-emerald-600" />
                          </div>
                          {!notification.is_read && (
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1 gap-2">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {notification.title ?? "Notification"}
                            </h3>
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {formatTime(dateObj)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {notification.message}
                          </p>
                          {notification.related_order_id && (
                            <span className="inline-block mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                              #{notification.related_order_id.slice(0, 8).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notification;
