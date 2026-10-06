import { useState, useEffect, useMemo, useCallback } from "react";
import { SearchResult } from "@/types/search";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { Product } from "@/data/products";
import { getSafeImageSrc } from "@/lib/image";
import Fuse, { type FuseResultMatch } from "fuse.js";

type SearchIndexEntry = SearchResult & {
  nameCompact: string;
  slugCompact: string;
  brandCompact: string;
  categoryCompact: string;
  variantCompact: string;
  tagsCompact: string[];
};

const PRODUCT_CACHE_TTL = 60_000;
const SEARCH_DEBOUNCE_MS = 200;
const MAX_SEARCH_RESULTS = 20;

let cachedProducts: Product[] | null = null;
let cachedAt = 0;
let productRequest: Promise<Product[]> | null = null;

const normalizeSearchText = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

const compactSearchText = (value: string) =>
  normalizeSearchText(value).replace(/[^\p{L}\p{N}]/gu, "");

const loadProducts = async (): Promise<Product[]> => {
  if (cachedProducts && Date.now() - cachedAt < PRODUCT_CACHE_TTL) {
    return cachedProducts;
  }

  if (!productRequest) {
    productRequest = getDocs(collection(db, "products"))
      .then((snapshot) => {
        const products = snapshot.docs.map(
          (document) =>
            ({
              ...(document.data() as Omit<Product, "_id">),
              _id: document.id,
            }) as Product,
        );
        cachedProducts = products;
        cachedAt = Date.now();
        return products;
      })
      .finally(() => {
        productRequest = null;
      });
  }

  return productRequest;
};

export function useSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [processedQuery, setProcessedQuery] = useState("");
  const searchTerm = normalizeSearchText(query);
  const loading =
    Boolean(searchTerm) &&
    (!productsLoaded || processedQuery !== searchTerm);

  useEffect(() => {
    let isCurrent = true;

    loadProducts()
      .then((products) => {
        if (!isCurrent) return;
        setAllProducts(products);
        setProductsLoaded(true);
      })
      .catch((loadError: unknown) => {
        console.error("Failed to load products for search", loadError);
        if (!isCurrent) return;
        setProductsError("Unable to load products. Please try again.");
        setProductsLoaded(true);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const fuse = useMemo(() => {
    const searchData: SearchIndexEntry[] = allProducts.map((product) => {
      const name = product.name ?? "";
      const slug = product.slug?.current ?? "";
      const brand = product.brand ?? "";
      const category = product.category ?? "";
      const tags = product.tags ?? [];

      return {
        id: product._id,
        name,
        slug,
        price: String(product.price ?? ""),
        imageUrl: getSafeImageSrc(
          product.images?.[0]?.src ||
            product.images?.[0]?.url ||
            product.thumbnail,
        ),
        description: product.description || "",
        category,
        brand,
        variant: product.variant || "",
        status: product.status || null,
        rating: product.ratings,
        tags,
        nameCompact: compactSearchText(name),
        slugCompact: compactSearchText(slug),
        brandCompact: compactSearchText(brand),
        categoryCompact: compactSearchText(category),
        variantCompact: compactSearchText(product.variant || ""),
        tagsCompact: tags.map(compactSearchText),
      };
    });

    return new Fuse(searchData, {
      keys: [
        { name: "name", weight: 0.42 },
        { name: "nameCompact", weight: 0.28 },
        { name: "slug", weight: 0.08 },
        { name: "slugCompact", weight: 0.06 },
        { name: "brand", weight: 0.06 },
        { name: "brandCompact", weight: 0.04 },
        { name: "category", weight: 0.04 },
        { name: "categoryCompact", weight: 0.03 },
        { name: "variant", weight: 0.04 },
        { name: "variantCompact", weight: 0.03 },
        { name: "tags", weight: 0.03 },
        { name: "tagsCompact", weight: 0.02 },
      ],
      threshold: 0.42,
      ignoreLocation: true,
      ignoreDiacritics: true,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      useTokenSearch: true,
      tokenMatch: "all",
    });
  }, [allProducts]);

  useEffect(() => {
    if (!searchTerm) {
      const timer = window.setTimeout(() => {
        setResults([]);
        setError(null);
        setHighlightedIndex(-1);
        setProcessedQuery("");
      }, 0);
      return () => window.clearTimeout(timer);
    }

    if (!productsLoaded) return;
    if (productsError) {
      const timer = window.setTimeout(() => {
        setResults([]);
        setError(productsError);
        setHighlightedIndex(-1);
        setProcessedQuery(searchTerm);
      }, 0);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      try {
        const searchVariants = Array.from(
          new Set([searchTerm, compactSearchText(searchTerm)]),
        ).filter((term) => term.length >= 2);
        const bestMatches = new Map<
          string,
          { entry: SearchIndexEntry; score: number; matches: readonly FuseResultMatch[] }
        >();

        for (const term of searchVariants) {
          for (const result of fuse.search(term)) {
            const score = result.score ?? 1;
            const previous = bestMatches.get(result.item.id);
            if (!previous || score < previous.score) {
              bestMatches.set(result.item.id, {
                entry: result.item,
                score,
                matches: result.matches ?? [],
              });
            }
          }
        }

        const normalizedTerm = compactSearchText(searchTerm);
        const ranked = Array.from(bestMatches.values())
          .sort((a, b) => {
            const aName = compactSearchText(a.entry.name);
            const bName = compactSearchText(b.entry.name);
            const aExact = aName === normalizedTerm ? 1 : 0;
            const bExact = bName === normalizedTerm ? 1 : 0;
            const aPrefix = aName.startsWith(normalizedTerm) ? 1 : 0;
            const bPrefix = bName.startsWith(normalizedTerm) ? 1 : 0;
            return (
              bExact - aExact ||
              bPrefix - aPrefix ||
              a.score - b.score
            );
          })
          .slice(0, MAX_SEARCH_RESULTS)
          .map(({ entry, matches }) => ({
            id: entry.id,
            name: entry.name,
            slug: entry.slug,
            price: entry.price,
            imageUrl: entry.imageUrl,
            description: entry.description,
            category: entry.category,
            brand: entry.brand,
            variant: entry.variant,
            status: entry.status,
            rating: entry.rating,
            matches,
          }));

        setResults(ranked);
        setError(null);
        setHighlightedIndex(-1);
      } catch (searchError: unknown) {
        const message =
          searchError instanceof Error
            ? searchError.message
            : "Error searching products";
        console.error("Failed to search products", searchError);
        setError(message);
        setResults([]);
        setHighlightedIndex(-1);
      } finally {
        setProcessedQuery(searchTerm);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchTerm, fuse, productsLoaded, productsError]);

  const onArrowDown = useCallback(() => {
    setHighlightedIndex((previous) => {
      const next = previous + 1;
      return next >= results.length ? results.length - 1 : next;
    });
  }, [results.length]);

  const onArrowUp = useCallback(() => {
    setHighlightedIndex((previous) => {
      const next = previous - 1;
      return next < 0 ? 0 : next;
    });
  }, []);

  const onEnter = useCallback(
    (onSubmit: (q: string) => void) => {
      if (highlightedIndex >= 0 && highlightedIndex < results.length) {
        onSubmit(results[highlightedIndex].name);
      }
    },
    [highlightedIndex, results],
  );

  return {
    results,
    loading,
    error,
    highlightedIndex,
    setHighlightedIndex,
    onArrowDown,
    onArrowUp,
    onEnter,
    allProducts,
  };
}
