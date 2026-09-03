import { useState, useEffect } from "react";
import {
  ChevronLeft,
  Bell,
  BellOff,
  Trash2,
  Check,
  Clock,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { VendorNav } from "../component/VendorNav";
import {
  getVendorNotifications,
  markVendorNotificationRead,
  markAllVendorNotificationsRead,
} from "../../services/api";
import { useToast } from "../../context/ToastContext";

interface Notification {
  id: string;
  type: string;
  title: string;
  description: string;
  orderId: string;
  amount: string;
  time: string;
  date: string;
  image: string;
  isRead: boolean;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getVendorNotifications();
        const raw: any[] = Array.isArray(res.data)
          ? res.data
          : (res.data?.notifications ?? []);
        setNotifications(
          raw.map((n: any, i: number) => {
            const created = n.created_at ? new Date(n.created_at) : new Date();
            return {
              id: String(n.id ?? n.notification_id ?? i),
              type: n.type || "general",
              title: n.title || "Notification",
              description: n.message || n.description || "",
              orderId: n.order_id ? String(n.order_id) : "",
              amount:
                n.amount !== undefined && n.amount !== null
                  ? `₦${Number(n.amount).toLocaleString()}`
                  : "",
              time: created.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              date: created
                .toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
                .toUpperCase(),
              image: n.image_url || FALLBACK_IMAGE,
              isRead: Boolean(n.is_read ?? n.read ?? false),
            };
          }),
        );
      } catch (e) {
        console.error("Failed to load notifications:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif,
      ),
    );
    try {
      await markVendorNotificationRead(id);
    } catch (e) {
      console.error("Failed to mark notification read:", e);
    }
  };

  const markAllAsRead = async () => {
    if (markingAll) return;
    const prevState = notifications;
    setMarkingAll(true);
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
    try {
      await markAllVendorNotificationsRead();
    } catch (e) {
      console.error("Failed to mark all notifications read:", e);
      setNotifications(prevState);
      toast.error("Failed to mark all as read");
    } finally {
      setMarkingAll(false);
    }
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const groupedNotifications = filteredNotifications.reduce((acc, notif) => {
    if (!acc[notif.date]) {
      acc[notif.date] = [];
    }
    acc[notif.date].push(notif);
    return acc;
  }, {} as Record<string, Notification[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <VendorNav />
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft size={24} className="text-gray-700" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">Notification</h1>
            </div>
            <div className="relative">
              <Bell size={24} className="text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === "all"
                    ? "bg-emerald-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === "unread"
                    ? "bg-emerald-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={markingAll}
                className="ml-auto px-4 py-2 rounded-xl text-sm font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {markingAll ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                Mark all read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
              <BellOff size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No notifications
              </h3>
              <p className="text-gray-500">You're all caught up!</p>
            </div>
          </div>
        ) : (
          Object.entries(groupedNotifications).map(
            ([date, notifs]) => (
              <div key={date} className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock size={16} className="text-gray-400" />
                  <h2 className="text-xs text-gray-400">
                    {date}
                  </h2>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                <div className="space-y-3">
                  {notifs.map((notification) => (
                    <div
                      key={notification.id}
                      className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                        !notification.isRead
                          ? "border-emerald-200"
                          : "border-gray-100"
                      }`}
                    >
                      <div className="flex items-start gap-4 p-4">
                        {/* Image */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={notification.image}
                            alt="Order"
                            className="w-16 h-16 rounded-xl object-cover"
                          />
                          {!notification.isRead && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-600 rounded-full border-2 border-white"></div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 text-sm">
                              {notification.title}
                            </h3>
                            <span className="text-xs text-gray-500 flex-shrink-0 flex items-center gap-1">
                              <Clock size={12} />
                              {notification.time}
                            </span>
                          </div>

                          {notification.description && (
                            <p className="text-sm text-gray-600 mb-3 whitespace-pre-line">
                              {notification.description}
                            </p>
                          )}

                          {(notification.orderId || notification.amount) && (
                            <div className="flex items-center justify-between">
                              {notification.orderId && (
                                <span className="text-sm text-gray-600">
                                  Order ID:{" "}
                                  <span className="font-semibold text-emerald-600">
                                    {notification.orderId}
                                  </span>
                                </span>
                              )}
                              {notification.amount && (
                                <span className="text-lg font-semibold text-emerald-600">
                                  {notification.amount}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex border-t border-gray-100">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="flex-1 py-3 text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                          >
                            <Check size={16} />
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="flex-1 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
