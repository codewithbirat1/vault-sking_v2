"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { useUser } from "@clerk/nextjs";

import type { Product } from "@/lib/frontend-data";
import { GUEST_CART_KEY } from "@/lib/localStorage";

import {
  addGuestCartItem,
  clearGuestCart,
  decreaseGuestQuantity,
  getGuestCart,
  increaseGuestQuantity,
  removeGuestCartItem,
} from "@/lib/cart";

import {
  addFirestoreCartItem,
  clearFirestoreCart,
  decreaseFirestoreQuantity,
  increaseFirestoreQuantity,
  listenFirestoreCart,
  removeFirestoreCartItem,
} from "@/lib/cartService";

import { mergeGuestCart } from "@/lib/cartSync";

export interface CartItem {
  productId: string;
  quantity: number;
}

let cachedGuestCartRaw: string | null | undefined = undefined;
let cachedGuestCart: CartItem[] = [];

const subscribeGuestCart = (callback: () => void) => {
  window.addEventListener("guest_cart_updated", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("guest_cart_updated", callback);
    window.removeEventListener("storage", callback);
  };
};

const emptyServerCart: CartItem[] = [];

const getGuestCartSnapshot = (): CartItem[] => {
  if (typeof window === "undefined") return emptyServerCart;
  const raw =
    localStorage.getItem(GUEST_CART_KEY) ??
    localStorage.getItem("guest_cart");
  if (raw !== cachedGuestCartRaw) {
    cachedGuestCartRaw = raw;
    cachedGuestCart = getGuestCart();
  }
  return cachedGuestCart;
};

const getServerCartSnapshot = (): CartItem[] => emptyServerCart;

export const useCart = () => {
  const { user, isSignedIn, isLoaded } = useUser();

  const guestCart = useSyncExternalStore(
    subscribeGuestCart,
    getGuestCartSnapshot,
    getServerCartSnapshot,
  );

  const [firestoreCart, setFirestoreCart] = useState<CartItem[]>([]);
  const [firestoreLoading, setFirestoreLoading] = useState(true);

  /**
   * Listen to Firestore when user signs in
   */
  useEffect(() => {
    if (!isSignedIn || !user) return;

    let unsubscribe = () => {};
    let cancelled = false;

    (async () => {
      await mergeGuestCart(user.id);

      if (cancelled) return;

      unsubscribe = listenFirestoreCart(user.id, (items) => {
        if (!cancelled) {
          setFirestoreCart(items);
          setFirestoreLoading(false);
        }
      });
    })();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [isSignedIn, user]);

  const cart = isSignedIn && user ? firestoreCart : guestCart;
  const loading = !isLoaded || (Boolean(isSignedIn && user) && firestoreLoading);

  const addToCart = useCallback(
    async (product: Product) => {
      if (isSignedIn && user) {
        await addFirestoreCartItem(user.id, product);
        return;
      }

      addGuestCartItem(product);
    },
    [isSignedIn, user],
  );

  const increaseQuantity = useCallback(
    async (productId: string) => {
      if (isSignedIn && user) {
        await increaseFirestoreQuantity(user.id, productId);
        return;
      }

      increaseGuestQuantity(productId);
    },
    [isSignedIn, user],
  );

  const decreaseQuantity = useCallback(
    async (productId: string) => {
      if (isSignedIn && user) {
        await decreaseFirestoreQuantity(user.id, productId);
        return;
      }

      decreaseGuestQuantity(productId);
    },
    [isSignedIn, user],
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      if (isSignedIn && user) {
        await removeFirestoreCartItem(user.id, productId);
        return;
      }

      removeGuestCartItem(productId);
    },
    [isSignedIn, user],
  );

  const clearCart = useCallback(async () => {
    if (isSignedIn && user) {
      await clearFirestoreCart(user.id);
      return;
    }

    clearGuestCart();
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
