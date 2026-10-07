import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "Hot Deals | Vault Skin" },
  description:
    "Explore current skincare offers and discounted products from Vault Skin.",
  alternates: { canonical: canonicalUrl("/deal") },
  openGraph: {
    title: "Hot Deals | Vault Skin",
    description:
      "Explore current skincare offers and discounted products from Vault Skin.",
    url: canonicalUrl("/deal"),
  },
};

export default function DealLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
