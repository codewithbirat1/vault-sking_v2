import Shop from "@/components/layout/shop/Shop";
import { getBrands, getCategories } from "@/lib/frontend-data";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse authentic skincare products from trusted brands at Vault Skin. Filter by category, brand, price, and more.",
};

const ShopPage = () => {
  const categories = getCategories();
  const brands = getBrands();

  return (
    <div className="bg-white min-h-screen">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        }
      >
        <Shop categories={categories} brands={brands} />
      </Suspense>
    </div>
  );
};

export default ShopPage;