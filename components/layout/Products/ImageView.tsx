"use client";

import { AnimatePresence, m } from "motion/react";
import Image from "next/image";
import { useState, useEffect } from "react";
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

  const [active, setActive] = useState(validImages[0]);
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setVisibleCount(3);
      } else {
        setVisibleCount(4);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync active image with sliding window if necessary, or just keep sliding range bounded
  useEffect(() => {
    if (validImages.length > 0 && !validImages.some(img => img.src === active?.src)) {
      setActive(validImages[0]);
    }
  }, [images, validImages, active]);

  if (!active) return null;

  const nextSlide = () => {
    setStartIndex((prev) => Math.min(prev + 1, validImages.length - visibleCount));
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
        <AnimatePresence mode="wait">
          <m.div
            key={active.src}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
              duration: 0.15,
              ease: "easeInOut",
            }}
            className="absolute inset-0"
          >
            <Image
              src={active.src}
              alt={active.alt}
              fill
              priority
              fetchPriority="high"
              unoptimized={isS3Url(active.src)}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={`
                object-cover
                transition-all
                duration-350
                ease-out
                hover:scale-[1.03]
                ${isStock === 0 ? "opacity-50" : ""}
              `}
            />
          </m.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2">
        {validImages.length > visibleCount && startIndex > 0 && (
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
            {validImages.map((image, index) => (
              <button
                key={image.src}
                type="button"
                onClick={() => setActive(image)}
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
                    active.src === image.src
                      ? "border-primary shadow-md scale-105"
                      : "border-border hover:border-primary/40 hover:scale-105"
                  }
                `}
              >
                 <Image
                  src={image.src}
                  alt={image.alt}
                  width={100}
                  height={100}
                  priority={index === 0}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  loading={index === 0 ? undefined : "lazy"}
                  unoptimized={isS3Url(image.src)}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {validImages.length > visibleCount && startIndex + visibleCount < validImages.length && (
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