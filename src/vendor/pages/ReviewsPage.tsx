import { useState, useEffect } from "react";
import { Star, ChevronLeft, ThumbsUp, MessageSquare, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { VendorNav } from "../component/VendorNav";
import { getVendorReviews } from "../../services/api";

interface Review {
  id: string;
  name: string;
  initials: string;
  date: string;
  rating: number;
  text: string;
  likes: number;
  replies: number;
}

const ReviewsPage = () => {
  const navigate = useNavigate();
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getVendorReviews();
        const raw: any[] = Array.isArray(res.data)
          ? res.data
          : (res.data?.reviews ?? []);
        setReviews(
          raw.map((r: any, i: number) => {
            const name =
              r.customer_name || r.user_name || r.name || "Anonymous";
            const initials = String(name)
              .split(" ")
              .filter(Boolean)
              .map((p: string) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return {
              id: String(r.id ?? i),
              name,
              initials: initials || "?",
              date: r.created_at
                ? new Date(r.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "",
              rating: Number(r.rating) || 0,
              text: r.comment || r.text || r.review || "",
              likes: Number(r.likes) || 0,
              replies: Number(r.replies_count ?? r.replies) || 0,
            };
          }),
        );
      } catch (e) {
        console.error("Failed to load reviews:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleLike = (id: string) => {
    setLikedReviews((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const totalReviews = reviews.length;
  const averageRating = totalReviews
    ? Math.round(
        (reviews.reduce((s, r) => s + r.rating, 0) / totalReviews) * 10,
      ) / 10
    : 0;

  const ratingData = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => Math.round(r.rating) === stars).length;
    return {
      stars,
      count,
      percentage: totalReviews ? (count / totalReviews) * 100 : 0,
    };
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <VendorNav />
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Reviews</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Rating Overview Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Reviews</h2>

          <div className="flex items-end gap-6 mb-6">
            <div className="flex-shrink-0">
              <div className="text-6xl font-semibold text-gray-900 mb-2">
                {averageRating || "—"}
              </div>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={24}
                    className={`${
                      star <= Math.floor(averageRating)
                        ? "fill-amber-400 text-amber-400"
                        : star - 0.5 <= averageRating
                        ? "fill-amber-400 text-amber-400 opacity-50"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500">({totalReviews} Reviews)</p>
            </div>

            <div className="flex-1 space-y-3">
              {ratingData.map((rating) => (
                <div
                  key={rating.stars}
                  className="flex items-center gap-3"
                >
                  <span className="text-sm text-gray-500 w-12">
                    {rating.stars} stars
                  </span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{
                        width: `${rating.percentage}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 w-10 text-right font-medium">
                    {rating.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
              <Star size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No reviews yet
              </h3>
              <p className="text-gray-500 text-sm">
                Customer reviews will show up here.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
              >
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {review.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {review.name}
                      </h3>
                      <span className="text-xs text-gray-400">{review.date}</span>
                    </div>
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={`${
                            star <= review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    {review.text && (
                      <p className="text-gray-700 text-sm leading-relaxed mb-4">
                        {review.text}
                      </p>
                    )}

                    <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => toggleLike(review.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                          likedReviews.has(review.id)
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <ThumbsUp
                          size={16}
                          className={
                            likedReviews.has(review.id) ? "fill-current" : ""
                          }
                        />
                        <span className="text-sm font-medium">
                          {review.likes + (likedReviews.has(review.id) ? 1 : 0)}
                        </span>
                      </button>

                      <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                        <MessageSquare size={16} />
                        <span className="text-sm font-medium">
                          Reply {review.replies > 0 ? `(${review.replies})` : ""}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;
