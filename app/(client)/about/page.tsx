import Hero from "@/components/layout/About/Hero";
import Story from "@/components/layout/About/Story";
import Founder from "@/components/layout/About/Founder";
import Features from "@/components/layout/About/Features";
import PartnerBrand from "@/components/layout/About/PartnerBrand";
import MissionVision from "@/components/layout/About/MissionVision";
import Values from "@/components/layout/About/Values";
import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "About | Vault Skin" },
  description: "Learn more about Vault Skin, your trusted destination for authentic skincare products in Nepal.",
  alternates: { canonical: canonicalUrl("/about") },
  openGraph: {
    title: "About | Vault Skin",
    description:
      "Learn more about Vault Skin, your trusted destination for authentic skincare products in Nepal.",
    url: canonicalUrl("/about"),
  },
};

const AboutPage = () => {
  return (
    <main className="flex flex-col gap-6 md:gap-10 overflow-hidden bg-bg">
      <Hero />
      <Story />
      <Founder />
      <PartnerBrand />
      <Features />

      {/* Unified Mission, Vision, and Values Section */}
      <section className="bg-surface/30 py-6 md:py-10 border-y border-border/5">
        <div className="flex flex-col gap-4 md:gap-6">
          <MissionVision />
          <Values />
        </div>
      </section>

    </main>
  );
};

export default AboutPage;
