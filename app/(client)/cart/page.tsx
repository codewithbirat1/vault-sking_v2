"use client";

import Container from "@/components/Container";
import EmptyCart from "@/components/layout/Products/EmptyCart";
import PriceFormatter from "@/components/layout/Products/PriceFormatter";
import QuantityButtons from "@/components/layout/Products/QuantityButtons";
import Title from "@/components/layout/Products/Title";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ConfirmDeleteModal from "@/components/layout/Products/ConfirmDeleteModal";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";
import { CartProduct, getCartProducts } from "@/utils/cartHelper";
import { ShoppingCart, Trash } from "lucide-react";
import Image from "next/image";
import { getSafeImageSrc, isS3Url } from "@/lib/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { productCategories } from "@/constants/data";
import { db } from "@/config/firebase.config";
import { collection, onSnapshot } from "firebase/firestore";

const CATEGORY_STYLES: Record<string, { label: string; className: string }> = {
  serum: {
    label: "Serum",
    className: "bg-purple-50 text-purple-700 border-purple-200/60",
  },
  serums: {
    label: "Serum",
    className: "bg-purple-50 text-purple-700 border-purple-200/60",
  },
  "face-wash": {
    label: "Face Wash",
    className: "bg-sky-50 text-sky-700 border-sky-200/60",
  },
  facewash: {
    label: "Face Wash",
    className: "bg-sky-50 text-sky-700 border-sky-200/60",
  },
  moisturizer: {
    label: "Moisturizer",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  },
  moisturizers: {
    label: "Moisturizer",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  },
  "sunscreen-and-sunstick": {
    label: "Sunscreen & Sunstick",
    className: "bg-amber-50 text-amber-700 border-amber-200/60",
  },
  sunscreen: {
    label: "Sunscreen",
    className: "bg-amber-50 text-amber-700 border-amber-200/60",
  },
  sunscreens: {
    label: "Sunscreen",
    className: "bg-amber-50 text-amber-700 border-amber-200/60",
  },
  "face-mask": {
    label: "Face Mask",
    className: "bg-rose-50 text-rose-700 border-rose-200/60",
  },
  "face-masks": {
    label: "Face Mask",
    className: "bg-rose-50 text-rose-700 border-rose-200/60",
  },
  "lip-balm": {
    label: "Lip Balm",
    className: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200/60",
  },
  toners: {
    label: "Toner",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
  },
  toner: {
    label: "Toner",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
  },
  others: {
    label: "Others",
    className: "bg-slate-100 text-slate-700 border-slate-200/60",
  },
};

const COLOR_PALETTES = [
  "bg-purple-50 text-purple-700 border-purple-200/60",
  "bg-sky-50 text-sky-700 border-sky-200/60",
  "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  "bg-amber-50 text-amber-700 border-amber-200/60",
  "bg-rose-50 text-rose-700 border-rose-200/60",
  "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200/60",
  "bg-indigo-50 text-indigo-700 border-indigo-200/60",
  "bg-teal-50 text-teal-700 border-teal-200/60",
  "bg-orange-50 text-orange-700 border-orange-200/60",
  "bg-cyan-50 text-cyan-700 border-cyan-200/60",
];

