"use client";

import dynamic from "next/dynamic";
import Image from "next/image";

const SwiperBanner = dynamic(() => import("./SwiperBanner"), {
  ssr: false,
  loading: () => (
    <div className="w-full">
      <div className="block xl:hidden">
        <Image
          src="https://ik.imagekit.io/vault088/vault/6.webp?tr=w-1080,q-80,f-auto"
          alt="Featured promotion"
          width={1080}
          height={1350}
          priority
          fetchPriority="high"
          sizes="100vw"
          className="h-[clamp(220px,55vw,480px)] w-full object-cover object-center"
        />
      </div>
      <div className="hidden xl:block">
        <Image
          src="https://ik.imagekit.io/vault088/vault/1.svg"
          alt="Featured promotion"
          width={1920}
          height={680}
          priority
          fetchPriority="high"
          sizes="100vw"
          className="h-[clamp(280px,50svh,680px)] w-full object-cover object-center"
        />
      </div>
    </div>
  ),
});

export default function HomeBanner() {
  return <SwiperBanner />;
}