import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";

export const runtime = "nodejs";

/**
 * POST /api/reviews — Submit or update a review.
 * Server-side validated: checks auth, purchase history, and duplicate reviews.
 */
export async function POST(req: NextRequest) {
  // 1. Authenticate the user via Clerk
  const { userId } = await auth();

  if (!userId) {
    return Response.json(
      { success: false, error: "You must be signed in to submit a review." },
      { status: 401 },
    );
  }

  // 2. Parse the request body
  let body: {
    productId?: string;
    rating?: number;
    title?: string;
    content?: string;
    authorName?: string;
  };

  try {
    body = await req.json();
  } catch {
    return Response.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const { productId, rating, title, content, authorName } = body;

  // 3. Validate fields
  if (!productId || typeof productId !== "string") {
    return Response.json(
      { success: false, error: "Product ID is required." },
      { status: 400 },
    );
  }

  if (
    typeof rating !== "number" ||
    !Number.isFinite(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return Response.json(
      { success: false, error: "Rating must be between 1 and 5." },
      { status: 400 },
    );
  }

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return Response.json(
      { success: false, error: "Review title is required." },
      { status: 400 },
    );
  }

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return Response.json(
      { success: false, error: "Review content is required." },
      { status: 400 },
    );
  }

  if (title.trim().length > 200) {
    return Response.json(
      { success: false, error: "Title must be 200 characters or less." },
      { status: 400 },
    );
  }

  if (content.trim().length > 2000) {
    return Response.json(
      { success: false, error: "Review must be 2000 characters or less." },
      { status: 400 },
    );
  }

  // 4. Verify the user actually purchased this product (delivered orders only)
  const ordersQuery = query(
    collection(db, "orders"),
    where("userId", "==", userId),
    where("status", "==", "delivered"),
  );

  const ordersSnapshot = await getDocs(ordersQuery);

  const hasPurchased = ordersSnapshot.docs.some((orderDoc) => {
    const data = orderDoc.data();
    if (!Array.isArray(data.items)) return false;
    return data.items.some(
      (item: Record<string, unknown>) => item.productId === productId,
    );
  });

  if (!hasPurchased) {
    return Response.json(
      {
        success: false,
        error:
          "You can only review products you have purchased and received.",
      },
      { status: 403 },
    );
  }

  // 5. Check if the user already has a review for this product
  const reviewId = `${userId}_${productId}`;
  const reviewRef = doc(db, "reviews", reviewId);
  const existingReview = await getDoc(reviewRef);

  if (existingReview.exists()) {
    return Response.json(
      {
        success: false,
        error: "You have already reviewed this product.",
      },
      { status: 403 },
    );
  }

  // 6. Write the review
  const now = Timestamp.now();
  const reviewData: Record<string, unknown> = {
    productId,
    userId,
    authorName:
      typeof authorName === "string" && authorName.trim().length > 0
        ? authorName.trim()
        : "Anonymous",
    rating: Math.round(rating),
    title: title.trim(),
    content: content.trim(),
    verifiedPurchase: true,
    updatedAt: now,
  };

  reviewData.createdAt = now;

  await setDoc(reviewRef, reviewData, { merge: true });

  return Response.json({
    success: true,
    reviewId,
    message: "Your review has been submitted.",
  });
}

/**
 * GET /api/reviews?productId=xxx — Fetch all reviews for a product.
 * Also returns purchase eligibility for the current user.
 */
export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");

  if (!productId) {
    return Response.json(
      { success: false, error: "productId query parameter is required." },
      { status: 400 },
    );
  }

  // Fetch reviews for this product
  const reviewsQuery = query(
    collection(db, "reviews"),
    where("productId", "==", productId),
  );

  const reviewsSnapshot = await getDocs(reviewsQuery);

  const reviews = reviewsSnapshot.docs.map((reviewDoc) => {
    const data = reviewDoc.data();
    return {
      id: reviewDoc.id,
      productId: data.productId ?? "",
      userId: data.userId ?? "",
      authorName: data.authorName ?? "Anonymous",
      rating: data.rating ?? 5,
      title: data.title ?? "",
      content: data.content ?? "",
      verifiedPurchase: data.verifiedPurchase === true,
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() ?? null,
    };
  });

  // Sort newest first
  reviews.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  // Check if the current user can review
  let canReview = false;
  let hasExistingReview = false;
  let existingReview = null;

  const { userId } = await auth();

  if (userId) {
    // Check purchase history
    const ordersQuery = query(
      collection(db, "orders"),
      where("userId", "==", userId),
      where("status", "==", "delivered"),
    );

    const ordersSnapshot = await getDocs(ordersQuery);

    canReview = ordersSnapshot.docs.some((orderDoc) => {
      const data = orderDoc.data();
      if (!Array.isArray(data.items)) return false;
      return data.items.some(
        (item: Record<string, unknown>) => item.productId === productId,
      );
    });

    // Check existing review
    const reviewId = `${userId}_${productId}`;
    const existingReviewRef = doc(db, "reviews", reviewId);
    const existingReviewSnap = await getDoc(existingReviewRef);

    if (existingReviewSnap.exists()) {
      hasExistingReview = true;
      const data = existingReviewSnap.data();
      existingReview = {
        id: existingReviewSnap.id,
        rating: data.rating ?? 5,
        title: data.title ?? "",
        content: data.content ?? "",
      };
    }
  }

  return Response.json({
    success: true,
    reviews,
    reviewCount: reviews.length,
    averageRating:
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0,
    canReview,
    hasExistingReview,
    existingReview,
    isAuthenticated: !!userId,
  });
}
