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
  product?: Product;
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
  const { user, isSignedIn } = useUser();

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
  const loading = Boolean(isSignedIn && user && firestoreLoading);

  const addToCart = useCallback(
    (product: Product) => {
      if (isSignedIn && user) {
        setFirestoreCart((prev) => {
          const existing = prev.find((item) => item.productId === product._id);
          if (existing) {
            return prev.map((item) =>
              item.productId === product._id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            );
          }
          return [...prev, { productId: product._id, quantity: 1 }];
        });
        
        addFirestoreCartItem(user.id, product).catch(console.error);
        return;
      }

      addGuestCartItem(product);
    },
    [isSignedIn, user],
  );

  const increaseQuantity = useCallback(
    (productId: string) => {
      if (isSignedIn && user) {
        setFirestoreCart((prev) =>
          prev.map((item) =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        );
        increaseFirestoreQuantity(user.id, productId).catch(console.error);
        return;
      }

      increaseGuestQuantity(productId);
    },
    [isSignedIn, user],
  );

  const decreaseQuantity = useCallback(
    (productId: string) => {
      if (isSignedIn && user) {
        setFirestoreCart((prev) =>
          prev.map((item) =>
            item.productId === productId && item.quantity > 1
              ? { ...item, quantity: item.quantity - 1 }
              : item,
          ),
        );
        decreaseFirestoreQuantity(user.id, productId).catch(console.error);
        return;
      }

      decreaseGuestQuantity(productId);
    },
    [isSignedIn, user],
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      if (isSignedIn && user) {
        setFirestoreCart((prev) =>
          prev.filter((item) => item.productId !== productId),
        );
        removeFirestoreCartItem(user.id, productId).catch(console.error);
        return;
      }

      removeGuestCartItem(productId);
    },
    [isSignedIn, user],
  );

  const clearCart = useCallback(() => {
    if (isSignedIn && user) {
      setFirestoreCart([]);
      clearFirestoreCart(user.id).catch(console.error);
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
