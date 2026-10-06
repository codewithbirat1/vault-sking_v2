"use client";

import { Search } from "lucide-react";
import { useId, useState, useEffect, useRef, useCallback } from "react";
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
  const panelId = `${inputId}-panel`;
  const alwaysExpanded = variant === "expanded";
  const isMobile = useMediaQuery("(max-width: 767px)");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [openedByHover, setOpenedByHover] = useState(false);
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const suppressFocusOpenRef = useRef(false);

  const clearHoverTimers = useCallback(() => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const handleOpen = useCallback(() => {
    clearHoverTimers();
    setOpenedByHover(false);
    setOpen(true);
  }, [clearHoverTimers]);

  const handleClose = useCallback(() => {
    clearHoverTimers();
    suppressFocusOpenRef.current = true;
    window.setTimeout(() => {
      suppressFocusOpenRef.current = false;
    }, 0);
    setOpenedByHover(false);
    setOpen(false);
    setQuery("");
  }, [clearHoverTimers]);

  // Focus-trap cleanup can restore focus to the trigger; don't let that reopen search.
  const handleFocus = useCallback(() => {
    if (suppressFocusOpenRef.current) {
      suppressFocusOpenRef.current = false;
      return;
    }
    handleOpen();
  }, [handleOpen]);

  const handleMouseEnter = () => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (open || openTimerRef.current !== null) return;

    openTimerRef.current = window.setTimeout(() => {
      openTimerRef.current = null;
      setOpenedByHover(true);
      setOpen(true);
    }, 100);
  };

  const handleMouseLeave = () => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (!openedByHover || closeTimerRef.current !== null) return;

    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      const searchInputFocused = document.activeElement?.matches(
        "[data-search-input]",
      );
      if (query.trim() || searchInputFocused) return;
      setOpenedByHover(false);
      setOpen(false);
    }, 200);
  };

  useEffect(
    () => () => {
      if (openTimerRef.current !== null) {
        window.clearTimeout(openTimerRef.current);
      }
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    },
    [],
  );

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


  // Global shortcuts keep search available even when the hover-open panel has no focus.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpenedByHover(false);
        setOpen(true);
      } else if (e.key === "Escape" && open) {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, clearHoverTimers, handleClose]);

  return (
    <>
      {/* Trigger input for desktop */}
      <div
        className={`search-trigger relative ${alwaysExpanded ? "block" : "hidden md:block"}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        data-search-open={open}
      >
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
          onClick={handleOpen}
          data-search-input
          role="combobox"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={panelId}
          className="h-11 w-full rounded-full border border-border bg-white pl-11 pr-4 text-sm text-text shadow-sm transition-all placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
        />
      </div>

      {/* Mobile icon trigger */}
      {!alwaysExpanded && (
        <button
          type="button"
          aria-label="Open search"
          onClick={handleOpen}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10 md:hidden"
        >
          <Search className="h-5 w-5 text-text" aria-hidden="true" />
        </button>
      )}

      {/* Render modal or drawer based on viewport */}
      {typeof document !== "undefined" &&
        createPortal(
          isMobile ? (
            <SearchDrawer
              isOpen={open}
              query={query}
              setQuery={setQuery}
              onClose={handleClose}
              onSubmit={handleSubmit}
              placeholder={placeholder}
              panelId={panelId}
            />
          ) : (
            <SearchModal
              isOpen={open}
              query={query}
              setQuery={setQuery}
              onClose={handleClose}
              onSubmit={handleSubmit}
              placeholder={placeholder}
              panelId={panelId}
              autoFocus={!openedByHover}
              onActivate={handleOpen}
              onHoverEnter={handleMouseEnter}
              onHoverLeave={handleMouseLeave}
            />
          ),
          document.body,
        )}
    </>
  );
};

export default SearchBar;