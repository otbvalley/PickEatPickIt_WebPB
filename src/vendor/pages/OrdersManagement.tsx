/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Check,
  Package,
  MessageSquare,
  Phone,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { VendorNav } from "../component/VendorNav";
import { backendAuthService } from "../../services/backendAuthService";
import { useToast } from "../../context/ToastContext";
import api, {
  acceptOrder,
  patchOrderStatus,
  verifyRiderPickup,
} from "../../services/api";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  time: string;
  image: string;
  status: "pending" | "accepted" | "preparing" | "canceled" | "completed";
  total: number;
  restaurantName: string;
  itemsCount: number;
  vendorId: string;
}

type TabType = "pending" | "accepted" | "preparing" | "canceled" | "completed";

// ── API helpers (backend only) ────────────────────────────────────────────────
const fetchVendorOrders = (vendorId: string, status?: string) =>
  api.get("/orders/", {
    params: { vendor_id: vendorId, ...(status ? { status } : {}) },
  });

const postTracking = (
  orderId: string,
  data: { status: string; message: string },
) => api.post(`/orders/${orderId}/tracking`, data);

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  pending: { label: "Pending", bg: "bg-amber-50", text: "text-amber-700" },
  accepted: { label: "Accepted", bg: "bg-indigo-50", text: "text-indigo-700" },
  preparing: { label: "Preparing", bg: "bg-blue-50", text: "text-blue-700" },
  canceled: { label: "Cancelled", bg: "bg-red-50", text: "text-red-700" },
  completed: { label: "Completed", bg: "bg-emerald-50", text: "text-emerald-700" },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    bg: "bg-gray-100",
    text: "text-gray-600",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────
