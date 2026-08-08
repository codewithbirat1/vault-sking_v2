import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";
import { Agentation } from "agentation";
import { ClerkProvider } from "@clerk/nextjs";
import { ChatwootWidget } from "@/components/ChatwootWidget";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

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
      </body>
    </html>
  );
};

export default RootLayout;
