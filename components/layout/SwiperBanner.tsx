"use client";

import { A11y, Autoplay, Keyboard, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import Link from "next/link";

import "swiper/css";
import "swiper/css/pagination";

type Banner = {
  id: string;
  src: string;
  alt: string;
  href: string;
};

const desktopBanners: Banner[] = [
  {
    id: "hydrating-serum",
    src: "https://ik.imagekit.io/vault088/vault/1.svg",
    alt: "Hydrating serum collection",
    href: "/product/skininspired-desqua-mate-aha-bha-pha-serum-refill-30ml",
  },
  {
    id: "vitamin-c-range",
    src: "https://ik.imagekit.io/vault088/vault/2.svg",
    alt: "Vitamin C range",
    href: "/product/foaming-face-wash-100ml-for-normal-dry-or-sensitive-skin",
  },
  {
    id: "spf-moisturizer",
    src: "https://ik.imagekit.io/vault088/vault/3.svg",
    alt: "SPF moisturizer",
    href: "/product/skininspired-care-addict-sunscreen-50-pa-encapsulated-sunscreen-and-water-resistant-50g",
  },
  {
    id: "gift-sets",
    src: "https://ik.imagekit.io/vault088/vault/4.svg",
    alt: "Gift sets",
    href: "/product/01-retinol-night-cream-50g-for-anti-aging-encapsulated-retinolvitalease-shea-and-cocoa-butter",
  },
  {
    id: "skincare-collection",
    src: "https://ik.imagekit.io/vault088/vault/5.svg",
    alt: "Skincare collection",
    href: "/product/skininspired-vitamin-c-serum-for-face-30ml-dive-in-c-20",
  },
];

const mobileBanners: Banner[] = [
  {
    id: "hydrating-serum",
    src: "https://ik.imagekit.io/vault088/vault/6.webp?tr=w-1080,q-80,f-auto",
    alt: "Hydrating serum collection",
    href: "/product/skininspired-desqua-mate-aha-bha-pha-serum-refill-30ml",
  },
  {
    id: "vitamin-c-range",
    src: "https://ik.imagekit.io/vault088/vault/7.webp?tr=w-1080,q-80,f-auto",
    alt: "Vitamin C range",
    href: "/product/foaming-face-wash-100ml-for-normal-dry-or-sensitive-skin",
  },
  {
    id: "spf-moisturizer",
    src: "https://ik.imagekit.io/vault088/vault/8.webp?tr=w-1080,q-80,f-auto",
    alt: "SPF moisturizer",
    href: "/product/skininspired-care-addict-sunscreen-50-pa-encapsulated-sunscreen-and-water-resistant-50g",
  },
  {
    id: "gift-sets",
    src: "https://ik.imagekit.io/vault088/vault/9.webp?tr=w-1080,q-80,f-auto",
    alt: "Gift sets",
    href: "/product/01-retinol-night-cream-50g-for-anti-aging-encapsulated-retinolvitalease-shea-and-cocoa-butter",
  },
  {
    id: "skincare-collection",
    src: "https://ik.imagekit.io/vault088/vault/10.webp?tr=w-1080,q-80,f-auto",
    alt: "Skincare collection",
    href: "/product/skininspired-vitamin-c-serum-for-face-30ml-dive-in-c-20",
  },
];

const swiperConfig = {
  modules: [Autoplay, Pagination, A11y, Keyboard],
  slidesPerView: 1,
  loop: true,
  speed: 800,
  autoplay: {
    delay: 5000,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
  },
  pagination: {
    clickable: true,
  },
  keyboard: {
    enabled: true,
  },
};

export default function SwiperBanner() {
  return (
    <section className="w-full cursor-pointer" aria-label="Featured promotions">
      <div className="block xl:hidden">
        <Swiper {...swiperConfig}>
          {mobileBanners.map((banner, index) => {
            const isPriority = index === 0;
            return (
              <SwiperSlide key={banner.id}>
                <Link
                  href={banner.href}
                  className="block"
                  aria-label={`Shop ${banner.alt}`}
                >
                  <Image
                    src={banner.src}
                    alt={banner.alt}
                    width={1080}
                    height={1350}
                    priority={isPriority}
                    fetchPriority={isPriority ? "high" : "auto"}
                    loading={isPriority ? "eager" : "lazy"}
                    unoptimized={banner.src.includes(".svg")}
                    sizes="100vw"
                    className="h-[clamp(220px,55vw,480px)] w-full object-cover object-center"
                  />
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      <div className="hidden xl:block">
        <Swiper {...swiperConfig}>
          {desktopBanners.map((banner, index) => {
            const isPriority = index === 0;
            return (
              <SwiperSlide key={banner.id}>
                <Link
                  href={banner.href}
                  className="block"
                  aria-label={`Shop ${banner.alt}`}
                >
                  <Image
                    src={banner.src}
                    alt={banner.alt}
                    width={1920}
                    height={680}
                    priority={isPriority}
                    fetchPriority={isPriority ? "high" : "auto"}
                    loading={isPriority ? "eager" : "lazy"}
                    unoptimized={banner.src.includes(".svg")}
                    sizes="100vw"
                    className="h-[clamp(280px,50svh,680px)] w-full object-cover object-center"
                  />
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}