"use client";

import {
  collection,
  documentId,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { Product } from "@/data/products";

export const getWishlistProducts = async (
  productIds: string[],
): Promise<Product[]> => {
  if (productIds.length === 0) return [];

  const q = query(
    collection(db, "products"),
    where(documentId(), "in", productIds),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    ...(docSnap.data() as Omit<Product, "_id">),
    _id: docSnap.id,
  }));
};
