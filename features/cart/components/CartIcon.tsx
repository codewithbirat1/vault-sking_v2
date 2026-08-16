"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/features/cart/hooks/useCart";

const CartIcon = () => {
  const { cartCount, loading } = useCart();

  return (
    <Link href="/cart" className="group relative">
      <ShoppingCart className="w-5 h-5 hover:text-accent/90 hoverEffect" />

      <span className="absolute -top-1 -right-1 bg-primary text-white h-4 min-w-4 px-1 rounded-full text-[10px] font-semibold flex items-center justify-center">
        {loading ? 0 : cartCount}
      </span>
    </Link>
  );
};

export default CartIcon;
