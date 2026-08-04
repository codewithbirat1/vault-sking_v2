"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

import {
  type CustomerOrder,
  listenFirestoreOrders,
} from "@/lib/orderService";

export const useOrders = () => {
  const { user, isSignedIn } = useUser();

  // null = still loading
  const [orders, setOrders] = useState<CustomerOrder[] | null>(null);

  useEffect(() => {
    if (!isSignedIn || !user) {
      return;
    }

    const unsubscribe = listenFirestoreOrders(user.id, (freshOrders: CustomerOrder[]) => {
      setOrders(freshOrders);
    });

    return unsubscribe;
  }, [isSignedIn, user]);

  const resolvedOrders = isSignedIn ? (orders ?? []) : [];

  return {
    orders: resolvedOrders,
    loading: isSignedIn && orders === null,
    orderCount: resolvedOrders.length,
  };
};