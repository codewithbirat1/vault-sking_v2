"use client";

import { collection, onSnapshot } from "firebase/firestore";
import Title from "../Products/Title";
import type { Category } from "@/data/products";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/config/firebase.config";
import { getCategoryProductCount } from "@/utils/helper";

const HomeCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let latestRequest = 0;

    const unsubscribe = onSnapshot(
      collection(db, "categories"),
      async (snapshot) => {
        const requestId = ++latestRequest;
        const rawDocs = snapshot.docs.map((doc) => ({
          ...(doc.data() as Category),
          _id: doc.id,
        }));

        const withCounts = await Promise.all(
          rawDocs.map(async (cat) => {
            try {
              const productCount = await getCategoryProductCount(cat._id);
              return { ...cat, productCount };
            } catch (error) {
              console.error(
                `Failed to load product count for category "${cat._id}"`,
                error,
              );
              return cat;
            }
          }),
        );

        if (requestId !== latestRequest) return;

        setCategories((previousCategories) =>
          withCounts.map((category) => {
            if (typeof category.productCount === "number") return category;

            const previousCount = previousCategories.find(
              (previous) => previous._id === category._id,
            )?.productCount;

            return previousCount === undefined
              ? category
              : { ...category, productCount: previousCount };
          }),
        );
        setIsLoading(false);
      },
      (error) => {
        console.error(error);
        setIsLoading(false);
      }
    );

    return () => {
      latestRequest += 1;
      unsubscribe();
    };
  }, []);

  return (
    <section className="w-full bg-surface p-3 md:p-5 lg:p-7 rounded-2xl">
      <div className="mb-6 flex items-center justify-between border-b border-grey/60 pb-3">
        <Title className="text-accent">Popular Categories</Title>
        <Link
          href="/shop"
          className="text-sm font-semibold tracking-wide transition-colors hover:text-primary"
        >
          View all
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-bg p-5 flex items-center gap-3 rounded-lg animate-pulse"
              >
                <div className="w-20 h-20 bg-neutral-200/80 dark:bg-neutral-800/80 rounded shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-neutral-200/80 dark:bg-neutral-800/80 rounded w-2/3" />
                  <div className="h-3 bg-neutral-200/60 dark:bg-neutral-800/60 rounded w-1/2" />
                </div>
              </div>
            ))
          : categories?.map((category) => (
              <div
                key={category?._id}
                className="bg-bg p-5 flex items-center gap-3 group rounded-lg"
              >
                {category?.image && category.image.trim().length > 0 && (
                  <div className="overflow-hidden border border-accent/30 hover:border-accent hoverEffect w-20 h-20 p-1 shrink-0 rounded">
                    <Link href={`/category/${category?.slug?.current}`} className="block w-full h-full relative">
                      <Image
                        src={category?.image}
                        alt={category?.title || "Category"}
                        width={80}
                        height={80}
                        className="w-full h-full object-contain group-hover:scale-110 hoverEffect"
                      />
                    </Link>
                  </div>
                )}
                <div className="space-y-1">
                  <h3 className="text-base font-semibold">{category?.title}</h3>
                  <p className="text-sm">
                    <span className="font-bold text-primary">
                      {`(${category?.productCount ?? "—"})`}
                    </span>{" "}
                    items Available
                  </p>
                </div>
              </div>
            ))}
      </div>
    </section>
  );
};

export default HomeCategories;
