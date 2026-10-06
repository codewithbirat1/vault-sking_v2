"use client";

import {
  type DocumentData,
  Timestamp,
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  setDoc,
  getDoc,
} from "firebase/firestore";

import { db } from "@/config/firebase.config";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  authorName: string;
  rating: number;
  title: string;
  content: string;
  verifiedPurchase: boolean;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const stringValue = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;

const numberValue = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const timestampValue = (value: unknown): Timestamp | null =>
  value instanceof Timestamp ? value : null;

const toReview = (id: string, data: DocumentData): Review => {
  return {
    id,
    productId: stringValue(data.productId),
    userId: stringValue(data.userId),
    authorName: stringValue(data.authorName, "Anonymous"),
    rating: Math.min(5, Math.max(1, numberValue(data.rating) || 5)),
    title: stringValue(data.title),
    content: stringValue(data.content),
    verifiedPurchase: data.verifiedPurchase === true,
    createdAt: timestampValue(data.createdAt),
    updatedAt: timestampValue(data.updatedAt),
  };
};

/**
 * Fetch all reviews for a product, sorted newest first.
 */
export const getProductReviews = async (
  productId: string,
): Promise<Review[]> => {
  if (!productId) return [];

  const reviewsQuery = query(
    collection(db, "reviews"),
    where("productId", "==", productId),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(reviewsQuery);

  return snapshot.docs.map((reviewDoc) =>
    toReview(reviewDoc.id, reviewDoc.data()),
  );
};

/**
 * Check if the user has already reviewed this product.
 */
export const getUserReviewForProduct = async (
  userId: string,
  productId: string,
): Promise<Review | null> => {
  if (!userId || !productId) return null;

  const reviewId = `${userId}_${productId}`;
  const reviewRef = doc(db, "reviews", reviewId);
  const snapshot = await getDoc(reviewRef);

  if (!snapshot.exists()) return null;

  return toReview(snapshot.id, snapshot.data());
};

/**
 * Check if the user has purchased the product (has a delivered order containing it).
 */
export const hasUserPurchasedProduct = async (
  userId: string,
  productId: string,
): Promise<boolean> => {
  if (!userId || !productId) return false;

  const ordersQuery = query(
    collection(db, "orders"),
    where("userId", "==", userId),
    where("status", "==", "delivered"),
  );

  const snapshot = await getDocs(ordersQuery);

  return snapshot.docs.some((orderDoc) => {
    const data = orderDoc.data();
    if (!Array.isArray(data.items)) return false;
    return data.items.some(
      (item: unknown) => isRecord(item) && item.productId === productId,
    );
  });
};

/**
 * Write a review directly to Firestore (client-side, used by the API route fallback or direct writes).
 * The document ID is `${userId}_${productId}` to enforce one review per user per product.
 */
export const writeReview = async (params: {
  userId: string;
  productId: string;
  authorName: string;
  rating: number;
  title: string;
  content: string;
  verifiedPurchase: boolean;
  isUpdate: boolean;
}): Promise<Review> => {
  const reviewId = `${params.userId}_${params.productId}`;
  const reviewRef = doc(db, "reviews", reviewId);

  const now = Timestamp.now();
  const reviewData = {
    productId: params.productId,
    userId: params.userId,
    authorName: params.authorName,
    rating: Math.min(5, Math.max(1, params.rating)),
    title: params.title.trim(),
    content: params.content.trim(),
    verifiedPurchase: params.verifiedPurchase,
    updatedAt: now,
    ...(params.isUpdate ? {} : { createdAt: now }),
  };

  await setDoc(reviewRef, reviewData, { merge: true });

  return {
    id: reviewId,
    ...reviewData,
    createdAt: reviewData.createdAt ?? now,
  };
};
