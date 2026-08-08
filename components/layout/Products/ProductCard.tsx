import type { Product } from "@/data/products";
import Image from "next/image";
import { getSafeImageSrc, isS3Url } from "@/lib/image";
import React from "react";
import Link from "next/link";
import PriceView from "./PriceView";
import Title from "./Title";
import AddToCartButton from "./AddToCartButton";
import AddToWishlistButton from "./AddToWishlistButton";

const statusConfig = {
  sale: "bg-red-500 text-white",
  new: "bg-green-500 text-white",
  hot: "bg-orange-500 text-white",
};

const ProductCard = ({
  product,
  layout = "default",
  index = 0,
}: {
  product: Product;
  layout?: "default" | "compact";
  index?: number;
}) => {
  const isCompact = layout === "compact";
  // Only the first row (roughly) should be eagerly loaded/preloaded.
  // Everything below the fold should lazy-load instead.
  const isAboveFold = index < 4;
  const imageSrc = getSafeImageSrc(product.images[0]?.url || product.thumbnail);
  return (
    <div
      className={`text-sm group flex flex-col`}
    >
       <div className="relative overflow-hidden bg-bg/90 rounded-md aspect-[4/5.4]">
        {product?.images && (
          <Link
            href={`/product/${product?.slug?.current}`}
            className=" relative w-full h-full block"
          >
            <Image
              src={imageSrc}
              alt={product?.name || "Product Image"}
              fill
              priority={isAboveFold}
              loading={isAboveFold ? undefined : "lazy"}
              unoptimized={isS3Url(imageSrc)}
              sizes={
                isCompact
                  ? "(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                  : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              }
              className={`object-contain scale-105 transition-transform duration-300 ease-out ${product?.stock !== 0
                  ? "group-hover:scale-110"
                  : "opacity-60 scale-105"
                }`}
            />
          </Link>
        )}
        <div className="absolute top-7 md:top-9 lg:top-11 right-2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/95 shadow-md ring-1 ring-black/5 backdrop-blur-sm opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 ease-out">
  <AddToWishlistButton product={product} />
</div>
        {product?.status &&
          statusConfig[product.status as keyof typeof statusConfig] && (
            <span
              className={`absolute top-7 md:top-9 lg:top-11.5 left-2 z-10 px-2.5 py-1 text-[11px] font-semibold leading-none rounded-br-lg shadow-sm ${statusConfig[product.status as keyof typeof statusConfig]
                }`}
            >
              {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
            </span>
          )}
      </div>
      <div className="flex flex-col gap-1">
        <Link
          href={`/product/${product?.slug?.current}`}
          className="hover:opacity-80 transition-opacity"
        >
          <Title className="text-base font-medium line-clamp-1">
            {product?.name}
          </Title>
        </Link>
        <PriceView price={product?.price} discount={product?.discount} />
        <div className="mt-2 opacity-100 lg:opacity-0 lg:-translate-y-2 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 transition-all duration-300 ease-out">
          <AddToCartButton product={product} className="w-full rounded" />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;