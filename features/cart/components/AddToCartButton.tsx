"use client";

import type { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/features/cart/hooks/useCart";
import toast from "react-hot-toast";

interface Props {
  product: Product;
  className?: string;
  iconOnly?: boolean;
}

const AddToCartButton = ({
  product,
  className,
  iconOnly = false,
}: Props) => {
  const { addToCart } = useCart();

  const isOutOfStock = product?.stock === 0;

  return (
    <div className={cn("h-10 flex items-center", iconOnly ? "" : "w-full")}>
      <Button
        disabled={isOutOfStock}
        onClick={() => {
          toast.promise(addToCart(product), {
            loading: "Adding to cart...",
            success: `${product.name} added to cart`,
            error: "Failed to add to cart",
          });
        }}
        className={cn(
          "h-9 rounded-xl bg-primary text-white font-medium shadow-sm border border-primary transition-all duration-300 hover:bg-accent hover:border-accent hover:shadow-md hover:-translate-y-0.5 disabled:bg-border disabled:border-border disabled:text-text-muted disabled:cursor-not-allowed",
          iconOnly
            ? "w-9 md:w-auto p-0 md:px-4 justify-center"
            : "w-full px-4",
          className,
        )}
      >
        <ShoppingBag className={cn("w-4 h-4", !iconOnly && "mr-2")} />

        {iconOnly ? (
          <span className="hidden md:inline">
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </span>
        ) : (
          <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
        )}
      </Button>
    </div>
  );
};

export default AddToCartButton;