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

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CartProduct extends Product {
  quantity: number;
}

export const getCartProducts = async (
  cart: CartItem[],
): Promise<CartProduct[]> => {
  if (cart.length === 0) return [];

  const ids = cart.map((item) => item.productId);

  const q = query(collection(db, "products"), where(documentId(), "in", ids));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const product = doc.data() as Omit<Product, "_id">;

    const cartItem = cart.find((item) => item.productId === doc.id);

    return {
      ...product,
      _id: doc.id,
      quantity: cartItem?.quantity ?? 1,
    };
  });
};
