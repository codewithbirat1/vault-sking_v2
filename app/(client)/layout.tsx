export const revalidate = 0;

import Navbar from "@/components/layout/Navbar/Navbar";
import "../globals.css";
import FooterWrapper from "@/components/layout/Footer/FooterWrapper";
import Header from "@/components/layout/Navbar/Header";

export const metadata = {
  title: "VaultSkin – Skincare & Beauty Products in Nepal",
  description:
    "Shop authentic skincare and beauty products in Nepal at VaultSkin. Discover SkinInspired and trusted brands, including sunscreens, serums, moisturizers, face washes and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Navbar />
      <main className="flex-1">{children}</main>
      <FooterWrapper />
    </div>
  );
}
