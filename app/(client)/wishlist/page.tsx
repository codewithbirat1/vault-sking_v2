import WishListProducts from "@/components/layout/Products/WishListProducts";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Wishlist | Vault Skin" },
  description:
    "View and manage your saved skincare products on your Vault Skin wishlist.",
  robots: { index: false, follow: false },
};

const WishListPage = () => {
  return <WishListProducts />;
};

export default WishListPage;