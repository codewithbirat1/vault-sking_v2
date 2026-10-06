"use client";

import React, { useState, useEffect, useCallback } from "react";
import { StarIcon, BadgeCheck, Loader2 } from "lucide-react";
import { useUser, SignInButton } from "@clerk/nextjs";
import toast from "react-hot-toast";

interface SerializedReview {
  id: string;
  productId: string;
  userId: string;
  authorName: string;
  rating: number;
  title: string;
  content: string;
  verifiedPurchase: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

interface ReviewsApiResponse {
  success: boolean;
  reviews: SerializedReview[];
  reviewCount: number;
  averageRating: number;
  canReview: boolean;
  hasExistingReview: boolean;
  existingReview: {
    id: string;
    rating: number;
    title: string;
    content: string;
  } | null;
  isAuthenticated: boolean;
}

interface ProductReviewsProps {
  productId: string;
}

function StarRating({
  rating,
  onRate,
  interactive = false,
  size = "w-4 h-4",
}: {
  rating: number;
  onRate?: (rating: number) => void;
  interactive?: boolean;
  size?: string;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"} p-0 border-0 bg-transparent`}
        >
          <StarIcon
            className={`${size} ${
              star <= (hovered || rating)
                ? "text-yellow-500 fill-current"
                : "text-gray-300 fill-current"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { user, isSignedIn, isLoaded } = useUser();
  const [reviews, setReviews] = useState<SerializedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasExistingReview, setHasExistingReview] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  // Form state
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");

  const applyReviews = useCallback((data: ReviewsApiResponse) => {
    setReviews(data.reviews);
    setCanReview(data.canReview);
    setHasExistingReview(data.hasExistingReview);
    setIsAuthenticated(data.isAuthenticated);
    setAverageRating(data.averageRating);
    setReviewCount(data.reviewCount);
  }, []);

  const fetchReviews = useCallback(async (): Promise<ReviewsApiResponse | null> => {
    try {
      const res = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`);
      const data: ReviewsApiResponse = await res.json();
      return data.success ? data : null;
    } catch {
      return null;
    }
  }, [productId]);

  useEffect(() => {
    if (!productId) return;

    let cancelled = false;
    void fetchReviews().then((data) => {
      if (cancelled) return;
      if (data) applyReviews(data);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [productId, fetchReviews, applyReviews, isLoaded, isSignedIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim() || !formContent.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating: formRating,
          title: formTitle.trim(),
          content: formContent.trim(),
          authorName: user?.firstName
            ? `${user.firstName} ${user.lastName?.[0] ?? ""}`.trim()
            : "Customer",
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        setShowForm(false);
        // Refresh reviews
        const updatedReviews = await fetchReviews();
        if (updatedReviews) applyReviews(updatedReviews);
      } else {
        toast.error(data.error || "Failed to submit review.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Rating distribution
  const ratingCounts = [0, 0, 0, 0, 0]; // index 0 = 1 star, etc.
  for (const review of reviews) {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingCounts[review.rating - 1]++;
    }
  }

  return (
    <div className="py-6">
      {/* Summary Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-12 p-8 bg-gray-50 rounded-2xl">
        <div className="text-center md:text-left">
          <p className="text-5xl font-bold text-gray-900 mb-2">
            {reviewCount > 0 ? averageRating.toFixed(1) : "—"}
          </p>
          <div className="flex items-center gap-1 text-yellow-500 mb-2 justify-center md:justify-start">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`w-5 h-5 ${
                  i < Math.round(averageRating)
                    ? "fill-current"
                    : "fill-current text-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500">
            {reviewCount > 0
              ? `Based on ${reviewCount} review${reviewCount !== 1 ? "s" : ""}`
              : "No reviews yet"}
          </p>
        </div>

        <div className="flex-1 w-full space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingCounts[rating - 1];
            const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
            return (
              <div key={rating} className="flex items-center gap-3 text-sm">
                <span className="w-4">{rating}</span>
                <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-gray-400 text-xs">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Action Area */}
      <div className="mb-8">
        {loading ? null : !isAuthenticated ? (
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-sm text-gray-600 flex-1">
              Sign in to leave a review if you&apos;ve purchased this product.
            </p>
            <SignInButton mode="modal">
              <button
                type="button"
                className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
              >
                Sign in
              </button>
            </SignInButton>
          </div>
        ) : canReview ? (
          hasExistingReview ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
              <p className="text-sm text-green-800">
                You have already reviewed this product. Thank you for your feedback!
              </p>
            </div>
          ) : !showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
            >
              <StarIcon className="w-4 h-4" />
              Write a review
            </button>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-5"
            >
              <h3 className="text-lg font-bold text-gray-900">
                Write a review
              </h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rating
                </label>
                <StarRating
                  rating={formRating}
                  onRate={setFormRating}
                  interactive
                  size="w-6 h-6"
                />
              </div>

              <div>
                <label
                  htmlFor="review-title"
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  Title
                </label>
                <input
                  id="review-title"
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Summarize your experience"
                  maxLength={200}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="review-content"
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  Review
                </label>
                <textarea
                  id="review-content"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Share your experience with this product..."
                  maxLength={2000}
                  rows={4}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {submitting && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Submit review
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )
        ) : (
          <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-sm text-amber-800">
              You can review this product after purchasing it.
            </p>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}

      {/* Review List */}
      {!loading && reviews.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm">
            No reviews yet. Be the first to share your experience!
          </p>
        </div>
      )}

      {!loading && reviews.length > 0 && (
        <div className="space-y-8">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-gray-100 pb-8 last:border-0"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900">
                      {review.authorName}
                    </h4>
                    {review.verifiedPurchase && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-green-700 bg-green-50 rounded-full border border-green-200">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <StarRating rating={review.rating} />
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(review.createdAt)}
                </span>
              </div>
              <h5 className="font-semibold text-gray-800 mb-2">
                {review.title}
              </h5>
              <p className="text-gray-600 leading-relaxed">{review.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
}
