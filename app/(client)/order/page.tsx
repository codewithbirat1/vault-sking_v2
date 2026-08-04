"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { ChevronRight, FileX, Package, ReceiptText } from "lucide-react";
import Container from "@/components/Container";

import PriceFormatter from "@/components/layout/Products/PriceFormatter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type CustomerOrder,
  type CustomerOrderStatus,
  getCustomerOrders,
} from "@/lib/orderService";

const statusClassName: Record<CustomerOrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-sky-100 text-sky-800",
  processing: "bg-violet-100 text-violet-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

const formatStatus = (status: CustomerOrderStatus) =>
  `${status.charAt(0).toUpperCase()}${status.slice(1)}`;

const orderDateFormatter = new Intl.DateTimeFormat("en-NP", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatOrderDate = (order: CustomerOrder) => {
  if (!order.createdAt) return "Date unavailable";

  return orderDateFormatter.format(order.createdAt.toDate());
};

const OrdersPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !user?.id) return;

    let isCurrent = true;

    const loadOrders = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const customerOrders = await getCustomerOrders(user.id);

        if (isCurrent) setOrders(customerOrders);
      } catch (loadError) {
        console.error("Unable to load customer orders:", loadError);

        if (isCurrent) {
          setError("We could not load your orders. Please try again.");
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    loadOrders();

    return () => {
      isCurrent = false;
    };
  }, [isLoaded, isSignedIn, user?.id]);

  if (!isLoaded) {
    return (
      <Container className="py-10">
        <Skeleton className="h-9 w-40" />
        <div className="mt-8 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </Container>
    );
  }

  if (!isSignedIn || !user?.id) {
    return null;
  }

  return (
    <Container className="py-10 sm:py-14">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Account</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">My orders</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            View your purchases, delivery progress, and order details.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-surface"
        >
          Continue shopping
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="font-medium">{error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-14 text-center">
            <FileX className="h-14 w-14 text-muted-foreground" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-semibold">No orders yet</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              When you place an order, it will appear here with its delivery
              status and details.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              Browse products
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/order/${encodeURIComponent(order.id)}`}
              className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Card className="transition-colors hover:border-primary/40 hover:bg-surface/40">
                <CardContent className="flex flex-col gap-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <ReceiptText className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{order.orderNumber}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatOrderDate(order)} · {order.items.length} item
                        {order.items.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-5 sm:justify-end">
                    <div className="text-left sm:text-right">
                      <PriceFormatter amount={order.totals.total} />
                      <span
                        className={`mt-2 block w-fit rounded-full px-2.5 py-1 text-xs font-semibold sm:ml-auto ${statusClassName[order.status]}`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </div>
                    <ChevronRight
                      className="h-5 w-5 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 flex items-center gap-2 rounded-lg bg-surface/60 px-4 py-3 text-sm text-muted-foreground">
        <Package className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        Select an order to see its items, delivery address, and full status
        history.
      </div>
    </Container>
  );
};

export default OrdersPage;
