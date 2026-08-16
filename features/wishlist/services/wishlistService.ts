"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";

export interface FirestoreWishlistItem {
  productId: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Add product to Firestore wishlist
 */
export const addFirestoreWishlistItem = async (
  userId: string,
  productId: string,
) => {
  const itemRef = doc(db, "wishlists", userId, "items", productId);

  await setDoc(
    itemRef,
    {
      productId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    { merge: true },
  );
};

/**
 * Remove product from Firestore wishlist
 */
export const removeFirestoreWishlistItem = async (
  userId: string,
  productId: string,
) => {
  await deleteDoc(doc(db, "wishlists", userId, "items", productId));
};

/**
 * Clear entire wishlist
 */
export const clearFirestoreWishlist = async (userId: string) => {
  const itemsRef = collection(db, "wishlists", userId, "items");
  const snapshot = await getDocs(itemsRef);

  const batch = writeBatch(db);

  snapshot.docs.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });

  await batch.commit();
};

/**
 * Listen to wishlist changes
 */
export const listenFirestoreWishlist = (
  userId: string,
  callback: (items: FirestoreWishlistItem[]) => void,
) => {
  return onSnapshot(collection(db, "wishlists", userId, "items"), (snapshot) => {
    callback(
      snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as FirestoreWishlistItem),
      })),
    );
  });
};
