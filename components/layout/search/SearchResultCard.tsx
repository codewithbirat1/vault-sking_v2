"use client";

import Image from "next/image";
import { m } from "framer-motion";
import { isCustomerFacingLabel, SearchResult } from "@/types/search";
import { getSafeImageSrc, PLACEHOLDER_IMAGE, isS3Url } from "@/lib/image";
import HighlightedText from "./HighlightedText";

type Props = {
  result: SearchResult;
  onSelect: () => void;
  isHighlighted?: boolean;
};

export default function SearchResultCard({ result, onSelect, isHighlighted }: Props) {
  const nameMatches = result.matches?.find((m) => m.key === "name")?.indices;
  const brandMatches = result.matches?.find((m) => m.key === "brand")?.indices;
  const categoryMatches = result.matches?.find((m) => m.key === "category")?.indices;
  const hasBrand = isCustomerFacingLabel(result.brand, result.id);
  const hasCategory =
    isCustomerFacingLabel(result.category, result.id) &&
    result.category !== result.brand;
  const imageUrl = getSafeImageSrc(result.imageUrl);

  return (
    <m.button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors ${
        isHighlighted
          ? "bg-primary/8 ring-1 ring-primary/20"
          : "hover:bg-gray-50"
      } focus:outline-none focus:ring-2 focus:ring-primary/30`}
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.12 }}
    >
      {/* Product thumbnail */}
      <div className="shrink-0 w-14 h-14 relative rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={imageUrl}
          alt={result.name}
          fill
          sizes="56px"
          unoptimized={isS3Url(imageUrl)}
          style={{ objectFit: "cover" }}
          className="rounded-lg"
          onError={(e) => {
            (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
          }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate leading-tight">
          <HighlightedText text={result.name} indices={nameMatches} />
        </p>
        {(hasBrand || hasCategory) && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {hasBrand && (
              <HighlightedText text={result.brand} indices={brandMatches} />
            )}
            {hasCategory ? (
              <>
                {hasBrand && " · "}
                <HighlightedText
                  text={result.category}
                  indices={categoryMatches}
                />
              </>
            ) : null}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-semibold text-primary">
            NPR {result.price}
          </span>
          {result.status && (
            <span
              className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                result.status === "hot"
                  ? "bg-rose-100 text-rose-600"
                  : result.status === "new"
                  ? "bg-emerald-100 text-emerald-600"
                  : result.status === "sale"
                  ? "bg-amber-100 text-amber-600"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {result.status}
            </span>
          )}
        </div>
      </div>
    </m.button>
  );
}
