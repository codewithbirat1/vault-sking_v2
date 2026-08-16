"use client";

import { GUEST_WISHLIST_KEY } from "@/lib/localStorage";

const WISHLIST_KEY = GUEST_WISHLIST_KEY;
const LEGACY_WISHLIST_KEY = "vault-skin-wishlist";

const rawReadWishlistIds = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

const migrateLegacyWishlist = () => {
  if (typeof window === "undefined") return;

  // Migrate from unversioned "guest_wishlist"
  const oldWishlist = localStorage.getItem("guest_wishlist");
  if (oldWishlist) {
    try {
      const oldIds = JSON.parse(oldWishlist) as string[];
      const current = rawReadWishlistIds();
      const merged = [...new Set([...current, ...oldIds])];
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(merged));
      localStorage.removeItem("guest_wishlist");
    } catch {
      localStorage.removeItem("guest_wishlist");
    }
  }

  // Migrate from older legacy key
  const legacy = localStorage.getItem(LEGACY_WISHLIST_KEY);
  if (!legacy) return;

  try {
    const legacyIds = JSON.parse(legacy) as string[];
    const current = rawReadWishlistIds();
    const merged = [...new Set([...current, ...legacyIds])];
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(merged));
    localStorage.removeItem(LEGACY_WISHLIST_KEY);
  } catch {
    localStorage.removeItem(LEGACY_WISHLIST_KEY);
  }
};

const readWishlistIds = (): string[] => {
  if (typeof window === "undefined") return [];

  migrateLegacyWishlist();

  return rawReadWishlistIds();
};

/**
 * Get guest wishlist product IDs
 */
export const getGuestWishlist = (): string[] => readWishlistIds();

/**
 * Save guest wishlist
 */
export const saveGuestWishlist = (ids: string[]) => {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("guest_wishlist_updated"));
  }
};

/**
 * Add product to guest wishlist
 */
export const addGuestWishlistItem = (productId: string): string[] => {
  const wishlist = getGuestWishlist();

  if (wishlist.includes(productId)) {
    return wishlist;
  }

  const updated = [...wishlist, productId];
  saveGuestWishlist(updated);

  return updated;
};

/**
 * Remove product from guest wishlist
 */
export const removeGuestWishlistItem = (productId: string): string[] => {
  const updated = getGuestWishlist().filter((id) => id !== productId);
  saveGuestWishlist(updated);

  return updated;
};

/**
 * Toggle product in guest wishlist
 */
export const toggleGuestWishlistItem = (productId: string): string[] => {
  const wishlist = getGuestWishlist();

  if (wishlist.includes(productId)) {
    return removeGuestWishlistItem(productId);
  }

  return addGuestWishlistItem(productId);
};

/**
 * Clear guest wishlist
 */
export const clearGuestWishlist = () => {
  localStorage.removeItem(WISHLIST_KEY);
  localStorage.removeItem("guest_wishlist");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("guest_wishlist_updated"));
  }
};

/**
 * Check if product is in guest wishlist
 */
export const isInGuestWishlist = (productId: string) => {
  return getGuestWishlist().includes(productId);
};

/**
 * Guest wishlist count
 */
export const getGuestWishlistCount = () => getGuestWishlist().length;
