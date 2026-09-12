"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { isS3Url } from "@/lib/image";

interface Props {
  images?: Array<{
    src: string;
    alt: string;
  }>;
  isStock?: number;
}

const ImageView = ({ images = [], isStock }: Props) => {
  const validImages = images.filter(
    (image): image is { src: string; alt: string } =>
      typeof image?.src === "string" && image.src.trim().length > 0,
  );

  const [userSelection, setUserSelection] = useState<{ src: string; alt: string } | null>(null);
  const [startIndex, setStartIndex] = useState(0);

  const displayedImage =
    userSelection && validImages.some((img) => img.src === userSelection.src)
      ? userSelection
      : validImages[0] ?? null;

  if (!displayedImage) return null;

  const nextSlide = () => {
    setStartIndex((prev) => Math.min(prev + 1, Math.max(0, validImages.length - 3)));
  };

  const prevSlide = () => {
    setStartIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="w-full lg:w-[42%] flex flex-col gap-4">
      <div
        className="
          relative
          w-full
          h-105
          lg:h-130
          bg-surface
          border border-border
          rounded-2xl
          overflow-hidden
          shadow-sm
        "
      >
        <div
          key={displayedImage.src}
          className="absolute inset-0"
        >
          <Image
            src={displayedImage.src}
            alt={displayedImage.alt}
            fill
            priority
            fetchPriority="high"
            unoptimized={isS3Url(displayedImage.src)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 42vw"
            className={`
              object-cover
              transition-all
              duration-350
              ease-out
              hover:scale-[1.03]
              ${isStock === 0 ? "opacity-50" : ""}
            `}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {validImages.length > 3 && startIndex > 0 && (
          <button
            type="button"
            onClick={prevSlide}
            className="p-2 rounded-full border border-border hover:bg-gray-100 transition duration-200 cursor-pointer"
            aria-label="Previous images"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}

        <div className="overflow-hidden w-[264px] lg:w-[356px] flex-shrink-0">
          <div
            className="flex gap-3 transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${startIndex * 92}px)` }}
          >
            {validImages.map((image) => (
              <button
                key={image.src}
                type="button"
                onClick={() => setUserSelection(image)}
                className={`
                  h-20
                  w-20
                  flex-shrink-0
                  rounded-xl
                  overflow-hidden
                  border-2
                  bg-white
                  transition-all
                  duration-300
                  ${
                    displayedImage.src === image.src
                      ? "border-primary shadow-md scale-105"
                      : "border-border hover:border-primary/40 hover:scale-105"
                  }
                `}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={80}
                  height={80}
                  loading="lazy"
                  unoptimized={isS3Url(image.src)}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {validImages.length > 3 && startIndex + 3 < validImages.length && (
          <button
            type="button"
            onClick={nextSlide}
            className="p-2 rounded-full border border-border hover:bg-gray-100 transition duration-200 cursor-pointer"
            aria-label="Next images"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageView;