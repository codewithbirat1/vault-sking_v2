import { Metadata } from "next";
import { canonicalUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "Contact | Vault Skin" },
  description: "Get in touch with Vault Skin. We are here to help you with your skincare journey.",
  alternates: { canonical: canonicalUrl("/contact") },
  openGraph: {
    title: "Contact | Vault Skin",
    description:
      "Get in touch with Vault Skin. We are here to help you with your skincare journey.",
    url: canonicalUrl("/contact"),
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
