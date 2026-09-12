"use client";

import React from "react";
import dynamic from "next/dynamic";

const PrivacyPolicyDialog = dynamic(
  () => import("@/components/legal/PrivacyPolicyDialog").then((mod) => mod.PrivacyPolicyDialog),
  { ssr: false }
);

const TermsDialog = dynamic(
  () => import("@/components/legal/TermsDialog").then((mod) => mod.TermsDialog),
  { ssr: false }
);

export function FooterTermsLink({ children }: { children: React.ReactNode }) {
  return <TermsDialog>{children}</TermsDialog>;
}

export function FooterPrivacyLink({ children }: { children: React.ReactNode }) {
  return <PrivacyPolicyDialog>{children}</PrivacyPolicyDialog>;
}
