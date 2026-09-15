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
  product?: Product;
}

export interface CartProduct extends Product {
  quantity: number;
}

export const getCartProducts = async (
  cart: CartItem[],
): Promise<CartProduct[]> => {
  if (cart.length === 0) return [];

  const cachedProductsMap = new Map<string, Product>();
  const missingIds: string[] = [];

  for (const item of cart) {
    if (item.product && (item.product._id || item.product.id)) {
      cachedProductsMap.set(item.productId, item.product);
    } else {
      missingIds.push(item.productId);
    }
  }

  if (missingIds.length > 0) {
    try {
      const fetchPromise = (async () => {
        const q = query(
          collection(db, "products"),
          where(documentId(), "in", missingIds),
        );
        const snapshot = await getDocs(q);
        snapshot.docs.forEach((doc) => {
          const product = doc.data() as Omit<Product, "_id">;
          cachedProductsMap.set(doc.id, {
            ...product,
            _id: doc.id,
          });
        });
      })();

      const timeoutPromise = new Promise((resolve) =>
        setTimeout(resolve, 2500)
      );
      await Promise.race([fetchPromise, timeoutPromise]);
    } catch (err) {
      console.error("Error fetching cart products from Firestore:", err);
    }
  }

  return cart
    .map((item) => {
      const product = cachedProductsMap.get(item.productId);
      if (!product) return null;
      return {
        ...product,
        _id: item.productId,
        quantity: item.quantity,
      };
    })
    .filter((p): p is CartProduct => p !== null);
};
