import { auth } from "@clerk/nextjs/server";
import OrderDetailClient from "@/components/layout/Order/OrderDetailClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Order Details | Vault Skin" },
  description: "View details and status for your Vault Skin order.",
  robots: { index: false, follow: false },
};

export default async function Page() {
  await auth.protect();
  return <OrderDetailClient />;
}
