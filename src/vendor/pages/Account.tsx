/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  User,
  FileText,
  History,
  Wallet,
  Smartphone,
  Star,
  Headphones,
  LogOut,
  ShoppingBag,
  ChevronRight,
  Award,
  TrendingUp,
  Crown,
  Bell,
  Loader2,
} from "lucide-react";
import { VendorNav } from "../component/VendorNav";
import { Link } from "react-router-dom";
import { backendAuthService } from "../../services/backendAuthService";
import api from "../../services/api";

interface VendorData {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  business_name: string | null;
  full_name: string | null;
  business_email: string | null;
  business_phone: string | null;
  business_address: string | null;
  business_category: string | null;
  logo_url: string | null;
  state: string | null;
  lga: string | null;
  day_from: string | null;
  day_to: string | null;
  status: string;
}

const MENU_ITEMS = [
  {
    icon: User,
    label: "Profile",
    description: "Manage your personal info",
    color: "bg-blue-600",
    bgColor: "bg-blue-50",
    sec: "ProfileSetting",
  },
  {
    icon: FileText,
    label: "Menu",
    description: "View and manage menu items",
    color: "bg-emerald-600",
    bgColor: "bg-emerald-50",
    sec: "menu",
  },
  {
    icon: History,
    label: "Order History",
    description: "Track all your orders",
    color: "bg-purple-600",
    bgColor: "bg-purple-50",
    sec: "orderhistory",
  },
  {
    icon: Wallet,
    label: "Earning and Payment",
    description: "Manage earnings & payments",
    color: "bg-amber-600",
    bgColor: "bg-amber-50",
    sec: "earning",
  },
  {
    icon: Smartphone,
    label: "Devices and Session",
    description: "Manage connected devices",
    color: "bg-indigo-600",
    bgColor: "bg-indigo-50",
    sec: "DevicesSession",
  },
  {
    icon: Star,
    label: "Review and Ratings",
    description: "View customer feedback",
    color: "bg-pink-600",
    bgColor: "bg-pink-50",
    sec: "reviews",
  },
  {
    icon: Headphones,
    label: "Support",
    description: "Get help from our team",
    color: "bg-red-600",
    bgColor: "bg-red-50",
    sec: "Support-vendor",
  },
];

