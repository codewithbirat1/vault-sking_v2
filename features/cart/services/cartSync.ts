"use client";

import { doc, getDoc, writeBatch } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { clearGuestCart, getGuestCart } from "./cart";

/**
 * Merge guest cart into Firestore after login
 */
export const mergeGuestCart = async (userId: string) => {
  const guestCart = getGuestCart();

  if (guestCart.length === 0) return;

  const batch = writeBatch(db);

  try {
    for (const item of guestCart) {
      const cartItemRef = doc(db, "carts", userId, "items", item.productId);

      const snap = await getDoc(cartItemRef);

      if (snap.exists()) {
        const existing = snap.data();

        batch.set(
          cartItemRef,
          {
            ...existing,
            quantity: existing.quantity + item.quantity,
            updatedAt: Date.now(),
          },
          { merge: true },
        );
      } else {
        batch.set(cartItemRef, {
          productId: item.productId,
          quantity: item.quantity,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }

    await batch.commit();

    // Remove guest cart after successful merge
    clearGuestCart();
  } catch (error) {
    console.error("Failed to merge guest cart:", error);
    throw error;
  }
};
