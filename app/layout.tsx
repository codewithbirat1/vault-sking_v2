import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import { ToastProvider } from "@/components/ui/ToastProvider";
import Providers from "./providers";
import { ClerkProvider } from "@clerk/nextjs";
import { ChatwootWidget } from "@/components/ChatwootWidget";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? `https://${process.env.NEXT_PUBLIC_SITE_URL}`
  : "https://vaultskin.co";

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Vault Skin",
    template: "%s | Vault Skin",
  },
  description: "Dermatologist-developed skincare and beauty products.",
  openGraph: {
    title: "Vault Skin",
    description: "Dermatologist-developed skincare and beauty products.",
    url: baseUrl,
    siteName: "Vault Skin",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vault Skin",
    description: "Dermatologist-developed skincare and beauty products.",
  },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" className={font.variable} data-scroll-behavior="smooth">
      <body
        className="font-poppins antialiased"
        suppressHydrationWarning={true}
      >
        <ClerkProvider>
          <Providers>{children}</Providers>
        </ClerkProvider>

        <ToastProvider />

        <ChatwootWidget />

        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;
