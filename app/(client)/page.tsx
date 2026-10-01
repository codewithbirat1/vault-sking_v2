import { Suspense } from "react";
import HomeBanner from "@/components/layout/HeroBanner";
import HomeClient from "@/components/HomeClient";
import LatestBlog from "@/components/layout/Blogs/LatestBlog";
import Container from "@/components/Container";

import { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Skincare & Beauty Products in Nepal",
  description:
    "Discover skincare and beauty products at VaultSkin, featuring SkinInspired and trusted brands. Shop quality sunscreen, serums, moisturizers and more in Nepal.",
};

const LatestBlogSkeleton = () => (
  <div className="w-full animate-pulse my-4">
    <div className="h-6 w-36 bg-neutral-200/80 dark:bg-neutral-800/80 rounded mb-6" />

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg overflow-hidden space-y-3">
          <div className="aspect-16/10 bg-neutral-200/80 dark:bg-neutral-800/80 rounded" />

          <div className="h-4 bg-neutral-200/80 dark:bg-neutral-800/80 rounded w-3/4" />

          <div className="h-3 bg-neutral-200/60 dark:bg-neutral-800/60 rounded w-1/2" />
        </div>
      ))}
    </div>
  </div>
);

export default function Page() {
  return (
    <>
      <HomeBanner />

      <Container className="py-8 md:py-12 flex flex-col gap-4 md:gap-6">
        <HomeClient />

        <Suspense fallback={<LatestBlogSkeleton />}>
          <LatestBlog />
        </Suspense>
      </Container>
    </>
  );
}
