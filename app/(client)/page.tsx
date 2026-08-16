import HomeBanner from "@/components/layout/HeroBanner";
import HomeClient from "@/components/HomeClient";
import LatestBlog from "@/components/layout/Blogs/LatestBlog";
import Container from "@/components/Container";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to Vault Skin, your destination for premium skincare products.",
};

export default function Page() {
  return (
    <>
      <HomeBanner />

      <Container className="py-8 md:py-12 flex flex-col gap-4 md:gap-6">
        <HomeClient />
        <LatestBlog />
      </Container>
    </>
  );
}