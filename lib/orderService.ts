"use client";

import {
  type DocumentData,
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "@/config/firebase.config";

export const paymentMethods = ["cod", "qr"] as const;

export type PaymentMethod = (typeof paymentMethods)[number];

export const paymentStatuses = ["pending", "verified", "rejected"] as const;

export type PaymentStatus = (typeof paymentStatuses)[number];

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;

  address: string;
  city: string;
  district: string;
  zipCode: string;
}

export interface OrderItem {
  productId: string;

  title: string;

  thumbnail: string;

  price: number;

  discount: number;

  quantity: number;

  sku: string;
}

export const customerOrderStatuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type CustomerOrderStatus = (typeof customerOrderStatuses)[number];

export interface OrderTimelineEntry {
  status: CustomerOrderStatus;

  note: string;

  at: Timestamp | null;
}

export interface CustomerOrder {
  id: string;

  orderNumber: string;

  userId: string;

  status: CustomerOrderStatus;

  customer: Pick<ShippingAddress, "fullName" | "phone" | "email">;

  shippingAddress: ShippingAddress;

  payment: {
    method: PaymentMethod;
    verified: boolean;
    status: PaymentStatus;
    transactionId: string;
    paymentScreenshot: string;
  };

  totals: {
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
  };

  items: OrderItem[];

  timeline: OrderTimelineEntry[];

  createdAt: Timestamp | null;

  updatedAt: Timestamp | null;
}

export interface PlaceOrderInput {
  userId: string;

  paymentMethod: PaymentMethod;

  transactionId?: string;

  paymentScreenshot?: string;

  shippingAddress: ShippingAddress;

  items: OrderItem[];
}

const cancelableOrderStatuses: CustomerOrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
];

