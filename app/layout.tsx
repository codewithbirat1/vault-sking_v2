import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ToastProvider } from "@/components/ui/ToastProvider";
import Providers from "./providers";
import { ClerkProvider } from "@clerk/nextjs";
import { ChatwootWidget } from "@/components/ChatwootWidget";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? `https://${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}`
  : "https://vaultskin.co";

export const metadata = {
  metadataBase: new URL(baseUrl),

  title: {
    default:
      "VaultSkin – Skincare & Beauty Products in Nepal | Quality Skincare",
    template: "%s | VaultSkin",
  },

  description:
    "Discover skincare and beauty products at VaultSkin, featuring SkinInspired and trusted brands. Shop quality sunscreen, serums, moisturizers and more in Nepal.",

  keywords: [
    "skincare products Nepal",
    "beauty products Nepal",
    "VaultSkin Nepal",
    "SkinInspired Nepal",
    "skincare store Nepal",
    "skincare shop Nepal",
    "beauty store Nepal",
    "cosmetics Nepal",
    "sunscreen Nepal",
    "serum Nepal",
    "moisturizer Nepal",
    "face wash Nepal",
    "SkinInspired products",
    "Korean skincare Nepal",
  ],

  authors: [
    {
      name: "VaultSkin",
      url: baseUrl,
    },
  ],

  creator: "VaultSkin",
  publisher: "VaultSkin",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    title:
      "VaultSkin – Skincare & Beauty Products in Nepal | Quality Skincare",

    description:
      "Discover skincare and beauty products at VaultSkin, featuring SkinInspired and trusted brands. Shop quality sunscreen, serums, moisturizers and more in Nepal.",

    url: baseUrl,

    siteName: "VaultSkin",

    locale: "en_NP",

    type: "website",

    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "VaultSkin – Skincare & Beauty Products in Nepal",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "VaultSkin – Skincare & Beauty Products in Nepal",

    description:
      "Discover authentic skincare and beauty products from trusted brands at VaultSkin.",

    images: ["/og-image.jpg"],
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

const RootLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <html
      lang="en"
      className={font.variable}
      data-scroll-behavior="smooth"
    >
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
