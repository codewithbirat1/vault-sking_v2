"use client";

import React, { useState, useEffect } from "react";
import { StarIcon, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ReviewModalProps {
  productId: string;
  productTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function StarRating({
  rating,
  onRate,
}: {
  rating: number;
  onRate: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          onClick={() => onRate(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="cursor-pointer hover:scale-110 transition-transform p-0 border-0 bg-transparent"
        >
          <StarIcon
            className={`w-8 h-8 ${
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

export default function ReviewModal({
  productId,
  productTitle,
  isOpen,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasExistingReview, setHasExistingReview] = useState(false);

  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");

  const handleClose = () => {
    setFormRating(5);
    setFormTitle("");
    setFormContent("");
    setHasExistingReview(false);
    onClose();
  };

  useEffect(() => {
    if (isOpen && productId) {
      // Fetch existing review if any
      const fetchExisting = async () => {
        try {
          setLoading(true);
          const res = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`);
          const data = await res.json();
          if (data.success && data.hasExistingReview && data.existingReview) {
            setHasExistingReview(true);
            setFormRating(data.existingReview.rating);
            setFormTitle(data.existingReview.title);
            setFormContent(data.existingReview.content);
          }
        } catch {
          // ignore
        } finally {
          setLoading(false);
        }
      };
      fetchExisting();
    }
  }, [isOpen, productId]);

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
        onSuccess?.();
        handleClose();
      } else {
        toast.error(data.error || "Failed to submit review.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>
            {hasExistingReview ? "Edit your review" : "Write a review"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            For {productTitle}
          </p>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rating
              </label>
              <StarRating rating={formRating} onRate={setFormRating} />
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
                className="w-full px-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
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
                className="w-full px-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {hasExistingReview ? "Update review" : "Submit review"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