const OrdersManagement = () => {
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [orders, setOrders] = useState<Order[]>([]);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const navigate = useNavigate();
  const toast = useToast();

  // ── Load orders ─────────────────────────────────────────────────────────────
  const loadOrders = useCallback(
    async (vId?: string) => {
      const id = vId ?? vendorId;
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetchVendorOrders(id);
        const raw: any[] = Array.isArray(res.data) ? res.data : [];

        const mapped: Order[] = raw.map((o) => ({
          id: o.id,
          customerName: o.customer_name || "Customer",
          customerPhone: o.customer_phone || o.vendor?.phone || "—",
          address: o.delivery_address || "—",
          time: new Date(o.created_at).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          image: o.order_items?.[0]?.menu_item?.image_url || "",
          status: (o.status || "pending") as Order["status"],
          total: Number(o.total_amount) || Number(o.total_price) || 0,
          restaurantName:
            o.restaurant_name || o.vendor?.business_name || "Restaurant",
          itemsCount: Number(o.items_count) || o.order_items?.length || 0,
          vendorId: o.vendor_id,
        }));

        setOrders(mapped);
      } catch (err) {
        console.error("Failed to load orders:", err);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    },
    [vendorId],
  );

  // ── Init ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const user = await backendAuthService.getCurrentUser();
        if (!user) {
          setLoading(false);
          return;
        }
        const id = user.vendor_id || user.id;
        setVendorId(id);
        await loadOrders(id);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    })();
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const changeStatus = async (orderId: string, status: string, msg: string) => {
    setActionId(orderId);
    try {
      await patchOrderStatus(orderId, status);
      try {
        await postTracking(orderId, { status, message: msg });
      } catch {
        /* non-blocking */
      }
      toast.success(`Order ${status}!`);
      loadOrders();
    } catch {
      toast.error(`Failed to update order`);
    } finally {
      setActionId(null);
    }
  };

  const handleAccept = async (id: string) => {
    setActionId(id);
    try {
      await acceptOrder(id);
      try {
        await postTracking(id, {
          status: "accepted",
          message: "Order accepted and being prepared",
        });
      } catch {
        /* non-blocking */
      }
      toast.success("Order accepted!");
      loadOrders();
    } catch {
      toast.error("Failed to accept order");
    } finally {
      setActionId(null);
    }
  };
  const handleCancel = (id: string) =>
    changeStatus(id, "canceled", "Order canceled by vendor");
  const handleComplete = (id: string) =>
    changeStatus(id, "completed", "Order completed successfully");

  const handleMessage = (userId: string) =>
    navigate(`/vendor-chat?recipientId=${userId}`);

  // ── Rider pickup verification ───────────────────────────────────────────────
  const [pickupOrderId, setPickupOrderId] = useState<string | null>(null);
  const [pickupCode, setPickupCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleVerifyPickup = async (orderId: string) => {
    if (!pickupCode.trim()) {
      toast.error("Enter the rider's pickup code");
      return;
    }
    setVerifying(true);
    try {
      await verifyRiderPickup(orderId, pickupCode.trim());
      toast.success("Rider pickup verified!");
      setPickupOrderId(null);
      setPickupCode("");
      loadOrders();
    } catch {
      toast.error("Invalid or expired pickup code");
    } finally {
      setVerifying(false);
    }
  };

  // ── Derived ──────────────────────────────────────────────────────────────────
  const filteredOrders = orders.filter((o) => {
    if (activeTab === "accepted")
      return ["accepted", "preparing"].includes(o.status);
    return o.status === activeTab;
  });

  const getCount = (tab: TabType) => {
    if (tab === "accepted")
      return orders.filter((o) => ["accepted", "preparing"].includes(o.status))
        .length;
    return orders.filter((o) => o.status === tab).length;
  };

  const TABS: { id: TabType; label: string }[] = [
    { id: "pending", label: "Pending" },
    { id: "accepted", label: "Active" },
    { id: "canceled", label: "Canceled" },
    { id: "completed", label: "Completed" },
  ];

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium text-sm">
            Loading orders...
          </p>
        </div>
      </div>
    );

  if (!vendorId)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold text-lg mb-2">
            Vendor not found
          </p>
          <p className="text-gray-500 text-sm">Please log in again</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <VendorNav />

      {/* Header */}
      <div className="bg-white text-gray-900 px-6 py-4 border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <span className="text-gray-500 text-sm font-medium">
            {orders.length} total
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="bg-gray-50 p-1 rounded-xl border border-gray-100 grid grid-cols-4 gap-1 mb-6">
          {TABS.map((tab) => {
            const count = getCount(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 py-2.5 rounded-lg font-medium text-xs transition-colors ${
                  activeTab === tab.id
                    ? "bg-emerald-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      activeTab === tab.id
                        ? "bg-white/20 text-white"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium text-sm">
              No {activeTab} orders
            </p>
            <p className="text-gray-300 text-xs mt-2">
              Orders will appear here when available
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-emerald-200 transition-colors p-6"
              >
                {/* Top row */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-emerald-50">
                    {order.image ? (
                      <img
                        src={order.image}
                        alt="Food"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        🍽️
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                          {order.restaurantName}
                        </h3>
                        <p className="text-xs text-gray-400">
                          ID: {order.id.slice(0, 8).toUpperCase()} •{" "}
                          {order.itemsCount} items
                        </p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    {/* Customer */}
                    <p className="font-medium text-gray-700 text-sm mb-1">
                      {order.customerName}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-400">
                      {/* Phone */}
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        <Phone size={11} /> {order.customerPhone}
                      </a>
                      {/* Address */}
                      <span className="flex items-center gap-1">
                        <MapPin
                          size={11}
                          className="text-emerald-500 flex-shrink-0"
                        />
                        <span className="truncate max-w-[200px]">
                          {order.address}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount + time */}
                <div className="flex items-center justify-between mb-4 py-3 border-t border-b border-gray-100">
                  <span className="text-xs font-medium text-gray-400">
                    {order.time}
                  </span>
                  <span className="text-xl font-semibold text-emerald-600">
                    ₦{order.total.toLocaleString()}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  {order.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleCancel(order.id)}
                        disabled={actionId === order.id}
                        className="flex-1 py-3 rounded-xl font-medium text-xs text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAccept(order.id)}
                        disabled={actionId === order.id}
                        className="flex-[2] py-3 rounded-xl font-medium text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {actionId === order.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Check size={14} />
                        )}
                        Accept Order
                      </button>
                    </>
                  )}

                  {(order.status === "accepted" ||
                    order.status === "preparing") &&
                    pickupOrderId !== order.id && (
                      <>
                        <button
                          onClick={() => handleMessage("")}
                          className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-100 transition-colors flex-shrink-0"
                        >
                          <MessageSquare size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setPickupOrderId(order.id);
                            setPickupCode("");
                          }}
                          className="flex-1 py-3 rounded-xl font-medium text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                        >
                          <ShieldCheck size={14} />
                          Verify Rider
                        </button>
                        <button
                          onClick={() => handleComplete(order.id)}
                          disabled={actionId === order.id}
                          className="flex-1 py-3 rounded-xl font-medium text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {actionId === order.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} />
                          )}
                          Mark Complete
                        </button>
                      </>
                    )}

                  {(order.status === "accepted" ||
                    order.status === "preparing") &&
                    pickupOrderId === order.id && (
                      <div className="w-full flex items-center gap-2">
                        <input
                          type="text"
                          autoFocus
                          value={pickupCode}
                          onChange={(e) => setPickupCode(e.target.value)}
                          placeholder="Rider pickup code"
                          className="flex-1 py-3 px-3 rounded-xl border border-gray-100 bg-white text-xs text-gray-700 focus:outline-none focus:border-emerald-300"
                        />
                        <button
                          onClick={() => setPickupOrderId(null)}
                          className="py-3 px-3 rounded-xl text-xs font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleVerifyPickup(order.id)}
                          disabled={verifying}
                          className="py-3 px-4 rounded-xl text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {verifying ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <ShieldCheck size={14} />
                          )}
                          Confirm
                        </button>
                      </div>
                    )}

                  {order.status === "canceled" && (
                    <div className="w-full text-center py-3 text-gray-400 text-xs font-medium">
                      Order was declined
                    </div>
                  )}

                  {order.status === "completed" && (
                    <div className="w-full text-center py-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-medium flex items-center justify-center gap-2">
                      <Check size={14} /> Order Completed
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersManagement;