function getCategoryBadgeInfo(
  categoryRaw?: string,
  categoryMap: Record<string, { title: string; slug?: string }> = {},
) {
  if (!categoryRaw || typeof categoryRaw !== "string") return null;

  // 1. Resolve Firestore category ID to actual category title
  const categoryObject = categoryMap[categoryRaw];
  let categoryTitle = categoryObject?.title;

  if (!categoryTitle) {
    const foundEntry = Object.values(categoryMap).find(
      (cat) =>
        cat.slug === categoryRaw ||
        cat.title.toLowerCase() === categoryRaw.toLowerCase(),
    );
    if (foundEntry) {
      categoryTitle = foundEntry.title;
    }
  }

  const resolvedName = categoryTitle || categoryRaw;

  // If resolvedName is an unresolved raw Firestore document ID (e.g. alphanumeric string like emsQng1o3KYwMTIRvgOZ with no spaces/hyphens), wait for categoryMap to load
  const isRawId = /^[A-Za-z0-9]{15,30}$/.test(resolvedName) && !categoryTitle;
  if (isRawId) {
    return null;
  }

  const rawLower = resolvedName.toLowerCase().trim();
  const normalizedKey = rawLower.replace(/[\s-_]+/g, "-");

  if (CATEGORY_STYLES[rawLower]) {
    return CATEGORY_STYLES[rawLower];
  }
  if (CATEGORY_STYLES[normalizedKey]) {
    return CATEGORY_STYLES[normalizedKey];
  }

  const matchedCat = productCategories.find(
    (c) =>
      c.value.toLowerCase() === rawLower ||
      c.title.toLowerCase() === rawLower ||
      c.value.toLowerCase() === normalizedKey,
  );

  let label = matchedCat ? matchedCat.title : resolvedName;

  if (!matchedCat && (label.includes("-") || label.includes("_"))) {
    label = label
      .replace(/[-_]+/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  } else if (!matchedCat && label === rawLower) {
    label = label.charAt(0).toUpperCase() + label.slice(1);
  }

  let hash = 0;
  for (let i = 0; i < rawLower.length; i++) {
    hash = rawLower.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % COLOR_PALETTES.length;
  const className = COLOR_PALETTES[colorIndex];

  return { label, className };
}

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
  const { isSignedIn } = useUser();
  const { cart, removeFromCart, clearCart, loading } = useCart();
  const [cartProducts, setCartProducts] = useState<CartProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [categoryMap, setCategoryMap] = useState<Record<string, { title: string; slug?: string }>>({});
  const prevCartRef = useRef<typeof cart>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "categories"),
      (snapshot) => {
        const map: Record<string, { title: string; slug?: string }> = {};
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          map[doc.id] = {
            title: data.title || data.name || doc.id,
            slug: typeof data.slug === "string" ? data.slug : data.slug?.current,
          };
        });
        setCategoryMap(map);
      },
      (err) => console.error("Error fetching categories map:", err),
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let isCurrent = true;
    const load = async () => {
      if (cart.length === 0) {
        if (isCurrent) {
          setCartProducts([]);
          setLoadingProducts(false);
          prevCartRef.current = [];
        }
        return;
      }

      const prevIds = prevCartRef.current.map((c) => c.productId).sort().join(",");
      const currentIds = cart.map((c) => c.productId).sort().join(",");

      if (
        cartProducts.length > 0 &&
        cartProducts.length === cart.length &&
        prevIds === currentIds
      ) {
        // Only quantities changed (or no changes)
        setCartProducts((prev) =>
          prev.map((p) => {
            const cartItem = cart.find((c) => c.productId === p._id);
            return cartItem ? { ...p, quantity: cartItem.quantity } : p;
          })
        );
        prevCartRef.current = cart;
        setLoadingProducts(false);
        return;
      }

      const allHasProduct = cart.every((c) => c.product);
      if (allHasProduct) {
        const instantProducts: CartProduct[] = cart.map((item) => ({
          ...item.product!,
          _id: item.productId,
          quantity: item.quantity,
        }));
        if (isCurrent) {
          setCartProducts(instantProducts);
          setLoadingProducts(false);
          prevCartRef.current = cart;
        }
        return;
      }

      setLoadingProducts(true);
      const data = await getCartProducts(cart);
      if (isCurrent) {
        setCartProducts(data);
        setLoadingProducts(false);
        prevCartRef.current = cart;
      }
    };

    load();
    return () => {
      isCurrent = false;
    };
  }, [cart, cartProducts.length]);

  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isClearCartModalOpen, setIsClearCartModalOpen] = useState(false);

  const handleClearCart = () => {
    setIsClearCartModalOpen(true);
  };

  const confirmClearCart = async () => {
    try {
      await clearCart();
      toast.success("Cart cleared successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to clear cart");
    } finally {
      setIsClearCartModalOpen(false);
    }
  };

  const confirmRemoveItem = async () => {
    if (!itemToDelete) return;
    try {
      await removeFromCart(itemToDelete.id);
      toast.success(`${itemToDelete.name} removed from cart`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove item");
    } finally {
      setItemToDelete(null);
    }
  };

  const isCartLoading = (isSignedIn && loading) || (cart.length > 0 && loadingProducts && cartProducts.length === 0);

  if (isCartLoading) {
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

                          {(() => {
                            const badgeInfo = getCategoryBadgeInfo(
                              product?.category,
                              categoryMap,
                            );
                            if (!badgeInfo) return null;
                            return (
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] sm:text-[11px] font-medium",
                                  badgeInfo.className,
                                )}
                              >
                                {badgeInfo.label}
                              </span>
                            );
                          })()}

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
                            onClick={() =>
                              setItemToDelete({
                                id: product._id,
                                name: product.name,
                              })
                            }
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
                    className="h-8 px-3 text-xs font-medium text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 cursor-pointer"
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>

              {/* Confirmation Modals */}
              <ConfirmDeleteModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmRemoveItem}
                title="Remove Item from Cart?"
                description={`Are you sure you want to remove "${itemToDelete?.name}" from your shopping cart?`}
                confirmText="Remove Item"
              />

              <ConfirmDeleteModal
                isOpen={isClearCartModalOpen}
                onClose={() => setIsClearCartModalOpen(false)}
                onConfirm={confirmClearCart}
                title="Clear Entire Cart?"
                description="Are you sure you want to remove all items from your shopping cart? This action cannot be undone."
                confirmText="Clear Cart"
              />

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
