"use client";

import Image from "next/image";
import { useState } from "react";

const FALLBACK_IMAGE = "/placeholder-product.png";

function isApprovedCoverSource(src?: string | null): src is string {
  if (!src?.trim()) return false;
  const value = src.trim();
  if (value.startsWith("/") && !value.startsWith("//")) return true;

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "ik.imagekit.io" &&
      url.pathname.startsWith("/vault088/")
    );
  } catch {
    return false;
  }
}

type BlogCoverImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
};

export default function BlogCoverImage({
  src,
  alt,
  className,
  fill,
  sizes,
  width,
  height,
}: BlogCoverImageProps) {
  const [failed, setFailed] = useState(false);
  const source = isApprovedCoverSource(src) ? src.trim() : FALLBACK_IMAGE;

  return (
    <Image
      src={failed ? FALLBACK_IMAGE : source}
      alt={alt}
      className={className}
      fill={fill}
      sizes={sizes}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      onError={() => setFailed(true)}
    />
  );
}
