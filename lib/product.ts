import { db } from "@/config/firebase.config";
import { cache } from "react";
import { collection, getDocs } from "firebase/firestore";
import type { Category, Product } from "@/data/products";

export const fetchProducts = cache(async (): Promise<Product[]> => {
  const snapshot = await getDocs(collection(db, "products"));

  return snapshot.docs.map((doc) => ({
    _id: doc.id,
    ...(doc.data() as Omit<Product, "_id">),
  }));
});

export const fetchCategories = cache(async (): Promise<Category[]> => {
  const snapshot = await getDocs(collection(db, "categories"));

  return snapshot.docs.flatMap((doc) => {
    const data = doc.data();
    const slug = data.slug?.current;
    const title =
      typeof data.title === "string"
        ? data.title
        : typeof data.name === "string"
          ? data.name
          : "";

    if (typeof slug !== "string" || !slug.trim() || !title.trim()) {
      return [];
    }

    return [
      {
        _id: doc.id,
        title,
        slug: { current: slug },
        description:
          typeof data.description === "string" ? data.description : "",
        image: typeof data.image === "string" ? data.image : "",
      },
    ];
  });
});
