"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";

import { ArrowLeft, X, Search, RotateCcw, TrendingUp, Sparkles, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/hooks/useSearch";
import { getRecentSearches, saveRecentSearches } from "@/lib/localStorage";
import SearchResultCard from "./SearchResultCard";
import HighlightedText from "./HighlightedText";

type SearchDrawerProps = {
  query: string;
  setQuery: (q: string) => void;
  onClose: () => void;
  onSubmit: (q: string) => void;
  placeholder?: string;
};

const drawerVariants = {
  hidden: { opacity: 0, y: "100%" },
  visible: { opacity: 1, y: 0 },
};

export default function SearchDrawer({
  query,
  setQuery,
  onClose,
  onSubmit,
  placeholder = "Search skincare, brands, categories...",
}: SearchDrawerProps) {
  const { results, loading, error, highlightedIndex, setHighlightedIndex, allProducts } = useSearch(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches on mount
  useEffect(() => {
    try {
      setRecentSearches(getRecentSearches());
    } catch {
      setRecentSearches([]);
    }
  }, []);

  // Lock body scroll while open and restore correctly
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Autofocus input
  useEffect(() => {
    // Small timeout ensures the slide animation is smooth before focusing keyboard
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleProductSelect = (slug: string, name: string) => {
    handleSaveSearch(name);
    router.push(`/product/${slug}`);
    onClose();
  };

  const handleSaveSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    try {
      const existing = getRecentSearches();
      const updated = [searchTerm, ...existing.filter((s: string) => s !== searchTerm)].slice(0, 8);
      saveRecentSearches(updated);
      setRecentSearches(updated);
    } catch {}
  };

  const handleRemoveSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    try {
      const updated = recentSearches.filter((s) => s !== term);
      saveRecentSearches(updated);
      setRecentSearches(updated);
    } catch {}
  };

  const handleClearInput = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && highlightedIndex < results.length) {
        const item = results[highlightedIndex];
        handleProductSelect(item.slug, item.name);
      } else if (query.trim().length > 0) {
        handleSaveSearch(query);
        onSubmit(query);
      }
    }
  };

  // Group matches for categories and brands
  const matchedCategories = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    const categoriesSet = new Set<string>();
    
    // Scan all products for matching categories
    allProducts.forEach((p) => {
      if (p.category && p.category.toLowerCase().includes(lowerQuery)) {
        categoriesSet.add(p.category);
      }
    });

    return Array.from(categoriesSet).slice(0, 4);
  }, [allProducts, query]);

  const matchedBrands = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    const brandsSet = new Set<string>();
    
    // Scan all products for matching brands
    allProducts.forEach((p) => {
      if (p.brand && p.brand.toLowerCase().includes(lowerQuery)) {
        brandsSet.add(p.brand);
      }
    });

    return Array.from(brandsSet).slice(0, 4);
  }, [allProducts, query]);

  // Suggested / Recommended Products when search matches nothing
  const recommendedProducts = useMemo(() => {
    return allProducts
      .filter((p) => p.isFeatured || p.status === "hot" || p.price > 0)
      .slice(0, 3)
      .map((p) => ({
        id: p._id,
        name: p.name,
        slug: p.slug.current,
        price: p.price.toString(),
        imageUrl: p.images?.[0]?.src || p.images?.[0]?.url || p.thumbnail,
        category: p.category,
        brand: p.brand,
        variant: p.variant || "",
        status: p.status || null,
        rating: p.ratings,
      }));
  }, [allProducts]);

  const hasQuery = query.trim().length > 0;

  return (
    <AnimatePresence>
      <m.div
        className="fixed inset-0 z-50 flex flex-col bg-bg overflow-hidden"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={drawerVariants}
        transition={{ type: "tween", duration: 0.25, ease: "easeInOut" }}
      >
          <div
            className="flex flex-col h-full w-full pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            {/* Premium Mobile Search Bar */}
            <div className="flex items-center gap-2 px-3 py-3 border-b border-border/60 bg-white shrink-0 min-h-[64px] shadow-sm">
              {/* Back Button (44px target) */}
              <button
                type="button"
                aria-label="Go back"
                className="shrink-0 p-2.5 text-text hover:bg-gray-100 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                onClick={onClose}
              >
                <ArrowLeft size={22} />
              </button>

              {/* Input Container */}
              <div className="flex-1 relative flex items-center bg-gray-50 border border-border/80 rounded-full overflow-hidden transition-all focus-within:bg-white focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10">
                <Search className="absolute left-3.5 h-4.5 w-4.5 text-text-muted pointer-events-none" />
                <input
                  ref={inputRef}
                  type="search"
                  inputMode="search"
                  enterKeyHint="search"
                  placeholder={placeholder}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 text-base text-text bg-transparent focus:outline-none min-h-[44px]"
                  aria-label="Search inputs"
                />
                
                {/* Clear Input Button (44px target) */}
                {hasQuery && (
                  <button
                    type="button"
                    aria-label="Clear search text"
                    onClick={handleClearInput}
                    className="absolute right-1 text-text-muted hover:text-text p-2 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Suggestions & Results Panel */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
              {/* 1. Idle state suggestions */}
              {!hasQuery && (
                <>
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                          <RotateCcw size={13} /> Recent Searches
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            saveRecentSearches([]);
                            setRecentSearches([]);
                          }}
                          className="text-xs font-medium text-primary hover:underline px-2 py-1 min-h-[30px]"
                        >
                          Clear All
                        </button>
                      </div>
                      <ul className="divide-y divide-border/40">
                        {recentSearches.map((term) => (
                          <li key={term} className="flex items-center justify-between group">
                            <button
                              type="button"
                              onClick={() => {
                                setQuery(term);
                                handleSaveSearch(term);
                              }}
                              className="flex-1 text-left py-3 text-sm text-text hover:text-primary min-h-[44px] flex items-center gap-2"
                            >
                              <Search size={14} className="text-text-muted" />
                              {term}
                            </button>
                            <button
                              type="button"
                              aria-label={`Remove search term ${term}`}
                              onClick={(e) => handleRemoveSearch(e, term)}
                              className="p-3 text-text-muted hover:text-rose-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
                            >
                              <X size={16} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Trending / Popular Searches */}
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 delay-75">
                    <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <TrendingUp size={13} /> Trending Searches
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Vitamin C",
                        "Moisturizer",
                        "Sunscreen",
                        "Serum",
                        "Retinol",
                        "Cleanser",
                      ].map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => {
                            setQuery(term);
                            handleSaveSearch(term);
                          }}
                          className="px-4 py-2 bg-white border border-border/80 rounded-full text-xs font-medium text-text hover:border-primary hover:text-primary transition-all min-h-[36px]"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* 2. Results & Match suggestions */}
              {hasQuery && (
                <div className="space-y-6">
                  {loading && (
                    <div className="flex flex-col items-center justify-center py-10 space-y-3">
                      <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                      <p className="text-xs text-text-muted animate-pulse">Searching catalog...</p>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 bg-error/10 text-error text-sm rounded-xl">
                      {error}
                    </div>
                  )}

                  {!loading && !error && (
                    <>
                      {/* Matching Categories */}
                      {matchedCategories.length > 0 && (
                        <div className="animate-in fade-in duration-200">
                          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Sparkles size={13} /> Matching Categories
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {matchedCategories.map((cat) => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                  handleSaveSearch(cat);
                                  router.push(`/category/${cat.toLowerCase()}`);
                                  onClose();
                                }}
                                className="px-3.5 py-1.5 bg-secondary/30 rounded-lg text-xs font-semibold text-primary transition-colors min-h-[36px]"
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matching Brands */}
                      {matchedBrands.length > 0 && (
                        <div className="animate-in fade-in duration-200">
                          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <ShoppingBag size={13} /> Matching Brands
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {matchedBrands.map((brand) => (
                              <button
                                key={brand}
                                type="button"
                                onClick={() => {
                                  handleSaveSearch(brand);
                                  router.push(`/shop?brand=${encodeURIComponent(brand)}`);
                                  onClose();
                                }}
                                className="px-3.5 py-1.5 bg-gray-100 rounded-lg text-xs font-semibold text-text transition-colors min-h-[36px]"
                              >
                                {brand}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matching Products */}
                      {results.length > 0 ? (
                        <div className="space-y-3 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                              Products ({results.length})
                            </h4>
                          </div>
                          <ul className="space-y-2.5">
                            {results.map((item, idx) => (
                              <li key={item.id}>
                                <SearchResultCard
                                  result={item}
                                  onSelect={() => handleProductSelect(item.slug, item.name)}
                                  isHighlighted={highlightedIndex === idx}
                                />
                              </li>
                            ))}
                          </ul>

                          {/* Full Search Submit Button */}
                          <div className="pt-4">
                            <button
                              type="button"
                              onClick={() => {
                                handleSaveSearch(query);
                                onSubmit(query);
                              }}
                              className="w-full text-center py-3.5 bg-primary text-white text-sm font-semibold rounded-full shadow-md hover:bg-primary/95 transition-all active:scale-98 min-h-[44px]"
                            >
                              View all results for &ldquo;{query}&rdquo;
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Empty State + Recommendation */
                        !loading && (
                          <div className="space-y-6 py-6 animate-in fade-in duration-300">
                            <div className="text-center space-y-2">
                              <p className="text-base font-semibold text-text">No products found</p>
                              <p className="text-sm text-text-muted">
                                Try different keywords or check spelling.
                              </p>
                            </div>

                            {/* Similar / Recommended Products */}
                            {recommendedProducts.length > 0 && (
                              <div className="border-t border-border/50 pt-6">
                                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
                                  You might also like
                                </h4>
                                <ul className="space-y-2.5">
                                  {recommendedProducts.map((item) => (
                                    <li key={item.id}>
                                      <SearchResultCard
                                        result={item}
                                        onSelect={() => handleProductSelect(item.slug, item.name)}
                                      />
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
      </m.div>
    </AnimatePresence>
  );
}
