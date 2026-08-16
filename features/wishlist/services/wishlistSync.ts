"use client";

import { doc, getDoc, writeBatch } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { clearGuestWishlist, getGuestWishlist } from "./wishlist";

/**
 * Merge guest wishlist into Firestore after login
 */
export const mergeGuestWishlist = async (userId: string) => {
  const guestWishlist = getGuestWishlist();

  if (guestWishlist.length === 0) return;

  const batch = writeBatch(db);

  try {
    for (const productId of guestWishlist) {
      const wishlistItemRef = doc(db, "wishlists", userId, "items", productId);

      const snap = await getDoc(wishlistItemRef);

      if (!snap.exists()) {
        batch.set(wishlistItemRef, {
          productId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }

    await batch.commit();

    clearGuestWishlist();
  } catch (error) {
    console.error("Failed to merge guest wishlist:", error);
    throw error;
  }
};
