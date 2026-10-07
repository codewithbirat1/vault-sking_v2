import { useState, useEffect, useMemo, useCallback } from "react";
import { isCustomerFacingLabel, SearchResult } from "@/types/search";
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

type SearchData = {
  products: Product[];
  categoryLabels: Map<string, string>;
  brandLabels: Map<string, string>;
};

const PRODUCT_CACHE_TTL = 60_000;
const SEARCH_DEBOUNCE_MS = 200;
const MAX_SEARCH_RESULTS = 20;

let cachedSearchData: SearchData | null = null;
let cachedAt = 0;
let searchDataRequest: Promise<SearchData> | null = null;

const normalizeSearchText = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

const compactSearchText = (value: string) =>
  normalizeSearchText(value).replace(/[^\p{L}\p{N}]/gu, "");

const normalizeLabel = (value: string) => value.trim().toLowerCase();

const readLabelCollection = async (collectionName: string) => {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    const labels = new Map<string, string>();

    for (const document of snapshot.docs) {
      const data = document.data();
      const label =
        typeof data.title === "string"
          ? data.title.trim()
          : typeof data.name === "string"
            ? data.name.trim()
            : typeof data.label === "string"
              ? data.label.trim()
              : "";
      if (!label) continue;

      const slug =
        typeof data.slug?.current === "string" ? data.slug.current.trim() : "";
      for (const alias of [document.id, slug, label]) {
        if (alias) labels.set(normalizeLabel(alias), label);
      }
    }

    return labels;
  } catch (loadError: unknown) {
    console.error(`Failed to load ${collectionName} labels for search`, loadError);
    return new Map<string, string>();
  }
};

const resolveLabel = (value: string, labels: Map<string, string>) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return "";

  return (
    labels.get(normalizeLabel(trimmedValue)) ??
    (isCustomerFacingLabel(trimmedValue) ? trimmedValue : "")
  );
};

const loadSearchData = async (): Promise<SearchData> => {
  if (cachedSearchData && Date.now() - cachedAt < PRODUCT_CACHE_TTL) {
    return cachedSearchData;
  }

  if (!searchDataRequest) {
    searchDataRequest = Promise.all([
      getDocs(collection(db, "products")),
      readLabelCollection("categories"),
      readLabelCollection("brands"),
    ])
      .then(([snapshot, categoryLabels, brandLabels]) => {
        const products = snapshot.docs.map(
          (document) =>
            ({
              ...(document.data() as Omit<Product, "_id">),
              _id: document.id,
            }) as Product,
        );
        const data = { products, categoryLabels, brandLabels };
        cachedSearchData = data;
        cachedAt = Date.now();
        return data;
      })
      .finally(() => {
        searchDataRequest = null;
      });
  }

  return searchDataRequest;
};

export function useSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categoryLabels, setCategoryLabels] = useState<Map<string, string>>(
    () => new Map(),
  );
  const [brandLabels, setBrandLabels] = useState<Map<string, string>>(
    () => new Map(),
  );
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [processedQuery, setProcessedQuery] = useState("");
  const searchTerm = normalizeSearchText(query);
  const loading =
    Boolean(searchTerm) &&
    (!productsLoaded || processedQuery !== searchTerm);

  useEffect(() => {
    let isCurrent = true;

    loadSearchData()
      .then(({ products, categoryLabels: loadedCategories, brandLabels: loadedBrands }) => {
        if (!isCurrent) return;
        const customerFacingProducts = products.filter(
          (product) =>
            isCustomerFacingLabel(product.name, product._id) &&
            typeof product.slug?.current === "string" &&
            product.slug.current.length > 0,
        );
        setCategoryLabels(loadedCategories);
        setBrandLabels(loadedBrands);
        setAllProducts(
          customerFacingProducts.map((product) => ({
            ...product,
            category: resolveLabel(product.category ?? "", loadedCategories),
            brand: resolveLabel(product.brand ?? "", loadedBrands),
          })),
        );
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
      const brand = resolveLabel(product.brand ?? "", brandLabels);
      const category = resolveLabel(product.category ?? "", categoryLabels);
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
  }, [allProducts, brandLabels, categoryLabels]);

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
