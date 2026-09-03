import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  ArrowUpCircle,
  Eye,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { VendorNav } from "../component/VendorNav";
import api from "../../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawOrder {
  id: string;
  total_price?: number;
  total_amount?: number;
  status: string;
  created_at: string;
  customer_name?: string;
}

interface TransactionRow {
  id: number;
  title: string;
  amount: number;
  commission: number;
  date: string;
  status: string;
}

interface OrderRow {
  id: number;
  orderNo: string;
  amount: number;
  commission: number;
  date: string;
  status: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const EarningsPayment = () => {
  const [activeTab, setActiveTab] = useState<"transactions" | "orders">(
    "transactions",
  );
  const [showEarnings, setShowEarnings] = useState(true);
  const [currentPage, setCurrentPage] = useState<"main" | "payment">("main");
  const [selectedBank, setSelectedBank] = useState("Guaranty Trust Bank");
  const [bankName, setBankName] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        // Get vendor dashboard stats (earnings summary)
        const statsRes = await api.get("/vendors/dashboard-stats");
        const stats = statsRes.data as { total_earnings?: number };
        setTotalEarnings(stats.total_earnings ?? 0);

        // Get vendor orders
        const ordersRes = await api.get("/orders/", {
          params: { limit: 50 },
        });
        const orderData = ordersRes.data as RawOrder[];

        const total = orderData
          .filter((o) => o.status === "completed" || o.status === "delivered")
          .reduce(
            (acc: number, o: RawOrder) =>
              acc + (Number(o.total_price ?? o.total_amount) || 0),
            0,
          );
        setTotalEarnings(total);

        setTransactions(
          orderData.map((o: RawOrder, i: number) => ({
            id: i + 1,
            title: `Order from ${o.customer_name ?? "Customer"}`,
            amount: Number(o.total_price ?? o.total_amount) || 0,
            commission: Math.round(
              (Number(o.total_price ?? o.total_amount) || 0) * 0.1,
            ),
            date: new Date(o.created_at).toLocaleDateString("en-NG", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            status: o.status,
          })),
        );

        setOrders(
          orderData.map((o: RawOrder, i: number) => ({
            id: i + 1,
            orderNo: `#${o.id.slice(0, 5).toUpperCase()}`,
            amount: Number(o.total_price ?? o.total_amount) || 0,
            commission: Math.round(
              (Number(o.total_price ?? o.total_amount) || 0) * 0.1,
            ),
            date: new Date(o.created_at).toLocaleDateString("en-NG", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            status: o.status,
          })),
        );

        // Fetch existing bank info
        try {
          const bankRes = await api.get("/vendors/bank-info");
          const bankData = bankRes.data as {
            bank_name?: string;
            account_name?: string;
            account_number?: string;
          };
          if (bankData) {
            setSelectedBank(bankData.bank_name ?? "Guaranty Trust Bank");
            setBankName(bankData.account_name ?? "");
            setAccountNo(bankData.account_number ?? "");
          }
        } catch {
          // Bank info not set yet — silently ignore
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, []);

  const banks = [
    "Guaranty Trust Bank",
    "Access Bank",
    "First Bank of Nigeria",
    "Zenith Bank",
    "United Bank for Africa",
    "Fidelity Bank",
  ];

  const handleSave = async () => {
    try {
      await api.post("/vendors/bank-info", {
        bank_name: selectedBank,
        account_name: bankName,
        account_number: accountNo,
      });
    } catch {
      // silently fail
    }
    setCurrentPage("main");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading earnings...</p>
        </div>
      </div>
    );
  }

  if (currentPage === "payment") {
    return (
      <div className="min-h-screen bg-gray-50">
        <VendorNav />
        <div className="bg-white text-gray-900 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentPage("main")}
                className="hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">
                Earnings and Payment
              </h1>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          {/* Earnings Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-emerald-600 font-medium">
                <span className="text-sm">Today's Earning</span>
                <ChevronDown size={16} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 p-3 rounded-2xl">
                  <span className="text-emerald-600 text-2xl font-semibold">
                    ₦
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-4xl font-semibold text-gray-900">
                    {showEarnings
                      ? `₦ ${totalEarnings.toLocaleString()}`
                      : "₦ ••••••"}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Pending Payout -{" "}
                    <span className="text-emerald-600 font-semibold">
                      ₦ {Math.round(totalEarnings * 0.9).toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEarnings(!showEarnings)}
                className="bg-emerald-50 p-2 sm:p-3 rounded-full hover:bg-emerald-100 transition-colors"
              >
                <Eye size={18} className="text-emerald-600" />
              </button>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            <div>
              <label className="inline-block bg-emerald-600 text-white text-xs px-3 py-1 rounded-t-lg font-medium">
                Select bank
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                  #
                </span>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-12 py-4 text-gray-700 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all appearance-none cursor-pointer"
                >
                  {banks.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2 ml-1">
                Bank name
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                  #
                </span>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Enter bank name"
                  className="w-full bg-white border border-gray-200 rounded-lg px-12 py-4 text-gray-700 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2 ml-1">
                Account No:
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                  #
                </span>
                <input
                  type="text"
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                  placeholder="Enter account number"
                  className="w-full bg-white border border-gray-200 rounded-lg px-12 py-4 text-gray-700 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 pb-8">
            <button
              onClick={handleSave}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorNav />
      <div className="bg-white text-gray-900 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <button className="hover:bg-gray-100 p-2 rounded-full transition-colors">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">
              Earnings and Payment
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
            <div
              className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Earnings Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <div className="flex items-center gap-2 text-emerald-600 font-medium mb-4">
            <span className="text-sm">Today's Earning</span>
            <ChevronDown size={16} />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 p-3 rounded-2xl">
                <span className="text-emerald-600 text-2xl font-semibold">
                  ₦
                </span>
              </div>
              <div>
                <h2 className="text-2xl sm:text-4xl font-semibold text-gray-900">
                  {showEarnings
                    ? `₦ ${totalEarnings.toLocaleString()}`
                    : "₦ ••••••"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Pending Payout -{" "}
                  <span className="text-emerald-600 font-semibold">
                    ₦ {Math.round(totalEarnings * 0.9).toLocaleString()}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowEarnings(!showEarnings)}
              className="bg-emerald-50 p-2 sm:p-3 rounded-full hover:bg-emerald-100 transition-colors self-end sm:self-auto"
            >
              <Eye size={18} className="text-emerald-600" />
            </button>
          </div>
        </div>

        {/* Update Payment Info */}
        <button
          onClick={() => setCurrentPage("payment")}
          className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex items-center justify-between hover:border-emerald-200 transition-colors"
        >
          <span className="text-gray-700 font-medium text-sm sm:text-base">
            Update Payment Info
          </span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 18L15 12L9 6"
              stroke="#059669"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Tabs */}
        <div className="bg-gray-50 p-1 rounded-xl border border-gray-100">
          <div className="flex gap-1">
            {(["transactions", "orders"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 px-6 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? "bg-emerald-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="flex items-center justify-end gap-2 text-gray-500 text-sm">
          <span className="font-medium">21st May - 25th Aug</span>
          <Calendar size={16} className="text-emerald-600" />
        </div>

        {/* List */}
        <div className="space-y-3">
          {(activeTab === "transactions" ? transactions : orders).map(
            (item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 hover:border-emerald-200 transition-colors"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                    <div className="bg-emerald-50 p-3 sm:p-4 rounded-2xl flex-shrink-0">
                      <ArrowUpCircle
                        size={20}
                        className="text-emerald-600 sm:w-6 sm:h-6"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base truncate">
                        {activeTab === "transactions"
                          ? (item as TransactionRow).title
                          : `ORDER - ${(item as OrderRow).orderNo}`}
                      </h3>
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <span className="text-xs text-gray-500">
                          {item.date}
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 text-xs px-2 sm:px-3 py-1 rounded-full font-medium">
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right pl-11 sm:pl-0">
                    <p className="text-lg sm:text-xl font-semibold text-gray-900">
                      -₦{item.amount.toLocaleString()}
                    </p>
                    <p className="text-xs sm:text-sm text-emerald-600 font-medium">
                      Commission - ₦{item.commission.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pb-8">
          <button className="w-full bg-emerald-600 text-white py-4 rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
            Request Withdrawal
          </button>
          <button className="w-full bg-white text-emerald-600 py-4 rounded-xl font-semibold border border-gray-200 hover:bg-emerald-50 transition-colors">
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default EarningsPayment;
