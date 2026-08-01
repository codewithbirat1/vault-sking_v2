import { useState, useEffect, useMemo, useCallback } from "react";
import debounce from "lodash.debounce";
import { SearchResult } from "@/types/search";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { Product } from "@/data/products";
import { getSafeImageSrc } from "@/lib/image";
import Fuse from "fuse.js";

export function useSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          ...(doc.data() as Omit<Product, "_id">),
          _id: doc.id,
        }));

        setAllProducts(data);
      },
      (error) => {
        console.error(error);
      },
    );

    return unsubscribe;
  }, []);

  const fuse = useMemo(() => {
    const searchData = allProducts.map((p) => ({
      id: p._id,
      name: p.name,
      slug: p.slug.current,
      price: p.price.toString(),
      imageUrl: getSafeImageSrc(p.images?.[0]?.src || p.images?.[0]?.url || p.thumbnail),
      category: p.category,
      brand: p.brand,
      variant: p.variant || "",
      status: p.status || null,
      rating: p.ratings,
      tags: p.tags || [],
    }));

    return new Fuse(searchData, {
      keys: [
        { name: "name", weight: 0.5 },
        { name: "slug", weight: 0.1 },
        { name: "category", weight: 0.15 },
        { name: "brand", weight: 0.15 },
        { name: "tags", weight: 0.1 },
      ],
      threshold: 0.35,
      ignoreLocation: true,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
    });
  }, [allProducts]);

  const fetchResults = useCallback((searchTerm: string) => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      setResults([]);
      setLoading(false);
      setError(null);
      setHighlightedIndex(-1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fuseResults = fuse.search(searchTerm);
      const ranked: SearchResult[] = fuseResults.map((res) => ({
        ...res.item,
        matches: res.matches as any,
      }));
      setResults(ranked);
      setHighlightedIndex(-1);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error fetching results";
      setError(msg);
      setResults([]);
      setHighlightedIndex(-1);
    } finally {
      setLoading(false);
    }
  }, [fuse]);

  const debouncedFetch = useMemo(
    () =>
      debounce((searchTerm: string) => {
        fetchResults(searchTerm);
      }, 150),
    [fetchResults],
  );

  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

  const onArrowDown = () => {
    setHighlightedIndex((prev) => {
      const next = prev + 1;
      return next >= results.length ? results.length - 1 : next;
    });
  };

  const onArrowUp = () => {
    setHighlightedIndex((prev) => {
      const next = prev - 1;
      return next < 0 ? 0 : next;
    });
  };

  const onEnter = (onSubmit: (q: string) => void) => {
    if (highlightedIndex >= 0 && highlightedIndex < results.length) {
      onSubmit(results[highlightedIndex].name);
    }
  };

  useEffect(() => {
    debouncedFetch(query);
    return () => {
      debouncedFetch.cancel();
    };
  }, [query, debouncedFetch]);

  return {
    results,
    loading,
    error,
    highlightedIndex,
    setHighlightedIndex,
    onArrowDown,
    onArrowUp,
    onEnter,
    allProducts, // Expose allProducts for suggestions or similar products
  };
}
