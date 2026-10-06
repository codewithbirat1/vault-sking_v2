"use client";

import { m, AnimatePresence } from "framer-motion";
import { FocusTrap } from "focus-trap-react";
import SearchResultCard from "./SearchResultCard";
import SearchPreview from "./SearchPreview";
import { useSearch } from "@/hooks/useSearch";
import { LucideX, Search } from "lucide-react";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getRecentSearches, saveRecentSearches } from "@/lib/localStorage";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

type SearchModalProps = {
  query: string;
  setQuery: (q: string) => void;
  onClose: () => void;
  onSubmit: (q: string) => void;
  placeholder?: string;
};

export default function SearchModal({
  query,
  setQuery,
  onClose,
  onSubmit,
  placeholder = "Search skincare, brands, categories...",
}: SearchModalProps) {
  const {
    results,
    loading,
    error,
    highlightedIndex,
    setHighlightedIndex,
    onArrowDown,
    onArrowUp,
  } = useSearch(query);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useBodyScrollLock();

  // Scroll active element into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const listEl = listRef.current;
      const activeEl = listEl.children[highlightedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({
          block: "nearest",
          behavior: "smooth"
        });
      }
    }
  }, [highlightedIndex]);

  const handleProductSelect = (slug: string, name: string) => {
    try {
      const existing = getRecentSearches();
      const updated = [name, ...existing.filter((s: string) => s !== name)].slice(0, 8);
      saveRecentSearches(updated);
    } catch { }
    router.push(`/product/${slug}`);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") { e.preventDefault(); onArrowDown(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); onArrowUp(); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < results.length) {
        const item = results[highlightedIndex];
        handleProductSelect(item.slug, item.name);
      } else if (query.trim().length > 0) {
        onSubmit(query);
      }
    }
  };

  const hasResults = results.length > 0;
  const hasQuery = query.trim().length > 0;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <m.div
        key="backdrop"
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal panel */}
      <m.div
        key="modal"
        className="fixed inset-x-0 top-18 z-50 mx-auto w-[90vw] md:max-w-225 lg:w-[95vw] lg:max-w-275 xl:max-w-300 px-4"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        <FocusTrap>
          <div
            className="flex flex-col rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden"
            onKeyDown={handleKeyDown}
            style={{ maxHeight: "calc(100vh - 100px)" }}
          >
            {/* Search input row */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <Search className="h-5 w-5 shrink-0 text-gray-400" />
              <input
                ref={inputRef}
                type="search"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-base text-gray-900 placeholder:text-gray-400 focus:outline-none"
                aria-label="Search input"
              />
              {loading && (
                <span className="text-xs text-gray-400 animate-pulse">Searching…</span>
              )}
              <button type="button"
                aria-label="Close search"
                onClick={onClose}
                className="shrink-0ded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              >
                <LucideX size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-col lg:flex-row overflow-hidden" style={{ minHeight: hasQuery ? "280px" : "auto" }}>
              {!hasQuery && (
                /* Empty / idle state */
                <div className="flex-1 px-6 py-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                    Trending Searches
                  </p>
                  <ul className="grid grid-cols-2 gap-2">
                    {[
                      "Vitamin C Serum",
                      "Hyaluronic Acid Serum",
                      "SPF 50 Sunscreen",
                      "Gentle Face Cleanser",
                      "Retinol Night Cream",
                      "Hydrating Moisturizer",
                    ].map((term) => (
                      <li key={term}>
                        <button type="button"
                          onClick={() => setQuery(term)}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                        >
                          {term}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {hasQuery && !hasResults && !loading && !error && (
                <div className="flex-1 flex items-center justify-center py-12 text-gray-400 text-sm">
                  No products found for &ldquo;{query}&rdquo;
                </div>
              )}

              {hasQuery && error && (
                <div className="flex-1 flex items-center justify-center py-12 text-red-500 text-sm">
                  Something went wrong. Please try again.
                </div>
              )}

              {hasQuery && hasResults && (
                <>
                  {/* Results list */}
                  <div className="w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-100 max-h-[40vh] lg:max-h-none overflow-hidden">
                    <ul
                      ref={listRef}
                      role="listbox"
                      className="flex-1 overflow-y-auto py-2"
                    >
                      {results.map((item, idx) => (
                        <li
                          key={item.id}
                          role="option"
                          aria-selected={highlightedIndex === idx}
                          onMouseEnter={() => setHighlightedIndex(idx)}
                          className="px-2"
                        >
                          <SearchResultCard
                            result={item}
                            onSelect={() => handleProductSelect(item.slug, item.name)}
                            isHighlighted={highlightedIndex === idx}
                          />
                        </li>
                      ))}
                    </ul>

                    {/* View all matching products link */}
                    <div className="p-2 border-t border-gray-100 bg-gray-50/50">
                      <button type="button"
                        onClick={() => onSubmit(query)}
                        className="w-full text-center py-2.5 bg-white hover:bg-gray-100 text-xs font-semibold text-primary rounded-xl border border-gray-200/80 shadow-sm transition-all"
                      >
                        View all results for &ldquo;{query}&rdquo;
                      </button>
                    </div>
                  </div>

                  {/* Preview panel */}
                  <div className="w-full lg:w-1/2 overflow-y-auto bg-gray-50/60 max-h-[40vh] lg:max-h-none shrink-0">
                    {highlightedIndex >= 0 && results[highlightedIndex] ? (
                      <SearchPreview
                        result={results[highlightedIndex]}
                        onView={() => handleProductSelect(results[highlightedIndex].slug, results[highlightedIndex].name)}
                      />
                    ) : results[0] ? (
                      <SearchPreview
                        result={results[0]}
                        onView={() => handleProductSelect(results[0].slug, results[0].name)}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-300 text-sm p-6">
                        Hover a result to preview
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center gap-4 border-t border-gray-100 px-4 py-2 text-[11px] text-gray-400">
              <span><kbd className="font-mono">↑</kbd><kbd className="font-mono ml-1">↓</kbd> navigate</span>
              <span><kbd className="font-mono">↵</kbd> open</span>
              <span><kbd className="font-mono">Esc</kbd> close</span>
            </div>
          </div>
        </FocusTrap>
      </m.div>
    </AnimatePresence>
  );
}