const Account = () => {
  const [isHovering, setIsHovering] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);

        // 1. Verify JWT
        const user = await backendAuthService.getCurrentUser();
        if (!user) {
          window.location.href = "/vendor-login";
          return;
        }

        const vendorId = user.vendor_id || user.id;

        // 2. Fetch vendor profile + orders in parallel
        const [vendorRes, ordersRes, statsRes] = await Promise.allSettled([
          api.get(`/vendors/${vendorId}`),
          api.get("/orders/", { params: { vendor_id: vendorId } }),
          api.get("/vendors/dashboard-stats"),
        ]);

        // 3. Vendor profile from GET /vendors/{id}
        if (vendorRes.status === "fulfilled") {
          setVendor(vendorRes.value.data);
        }

        // 4. Dashboard stats (revenue, ratings)
        if (statsRes.status === "fulfilled") {
          const d = statsRes.value.data;
          setTotalOrders(Number(d.total_orders || 0));
          setRevenue(Number(d.total_revenue || 0));
          setAvgRating(Number(d.average_rating || 0));
        }

        // 5. Derive from orders as fallback
        if (ordersRes.status === "fulfilled") {
          const orders: any[] = Array.isArray(ordersRes.value.data)
            ? ordersRes.value.data
            : [];
          if (totalOrders === 0) setTotalOrders(orders.length);
          if (revenue === 0)
            setRevenue(
              orders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0),
            );
          if (avgRating === 0) {
            const rated = orders.filter((o) => o.rating);
            if (rated.length)
              setAvgRating(
                Math.round(
                  (rated.reduce((s, o) => s + Number(o.rating), 0) /
                    rated.length) *
                    10,
                ) / 10,
              );
          }
        }
      } catch (e) {
        console.error("Account error:", e);
        window.location.href = "/vendor-login";
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatRevenue = (n: number) => {
    if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `₦${(n / 1_000).toFixed(1)}K`;
    return `₦${n.toLocaleString()}`;
  };

  const displayName =
    vendor?.business_name ||
    `${vendor?.firstname || ""} ${vendor?.lastname || ""}`.trim() ||
    "Your Restaurant";
  const displayEmail = vendor?.business_email || vendor?.email || "";
  const displayPhone = vendor?.business_phone || vendor?.phone || "";
  const displayAddr =
    [vendor?.business_address, vendor?.lga, vendor?.state]
      .filter(Boolean)
      .join(", ") || "Address not set";
  const deliveryRange =
    vendor?.day_from && vendor?.day_to
      ? `${vendor.day_from} – ${vendor.day_to}`
      : "Not Set";

  const statCards = [
    {
      icon: ShoppingBag,
      label: "Total Orders",
      value: totalOrders.toLocaleString(),
      color: "text-blue-600",
    },
    {
      icon: TrendingUp,
      label: "Revenue",
      value: formatRevenue(revenue),
      color: "text-emerald-600",
    },
    {
      icon: Award,
      label: "Rating",
      value: avgRating > 0 ? String(avgRating) : "N/A",
      color: "text-amber-600",
    },
  ];

  if (isLoading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
          <p className="text-gray-500 font-medium">Loading your profile...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white pb-24">
      <VendorNav />

      {/* Header */}
      <div className="bg-white text-gray-900 px-6 py-4 border-b border-gray-100 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="w-10" />
          <h1 className="text-lg font-semibold text-gray-900">Profile</h1>
          <Link to="/vendor-dashboard">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Hero card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-6">
          <div className="relative z-10">
            {/* Avatar */}
            <div className="flex justify-center mb-4 relative">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-emerald-600 p-1">
                  <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center text-white text-4xl font-semibold overflow-hidden">
                    {vendor?.logo_url ? (
                      <img
                        src={vendor.logo_url}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{displayName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center shadow-sm">
                  <Crown className="w-6 h-6 text-white" />
                </div>
              </div>
              {/* Rating pill */}
              <div className="absolute right-8 top-0 bg-white rounded-full px-4 py-2 shadow-sm flex items-center gap-2 border border-emerald-100">
                <span className="text-2xl font-semibold text-gray-900">
                  {avgRating > 0 ? avgRating : "N/A"}
                </span>
                <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
              </div>
            </div>

            {/* Name + address */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                {displayName}
              </h2>
              <p className="text-gray-400 text-sm mb-1">{displayEmail}</p>
              <p className="text-gray-400 text-sm mb-1">{displayPhone}</p>
              <p className="text-gray-500 text-sm">{displayAddr}</p>
              {deliveryRange !== "Not Set" && (
                <p className="text-emerald-600 text-xs font-medium mt-1">
                  {deliveryRange}
                </p>
              )}

              {/* Status badge */}
              <div className="mt-3">
                <span
                  className={`px-4 py-1 rounded-full text-xs font-medium ${
                    vendor?.status === "active"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-orange-50 text-orange-600"
                  }`}
                >
                  {vendor?.status || "pending"}
                </span>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                {statCards.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={i}
                      className="bg-gray-50 rounded-xl border border-gray-100 p-4"
                    >
                      <Icon className={`w-6 h-6 ${s.color} mx-auto mb-2`} />
                      <p className="text-2xl font-semibold text-gray-900">
                        {s.value}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Menu links */}
        <div className="space-y-3">
          {MENU_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                onMouseEnter={() => setIsHovering(item.label)}
                onMouseLeave={() => setIsHovering(null)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-gray-200 transition-colors cursor-pointer overflow-hidden"
              >
                <Link to={`/${item.sec}`}>
                  <div className="flex items-center gap-4 p-5">
                    <div
                      className={`w-14 h-14 rounded-xl ${item.bgColor} flex items-center justify-center flex-shrink-0`}
                    >
                      <div
                        className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base mb-0.5">
                        {item.label}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-gray-400 transition-all ${isHovering === item.label ? "text-emerald-600 translate-x-1" : ""}`}
                    />
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Logout */}
        <button
          onClick={() => {
            localStorage.removeItem("authToken");
            localStorage.removeItem("userData");
            window.location.href = "/vendor-login";
          }}
          className="w-full mt-6 py-4 px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-base transition-colors flex items-center justify-center gap-3 group"
        >
          <span>Log out</span>
          <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Premium badge */}
        <div className="mt-6 bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-800 mb-1">
                Premium Member
              </h3>
              <p className="text-sm text-emerald-700">
                You're enjoying all premium features. Keep up the great work!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
