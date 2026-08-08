"use client";

import { useEffect, useState } from "react";
import Container from "@/components/Container";
import { Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Product } from "@/data/products";
import toast from "react-hot-toast";
import Image from "next/image";
import { getSafeImageSrc, isS3Url } from "@/lib/image";
import PriceFormatter from "./PriceFormatter";
import AddToCartButton from "./AddToCartButton";
import { useWishlist } from "@/hooks/useWishlist";
import { getWishlistProducts } from "@/utils/wishlistHelper";

const WishListProducts = () => {
  const [visibleProducts, setVisibleProducts] = useState(7);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const { wishlistIds, removeFromWishlist, clearWishlist } = useWishlist();

  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true);

      try {
        const wishlistProducts = await getWishlistProducts(wishlistIds);
        const ordered = wishlistIds
          .map((id) => wishlistProducts.find((product) => product._id === id))
          .filter((product): product is Product => Boolean(product));

        setProducts(ordered);
      } catch (error) {
        console.error("Failed to load wishlist products:", error);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, [wishlistIds]);

  const loadMore = () => {
    setVisibleProducts((prev) => Math.min(prev + 5, products.length));
  };

  const handleRemoveItem = async (product: Product) => {
    if (!product?._id) return;

    await removeFromWishlist(product._id);
    toast.success("Product removed from wishlist");
  };

  const handleResetWishlist = async () => {
    const confirmReset = window.confirm(
      "Are you sure you want to reset your wishlist?",
    );

    if (confirmReset) {
      await clearWishlist();
      toast.success("Wishlist reset successfully");
    }
  };

  if (loadingProducts) {
    return (
      <Container>
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-muted-foreground">Loading wishlist...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      {products.length > 0 ? (
        <>
          <div className="overflow-x-auto py-6 md:py-10 lg:py-12">
            <table className="w-full border-collapse">
              <thead className="border-b">
                <tr className="bg-black/5">
                  <th className="p-2 text-left">Image</th>
                  <th className="p-2 text-left hidden md:table-cell">
                    Category
                  </th>
                  <th className="p-2 text-left hidden md:table-cell">Type</th>
                  <th className="p-2 text-left hidden md:table-cell">Status</th>
                  <th className="p-2 text-left">Price</th>
                  <th className="p-2 text-center md:text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, visibleProducts).map((product: Product) => (
                  <tr key={product?._id} className="border-b">
                    <td className="px-2 py-4 flex items-center gap-2">
                      <X
                        onClick={() => handleRemoveItem(product)}
                        size={18}
                        className="hover:text-red-600 hover:cursor-pointer hoverEffect"
                      />
                      {product?.images && (() => {
                        const imgUrl = getSafeImageSrc(product?.images[0]?.url || product?.thumbnail);
                        return (
                          <Link
                            href={`/product/${product?.slug?.current}`}
                            className="border rounded-md group hidden md:inline-flex"
                          >
                            <Image
                              src={imgUrl}
                              alt={"product image"}
                              width={80}
                              height={80}
                              unoptimized={isS3Url(imgUrl)}
                              className="rounded-md group-hover:scale-105 hoverEffect h-20 w-20 object-contain"
                            />
                          </Link>
                        );
                      })()}
                      <p className="line-clamp-1">{product?.name}</p>
                    </td>
                    <td className="p-2 capitalize hidden md:table-cell">
                      {product?.categories && (
                        <p className="uppercase line-clamp-1 text-xs font-medium">
                          {product.categories.map((cat) => cat).join(", ")}
                        </p>
                      )}
                    </td>
                    <td className="p-2 capitalize hidden md:table-cell">
                      {product?.variant}
                    </td>
                    <td
                      className={`p-2 w-24 ${
                        Number(product?.stock) > 0
                          ? "text-green-600"
                          : "text-red-600"
                      } font-medium text-sm hidden md:table-cell`}
                    >
                      {Number(product?.stock) > 0
                        ? "In Stock"
                        : "Out of Stock"}
                    </td>
                    <td className="p-2">
                      <PriceFormatter amount={product?.price} />
                    </td>
                    <td className="p-2">
                      <AddToCartButton product={product} iconOnly className="mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-2">
            {visibleProducts < products.length && (
              <div className="my-5">
                <Button variant="outline" onClick={loadMore}>
                  Load More
                </Button>
              </div>
            )}
            {visibleProducts > 10 && (
              <div className="my-5">
                <Button
                  onClick={() => setVisibleProducts(10)}
                  variant="outline"
                >
                  Load Less
                </Button>
              </div>
            )}
          </div>
          {products.length > 0 && (
            <Button
              onClick={handleResetWishlist}
              className="mb-4 mt-3 font-semibold"
              variant="destructive"
              size="lg"
            >
              Reset Wishlist
            </Button>
          )}
        </>
      ) : (
        <div className="flex min-h-[400px] flex-col items-center justify-center space-y-6 px-4 text-center">
          <div className="relative mb-4">
            <div className="absolute -top-1 -right-1 h-4 w-4 animate-ping rounded-full bg-muted-foreground/20" />
            <Heart
              className="h-12 w-12 text-muted-foreground"
              strokeWidth={1.5}
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Your wishlist is empty
            </h2>
            <p className="text-sm text-muted-foreground">
              Items added to your wishlist will appear here
            </p>
          </div>
          <Button>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      )}
    </Container>
  );
};

export default WishListProducts;
