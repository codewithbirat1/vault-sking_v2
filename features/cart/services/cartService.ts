"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { Product } from "@/lib/frontend-data";

export interface FirestoreCartItem {
  productId: string;
  quantity: number;
  createdAt: number;
  updatedAt: number;
}

/**
 * Add product to Firestore cart
 */
export const addFirestoreCartItem = async (
  userId: string,
  product: Product,
) => {
  const itemRef = doc(db, "carts", userId, "items", product._id);

  const snap = await getDoc(itemRef);

  if (snap.exists()) {
    const data = snap.data() as FirestoreCartItem;

    await updateDoc(itemRef, {
      quantity: data.quantity + 1,
      updatedAt: Date.now(),
    });

    return;
  }

  await setDoc(itemRef, {
    productId: product._id,
    quantity: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
};

/**
 * Increase quantity
 */
export const increaseFirestoreQuantity = async (
  userId: string,
  productId: string,
) => {
  const ref = doc(db, "carts", userId, "items", productId);

  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const data = snap.data() as FirestoreCartItem;

  await updateDoc(ref, {
    quantity: data.quantity + 1,
    updatedAt: Date.now(),
  });
};

/**
 * Decrease quantity
 */
export const decreaseFirestoreQuantity = async (
  userId: string,
  productId: string,
) => {
  const ref = doc(db, "carts", userId, "items", productId);

  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const data = snap.data() as FirestoreCartItem;

  if (data.quantity <= 1) {
    await deleteDoc(ref);
    return;
  }

  await updateDoc(ref, {
    quantity: data.quantity - 1,
    updatedAt: Date.now(),
  });
};

/**
 * Remove product
 */
export const removeFirestoreCartItem = async (
  userId: string,
  productId: string,
) => {
  await deleteDoc(doc(db, "carts", userId, "items", productId));
};

/**
 * Clear entire cart
 */
export const clearFirestoreCart = async (userId: string) => {
  const itemsRef = collection(db, "carts", userId, "items");

  const snapshot = await getDocs(itemsRef);

  const batch = writeBatch(db);

  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
};

/**
 * Listen to cart changes
 */
export const listenFirestoreCart = (
  userId: string,
  callback: (items: FirestoreCartItem[]) => void,
) => {
  return onSnapshot(collection(db, "carts", userId, "items"), (snapshot) => {
    callback(
      snapshot.docs.map((doc) => ({
        ...(doc.data() as FirestoreCartItem),
      })),
    );
  });
};
