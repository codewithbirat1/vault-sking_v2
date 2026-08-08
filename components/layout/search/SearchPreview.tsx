
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { ArrowRight, Tag } from "lucide-react";
import { SearchResult } from "@/types/search";
import { getSafeImageSrc, PLACEHOLDER_IMAGE, isS3Url } from "@/lib/image";

type Props = {
  result: SearchResult;
  onView: () => void;
};

export default function SearchPreview({ result, onView }: Props) {
  const router = useRouter();

  const handleView = () => {
    onView();
    if (result.slug) {
      router.push(`/product/${result.slug}`);
    }
  };

  const imageUrl = getSafeImageSrc(result.imageUrl);

  return (
    <m.div
      key={result.id}
      className="h-full flex flex-col items-center justify-center p-6 text-center"
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.18 }}
    >
      {/* Image */}
      <div className="relative w-48 h-48 mb-4 rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
        <Image
          src={imageUrl}
          alt={result.name}
          fill
          sizes="192px"
          unoptimized={isS3Url(imageUrl)}
          style={{ objectFit: "cover" }}
          className="rounded-2xl"
          onError={(e) => {
            (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
          }}
        />
        {result.status && (
          <span
            className={`absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              result.status === "hot"
                ? "bg-rose-500 text-white"
                : result.status === "new"
                ? "bg-emerald-500 text-white"
                : "bg-amber-400 text-white"
            }`}
          >
            {result.status}
          </span>
        )}
      </div>

      {/* Name */}
      <h3 className="text-base font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">
        {result.name}
      </h3>

      {/* Brand & category */}
      <p className="text-sm text-gray-500 mb-1">{result.brand}</p>

      {result.category && (
        <span className="inline-flex items-center gap-1 text-xs text-gray-400 mb-3">
          <Tag size={11} />
          {result.category}
        </span>
      )}

      {/* Price */}
      <p className="text-lg font-bold text-primary mb-4">{result.price}</p>

      {/* CTA */}
      <button type="button"
        onClick={handleView}
        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
      >
        View Product <ArrowRight size={14} />
      </button>
    </m.div>
  );
}
