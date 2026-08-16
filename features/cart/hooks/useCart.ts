"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";

import type { Product } from "@/lib/frontend-data";

import {
  addGuestCartItem,
  clearGuestCart,
  decreaseGuestQuantity,
  getGuestCart,
  increaseGuestQuantity,
  removeGuestCartItem,
} from "@/features/cart/services/cart";

import {
  addFirestoreCartItem,
  clearFirestoreCart,
  decreaseFirestoreQuantity,
  increaseFirestoreQuantity,
  listenFirestoreCart,
  removeFirestoreCartItem,
} from "@/features/cart/services/cartService";

import { mergeGuestCart } from "@/features/cart/services/cartSync";

export interface CartItem {
  productId: string;
  quantity: number;
}

export const useCart = () => {
  const { user, isSignedIn } = useUser();

  // Initialize guest cart immediately instead of inside an effect
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    return getGuestCart();
  });

  const [loading, setLoading] = useState(false);

  /**
   * Listen to Firestore when user signs in
   */
  useEffect(() => {
    if (!isSignedIn || !user) {
      const syncCart = () => setCart(getGuestCart());
      window.addEventListener("guest_cart_updated", syncCart);
      window.addEventListener("storage", syncCart);
      
      syncCart(); // initial sync

      return () => {
        window.removeEventListener("guest_cart_updated", syncCart);
        window.removeEventListener("storage", syncCart);
      };
    }

  let unsubscribe = () => {};
  let cancelled = false;

  (async () => {
    setLoading(true);

    await mergeGuestCart(user.id);

    if (cancelled) return;

    unsubscribe = listenFirestoreCart(user.id, (items: CartItem[]) => {
      if (!cancelled) {
        setCart(items);
        setLoading(false);
      }
    });
  })();

  return () => {
    cancelled = true;
    unsubscribe();
  };
}, [isSignedIn, user]);

  const addToCart = useCallback(
    async (product: Product) => {
      if (isSignedIn && user) {
        await addFirestoreCartItem(user.id, product);
        return;
      }

      setCart(addGuestCartItem(product));
    },
    [isSignedIn, user],
  );

  const increaseQuantity = useCallback(
    async (productId: string) => {
      if (isSignedIn && user) {
        await increaseFirestoreQuantity(user.id, productId);
        return;
      }

      setCart(increaseGuestQuantity(productId));
    },
    [isSignedIn, user],
  );

  const decreaseQuantity = useCallback(
    async (productId: string) => {
      if (isSignedIn && user) {
        await decreaseFirestoreQuantity(user.id, productId);
        return;
      }

      setCart(decreaseGuestQuantity(productId));
    },
    [isSignedIn, user],
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      if (isSignedIn && user) {
        await removeFirestoreCartItem(user.id, productId);
        return;
      }

      setCart(removeGuestCartItem(productId));
    },
    [isSignedIn, user],
  );

  const clearCart = useCallback(async () => {
    if (isSignedIn && user) {
      await clearFirestoreCart(user.id);
      return;
    }

    clearGuestCart();
    setCart([]);
  }, [isSignedIn, user]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  return {
    cart,
    loading,
    cartCount,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  };
};
