"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";

import type { Product } from "@/lib/frontend-data";

import {
  addGuestWishlistItem,
  clearGuestWishlist,
  getGuestWishlist,
  removeGuestWishlistItem,
  toggleGuestWishlistItem,
} from "@/lib/wishlist";

import {
  addFirestoreWishlistItem,
  clearFirestoreWishlist,
  listenFirestoreWishlist,
  removeFirestoreWishlistItem,
} from "@/lib/wishlistService";

import { mergeGuestWishlist } from "@/lib/wishlistSync";

export const useWishlist = () => {
  const { user, isSignedIn } = useUser();

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    return getGuestWishlist();
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSignedIn || !user) {
      const syncWishlist = () => setWishlistIds(getGuestWishlist());
      window.addEventListener("guest_wishlist_updated", syncWishlist);
      window.addEventListener("storage", syncWishlist);
      
      syncWishlist();

      return () => {
        window.removeEventListener("guest_wishlist_updated", syncWishlist);
        window.removeEventListener("storage", syncWishlist);
      };
    }

  let unsubscribe = () => {};
  let cancelled = false;

  (async () => {
    setLoading(true);

    await mergeGuestWishlist(user.id);

    if (cancelled) return;

    unsubscribe = listenFirestoreWishlist(user.id, (items) => {
      if (cancelled) return;

      setWishlistIds(items.map((item) => item.productId));
      setLoading(false);
    });
  })();

  return () => {
    cancelled = true;
    unsubscribe();
  };
}, [isSignedIn, user]);

  const addToWishlist = useCallback(
    async (product: Product) => {
      if (!product._id) return;

      if (isSignedIn && user) {
        await addFirestoreWishlistItem(user.id, product._id);
        return;
      }

      setWishlistIds(addGuestWishlistItem(product._id));
    },
    [isSignedIn, user],
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      if (isSignedIn && user) {
        await removeFirestoreWishlistItem(user.id, productId);
        return;
      }

      setWishlistIds(removeGuestWishlistItem(productId));
    },
    [isSignedIn, user],
  );

  const toggleWishlist = useCallback(
    async (product: Product) => {
      if (!product._id) return;

      if (isSignedIn && user) {
        if (wishlistIds.includes(product._id)) {
          await removeFirestoreWishlistItem(user.id, product._id);
        } else {
          await addFirestoreWishlistItem(user.id, product._id);
        }
        return;
      }

      setWishlistIds(toggleGuestWishlistItem(product._id));
    },
    [isSignedIn, user, wishlistIds],
  );

  const clearWishlist = useCallback(async () => {
    if (isSignedIn && user) {
      await clearFirestoreWishlist(user.id);
      return;
    }

    clearGuestWishlist();
    setWishlistIds([]);
  }, [isSignedIn, user]);

  const isWishlisted = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds],
  );

  const wishlistCount = useMemo(() => wishlistIds.length, [wishlistIds]);

  return {
    wishlistIds,
    loading,
    wishlistCount,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    isWishlisted,
  };
};
