import { auth } from "@clerk/nextjs/server";
import OrdersClient from "@/components/layout/Order/OrdersClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Orders | Vault Skin",
  description: "View your purchases, delivery progress, and order details.",
};

export default async function Page() {
  await auth.protect();
  return <OrdersClient />;
}