export const calculateShippingCharge = (district?: string): number => {
  if (!district) return 0;
  const normalizedDistrict = district.trim().toLowerCase();
  return normalizedDistrict === "kathmandu" ? 100 : 200;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const stringValue = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;

const numberValue = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const timestampValue = (value: unknown): Timestamp | null =>
  value instanceof Timestamp ? value : null;

const isPaymentMethod = (value: unknown): value is PaymentMethod =>
  typeof value === "string" &&
  paymentMethods.includes(value as PaymentMethod);

const isPaymentStatus = (value: unknown): value is PaymentStatus =>
  typeof value === "string" &&
  paymentStatuses.includes(value as PaymentStatus);

const isCustomerOrderStatus = (
  value: unknown,
): value is CustomerOrderStatus =>
  typeof value === "string" &&
  customerOrderStatuses.includes(value as CustomerOrderStatus);

const normalizeOrderItem = (value: unknown): OrderItem | null => {
  if (!isRecord(value)) return null;

  return {
    productId: stringValue(value.productId),
    title: stringValue(value.title),
    thumbnail: stringValue(value.thumbnail),
    price: numberValue(value.price),
    discount: numberValue(value.discount),
    quantity: numberValue(value.quantity),
    sku: stringValue(value.sku),
  };
};

const normalizeTimelineEntry = (value: unknown): OrderTimelineEntry | null => {
  if (!isRecord(value)) return null;

  return {
    status: isCustomerOrderStatus(value.status) ? value.status : "pending",
    note: stringValue(value.note),
    at: timestampValue(value.at),
  };
};

const toCustomerOrder = (id: string, data: DocumentData): CustomerOrder => {
  const customer = isRecord(data.customer) ? data.customer : {};
  const shippingAddress = isRecord(data.shippingAddress)
    ? data.shippingAddress
    : {};
  const payment = isRecord(data.payment) ? data.payment : {};
  const totals = isRecord(data.totals) ? data.totals : {};

  return {
    id,
    orderNumber: stringValue(data.orderNumber, id),
    userId: stringValue(data.userId),
    status: isCustomerOrderStatus(data.status) ? data.status : "pending",
    customer: {
      fullName: stringValue(customer.fullName),
      phone: stringValue(customer.phone),
      email: stringValue(customer.email),
    },
    shippingAddress: {
      fullName: stringValue(shippingAddress.fullName),
      phone: stringValue(shippingAddress.phone),
      email: stringValue(shippingAddress.email),
      address: stringValue(shippingAddress.address),
      city: stringValue(shippingAddress.city),
      district: stringValue(shippingAddress.district),
      zipCode: stringValue(shippingAddress.zipCode),
    },
    payment: {
      method: isPaymentMethod(payment.method) ? payment.method : "cod",
      verified: payment.verified === true,
      status: isPaymentStatus(payment.status) ? payment.status : "pending",
      transactionId: stringValue(payment.transactionId),
      paymentScreenshot: stringValue(payment.paymentScreenshot),
    },
    totals: {
      subtotal: numberValue(totals.subtotal),
      discount: numberValue(totals.discount),
      shipping: numberValue(totals.shipping),
      total: numberValue(totals.total),
    },
    items: Array.isArray(data.items)
      ? data.items
          .map(normalizeOrderItem)
          .filter((item): item is OrderItem => item !== null)
      : [],
    timeline: Array.isArray(data.timeline)
      ? data.timeline
          .map(normalizeTimelineEntry)
          .filter((entry): entry is OrderTimelineEntry => entry !== null)
      : [],
    createdAt: timestampValue(data.createdAt),
    updatedAt: timestampValue(data.updatedAt),
  };
};

export const canCustomerCancelOrder = (status: CustomerOrderStatus) =>
  cancelableOrderStatuses.includes(status);

export const getCustomerOrders = async (
  userId: string,
): Promise<CustomerOrder[]> => {
  if (!userId || userId.startsWith("guest-")) {
    throw new Error("Invalid user ID.");
  }

  const ordersSnapshot = await getDocs(
    query(collection(db, "orders"), where("userId", "==", userId)),
  );

  return ordersSnapshot.docs
    .map((order) => toCustomerOrder(order.id, order.data()))
    .sort(
      (first, second) =>
        (second.createdAt?.toMillis() ?? 0) -
        (first.createdAt?.toMillis() ?? 0),
    );
};

export const getCustomerOrder = async (
  orderId: string,
  userId: string,
): Promise<CustomerOrder | null> => {
  if (!userId || userId.startsWith("guest-")) {
    throw new Error("Invalid user ID.");
  }

  const orderSnapshot = await getDoc(doc(db, "orders", orderId));

  if (!orderSnapshot.exists()) return null;

  const order = toCustomerOrder(orderSnapshot.id, orderSnapshot.data());

  return order.userId === userId ? order : null;
};

export const cancelCustomerOrder = async (
  orderId: string,
  userId: string,
): Promise<CustomerOrder> => {
  if (!userId || userId.startsWith("guest-")) {
    throw new Error("Invalid user ID.");
  }

  return runTransaction(db, async (transaction) => {
    const orderRef = doc(db, "orders", orderId);
    const orderSnapshot = await transaction.get(orderRef);

    if (!orderSnapshot.exists()) {
      throw new Error("This order could not be found.");
    }

    const order = toCustomerOrder(orderSnapshot.id, orderSnapshot.data());

    if (order.userId !== userId) {
      throw new Error("You cannot cancel an order that is not yours.");
    }

    if (!canCustomerCancelOrder(order.status)) {
      if (order.status === "shipped") {
        throw new Error(
          "This order has already shipped. Please contact support if you need to cancel it.",
        );
      }

      throw new Error("This order can no longer be cancelled.");
    }

    const cancellationEntry: OrderTimelineEntry = {
      status: "cancelled",
      note: "Order cancelled by customer.",
      at: Timestamp.now(),
    };
    const timeline = [...order.timeline, cancellationEntry];

    transaction.update(orderRef, {
      status: "cancelled",
      timeline,
      updatedAt: serverTimestamp(),
    });

    return {
      ...order,
      status: "cancelled",
      timeline,
    };
  });
};

const generateOrderNumber = () => {
  const now = new Date();

  return `VS-${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    "0",
  )}${String(now.getDate()).padStart(2, "0")}-${Date.now()
    .toString()
    .slice(-6)}`;
};

export const placeOrder = async ({
  userId,
  paymentMethod,
  transactionId,
  paymentScreenshot,
  shippingAddress,
  items,
}: PlaceOrderInput) => {
  if (!userId || userId.startsWith("guest-")) {
    throw new Error("You must be logged in to place an order.");
  }

  if (items.length === 0) {
    throw new Error("Cart is empty.");
  }
  return runTransaction(db, async (transaction) => {
    const productSnapshots: Array<{
      item: OrderItem;
      stock: number;
    }> = [];

    let subtotal = 0;

    let discount = 0;

    for (const item of items) {
      const productRef = doc(db, "products", item.productId);

      const snapshot = await transaction.get(productRef);

      if (!snapshot.exists()) {
        throw new Error(`${item.title} no longer exists.`);
      }

      const product = snapshot.data();

      if (product.stock < item.quantity) {
        throw new Error(
          `${item.title} has only ${product.stock} left in stock.`,
        );
      }

      productSnapshots.push({
        item,
        stock: product.stock,
      });

      subtotal += item.price * item.quantity;

      discount += item.discount * item.quantity;
    }

    const shipping = calculateShippingCharge(shippingAddress.district);

    const total = subtotal - discount + shipping;
    const orderRef = doc(collection(db, "orders"));

    transaction.set(orderRef, {
      orderNumber: generateOrderNumber(),

      userId,

      status: "pending",

      customer: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        email: shippingAddress.email,
      },

      shippingAddress,

      payment: {
        method: paymentMethod,
        verified: false,
        status: "pending",
        transactionId: transactionId ?? "",
        paymentScreenshot: paymentScreenshot ?? "",
      },

      totals: {
        subtotal,

        discount,

        shipping,

        total,
      },

      items,

      timeline: [
        {
          status: "pending",

          note: "Order placed successfully.",

          at: Timestamp.now(),
        },
      ],

      createdAt: serverTimestamp(),

      updatedAt: serverTimestamp(),
    });

    for (const { item, stock } of productSnapshots) {
      const productRef = doc(db, "products", item.productId);

      transaction.update(productRef, {
        stock: stock - item.quantity,
      });
    }

    for (const item of items) {
      const cartRef = doc(db, "carts", userId, "items", item.productId);

      transaction.delete(cartRef);
    }
    return orderRef.id;
  });
};

/**
 * Subscribe to real-time order updates for a user.
 * Returns an unsubscribe function — call it on cleanup.
 */
export const listenFirestoreOrders = (
  userId: string,
  callback: (orders: CustomerOrder[]) => void,
) => {
  const q = query(collection(db, "orders"), where("userId", "==", userId));

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs
      .map((orderDoc) => toCustomerOrder(orderDoc.id, orderDoc.data()))
      .sort(
        (a, b) =>
          (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0),
      );

    callback(orders);
  });
};