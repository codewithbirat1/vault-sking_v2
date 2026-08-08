"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, m } from "motion/react";
import { Button } from "@/components/ui/button";
import NoProductFound from "@/components/layout/Products/NoProductFound";
import ProductCard from "@/components/layout/Products/ProductCard";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import type { Category, Product } from "@/data/products";

interface Props {
  categories: Category[];
  slug: string;
}

/** Skeleton card — matches the ProductCard aspect ratio */
const ProductSkeleton = () => (
  <div className="flex flex-col gap-2 animate-pulse">
    <div className="aspect-[4/5.4] rounded-md bg-border/40 w-full" />
    <div className="h-3 rounded bg-border/40 w-3/4" />
    <div className="h-3 rounded bg-border/40 w-1/2" />
  </div>
);

const CategoryProducts = ({ categories, slug }: Props) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  // Start as loading — data for this slug hasn't been resolved yet
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const normalizedSlug = useMemo(() => {
    const mapping: Record<string, string> = {
      sunscreens: "sunscreen",
      cleansers: "facewash",
    };
    return mapping[slug.toLowerCase()] || slug;
  }, [slug]);

  // When the slug changes, immediately reset to a fresh loading state
  // so the grid shows skeletons instead of stale or empty content.
  useEffect(() => {
    setIsLoading(true);
    setProducts([]);
    setCategoryId(null);
  }, [normalizedSlug]);

  // Step 1 — resolve normalizedSlug → categoryId
  useEffect(() => {
    let isCurrent = true;

    const unsubscribe = onSnapshot(
      query(collection(db, "categories"), where("slug.current", "==", normalizedSlug)),
      (snapshot) => {
        if (!isCurrent) return;
        const match = snapshot.docs[0];
        setCategoryId(match?.id ?? null);
        // No matching category in DB → stop loading immediately
        if (!match) setIsLoading(false);
      },
      (error) => {
        console.error(error);
        if (isCurrent) setIsLoading(false);
      },
    );

    return () => {
      isCurrent = false;
      unsubscribe();
    };
  }, [normalizedSlug]);

  // Step 2 — fetch products for the resolved categoryId
  useEffect(() => {
    if (!categoryId) return;

    let isCurrent = true;

    const unsubscribe = onSnapshot(
      query(collection(db, "products"), where("category", "==", categoryId)),
      (snapshot) => {
        if (!isCurrent) return;
        const data = snapshot.docs.map((doc) => ({
          ...(doc.data() as Omit<Product, "_id">),
          _id: doc.id,
        }));
        setProducts(data);
        setIsLoading(false);
      },
      (error) => {
        console.error(error);
        if (isCurrent) setIsLoading(false);
      },
    );

    return () => {
      isCurrent = false;
      unsubscribe();
    };
  }, [categoryId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close dropdown on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleCategoryChange = (newSlug: string) => {
    if (newSlug === slug) return;
    router.push(`/category/${newSlug}`, { scroll: false });
  };

  const activeCategory = categories.find((cat) => cat.slug?.current === slug);
  const activeTitle = activeCategory ? activeCategory.title : "Select Category";

  const SKELETON_COUNT = 8;

  return (
    <div className="py-5 flex flex-col md:flex-row items-start gap-6 text-text">
      {/* Mobile Dropdown */}
      <div ref={dropdownRef} className="w-full md:hidden relative z-30">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-surface border border-border rounded-xl text-left font-medium text-sm text-text shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 cursor-pointer"
        >
          <span>Category: {activeTitle}</span>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-40">
            <div className="px-4 py-2.5 text-xs font-semibold text-gray-500 border-b border-border bg-bg/50">
              Select Category
            </div>
            <div className="max-h-60 overflow-y-auto">
              {categories.map((cat) => {
                const slugVal = cat.slug?.current;
                if (!slugVal) return null;
                const isActive = slugVal === slug;
                return (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => {
                      handleCategoryChange(slugVal);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-3 text-sm text-left transition-colors border-b border-border last:border-b-0 cursor-pointer ${
                      isActive ? "bg-primary/5 text-primary font-semibold" : "text-text hover:bg-bg"
                    }`}
                  >
                    <span className="w-4 flex items-center justify-center shrink-0">
                      {isActive && (
                        <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <span>{cat.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col md:w-56 border border-border bg-surface rounded-xl overflow-hidden shadow-sm shrink-0">
        {categories.map((cat) => {
          const slugVal = cat.slug?.current;
          if (!slugVal) return null;
          const isActive = slugVal === slug;
          return (
            <Button
              key={cat._id}
              onClick={() => handleCategoryChange(slugVal)}
              className={`bg-transparent border-0 p-0 rounded-none shadow-none w-full text-left px-5 py-3.5 text-base transition-colors border-b border-border last:border-b-0 hover:bg-primary hover:text-white cursor-pointer ${
                isActive ? "bg-primary text-white font-semibold" : "text-text"
              }`}
            >
              {cat.title}
            </Button>
          );
        })}
      </div>

      {/* Product Grid */}
      <div className="flex-1 w-full">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            <AnimatePresence>
              {products.map((p) => (
                <m.div key={p._id} layout>
                  <ProductCard product={p} />
                </m.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <NoProductFound selectedTab={slug} />
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;
