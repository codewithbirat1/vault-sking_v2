"use client";

import { useEffect, useMemo, useState } from "react";
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

const CategoryProducts = ({ categories, slug }: Props) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const router = useRouter();

  const normalizedSlug = useMemo(() => {
    const mapping: Record<string, string> = {
      sunscreens: "sunscreen",
      cleansers: "facewash",
    };
    return mapping[slug.toLowerCase()] || slug;
  }, [slug]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "categories"), where("slug.current", "==", normalizedSlug)),
      (snapshot) => {
        const matchedCategory = snapshot.docs[0];
        setCategoryId(matchedCategory?.id ?? null);
      },
      (error) => {
        console.error(error);
      },
    );

    return unsubscribe;
  }, [normalizedSlug]);

  const filteredProducts = useMemo(() => {
    if (!categoryId) return [];

    return products.filter((product) => product.category === categoryId);
  }, [categoryId, products]);

  useEffect(() => {
    if (!categoryId) return;

    const unsubscribe = onSnapshot(
      query(collection(db, "products"), where("category", "==", categoryId)),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          ...(doc.data() as Omit<Product, "_id">),
          _id: doc.id,
        }));

        setProducts(data);
      },
      (error) => {
        console.error(error);
      },
    );

    return unsubscribe;
  }, [categoryId]);

  const handleCategoryChange = (newSlug: string) => {
    if (newSlug === slug) return;
    router.push(`/category/${newSlug}`, { scroll: false });
  };

  return (
    <div className="py-5 flex flex-col md:flex-row items-start gap-5 text-text">
      <div className="flex flex-col md:min-w-40 border border-border bg-surface rounded-md overflow-hidden">
        {categories.map((cat) => {
          const slugVal = cat.slug?.current;
          if (!slugVal) return null;

          const isActive = slugVal === slug;

          return (
            <Button
              key={cat._id}
              onClick={() => handleCategoryChange(slugVal)}
              className={`bg-transparent border-0 p-0 rounded-none shadow-none w-full text-left px-3 py-2 transition-colors border-b border-border last:border-b-0 hover:bg-primary hover:text-white ${isActive ? "bg-primary text-white" : "text-text"}`}
            >
              {cat.title}
            </Button>
          );
        })}
      </div>

      <div className="flex-1">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            <AnimatePresence>
              {filteredProducts.map((p) => (
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
