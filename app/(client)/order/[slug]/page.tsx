import { auth } from "@clerk/nextjs/server";
import OrderDetailClient from "@/components/layout/Order/OrderDetailClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Details | Vault Skin",
  description: "View details and status for your Vault Skin order.",
};

export default async function Page() {
  await auth.protect();
  return <OrderDetailClient />;
}
