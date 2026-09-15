"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { m } from "framer-motion";
import { emptyCart } from "@/public/Images/index";
import Image from "next/image";

export default function EmptyCart() {
  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center px-4 py-6">
      <m.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-sm sm:p-8"
      >
        <div className="relative mx-auto mb-5 h-36 w-36 sm:h-40 sm:w-40">
          <Image
            src={emptyCart}
            alt="Empty shopping cart"
            fill
            sizes="160px"
            className="object-contain"
            priority
          />
        </div>

        <h2 className="text-xl font-semibold text-gray-800 sm:text-2xl">
          Your Cart is Empty
        </h2>

        <p className="mx-auto mt-2 max-w-xs text-sm leading-5 text-gray-500">
          You haven&apos;t added anything to your cart yet. Explore our
          products and find something you&apos;ll love.
        </p>

        <Link
          href="/"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <ShoppingCart className="h-4 w-4" />
          Discover Products
        </Link>
      </m.div>
    </div>
  );
}