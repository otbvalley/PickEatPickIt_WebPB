import { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  MapPin,
  Heart,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  backendAuthService,
  type MenuItem,
} from "../../services/backendAuthService";
import { useToast } from "../../context/ToastContext";

const BACKEND_BASE_URL = "https://pickeatpickitbe.onrender.com";

const FOOD_FALLBACKS = [
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop",
];

const isValidUrl = (url: string) => {
  if (!url) return false;
  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  );
};

const constructImageUrl = (url: string, fallbackIndex: number = 0): string => {
  if (!url) return FOOD_FALLBACKS[fallbackIndex % FOOD_FALLBACKS.length];
  if (isValidUrl(url)) return url;
  // If it's a relative path, construct the full URL
  if (url.startsWith("/")) {
    return `${BACKEND_BASE_URL}${url}`;
  }
  // Otherwise, assume it's missing the leading slash
  return `${BACKEND_BASE_URL}/${url}`;
};

export default function FoodScrollCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [foods, setFoods] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const toast = useToast();

  useEffect(() => {
    const fetchSpecials = async () => {
      try {
        setLoading(true);
        // Fetch menu items with a discount — these are the "specials"
        const data = await backendAuthService.getOffers(10);
        setFoods(data);
      } catch (err) {
        console.error("Error fetching specials:", err);
      } finally {
        setLoading(false);
        setTimeout(handleScroll, 100);
      }
    };

    fetchSpecials();
  }, []);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const favs = await backendAuthService.getMealFavorites();
        setFavoriteIds(
          new Set((favs || []).map((f) => String(f.menu_item_id))),
        );
      } catch (err) {
        console.error("Failed to load meal favorites:", err);
      }
    };
    loadFavorites();
  }, []);

  const toggleFavorite = async (
    e: React.MouseEvent,
    menuItemId: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const wasFavorited = favoriteIds.has(menuItemId);

    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (wasFavorited) {
        next.delete(menuItemId);
      } else {
        next.add(menuItemId);
      }
      return next;
    });

    try {
      if (wasFavorited) {
        await backendAuthService.removeMealFavorite(menuItemId);
      } else {
        await backendAuthService.addMealFavorite(menuItemId);
      }
    } catch (err) {
      console.error("Failed to update meal favorite:", err);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasFavorited) {
          next.add(menuItemId);
        } else {
          next.delete(menuItemId);
        }
        return next;
      });
      toast.error("Could not update favorite. Please try again.", "Error");
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -320 : 320,
        behavior: "smooth",
      });
    }
  };

  const getDiscountedPrice = (price: number, discount: number) =>
    (price * (1 - (discount || 0) / 100)).toFixed(2);

  if (loading)
    return (
      <div className="p-10 text-center font-medium text-gray-400">
        Loading Chef's Specials...
      </div>
    );

  if (foods.length === 0) return null;

  return (
    <div className="w-full bg-gray-50 py-12 px-4 md:px-8">
      <div className="w-full mx-auto">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1.5">
            Chef's Specials
          </h2>
          <p className="text-gray-500 text-sm">
            Curated dishes from top-rated kitchens
          </p>
        </div>

        <div className="relative group">
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-100 rounded-full p-3 shadow-sm hover:shadow-md transition-all hidden md:flex items-center justify-center"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
          )}
          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-100 rounded-full p-3 shadow-sm hover:shadow-md transition-all hidden md:flex items-center justify-center"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>
          )}

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto scroll-smooth pb-4 md:px-12 px-2 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {foods.map((item) => (
              <div
                key={item.id}
                className="flex-shrink-0 w-80 group cursor-pointer"
              >
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                  <div className="relative overflow-hidden h-48 bg-gray-100 flex items-center justify-center">
                    <img
                      src={constructImageUrl(
                        item.image_url,
                        Math.random() * FOOD_FALLBACKS.length,
                      )}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        console.error("Failed to load image:", item.image_url);
                        e.currentTarget.src =
                          FOOD_FALLBACKS[
                            Math.floor(Math.random() * FOOD_FALLBACKS.length)
                          ];
                      }}
                    />

                    {item.discount > 0 && (
                      <div className="absolute top-4 right-14 bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-medium text-xs">
                        {item.discount}% OFF
                      </div>
                    )}

                    <button
                      onClick={(e) => toggleFavorite(e, String(item.id))}
                      className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm hover:bg-white transition-all"
                      aria-label="Toggle favorite"
                    >
                      <Heart
                        className={`w-4 h-4 transition-all ${
                          favoriteIds.has(String(item.id))
                            ? "fill-red-500 text-red-500"
                            : "text-gray-400 hover:text-red-500"
                        }`}
                      />
                    </button>

                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shadow-sm">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium text-sm text-gray-900">
                        4.9
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-semibold text-emerald-600">
                          ₦{getDiscountedPrice(item.price, item.discount)}
                        </span>
                        {item.discount > 0 && (
                          <span className="text-sm text-gray-400 line-through">
                            ₦{item.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-semibold overflow-hidden border-2 border-white shadow-sm">
                          {item.vendor_name?.charAt(0) ?? "V"}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">
                            {item.vendor_name ?? "Professional Chef"}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            Nearby
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <span>25-30 min</span>
                      </div>
                    </div>

                    <Link to={`/market?item=${item.id}`} className="w-full">
                      <button className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition-colors">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Link to="/market">
            <button className="bg-emerald-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-emerald-700 transition-colors text-sm">
              View All Dishes
            </button>
          </Link>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
