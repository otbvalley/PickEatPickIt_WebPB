/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Search,
  Minus,
  Plus,
  Clock,
  ShoppingBag,
  ArrowRight,
  Star,
  Flame,
  UtensilsCrossed,
  Heart,
  X,
  MapPin,
  Phone,
  Loader2,
} from "lucide-react";
import { Navbar } from "../../component/Navbar";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  backendAuthService,
  type Vendor,
} from "../../services/backendAuthService";
import { getVendorPublicReviews } from "../../services/api";
import { useToast } from "../../context/ToastContext";

type Screen = "kitchen" | "confirm";

interface MenuItem {
  id: number;
  name: string;
  businessName: string;
  price: number;
  discount: number;
  image_url: string;
  description: string;
  quantity: number;
  vendor_id?: string;
  category?: string; // ← add this
}
interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  vendor_id?: string; // Vendor ID for payment processing
}

export default function Market() {
  const [screen, setScreen] = useState<Screen>("kitchen");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [spiceLevel, setSpiceLevel] = useState(30);
  const [scheduleOrder, setScheduleOrder] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [searchParams, setSearchParams] = useSearchParams();
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);
  const [detailVendor, setDetailVendor] = useState<Vendor | null>(null);
  const [detailVendorLoading, setDetailVendorLoading] = useState(false);
  const [detailVendorReviews, setDetailVendorReviews] = useState<{
    count: number;
    average: number;
  } | null>(null);
  // Add these new states
  const firstItem = items.find((item) => item.quantity > 0);
  const [vendorInfo, setVendorInfo] = useState<{
    businessName: string;
    image_url: string;
  } | null>(null);

  const navigate = useNavigate();
  const toast = useToast();
  const fetchVendorDetails = async (menuItemId: string | number) => {
    try {
      // Get menu items and find the vendor
      const menuItems = await backendAuthService.getMenuItems(100);
      const menuItem = menuItems.find(
        (item: { id: string | number }) =>
          String(item.id) === String(menuItemId),
      );

      if (!menuItem) {
        console.error("Menu item not found");
        return;
      }

      // Get vendors and find the one matching the vendor_id
      const vendorArr = await backendAuthService.getVendorByID(
        menuItem.vendor_id || "",
      );
      const vendor = Array.isArray(vendorArr) ? vendorArr[0] : vendorArr;

      if (vendor) {
        setVendorInfo({
          businessName: (vendor as any).business_name || "Unknown Vendor",
          image_url:
            (vendor as any).logo_url ||
            "https://images.unsplash.com/photo-1555939594-58d7cb561404?w=400",
        });
      }
    } catch (error) {
      console.error("Error fetching vendor details:", error);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [screen]);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        // Get menu items with a reasonable limit
        console.log("Fetching menu items from Market...");
        const data = await backendAuthService.getMenuItems(100);
        console.log("Menu items received:", data);
        console.log(
          "First item image_url:",
          data[0]?.image_url,
          "Name:",
          data[0]?.name,
        );

        if (!data || data.length === 0) {
          console.warn("No menu items returned from API.");
        }

        const formattedItems = data.map((item: any) => ({
          ...item,
          quantity: 0,
          businessName: item.vendor_name || "Unknown Vendor",
          image_url:
            item.image_url ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
          discount: item.discount || 15,
        }));
        setItems(formattedItems);
      } catch (error) {
        console.error("Failed to load menu items:", error);
      }
    };
    loadMenu();
  }, []);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const favs = await backendAuthService.getMealFavorites();
        setFavoriteIds(
          new Set((favs || []).map((f) => String(f.menu_item_id))),
        );
      } catch (error) {
        console.error("Failed to load meal favorites:", error);
      }
    };
    loadFavorites();
  }, []);

  const toggleMealFavorite = async (itemId: number) => {
    const key = String(itemId);
    const wasFavorited = favoriteIds.has(key);

    // Optimistic update
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (wasFavorited) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });

    try {
      if (wasFavorited) {
        await backendAuthService.removeMealFavorite(key);
      } else {
        await backendAuthService.addMealFavorite(key);
      }
    } catch (error) {
      console.error("Failed to update meal favorite:", error);
      // Revert on error
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasFavorited) {
          next.add(key);
        } else {
          next.delete(key);
        }
        return next;
      });
      toast.error("Could not update favorite. Please try again.", "Error");
    }
  };
  // const formattedItems = data.map((item: any) => ({
  //   ...item,
  //   quantity: 0,
  //   businessName: item.vendor_profiles?.business_name || "Unknown Vendor",
  //   // keep original name for menu item
  //   image_url: item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
  //   discount: item.discount || 15
  // }))
  //  useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       setLoading(true);
  //       const { data: { session } } = await supabase.auth.getSession();

  //       if (session?.user) {
  //         const firstName = session.user.user_metadata?.email || "User";
  //         setUserProfile({
  //           name: firstName,
  //           initial: firstName.charAt(0).toUpperCase()
  //         });

  //         const { data: favs } = await supabase
  //           .from("user_favorites")
  //           .select("vendor_id")
  //           .eq("user_id", session.user.id);

  //         if (favs) {
  //           const likedMap: LikedState = {};
  //           favs.forEach(f => { likedMap[f.vendor_id] = true; });
  //           setLiked(likedMap);
  //         }
  //       }

  //       const { data: menuData } = await supabase.from("menu_items").select("*").limit(10);
  //       if (menuData) setFoods(menuData);

  //       const { data: profileData } = await supabase.from("vendor_profiles").select("*").limit(8);
  //       if (profileData) setVendors(profileData);

  //       const { data: offerData } = await supabase
  //         .from("menu_items")
  //         .select("*, vendor_profiles(business_name)")
  //         .gt("discount", 0)
  //         .limit(5);
  //       if (offerData) setOffers(offerData);

  //     } catch (error) {
  //       console.error("Dashboard error:", error);
  //     } finally {
  //       setTimeout(() => setLoading(false), 800);
  //     }
  //   };

  //   fetchData();
  // }, []);

  const handleOrderNow = (item: MenuItem) => {
    if (item.quantity === 0) return;

    const checkoutItems = [
      {
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image_url: item.image_url,
        vendor_id: item.vendor_id, // Include vendor ID for payment processing
      },
    ];

    sessionStorage.setItem("checkoutItems", JSON.stringify(checkoutItems));
    navigate(`/payment?vendor_id=${item.vendor_id}`);
  };

  const addToCart = (item: MenuItem) => {
    if (item.quantity === 0) {
      toast.warning("Please select quantity first", "Quantity Required");
      return;
    }

    const existingCart = sessionStorage.getItem("cart");
    const cart = existingCart ? JSON.parse(existingCart) : [];

    const cartItem = {
      id: item.id,
      name: item.name,
      restaurant: "Mardiya Kitchen",
      items: item.description,
      date: new Date().toLocaleString(),
      price: item.price * (1 - item.discount / 100),
      quantity: item.quantity,
      selected: true,
      image_url: item.image_url,
    };

    const existingItemIndex = cart.findIndex((i: any) => i.id === item.id);
    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += item.quantity;
    } else {
      cart.push(cartItem);
    }

    sessionStorage.setItem("cart", JSON.stringify(cart));
    toast.success("Item added to cart!", "Cart Updated");
  };

  const openItemDetail = (item: MenuItem) => {
    setDetailItem(item);
    setDetailVendor(null);
    setDetailVendorReviews(null);
    setSearchParams({ item: String(item.id) }, { replace: true });

    if (item.vendor_id) {
      setDetailVendorLoading(true);
      backendAuthService
        .getVendorByID(item.vendor_id)
        .then((vendor) => {
          const resolved = Array.isArray(vendor) ? vendor[0] : vendor;
          setDetailVendor(resolved || null);
        })
        .catch((error) => {
          console.error("Failed to load vendor details:", error);
        })
        .finally(() => setDetailVendorLoading(false));

      getVendorPublicReviews(item.vendor_id)
        .then((res) => {
          const raw: any[] = Array.isArray(res.data)
            ? res.data
            : (res.data?.reviews ?? []);
          const count = res.data?.total ?? raw.length;
          const average =
            res.data?.average_rating ??
            (raw.length
              ? raw.reduce((s: number, r: any) => s + (Number(r.rating) || 0), 0) /
                raw.length
              : 0);
          if (count > 0) {
            setDetailVendorReviews({
              count: Number(count),
              average: Math.round(Number(average) * 10) / 10,
            });
          }
        })
        .catch((error) => {
          console.error("Failed to load vendor reviews:", error);
        });
    }
  };

  const closeItemDetail = () => {
    setDetailItem(null);
    setDetailVendor(null);
    setDetailVendorReviews(null);
    searchParams.delete("item");
    setSearchParams(searchParams, { replace: true });
  };

  // Open the detail view automatically when arriving via a "View Details" deep link
  useEffect(() => {
    if (items.length === 0) return;
    const itemId = searchParams.get("item");
    if (!itemId) return;
    const match = items.find((i) => String(i.id) === itemId);
    if (match && (!detailItem || String(detailItem.id) !== itemId)) {
      openItemDetail(match);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const handleConfirmOrder = async () => {
    const cart = getCart();
    if (cart.length === 0) {
      toast.warning("Please add items to cart first", "Cart Empty");
      return;
    }

    const dateInput = document.querySelector(
      'input[type="date"]',
    ) as HTMLInputElement;
    const timeInput = document.querySelector(
      'input[type="time"]',
    ) as HTMLInputElement;
    const instructionsTextarea = document.querySelector(
      "textarea",
    ) as HTMLTextAreaElement;

    sessionStorage.setItem(
      "pendingOrder",
      JSON.stringify({
        items: cart,
        spiceLevel,
        scheduleOrder,
        scheduledDate: scheduleOrder ? dateInput?.value : null,
        scheduledTime: scheduleOrder ? timeInput?.value : null,
        specialInstructions: instructionsTextarea?.value || "",
      }),
    );

    // Get vendor_id from first item (assuming all items are from same vendor)
    const vendorId = cart.length > 0 ? cart[0].vendor_id : null;
    navigate(vendorId ? `/payment?vendor_id=${vendorId}` : "/payment");
  };

  const getCart = (): OrderItem[] =>
    items
      .filter((item) => item.quantity > 0)
      .map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price * (1 - item.discount / 100) * item.quantity,
        vendor_id: item.vendor_id, // Include vendor ID for payment processing
      }));

  const updateQuantity = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item,
      ),
    );
  };

  const KitchenView = () => {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const categories = [
      "All",
      "Desert",
      "Breakfast",
      "Add ons",
      "Rice",
      "Meat",
      "Drinks",
      "Snacks",
      "Vegan",
    ];

    const filteredItems = items.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    return (
      <div className="min-h-screen w-full bg-white transition-colors duration-300 pb-20">
        <div className="sticky top-0 bg-white/80 backdrop-blur-xl z-40 border-b border-gray-100">
          <Navbar />
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="flex-1 w-full relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Search for available items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all"
                />
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 w-full md:w-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                      selectedCategory === cat
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-50 border border-gray-100 text-gray-500 hover:text-emerald-600"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-[300px] rounded-2xl overflow-hidden mb-16 group border border-gray-100 shadow-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
            <img
              src={
                items[0]?.image_url ||
                "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80"
              }
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              alt="Hero"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                // Fallback if image fails to load
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80";
              }}
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-12">
              <div className="flex items-center gap-2 text-emerald-400 font-medium text-xs mb-4">
                <span>Trending Now</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-semibold text-white leading-tight mb-4">
                {/* Mardiya <span className="text-emerald-400">Kitchen</span> */}
                {items[0]?.businessName || "Mardiya"}{" "}
                <span className="text-emerald-400">Kitchen</span>
              </h2>
              <p className="text-white/70 max-w-md text-base mb-8">
                Experience the finest culinary treasures delivered with
                cinematic speed.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {filteredItems.map((item) => {
              const discountedPrice = (
                item.price *
                (1 - item.discount / 100)
              ).toFixed(2);
              return (
                <motion.div
                  key={item.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all group relative"
                >
                  <div
                    className="relative h-64 overflow-hidden cursor-pointer"
                    onClick={() => openItemDetail(item)}
                  >
                    <div className="absolute top-4 left-4 z-20 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {item.discount}% OFF
                    </div>
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                      <div className="bg-black/40 backdrop-blur-md text-white p-2 rounded-xl border border-white/20">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMealFavorite(item.id);
                        }}
                        className="bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/20 hover:bg-black/60 transition-all"
                        aria-label="Toggle favorite"
                      >
                        <Heart
                          className={`w-4 h-4 transition-all ${
                            favoriteIds.has(String(item.id))
                              ? "fill-red-500 text-red-500"
                              : "text-white"
                          }`}
                        />
                      </button>
                    </div>
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  <div className="p-6">
                    <div
                      className="cursor-pointer"
                      onClick={() => openItemDetail(item)}
                    >
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-emerald-600 font-semibold text-xl">
                          ₦{discountedPrice}
                        </span>
                        <span className="text-gray-400 text-sm line-through">
                          ₦{item.price.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2 border border-gray-100">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-gray-100 transition-colors hover:bg-gray-50"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="text-base font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-gray-100 transition-colors hover:bg-gray-50"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => addToCart(item)}
                          className="flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition-all border border-gray-100"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Cart
                        </button>
                        <button
                          onClick={() => handleOrderNow(item)}
                          className="flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-all"
                        >
                          Order
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        <AnimatePresence>
          {getCart().length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl px-8 py-5 bg-gray-900 rounded-2xl shadow-md flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white text-base font-semibold">
                    {getCart().reduce((sum, i) => sum + i.quantity, 0)} Items
                  </p>
                  <p className="text-emerald-400 text-xs">
                    Total: ₦
                    {getCart()
                      .reduce((sum, i) => sum + i.price, 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  const cart = getCart();
                  if (cart.length > 0) {
                    // Fetch vendor details for the first item in cart
                    await fetchVendorDetails(cart[0].id);
                    setScreen("confirm");
                  }
                }}
                className="px-8 py-3 bg-white text-gray-900 text-sm font-semibold rounded-xl flex items-center gap-2 hover:bg-gray-100 transition-colors"
              >
                Checkout <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const ConfirmView = () => (
    <div className="min-h-screen w-full bg-white transition-colors duration-300 pb-20 font-inter">
      <div className="sticky top-0 bg-white/80 backdrop-blur-xl z-50 border-b border-gray-100 px-6 py-6 flex items-center justify-between">
        <button
          onClick={() => setScreen("kitchen")}
          className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">
          Confirm Order
        </h1>
        <div className="w-12" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto px-6 py-12"
      >
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-50 rounded-bl-full pointer-events-none" />
          <div className="flex gap-8">
            <div className="w-28 h-28 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
              <img
                src={
                  vendorInfo?.image_url ||
                  items[0]?.image_url ||
                  "https://images.unsplash.com/photo-1555939594-58d7cb561404?w=400"
                }
                className="w-full h-full object-cover"
                alt="Kitchen"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
                <span className="text-xs text-gray-400">
                  Premium Kitchen
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {firstItem?.businessName || "Mardiya Kitchen"}
              </h2>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                  <Clock className="w-4 h-4" /> 15 Mins
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-gray-900">
                Spice Level
              </h3>
              <Flame
                className={spiceLevel > 66 ? "text-red-500" : "text-amber-500"}
              />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={spiceLevel}
              onChange={(e) => setSpiceLevel(Number(e.target.value))}
              className="w-full h-2 bg-gray-100 rounded-full appearance-none accent-emerald-600"
            />
          </div>

          <div className="space-y-3">
            {getCart().map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 flex justify-between items-center border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center font-semibold text-emerald-600">
                    {item.quantity}x
                  </span>
                  <span className="font-medium text-gray-900 text-base">
                    {item.name}
                  </span>
                </div>
                <span className="font-semibold text-emerald-600 text-lg">
                  ₦{item.price.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-semibold text-gray-900">
                Scheduling
              </h3>
              <button
                onClick={() => setScheduleOrder(!scheduleOrder)}
                className={`w-14 h-7 rounded-full transition-all relative ${scheduleOrder ? "bg-emerald-600" : "bg-gray-300"}`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all ${scheduleOrder ? "translate-x-7" : ""}`}
                />
              </button>
            </div>

            {scheduleOrder && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-gray-50 p-3 rounded-xl outline-none text-sm border border-gray-100 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">
                    Time
                  </label>
                  <input
                    type="time"
                    className="w-full bg-gray-50 p-3 rounded-xl outline-none text-sm border border-gray-100 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                  />
                </div>
              </div>
            )}
          </div>

          <textarea
            placeholder="Special instructions (allergies, door codes...)"
            className="w-full bg-white rounded-2xl p-6 text-sm h-40 resize-none outline-none focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600 border border-gray-100 shadow-sm"
          />
        </div>

        <button
          onClick={handleConfirmOrder}
          className="w-full mt-10 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 text-base transition-colors"
        >
          Secure Checkout <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white transition-colors duration-300">
      <AnimatePresence mode="wait">
        {screen === "kitchen" ? (
          <motion.div
            key="kitchen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <KitchenView />
          </motion.div>
        ) : (
          <motion.div
            key="confirm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ConfirmView />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detailItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6"
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={closeItemDetail}
            />
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl border border-gray-100 shadow-sm"
            >
              <button
                onClick={closeItemDetail}
                className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-md p-2 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>

              <div className="relative h-64 overflow-hidden rounded-t-2xl">
                <img
                  src={detailItem.image_url}
                  alt={detailItem.name}
                  className="w-full h-full object-cover"
                />
                {detailItem.discount > 0 && (
                  <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {detailItem.discount}% OFF
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {detailItem.name}
                  </h2>
                  <button
                    onClick={() => toggleMealFavorite(detailItem.id)}
                    className="flex-shrink-0 p-2 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                    aria-label="Toggle favorite"
                  >
                    <Heart
                      className={`w-4 h-4 transition-all ${
                        favoriteIds.has(String(detailItem.id))
                          ? "fill-red-500 text-red-500"
                          : "text-gray-400"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <span className="text-emerald-600 font-semibold text-xl">
                    ₦
                    {(
                      detailItem.price *
                      (1 - detailItem.discount / 100)
                    ).toFixed(2)}
                  </span>
                  {detailItem.discount > 0 && (
                    <span className="text-gray-400 text-sm line-through">
                      ₦{detailItem.price.toLocaleString()}
                    </span>
                  )}
                </div>

                {detailItem.description && (
                  <p className="text-sm text-gray-500 leading-relaxed mb-6">
                    {detailItem.description}
                  </p>
                )}

                {/* Vendor info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                  {detailVendorLoading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading kitchen details...
                    </div>
                  ) : detailVendor ? (
                    <div className="flex gap-4">
                      {detailVendor.logo_url && (
                        <img
                          src={detailVendor.logo_url}
                          alt={detailVendor.business_name || "Vendor"}
                          className="w-14 h-14 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {detailVendor.business_name ||
                              detailItem.businessName}
                          </p>
                          <span
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                              detailVendor.is_open
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {detailVendor.is_open ? "Open" : "Closed"}
                          </span>
                        </div>
                        {detailVendor.business_description && (
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                            {detailVendor.business_description}
                          </p>
                        )}
                        {detailVendor.business_address && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            {detailVendor.business_address}
                          </p>
                        )}
                        {detailVendor.business_phone && (
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Phone className="w-3 h-3 flex-shrink-0" />
                            {detailVendor.business_phone}
                          </p>
                        )}
                        {detailVendorReviews && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                            {detailVendorReviews.average} · {detailVendorReviews.count}{" "}
                            review{detailVendorReviews.count === 1 ? "" : "s"}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {detailItem.businessName || "Unknown Vendor"}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2 border border-gray-100 mb-4">
                  <button
                    onClick={() => updateQuantity(detailItem.id, -1)}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-gray-100 transition-colors hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="text-base font-semibold text-gray-900">
                    {items.find((i) => i.id === detailItem.id)?.quantity ??
                      detailItem.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(detailItem.id, 1)}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-gray-100 transition-colors hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      const current = items.find(
                        (i) => i.id === detailItem.id,
                      );
                      if (current) addToCart(current);
                    }}
                    className="flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition-all border border-gray-100"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Cart
                  </button>
                  <button
                    onClick={() => {
                      const current = items.find(
                        (i) => i.id === detailItem.id,
                      );
                      if (current) handleOrderNow(current);
                    }}
                    className="flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-all"
                  >
                    Order
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
