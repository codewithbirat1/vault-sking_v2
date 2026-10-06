"use client";

import { Search } from "lucide-react";
import { useId, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useMediaQuery } from "usehooks-ts";
import { useRouter } from "next/navigation";
import { getRecentSearches, saveRecentSearches } from "@/lib/localStorage";
import { createPortal } from "react-dom";

// Lazy load modal/drawer to avoid SSR issues
const SearchModal = dynamic(() => import("@/components/layout/search/SearchModal"), { ssr: false });
const SearchDrawer = dynamic(() => import("@/components/layout/search/SearchDrawer"), { ssr: false });

type SearchBarProps = {
  /** Force the full input even on mobile (e.g. inside the mobile drawer). */
  variant?: "responsive" | "expanded";
  placeholder?: string;
  /** Optional external submit handler (e.g., for analytics) */
  onSubmit?: (query: string) => void;
};

const SearchBar = ({
  variant = "responsive",
  placeholder = "Search skincare, brands, categories...",
  onSubmit,
}: SearchBarProps) => {
  const inputId = useId();
  const alwaysExpanded = variant === "expanded";
  const isMobile = useMediaQuery("(max-width: 767px)");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Open modal/drawer when input gains focus (desktop) or icon clicked (mobile)
  const handleFocus = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setQuery("");
  };

  // Forward submit to optional handler and close UI
  const handleSubmit = (q: string) => {
    // Store recent search
    try {
      const existing = getRecentSearches();
      const updated = [q, ...existing.filter((s: string) => s !== q)].slice(0, 8);
      saveRecentSearches(updated);
    } catch { }

    if (onSubmit) {
      onSubmit(q);
    } else {
      router.push(`/shop?q=${encodeURIComponent(q)}`);
    }
    handleClose();
  };

  // Sync query changes with local state for the modal/drawer
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };


  // Global shortcut Cmd+K / Ctrl+K to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* Trigger input for desktop */}
      <div className={`relative ${alwaysExpanded ? "block" : "hidden md:block"}`}>
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted"
          aria-hidden="true"
        />
        <label htmlFor={inputId} className="sr-only">
          Search products
        </label>
        <input
          id={inputId}
          name="q"
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          className="h-11 w-full rounded-full border border-border bg-white pl-11 pr-4 text-sm text-text shadow-sm transition-all placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
        />
      </div>

      {/* Mobile icon trigger */}
      {!alwaysExpanded && (
        <button
          type="button"
          aria-label="Open search"
          onClick={() => setOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10 md:hidden"
        >
          <Search className="h-5 w-5 text-text" aria-hidden="true" />
        </button>
      )}

      {/* Render modal or drawer based on viewport */}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          isMobile ? (
            <SearchDrawer
              query={query}
              setQuery={setQuery}
              onClose={handleClose}
              onSubmit={handleSubmit}
              placeholder={placeholder}
            />
          ) : (
            <SearchModal
              query={query}
              setQuery={setQuery}
              onClose={handleClose}
              onSubmit={handleSubmit}
              placeholder={placeholder}
            />
          ),
          document.body,
        )}
    </>
  );
};

export default SearchBar;