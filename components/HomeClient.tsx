"use client";

import dynamic from "next/dynamic";
import ProductGrid from "@/components/layout/Products/ProductGrid";

const HomeCategories = dynamic(
  () => import("@/components/layout/Category/HomeCategories"),
  {
    loading: () => (
      <div className="w-full bg-surface p-5 rounded-2xl animate-pulse h-48" />
    ),
  }
);

const ShopByBrands = dynamic(
  () => import("@/components/layout/Brands/ShopByBrands"),
  {
    loading: () => (
      <div className="w-full bg-surface p-5 rounded-2xl animate-pulse h-40" />
    ),
  }
);

export default function HomeClient() {
  return (
    <>
      <ProductGrid />
      <HomeCategories />
      <ShopByBrands />
    </>
  );
}