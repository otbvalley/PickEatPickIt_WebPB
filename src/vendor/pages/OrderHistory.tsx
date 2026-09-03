/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { ArrowLeft, Package, Loader2 } from "lucide-react";
import { VendorNav } from "../component/VendorNav";
import { Link, useNavigate } from "react-router-dom";
import { backendAuthService } from "../../services/backendAuthService";
import api from "../../services/api";

interface Order {
  id: string;
  customerName: string;
  date: string;
  time: string;
  amount: string;
  status: "completed" | "pending" | "canceled" | "accepted" | "preparing";
  image: string;
}

const STATUS_STYLES: Record<string, string> = {
  completed: "text-emerald-700 bg-emerald-50 border-emerald-100",
  pending: "text-amber-700 bg-amber-50 border-amber-100",
  accepted: "text-blue-700 bg-blue-50 border-blue-100",
  preparing: "text-blue-700 bg-blue-50 border-blue-100",
  canceled: "text-red-700 bg-red-50 border-red-100",
};

const STATUS_LABELS: Record<string, string> = {
  completed: "Completed",
  pending: "Pending",
  accepted: "Preparing",
  preparing: "Preparing",
  canceled: "Cancelled",
};

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const user = await backendAuthService.getCurrentUser();
        if (!user) {
          navigate("/vendor-login");
          return;
        }

        const vendorId = user.vendor_id || user.id;

        // GET /orders/?vendor_id=
        const res = await api.get("/orders/", {
          params: { vendor_id: vendorId },
        });
        const data: any[] = Array.isArray(res.data) ? res.data : [];

        const formatted: Order[] = data.map((o) => {
          const d = new Date(o.created_at);
          return {
            id: o.id,
            customerName: o.customer_name || "Guest Customer",
            date: d.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            time: d.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            amount: `₦${Number(o.total_amount || 0).toLocaleString()}`,
            status: o.status || "pending",
            image: o.order_items?.[0]?.menu_item?.image_url || "",
          };
        });

        // Most recent first
        setOrders(formatted.sort((a, b) => b.id.localeCompare(a.id)));
      } catch (err) {
        console.error("Error fetching order history:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-medium text-sm">
            Loading history...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white">
      <VendorNav />

      {/* Header */}
      <div className="bg-white text-gray-900 px-6 py-4 border-b border-gray-100 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">
            Order History
          </h1>
          <span className="ml-auto bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
            {orders.length} orders
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="bg-white p-10 rounded-2xl border border-gray-100 shadow-sm">
              <Package className="w-20 h-20 text-gray-200 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                No Orders Yet
              </h2>
              <p className="text-gray-400 max-w-xs mx-auto text-sm">
                Once you receive orders, they'll all appear here.
              </p>
              <Link
                to="/vendor-dashboard"
                className="mt-8 inline-block px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order, i) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-emerald-200 transition-colors p-5"
                style={{ animation: `slideIn 0.4s ease-out ${i * 0.05}s both` }}
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {order.image ? (
                      <img
                        src={order.image}
                        className="w-full h-full object-cover"
                        alt="Food"
                      />
                    ) : (
                      <span className="text-3xl">🍽️</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {order.customerName}
                      </h3>
                      <span className="text-[10px] font-medium text-gray-400 flex-shrink-0 font-mono">
                        #{order.id.slice(0, 6).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">
                      {order.date} · {order.time}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-600 text-lg">
                        {order.amount}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[order.status] || "text-gray-500 bg-gray-50 border-gray-200"}`}
                      >
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
};

export default OrderHistory;
