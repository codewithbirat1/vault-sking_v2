"use client";

import { Product } from "@/lib/frontend-data";

import { GUEST_CART_KEY } from "@/lib/localStorage";

export interface CartItem {
  productId: string;
  quantity: number;
  product?: Product;
}

const CART_KEY = GUEST_CART_KEY;

/**
 * Get guest cart
 */
export const getGuestCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];

  // Migration path
  const legacy = localStorage.getItem("guest_cart");
  if (legacy) {
    try {
      localStorage.setItem(CART_KEY, legacy);
      localStorage.removeItem("guest_cart");
      return JSON.parse(legacy);
    } catch {
      localStorage.removeItem("guest_cart");
    }
  }

  const cart = localStorage.getItem(CART_KEY);

  return cart ? JSON.parse(cart) : [];
};

/**
 * Save guest cart
 */
export const saveGuestCart = (cart: CartItem[]) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("guest_cart_updated"));
  }
};

/**
 * Add item to guest cart
 */
export const addGuestCartItem = (product: Product) => {
  const cart = getGuestCart();

  const existing = cart.find((item) => item.productId === product._id);

  if (existing) {
    existing.quantity += 1;
    existing.product = product;
  } else {
    cart.push({
      productId: product._id,
      quantity: 1,
      product: product,
    });
  }

  saveGuestCart(cart);

  return cart;
};

/**
 * Remove item completely
 */
export const removeGuestCartItem = (productId: string) => {
  const cart = getGuestCart().filter((item) => item.productId !== productId);

  saveGuestCart(cart);

  return cart;
};

/**
 * Increase quantity
 */
export const increaseGuestQuantity = (productId: string) => {
  const cart = getGuestCart();

  const item = cart.find((item) => item.productId === productId);

  if (item) {
    item.quantity++;
  }

  saveGuestCart(cart);

  return cart;
};

/**
 * Decrease quantity
 */
export const decreaseGuestQuantity = (productId: string) => {
  const cart = getGuestCart();

  const item = cart.find((item) => item.productId === productId);

  if (!item) return cart;

  if (item.quantity === 1) {
    return removeGuestCartItem(productId);
  }

  item.quantity--;

  saveGuestCart(cart);

  return cart;
};

/**
 * Clear guest cart
 */
export const clearGuestCart = () => {
  localStorage.removeItem(CART_KEY);
  localStorage.removeItem("guest_cart");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("guest_cart_updated"));
  }
};

/**
 * Total cart count
 */
export const getGuestCartCount = () => {
  return getGuestCart().reduce((total, item) => total + item.quantity, 0);
};

/**
 * Check if item exists
 */
export const isInGuestCart = (productId: string) => {
  return getGuestCart().some((item) => item.productId === productId);
};

/**
 * Get quantity
 */
export const getGuestQuantity = (productId: string) => {
  const item = getGuestCart().find((item) => item.productId === productId);

  return item?.quantity ?? 0;
};
