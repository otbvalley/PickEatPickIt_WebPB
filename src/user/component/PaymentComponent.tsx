/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, CreditCard, MapPin, Package, Plus } from "lucide-react";
import { createOrder } from "../../services/api";
import {
  backendAuthService,
  type Address,
} from "../../services/backendAuthService";
import { Navbar } from "../../component/Navbar";
import { useToast } from "../../context/ToastContext";

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  image_url?: string;
}

interface PendingOrder {
  items: OrderItem[];
  spiceLevel: number;
  scheduleOrder: boolean;
  scheduledDate: string | null;
  scheduledTime: string | null;
  specialInstructions: string;
}

const PaymentComponent: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [orderData, setOrderData] = useState<PendingOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">(
    "online",
  );
  const [userEmail, setUserEmail] = useState("");
  const [vendorInfo, setVendorInfo] = useState<any>(null);
  const [promoCode, setPromoCode] = useState("");
  const [discountInfo, setDiscountInfo] = useState<{
    code: string;
    type: "percentage" | "fixed";
    value: number;
  } | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  // Saved delivery addresses
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(
    null,
  );
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    address: "",
    address_name: "",
    address_type: "Home",
    delivery_instructions: "",
  });

  const fetchAddresses = async () => {
    setAddressesLoading(true);
    try {
      const addresses = await backendAuthService.getAddresses();
      setSavedAddresses(addresses || []);
      if (addresses && addresses.length > 0) {
        const defaultAddr =
          addresses.find((a) => a.is_default) || addresses[0];
        if (defaultAddr.id) {
          setSelectedAddressId(defaultAddr.id);
        }
        setSelectedAddress(defaultAddr);
        setDeliveryAddress(defaultAddr.address);
      } else {
        setShowAddAddressForm(true);
      }
    } catch (err) {
      // Non-blocking: fall back to free-text address entry
      console.error("Failed to fetch saved addresses:", err);
    } finally {
      setAddressesLoading(false);
    }
  };

  const handleSelectAddress = (addr: Address) => {
    setSelectedAddressId(addr.id || null);
    setSelectedAddress(addr);
    setDeliveryAddress(addr.address);
    setShowAddAddressForm(false);
  };

  const handleSaveNewAddress = async () => {
    if (!newAddress.address.trim()) {
      toast.warning("Please enter an address", "Address Required");
      return;
    }
    setSavingAddress(true);
    try {
      const created = await backendAuthService.addAddress({
        address: newAddress.address.trim(),
        address_name: newAddress.address_name.trim() || undefined,
        address_type: newAddress.address_type,
        delivery_instructions:
          newAddress.delivery_instructions.trim() || undefined,
        is_default: savedAddresses.length === 0,
      });
      toast.success("Address saved successfully", "Address Saved");
      await fetchAddresses();
      if (created?.id) {
        handleSelectAddress(created);
      } else {
        setDeliveryAddress(newAddress.address.trim());
      }
      setNewAddress({
        address: "",
        address_name: "",
        address_type: "Home",
        delivery_instructions: "",
      });
      setShowAddAddressForm(false);
    } catch (err) {
      console.error("Failed to save address:", err);
      toast.error(
        "Could not save this address, but you can still continue with it below.",
        "Save Failed",
      );
      // Non-blocking fallback: still use the typed address for checkout
      setDeliveryAddress(newAddress.address.trim());
    } finally {
      setSavingAddress(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const pendingOrder = sessionStorage.getItem("pendingOrder");
    const checkoutItems = sessionStorage.getItem("checkoutItems");
    console.log({ pendingOrder, checkoutItems });
    if (pendingOrder) {
      setOrderData(JSON.parse(pendingOrder));
    } else if (checkoutItems) {
      const items = JSON.parse(checkoutItems);
      setOrderData({
        items,
        spiceLevel: 30,
        scheduleOrder: false,
        scheduledDate: null,
        scheduledTime: null,
        specialInstructions: "",
      });
    } else {
      toast.warning("No order found. Please add items first.", "Cart Empty");
      navigate("/market");
    }

    const fetchInitialData = async () => {
      // Get user email
      const userDataStr = localStorage.getItem("userData");
      if (userDataStr) {
        const user = JSON.parse(userDataStr);
        setUserEmail(user.email);
      }

      // Fetch vendor info to check COD
      try {
        const items = pendingOrder
          ? JSON.parse(pendingOrder).items
          : checkoutItems
            ? JSON.parse(checkoutItems)
            : [];
        if (items.length > 0) {
          // Extract vendor_id directly from the first item (all items should be from same vendor)
          const vendorId = items[0].vendor_id;
          if (vendorId) {
            const vendors = await backendAuthService.getVendors(100);
            const vendor = vendors.find((v: any) => v.id === vendorId);
            if (vendor) {
              setVendorInfo(vendor);
              // If vendor doesn't accept COD and currently selected method is COD, switch to online
              if (!vendor.accept_cod && paymentMethod === "cod") {
                setPaymentMethod("online");
              }
            }
          }
        }
      } catch (err) {
        console.error("Error fetching vendor data:", err);
      }
    };
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, toast]);

  const calculateTotal = (): {
    subtotal: number;
    delivery: number;
    discount: number;
    total: number;
  } => {
    if (!orderData) return { subtotal: 0, delivery: 5, discount: 0, total: 5 };

    const subtotal = orderData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const delivery = 5.0;

    let discount = 0;
    if (discountInfo) {
      if (discountInfo.type === "percentage") {
        discount = (subtotal * discountInfo.value) / 100;
      } else {
        discount = discountInfo.value;
      }
    }

    const total = Math.max(0, subtotal + delivery - discount);

    return { subtotal, delivery, discount, total };
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) return;

    setIsValidatingPromo(true);
    try {
      const { subtotal } = calculateTotal();
      const data = await backendAuthService.validatePromoCode(
        promoCode.toUpperCase(),
        subtotal,
      );

      if (!data.valid) {
        toast.error("Invalid or inactive promo code", "Invalid Code");
        setDiscountInfo(null);
        return;
      }

      setDiscountInfo({
        code: data.code,
        type: data.discount_type as "percentage" | "fixed",
        value: data.discount_value,
      });
      toast.success(`${data.code} applied successfully!`, "Promo Applied");
    } catch {
      toast.error("Something went wrong validating promo code", "Error");
    } finally {
      setIsValidatingPromo(false);
    }
  };

  // FIXED handlePayment function
  // Replace your current handlePayment function with this:

  // FINAL CORRECTED handlePayment function
  // Replace your current handlePayment function with this:
  const { subtotal, delivery, discount, total } = calculateTotal();

  const handlePayment = async () => {
    if (!orderData) return;
    if (!deliveryAddress.trim()) {
      toast.warning("Please enter delivery address", "Address Required");
      return;
    }

    setLoading(true);

    if (paymentMethod === "online") {
      try {
        const userDataStr = localStorage.getItem("userData");
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        const fullName = userData
          ? `${userData.firstname || ""} ${userData.lastname || ""}`.trim()
          : "Customer";
        console.log({ vendorInfo });
        // Ensure vendor_id is available
        if (!vendorInfo?.id) {
          toast.error(
            "Vendor information is not available. Please try again.",
            "Payment Error",
          );
          setLoading(false);
          return;
        }

        const paymentPayload = {
          amount: total,
          vendor_id: vendorInfo.id, // Remove optional chaining to ensure it's required
          payment_method: "paystack",
          promo_code: discountInfo?.code,
          email: userEmail,
          customer_email: userEmail,
          customer_phone: userData?.phone,
          customer_name: fullName,
          delivery_address: deliveryAddress,
          delivery_type: "delivery",
          callback_url: `${window.location.origin}/payment-verify`,
          order_items: orderData.items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          metadata: {
            order_items: orderData.items,
            spice_level: orderData.spiceLevel,
            special_instructions: orderData.specialInstructions,
            latitude: selectedAddress?.latitude,
            longitude: selectedAddress?.longitude,
          },
        };

        const response = await backendAuthService.initializePayment(
          paymentPayload,
        );
        if (response?.authorization_url) {
          // Store order details temporarily to create order after verification
          sessionStorage.setItem(
            "pendingOrderDetails",
            JSON.stringify({
              orderPayload: {
                vendor_id: vendorInfo?.id,
                restaurant_name: vendorInfo?.business_name,
                user_id: userData?.id,
                customer_name: fullName,
                customer_phone: userData?.phone,
                delivery_address: deliveryAddress,
                total_price: total,
                status: "pending",
                items_count: orderData.items.length,
                scheduled_time: new Date().toISOString(),
                payment_method: "online",
                is_paid: true,
              },
              orderItems: orderData.items.map((item) => ({
                menu_item_id: item.id,
                quantity: item.quantity,
                price: item.price, // Backend expects 'price', not 'price_at_order'
              })),
            }),
          );

          // Redirect to Paystack
          window.location.href = response.authorization_url;
        } else {
          toast.error("Failed to initialize payment", "Payment Error");
          setLoading(false);
        }
      } catch (error) {
        console.error("Payment initialization error:", error);
        toast.error("Failed to initialize payment", "Payment Error");
        setLoading(false);
      }
    } else {
      // Cash on delivery flow
      await processOrderCreation();
    }
  };

  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const handlePaystackSuccess = async (reference: { reference: string }) => {
  //   await processOrderCreation(reference.reference);
  // };

  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const handlePaystackClose = () => {
  //   toast.info("Transaction was not completed", "Payment Cancelled");
  //   setLoading(false);
  // };

  const processOrderCreation = async (paymentRef: string | null = null) => {
    try {
      // Get user data from localStorage (set during login)
      const userDataStr = localStorage.getItem("userData");
      if (!userDataStr) {
        toast.error(
          "Please log in to place an order",
          "Authentication Required",
        );
        return;
      }
      const userData = JSON.parse(userDataStr);

      // Build fullName from user data
      const fullName =
        `${userData.firstname || ""} ${userData.lastname || ""}`.trim() ||
        "Customer";
      const phoneNum = userData.phone || "No phone";

      // 2. Fetch vendor business name correctly
      const firstItemId = orderData!.items[0].id;

      // Get menu items to find vendor_id
      const menuItems = await backendAuthService.getMenuItems(100);
      const menuItem = menuItems.find(
        (item: { id: string | number }) =>
          String(item.id) === String(firstItemId),
      );

      if (!menuItem) {
        toast.error("Unable to find menu item information.", "Menu Error");
        setLoading(false);
        return;
      }

      // Get vendor info
      const vendors = await backendAuthService.getVendors(100);
      const vendor = vendors.find(
        (v: { id: string }) => v.id === menuItem.vendor_id,
      );
      const restaurantName = vendor?.business_name || "Restaurant";

      // 3. Prepare Payload
      const orderPayload = {
        vendor_id: menuItem.vendor_id,
        restaurant_name: restaurantName,
        user_id: userData.id,
        customer_name: fullName,
        customer_phone: phoneNum,
        delivery_address: deliveryAddress,
        total_price: total, // Required by backend schema
        status: "pending",
        items_count: orderData!.items.length,
        scheduled_time: new Date().toISOString(),
        payment_method: paymentMethod,
        payment_reference: paymentRef,
        is_paid: paymentMethod === "online",
      };

      // After — cast id to string to match OrderItem type
      const orderItems = orderData!.items.map((item) => ({
        menu_item_id: String(item.id),
        quantity: item.quantity,
        price: item.price,
      }));

      try {
        const response = await createOrder(orderPayload, orderItems);
        const createdOrder = response.data;

        // Backend returns order directly, not nested under 'order'
        if (createdOrder?.id) {
          sessionStorage.removeItem("cart");
          sessionStorage.removeItem("pendingOrder");
          sessionStorage.removeItem("checkoutItems");
          setTrackingCode(createdOrder.id);
        } else {
          toast.error(
            "Unable to place your order at this time. Please try again.",
            "Order Failed",
          );
        }
      } catch (orderError: any) {
        // Humanize error messages instead of showing technical database errors
        let errorMessage =
          "Unable to place your order at this time. Please try again.";

        if (orderError?.response?.data?.detail) {
          errorMessage = orderError.response.data.detail;
        } else if (orderError?.message) {
          if (
            orderError.message.includes("column") ||
            orderError.message.includes("schema")
          ) {
            errorMessage =
              "We're experiencing technical difficulties. Please contact support if this persists.";
          } else if (
            orderError.message.includes("network") ||
            orderError.message.includes("connection")
          ) {
            errorMessage =
              "Network connection issue. Please check your internet and try again.";
          } else if (
            orderError.message.includes("permission") ||
            orderError.message.includes("unauthorized")
          ) {
            errorMessage =
              "Authentication issue. Please log in again and try placing your order.";
          }
        }

        toast.error(errorMessage, "Order Failed");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Payment processing error
      toast.error("An error occurred. Please try again.", "Payment Error");
    } finally {
      setLoading(false);
    }
  };
  if (!orderData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium font-inter">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  // Success screen with tracking code
  if (trackingCode) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 transition-colors duration-300">
        <div className="max-w-md w-full">
          {/* Success Animation */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full mb-6">
              <svg
                className="w-10 h-10 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2 font-inter">
              Order Placed!
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Your order has been confirmed successfully
            </p>
          </div>

          {/* Tracking Code Card */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mb-6">
            <div className="text-center mb-6">
              <p className="text-xs text-gray-500 mb-3">
                Your Tracking Code
              </p>
              <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
                <p className="text-3xl font-semibold text-emerald-600 font-mono">
                  {trackingCode.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    trackingCode.slice(0, 8).toUpperCase(),
                  );
                  toast.success("Tracking code copied to clipboard!", "Copied");
                }}
                className="mt-4 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors font-inter"
              >
                Copy Code
              </button>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                📱 Show this code to your rider when they arrive
              </p>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
            <div className="divide-y divide-gray-100 font-inter">
              <div className="flex justify-between pb-4">
                <span className="text-sm text-gray-500">Restaurant</span>
                <span className="text-sm font-semibold text-gray-900">
                  {orderData.items[0]?.name || "Order"}
                </span>
              </div>
              <div className="flex justify-between py-4">
                <span className="text-sm text-gray-500">Items</span>
                <span className="text-sm font-semibold text-gray-900">
                  {orderData.items.length} items
                </span>
              </div>
              <div className="flex justify-between pt-4">
                <span className="text-sm text-gray-500">Delivery Address</span>
                <span className="font-semibold text-gray-900 text-right max-w-xs text-sm truncate">
                  {deliveryAddress}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <button
            onClick={() => navigate("/booking")}
            className="w-full bg-emerald-600 text-white font-semibold py-4 rounded-xl hover:bg-emerald-700 transition-colors mb-3"
          >
            Track Your Order
          </button>
          <button
            onClick={() => navigate("/market")}
            className="w-full bg-white text-emerald-600 font-semibold py-4 rounded-xl hover:bg-gray-50 border border-emerald-100 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // totals is already destructured at the component level

  return (
    <div className="min-h-screen bg-white transition-colors duration-300">
      <Navbar />

      {/* Header */}
      <div className="bg-emerald-600 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <ChevronLeft
            className="w-6 h-6 cursor-pointer text-white hover:bg-white/10 rounded-full p-1 transition-all"
            onClick={() => navigate(-1)}
          />
          <h1 className="text-lg font-semibold text-white flex-1 font-inter">
            Payment
          </h1>
          <Package className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 pb-24">
        {/* Delivery Address */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-semibold text-gray-900 font-inter">
              Delivery Address
            </h2>
          </div>

          {addressesLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
              Loading saved addresses...
            </div>
          ) : savedAddresses.length > 0 ? (
            <div className="space-y-3 mb-4">
              {savedAddresses.map((addr, i) => {
                const isSelected =
                  (addr.id && addr.id === selectedAddressId) ||
                  (!addr.id && selectedAddress === addr);
                return (
                  <label
                    key={addr.id || i}
                    className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-emerald-200"
                    }`}
                    onClick={() => handleSelectAddress(addr)}
                  >
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "border-emerald-500" : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 font-inter">
                      <p className="font-semibold text-gray-900 text-sm">
                        {addr.address_name || addr.address_type || "Saved address"}
                        {addr.is_default && (
                          <span className="ml-2 inline-flex items-center text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                            Default
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{addr.address}</p>
                      {addr.delivery_instructions && (
                        <p className="text-xs text-gray-400 mt-1">
                          {addr.delivery_instructions}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}

              <button
                type="button"
                onClick={() => setShowAddAddressForm((prev) => !prev)}
                className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors px-1 py-1"
              >
                <Plus className="w-4 h-4" />
                Add new address
              </button>
            </div>
          ) : null}

          {showAddAddressForm && (
            <div className="border border-gray-200 rounded-xl p-4 space-y-3 mb-4">
              <input
                type="text"
                placeholder="Address name (e.g. Home, Office)"
                value={newAddress.address_name}
                onChange={(e) =>
                  setNewAddress((prev) => ({
                    ...prev,
                    address_name: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-inter"
              />
              <textarea
                placeholder="Full delivery address"
                value={newAddress.address}
                onChange={(e) =>
                  setNewAddress((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                rows={2}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-inter resize-none"
              />
              <select
                value={newAddress.address_type}
                onChange={(e) =>
                  setNewAddress((prev) => ({
                    ...prev,
                    address_type: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-inter"
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="text"
                placeholder="Delivery instructions (optional)"
                value={newAddress.delivery_instructions}
                onChange={(e) =>
                  setNewAddress((prev) => ({
                    ...prev,
                    delivery_instructions: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-inter"
              />
              <button
                type="button"
                onClick={handleSaveNewAddress}
                disabled={savingAddress || !newAddress.address.trim()}
                className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors text-sm font-inter"
              >
                {savingAddress ? "Saving..." : "Save Address"}
              </button>
            </div>
          )}

          {!showAddAddressForm && savedAddresses.length === 0 && !addressesLoading && (
            <input
              type="text"
              placeholder="Enter your delivery address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-inter"
            />
          )}
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2 font-inter">
            <Package className="w-5 h-5 text-emerald-600" />
            Order Items ({orderData.items.length})
          </h2>
          <div className="divide-y divide-gray-100">
            {orderData.items.map((item, i) => (
              <div
                key={i}
                className="flex gap-4 items-center py-4 first:pt-0 last:pb-0"
              >
                <div className="w-20 h-20 bg-emerald-50 rounded-xl overflow-hidden flex-shrink-0">
                  {item.image_url?.startsWith("http") ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      {item.image_url || "🍽️"}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-base font-inter">
                    {item.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Quantity:{" "}
                    <span className="font-medium text-gray-700">{item.quantity}</span>
                  </p>
                </div>
                <p className="font-semibold text-emerald-600 text-base font-inter">
                  ₦{(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Promo Code */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🏷️</span>
            <h2 className="text-base font-semibold text-gray-900 font-inter">
              Promo Code
            </h2>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              disabled={!!discountInfo || isValidatingPromo}
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-inter uppercase disabled:bg-gray-50 disabled:text-gray-400"
            />
            {discountInfo ? (
              <button
                onClick={() => {
                  setDiscountInfo(null);
                  setPromoCode("");
                }}
                className="px-6 py-3 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-all"
              >
                Remove
              </button>
            ) : (
              <button
                onClick={handleApplyPromoCode}
                disabled={!promoCode.trim() || isValidatingPromo}
                className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all"
              >
                {isValidatingPromo ? "..." : "Apply"}
              </button>
            )}
          </div>
          {discountInfo && (
            <div className="mt-3">
              <span className="inline-flex items-center gap-1 text-sm text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-medium">
                ✓ Promo code {discountInfo.code} applied
              </span>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm p-6 mb-4">
          <h2 className="text-base font-semibold text-gray-900 mb-4 font-inter">
            Order Summary
          </h2>
          <div className="divide-y divide-gray-100 font-inter">
            <div className="flex justify-between text-gray-600 pb-3">
              <span className="text-sm">Subtotal</span>
              <span className="text-sm font-semibold text-gray-900">
                ₦{subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-gray-600 py-3">
              <span className="text-sm">Delivery Fee</span>
              <span className="text-sm font-semibold text-gray-900">
                ₦{delivery.toLocaleString()}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 py-3">
                <span className="text-sm">Discount ({discountInfo?.code})</span>
                <span className="text-sm font-semibold">
                  -₦{discount.toLocaleString()}
                </span>
              </div>
            )}
            {orderData.spiceLevel && (
              <div className="flex justify-between text-gray-500 py-3">
                <span className="text-sm">Spice Level</span>
                <span className="text-sm font-semibold text-emerald-600">
                  {orderData.spiceLevel === 0
                    ? "Mild"
                    : orderData.spiceLevel > 50
                      ? "Hot"
                      : "Medium"}
                </span>
              </div>
            )}
            {orderData.specialInstructions && (
              <div className="py-3">
                <p className="text-gray-500 text-sm mb-1">
                  Special Instructions:
                </p>
                <p className="text-gray-700 text-sm bg-white p-3 rounded-lg border border-gray-100">
                  {orderData.specialInstructions}
                </p>
              </div>
            )}
            <div className="pt-4 mt-1 flex justify-between items-center">
              <span className="text-base font-semibold text-gray-900">Total Amount</span>
              <span className="text-xl font-semibold text-emerald-600">₦{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Seçimi */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4 font-inter">
            Choose Payment Method
          </h2>
          <div className="space-y-3">
            <label
              className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                paymentMethod === "online"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-emerald-200"
              }`}
              onClick={() => setPaymentMethod("online")}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === "online"
                    ? "border-emerald-500"
                    : "border-gray-300"
                }`}
              >
                {paymentMethod === "online" && (
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                )}
              </div>
              <div className="flex-1 font-inter">
                <p className="font-semibold text-gray-900">
                  Pay Online (Paystack)
                </p>
                <p className="text-xs text-gray-500">
                  Secure payment with Card, Transfer, USSD
                </p>
              </div>
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </label>

            <label
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                vendorInfo && !vendorInfo.accept_cod
                  ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-50"
                  : paymentMethod === "cod"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-emerald-200 cursor-pointer"
              }`}
              onClick={() => {
                if (vendorInfo?.accept_cod) {
                  setPaymentMethod("cod");
                } else if (vendorInfo && !vendorInfo.accept_cod) {
                  toast.info(
                    "This vendor does not accept Cash on Delivery",
                    "COD Unavailable",
                  );
                }
              }}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === "cod"
                    ? "border-emerald-500"
                    : "border-gray-300"
                }`}
              >
                {paymentMethod === "cod" && (
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                )}
              </div>
              <div className="flex-1 font-inter">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">Cash on Delivery</p>
                  {vendorInfo && !vendorInfo.accept_cod && (
                    <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">
                      Unavailable
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Pay with cash when your order arrives
                </p>
              </div>
              <MapPin className="w-5 h-5 text-emerald-600" />
            </label>
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={loading || !deliveryAddress.trim()}
          className="w-full bg-emerald-600 text-white font-semibold py-4 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base font-inter"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Processing...
            </span>
          ) : (
            `Place Order - ₦${total.toLocaleString()}`
          )}
        </button>

        {!deliveryAddress.trim() && (
          <p className="text-center text-sm text-red-500 mt-3">
            Please enter delivery address to continue
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentComponent;
