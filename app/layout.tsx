import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";
import { Agentation } from "agentation";
import { ClerkProvider } from "@clerk/nextjs";
import { ChatwootWidget } from "@/components/ChatwootWidget";
import Script from "next/script";

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

        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#000000",
              color: "#fff",
            },
          }}
        />
        {process.env.NODE_ENV === "development" && <Agentation />}
        <ChatwootWidget />
        <Script
          id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid="ae4e65e4-8ec5-4a80-a503-172b15ffc381"
          data-blockingmode="auto"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
};

export default RootLayout;
