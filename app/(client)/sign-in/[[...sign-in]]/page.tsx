import React from "react";
import { SignIn} from "@clerk/nextjs";
import AuthLayout from "@/components/auth/AuthLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Sign In | Vault Skin" },
  description: "Sign in to your Vault Skin account to track orders and manage your wishlist.",
  robots: { index: false, follow: false },
};

const clerkAppearance = {
  elements: {
    rootBox: "w-full",
    card: "shadow-none p-0 bg-transparent w-full gap-4",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton:
      "border border-border rounded-[12px] h-10 text-[14px] text-text font-medium hover:bg-bg transition-colors",
    socialButtonsBlockButtonText: "text-[13px] font-medium",
    dividerRow: "my-4",
    dividerLine: "bg-border",
    dividerText: "text-text-muted text-[12px]",
    formFieldLabel: "text-[13px] font-medium text-text mb-1",
    formFieldInput:
      "rounded-[12px] border border-border px-3 h-10 text-[14px] focus:ring-2 focus:ring-accent/60 focus:border-primary outline-none transition-shadow",
    formButtonPrimary:
      "bg-primary hover:bg-primary/90 text-white rounded-[12px] h-10 text-[14px] font-medium normal-case transition-colors w-full mt-2",
    footerAction: "hidden",
    identityPreviewText: "text-[14px]",
    formFieldAction: "text-primary hover:text-primary/80 text-[12px]",
  },
};

export default function SignInPage() {
  return (
    <AuthLayout>
      <div className=" w-full mb-2 bg-primary flex flex-col items-center md:hidden">
        <span className="font-sans text-[18px] tracking-wide text-white font-bold p-2  ">
         Sign In to Vault Enterprises
        </span>
      </div>

   
        <SignIn appearance={clerkAppearance} />

      
    </AuthLayout>
  );
}
