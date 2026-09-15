"use client";

import type { Product } from "@/lib/frontend-data";
import React from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";

interface Props {
  product: Product;
  className?: string;
}

const QuantityButtons = ({ product, className }: Props) => {
  const { cart, increaseQuantity, decreaseQuantity } = useCart();

  const cartItem = cart.find((item) => item.productId === product._id);

  const itemCount = cartItem?.quantity ?? 0;

  const isOutOfStock = product.stock === 0;

  const handleRemoveProduct = async () => {
    try {
      await decreaseQuantity(product._id);
      toast.success(
        itemCount <= 1
          ? `${product.name} removed from cart`
          : "Quantity decreased",
      );
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const handleAddProduct = async () => {
    if (itemCount >= product.stock) {
      toast.error("Cannot add more than available stock");
      return;
    }

    try {
      await increaseQuantity(product._id);
      toast.success("Quantity increased");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className={cn("flex items-center gap-1 pb-1 text-base", className)}>
      <Button
        onClick={handleRemoveProduct}
        variant="outline"
        size="icon"
        disabled={itemCount === 0 || isOutOfStock}
        className="w-6 h-6 border hover:bg-bg/70 cursor-pointer"
      >
        <Minus />
      </Button>

      <span className="font-semibold text-sm w-6 text-center text-primary">
        {itemCount}
      </span>

      <Button
        onClick={handleAddProduct}
        variant="outline"
        size="icon"
        disabled={isOutOfStock}
        className="w-6 h-6 border hover:bg-bg/70 cursor-pointer"
      >
        <Plus />
      </Button>
    </div>
  );
};

export default QuantityButtons;
