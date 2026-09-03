import { useState } from "react";
import { Star, ChevronLeft, ThumbsUp, MessageSquare } from "lucide-react";
import { VendorNav } from "../component/VendorNav";

const ReviewsPage = () => {
  const [likedReviews, setLikedReviews] = useState<Set<number>>(new Set());

  const reviews = [
    {
      id: 1,
      name: "Alex K.",
      initials: "AK",
      date: "Jan 20, 2024",
      rating: 5,
      text: "I love the meal it was great, and yeah the delivery was fast",
      likes: 12,
      replies: 2,
    },
    {
      id: 2,
      name: "Alex K.",
      initials: "AK",
      date: "Jan 20, 2024",
      rating: 5,
      text: "I love the meal it was great, and yeah the delivery was fast",
      likes: 8,
      replies: 1,
    },
    {
      id: 3,
      name: "Sarah M.",
      initials: "SM",
      date: "Jan 19, 2024",
      rating: 4,
      text: "Great food quality and packaging. Delivery took a bit longer than expected but overall satisfied.",
      likes: 15,
      replies: 3,
    },
    {
      id: 4,
      name: "John D.",
      initials: "JD",
      date: "Jan 18, 2024",
      rating: 5,
      text: "Absolutely amazing! The flavors were incredible and portion sizes were perfect. Will definitely order again!",
      likes: 24,
      replies: 5,
    },
  ];

  const ratingData = [
    { stars: 5, count: 488, percentage: 84.6 },
    { stars: 4, count: 74, percentage: 12.8 },
    { stars: 3, count: 14, percentage: 2.4 },
    { stars: 2, count: 0, percentage: 0 },
    { stars: 1, count: 0, percentage: 0 },
  ];

  const toggleLike = (id: number) => {
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

  const totalReviews = 578;
  const averageRating = 4.7;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <VendorNav />
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
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
                {averageRating}
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
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    {review.text}
                  </p>

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
                      <span className="text-sm font-medium">Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="mt-8 text-center">
          <button className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors">
            Load More Reviews
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
