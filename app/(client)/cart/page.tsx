"use client";

import Container from "@/components/Container";
import EmptyCart from "@/components/layout/Products/EmptyCart";
import PriceFormatter from "@/components/layout/Products/PriceFormatter";
import QuantityButtons from "@/components/layout/Products/QuantityButtons";
import Title from "@/components/layout/Products/Title";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";
import { CartProduct, getCartProducts } from "@/utils/cartHelper";
import { ShoppingCart, Trash } from "lucide-react";
import Image from "next/image";
import { getSafeImageSrc, isS3Url } from "@/lib/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useUser } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderSummaryContentProps {
  cartProducts: CartProduct[];
}

const OrderSummaryContent = ({ cartProducts }: OrderSummaryContentProps) => {
  const subtotal = cartProducts.reduce((total, item) => {
    const discountedPrice = item.price - item.discount;
    return total + discountedPrice * item.quantity;
  }, 0);

  const originalTotal = cartProducts.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  const discount = cartProducts.reduce((total, item) => {
    const itemDiscount = item.discount * item.quantity;
    return total + itemDiscount;
  }, 0);

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm text-gray-600">
        <span>Subtotal:</span>
        <PriceFormatter amount={originalTotal} />
      </div>

      <div className="flex justify-between text-sm text-green-600">
        <span>Discount:</span>
        <PriceFormatter amount={discount} className="text-green-600" />
      </div>

      <Separator />

      <div className="flex justify-between text-lg font-bold">
        <span>Total:</span>
        <PriceFormatter amount={subtotal} />
      </div>
    </div>
  );
};

const CartPage = () => {
  const router = useRouter();
  const { isLoaded } = useUser();
  const { cart, removeFromCart, clearCart, loading } = useCart();
  const [cartProducts, setCartProducts] = useState<CartProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    let isCurrent = true;
    const load = async () => {
      setLoadingProducts(true);
      const data = await getCartProducts(cart);
      if (isCurrent) {
        setCartProducts(data);
        setLoadingProducts(false);
      }
    };

    load();
    return () => {
      isCurrent = false;
    };
  }, [cart]);

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast.success("Cart cleared successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to clear cart");
    }
  };

  if (!isLoaded || loading || loadingProducts) {
    return (
      <div className="pb-20">
        <Container>
          <div className="flex items-center gap-2 py-5">
            <ShoppingCart className="text-darkColor animate-pulse" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <Container>
        {cartProducts?.length ? (
          <>
            <div className="flex items-center gap-2 py-5">
              <ShoppingCart className="text-darkColor" />
              <Title>Shopping Cart</Title>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-2 xl:gap-4">
              <div className="rounded-2xl border bg-white overflow-hidden self-start">
                {cartProducts.map((product) => {
                  return (
                    <div
                      key={product?._id}
                      className="border-b last:border-b-0 p-3 flex flex-col sm:flex-row gap-3"
                    >
                      {product?.images && (
                        <Link
                          href={`/product/${product?.slug?.current}`}
                          className="self-start shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 border rounded-xl overflow-hidden group"
                        >
                          {(() => {
                            const imgUrl = getSafeImageSrc(product.thumbnail);
                            return (
                              <Image
                                src={imgUrl}
                                alt={product?.name ?? "product image"}
                                width={112}
                                height={112}
                                loading="lazy"
                                unoptimized={isS3Url(imgUrl)}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            );
                          })()}
                        </Link>
                      )}

                      <div className="flex flex-1 flex-col justify-between min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h2 className="text-sm sm:text-base font-semibold line-clamp-2 flex-1 min-w-0">
                            {product?.name}
                          </h2>
                          <PriceFormatter
                            amount={
                              (product?.price as number) * product.quantity
                            }
                            className="font-bold text-base sm:text-lg shrink-0"
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-1 sm:mt-0">
                          {product?.variant && (
                            <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-gray-700 capitalize">
                              {product.variant}
                            </span>
                          )}

                          {product?.status && (
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-medium capitalize",
                                product.status === "hot"
                                  ? "bg-red-50 text-red-600"
                                  : product.status === "new"
                                    ? "bg-blue-50 text-blue-600"
                                    : "bg-green-50 text-green-700",
                              )}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {product.status}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 flex-wrap mt-2 sm:mt-0">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await removeFromCart(product._id);
                                toast.success(
                                  `${product.name} removed from cart`,
                                );
                              } catch (error) {
                                console.error(error);
                                toast.error("Failed to remove item");
                              }
                            }}
                            aria-label="Remove product"
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200 hover:scale-105 cursor-pointer"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </button>

                          <div className="scale-90 origin-right">
                            <QuantityButtons product={product} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="flex justify-end px-3 py-2 border-t bg-gray-50/50">
                  <Button
                    onClick={handleClearCart}
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs font-medium text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>

              <div className="sticky top-24 space-y-5 self-start">
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                  <OrderSummaryContent cartProducts={cartProducts} />
                </div>

                <Button
                  className="w-full rounded-full font-semibold tracking-wide"
                  size="lg"
                  onClick={() => router.push("/checkout")}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </>
        ) : (
          <EmptyCart />
        )}
      </Container>
    </div>
  );
};

export default CartPage;
