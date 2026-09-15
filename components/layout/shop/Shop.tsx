"use client";
import { Brand, Category, Product } from "@/data/products";
import React, { useEffect, useRef, useState, useMemo } from "react";
import Container from "../../Container";
import Title from "../Products/Title";
import CategoryList from "./CategoryList";
import { useSearchParams, useRouter } from "next/navigation";
import BrandList from "./BrandList";
import PriceList from "./PriceList";
import SkinConcernList from "./SkinConcernList";
import BenefitsList from "./BenefitsList";
import {
  Loader2,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import NoProductFound from "../Products/NoProductFound";
import ProductCard from "../Products/ProductCard";
import { m, AnimatePresence } from "framer-motion";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import {
  buildCategoryLookup,
  productMatchesBrandSlug,
  productMatchesCategorySlug,
} from "@/utils/categoryHelper";

interface Props {
  categories: Category[];
  brands: Brand[];
}

const ITEMS_PER_PAGE = 8;

const Shop = ({ categories, brands }: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const brandParams = searchParams?.get("brand");
  const categoryParams = searchParams?.get("category");
  const queryParam = searchParams?.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const loading = false;

  const [products, setProducts] = useState<Product[]>([]);
  const [firestoreCategories, setFirestoreCategories] = useState<Category[]>(
    [],
  );
  const [firestoreBrands, setFirestoreBrands] = useState<Brand[]>([]);

  // Anchor to scroll back to whenever the page changes, so "Next"
  // brings the new results into view instead of leaving the user
  // scrolled down at the pagination bar.
  const gridTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "categories"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          ...(doc.data() as Omit<Category, "_id">),
          _id: doc.id,
        }));

        setFirestoreCategories(data);
      },
      (error) => {
        console.error(error);
      },
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "brands"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          ...(doc.data() as Omit<Brand, "_id">),
          _id: doc.id,
        }));

        setFirestoreBrands(data);
      },
      (error) => {
        console.error(error);
      },
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
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
  }, []);

  // Sync searchQuery state when query param changes (e.g. searching again from navbar while on shop page)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchQuery(queryParam);
  }, [queryParam]);

  // Active filters applied to filtering and rendering
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryParams ? [categoryParams] : [],
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    brandParams ? [brandParams] : [],
  );
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [selectedSkinConcerns, setSelectedSkinConcerns] = useState<string[]>(
    [],
  );
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState<string>("default");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Mobile Bottom Sheet Drawer States
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: false,
    brands: false,
    price: false,
    concern: false,
    benefits: false,
  });

  // Draft filter state for Mobile Drawer
  const [draftCategories, setDraftCategories] = useState<string[]>([]);
  const [draftBrands, setDraftBrands] = useState<string[]>([]);
  const [draftPrice, setDraftPrice] = useState<string | null>(null);
  const [draftSkinConcerns, setDraftSkinConcerns] = useState<string[]>([]);
  const [draftBenefits, setDraftBenefits] = useState<string[]>([]);

  // Open mobile drawer & copy active selections to drafts
  const openMobileDrawer = () => {
    setDraftCategories(selectedCategories);
    setDraftBrands(selectedBrands);
    setDraftPrice(selectedPrice);
    setDraftSkinConcerns(selectedSkinConcerns);
    setDraftBenefits(selectedBenefits);
    setIsMobileDrawerOpen(true);
  };

  // Close mobile drawer and discard draft filters
  const closeMobileDrawer = () => {
    setIsMobileDrawerOpen(false);
  };

  // Apply draft filters to active filters
  const applyMobileFilters = () => {
    setSelectedCategories(draftCategories);
    setSelectedBrands(draftBrands);
    setSelectedPrice(draftPrice);
    setSelectedSkinConcerns(draftSkinConcerns);
    setSelectedBenefits(draftBenefits);
    setIsMobileDrawerOpen(false);
  };

  // Reset draft filters inside mobile drawer
  const resetMobileFilters = () => {
    setDraftCategories([]);
    setDraftBrands([]);
    setDraftPrice(null);
    setDraftSkinConcerns([]);
    setDraftBenefits([]);
  };

  // Reset active filters (both mobile and desktop)
  const resetAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedPrice(null);
    setSelectedSkinConcerns([]);
    setSelectedBenefits([]);
    setDraftCategories([]);
    setDraftBrands([]);
    setDraftPrice(null);
    setDraftSkinConcerns([]);
    setDraftBenefits([]);
    setSearchQuery("");
    router.push("/shop");
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedCategories(categoryParams ? [categoryParams] : []);
  }, [categoryParams]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedBrands(brandParams ? [brandParams] : []);
  }, [brandParams]);

  // Any time a filter, sort, or search changes, the result set changes shape,
  // so jump back to page 1 rather than stranding the user on a now-invalid page.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedCategories,
    selectedBrands,
    selectedPrice,
    selectedSkinConcerns,
    selectedBenefits,
    selectedSort,
  ]);

  const displayCategories =
    firestoreCategories.length > 0 ? firestoreCategories : categories;
  const displayBrands = firestoreBrands.length > 0 ? firestoreBrands : brands;

  const categoryLookup = useMemo(
    () => buildCategoryLookup([...categories, ...firestoreCategories]),
    [categories, firestoreCategories],
  );

  // Client-side filtering for all active filters
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const text = `${product.name} ${product.description || ""}`.toLowerCase();

      // --- Search query filter ---
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.trim().toLowerCase();
        if (!text.includes(q)) return false;
      }

      // --- Category filter ---
      if (selectedCategories.length > 0) {
        const matches = selectedCategories.some((categorySlug) =>
          productMatchesCategorySlug(product, categorySlug, categoryLookup),
        );

        if (!matches) return false;
      }

      // --- Brand filter ---
      if (selectedBrands.length > 0) {
        const matches = selectedBrands.some((brandSlug) =>
          productMatchesBrandSlug(product, brandSlug, displayBrands),
        );
        if (!matches) return false;
      }

      // --- Price range filter ---
      if (selectedPrice) {
        const [minStr, maxStr] = selectedPrice.split("-");
        const min = Number(minStr);
        const max = Number(maxStr);
        const price = product.price ?? 0;
        if (price < min || price > max) return false;
      }

      // --- Skin concern filter ---
      if (selectedSkinConcerns.length > 0) {
        const keywords: Record<string, string[]> = {
          acne: [
            "acne",
            "blemish",
            "salicylic",
            "spot",
            "breakout",
            "clearing",
            "pimple",
            "anti-acne",
          ],
          dryness: [
            "dry",
            "hydration",
            "moistur",
            "hyaluronic",
            "dryness",
            "dehydrated",
            "nourish",
          ],
          pigmentation: [
            "pigment",
            "dark spot",
            "bright",
            "niacinamide",
            "vitamin c",
            "whitening",
            "tone",
            "fade",
            "melasma",
          ],
          "anti-aging": [
            "aging",
            "wrinkle",
            "retinol",
            "collagen",
            "fine line",
            "firming",
            "youth",
            "anti-age",
          ],
        };

        const matches = selectedSkinConcerns.some((concern) =>
          keywords[concern]?.some((keyword) => text.includes(keyword)),
        );
        if (!matches) return false;
      }

      // --- Benefits filter ---
      if (selectedBenefits.length > 0) {
        const keywords: Record<string, string[]> = {
          hydration: [
            "hydration",
            "moistur",
            "hyaluronic",
            "dry",
            "water",
            "dewy",
            "hydrating",
            "plump",
          ],
          brightening: [
            "bright",
            "glow",
            "vitamin c",
            "niacinamide",
            "whitening",
            "radiance",
            "toning",
            "luminous",
          ],
          repair: [
            "repair",
            "barrier",
            "ceramide",
            "cicaplast",
            "cica",
            "centella",
            "soothing",
            "calming",
            "panthenol",
            "recovery",
          ],
        };

        const matches = selectedBenefits.some((benefit) =>
          keywords[benefit]?.some((keyword) => text.includes(keyword)),
        );
        if (!matches) return false;
      }

      return true;
    });
  }, [
    products,
    searchQuery,
    selectedCategories,
    selectedBrands,
    selectedPrice,
    selectedSkinConcerns,
    selectedBenefits,
    categoryLookup,
    displayBrands,
  ]);

  // Client-side sorting
  const sortedProducts = useMemo(() => {
    const items = [...filteredProducts];
    if (selectedSort === "price-asc") {
      return items.sort((a, b) => (a.price || 0) - (b.price || 0));
    }
    if (selectedSort === "price-desc") {
      return items.sort((a, b) => (b.price || 0) - (a.price || 0));
    }
    if (selectedSort === "name-asc") {
      return items.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
    if (selectedSort === "name-desc") {
      return items.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    }
    return items;
  }, [filteredProducts, selectedSort]);

  // Pagination derived values
  const totalPages = Math.max(
    1,
    Math.ceil(sortedProducts.length / ITEMS_PER_PAGE),
  );

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  const rangeStart =
    sortedProducts.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const rangeEnd = Math.min(currentPage * ITEMS_PER_PAGE, sortedProducts.length);

  const goToPage = (page: number) => {
    const safePage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(safePage);
    gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const activeFiltersCount = useMemo(() => {
    return (
      selectedCategories.length +
      selectedBrands.length +
      (selectedPrice ? 1 : 0) +
      selectedSkinConcerns.length +
      selectedBenefits.length +
      (searchQuery.trim().length > 0 ? 1 : 0)
    );
  }, [
    selectedCategories,
    selectedBrands,
    selectedPrice,
    selectedSkinConcerns,
    selectedBenefits,
    searchQuery,
  ]);

  return (
    <div className="border-t border-border/30 bg-bg min-h-screen">
      <Container className="mt-5 pb-16">
        {/* Desktop Title & Header */}
        <div className="hidden md:flex items-center justify-between  pb-4 border-b border-border/20">
          <div className="flex flex-col gap-1">
            <Title className="text-xl font-bold tracking-tight text-accent">
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : "Shop Products"}
            </Title>
            {searchQuery && (
              <button type="button"
                onClick={() => {
                  setSearchQuery("");
                  router.push("/shop");
                }}
                className="text-xs text-primary hover:text-accent font-semibold flex items-center gap-1 self-start mt-1"
              >
                Clear search query <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-text-muted">
              Showing {sortedProducts.length}{" "}
              {sortedProducts.length === 1 ? "result" : "results"}
            </span>
            <div className="relative flex items-center gap-1.5 border border-border/40 rounded-lg px-3 py-2 bg-white shadow-sm">
              <ArrowUpDown className="w-3.5 h-3.5 text-text-muted" />
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="appearance-none bg-transparent pl-1 pr-6 py-0 text-sm font-semibold text-primary outline-none cursor-pointer hover:text-accent transition-colors"
              >
                <option value="default">Default Sort</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
              <span className="absolute right-3 pointer-events-none text-text-muted text-[10px]">
                ▼
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between gap-2 py-2.5 px-2.5 sm:px-4 border border-border/40 bg-white rounded-xl mb-4 select-none box-border overflow-hidden">
          <div className="flex items-center gap-1.5 min-w-0">
            <button type="button"
              onClick={openMobileDrawer}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary py-1.5 px-2.5 sm:px-3 border border-border/40 rounded-lg bg-gray-50/50 active:bg-gray-100 transition-colors cursor-pointer shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Filter{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ""}
            </button>

            <div className="relative flex items-center gap-1 border border-border/40 rounded-lg px-2 py-1.5 bg-gray-50/50 overflow-hidden shrink min-w-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                style={{ maxWidth: "60px" }}               className="appearance-none bg-transparent pl-0.5 pr-1 py-0 text-xs font-semibold text-primary outline-none cursor-pointer hover:text-accent transition-colors"
              >
                <option value="default">Sort</option>
                <option value="price-asc">Low-High</option>
                <option value="price-desc">High-Low</option>
                <option value="name-asc">A-Z</option>
                <option value="name-desc">Z-A</option>
              </select>
            </div>
          </div>

          <span className=" ml-1 text-xs font-semibold text-text-muted whitespace-nowrap shrink-0">
            {sortedProducts.length}{" "}
            {sortedProducts.length === 1 ? "Product" : "Products"}
          </span>
        </div>

        {/* Mobile active search query banner */}
        {searchQuery && (
          <div className="md:hidden flex items-center justify-between px-4 py-2.5 border border-border/40 bg-gray-50 rounded-xl mb-4 text-xs font-semibold text-text">
            <span>Search query: &ldquo;{searchQuery}&rdquo;</span>
            <button type="button"
              onClick={() => {
                setSearchQuery("");
                router.push("/shop");
              }}
              className="text-xs text-primary font-bold flex items-center gap-1"
            >
              Clear <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-5">
          {" "}
          {/* Desktop Filter Sidebar */}
          <div
            className="
    hidden md:block
    w-[260px]
    shrink-0
    sticky
    top-5
    self-start
    bg-white
    rounded-2xl
    border
    border-zinc-200
    p-4
    shadow-sm
  "
          >
            {" "}
            <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-2">
              <span className="text-base font-bold text-text">
                Filter Products
              </span>
              {activeFiltersCount > 0 && (
                <button type="button"
                  onClick={resetAllFilters}
                  className="text-xs font-semibold text-primary underline underline-offset-2 hover:text-accent hoverEffect cursor-pointer"
                >
                  Reset All
                </button>
              )}
            </div>
            <CategoryList
              categories={displayCategories}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
            />
            <BrandList
              brands={displayBrands}
              selectedBrands={selectedBrands}
              setSelectedBrands={setSelectedBrands}
            />
            <PriceList
              selectedPrice={selectedPrice}
              setSelectedPrice={setSelectedPrice}
            />
            <SkinConcernList
              selectedSkinConcerns={selectedSkinConcerns}
              setSelectedSkinConcerns={setSelectedSkinConcerns}
            />
            <BenefitsList
              selectedBenefits={selectedBenefits}
              setSelectedBenefits={setSelectedBenefits}
            />
          </div>
          {/* Product Grid Area */}
          <div className="min-w-0 flex-1">
            <div ref={gridTopRef} />
            {loading ? (
              <div className="p-20 flex flex-col gap-3 items-center justify-center bg-white rounded-2xl border border-border/35 shadow-sm">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="font-semibold tracking-wide text-base text-text-muted">
                  Products are loading . . .
                </p>
              </div>
            ) : sortedProducts?.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                  {paginatedProducts?.map((product) => (
                    <div
                      key={product?._id}
                      className="h-full flex flex-col justify-between"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-6 border-t border-border/30">
                    <p className="text-sm text-text-muted order-2 sm:order-1">
                      Showing {rangeStart} to {rangeEnd} of{" "}
                      {sortedProducts.length} results
                    </p>
                    <div className="flex items-center gap-2 order-1 sm:order-2">
                      <button
                        type="button"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        aria-label="Previous page"
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-border/40 text-text-muted hover:text-text hover:border-border disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-text-muted disabled:hover:border-border/40 transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {Array.from({ length: totalPages }).map((_, i) => {
                        const page = i + 1;
                        const isActive = page === currentPage;
                        return (
                          <button
                            key={page}
                            type="button"
                            onClick={() => goToPage(page)}
                            aria-current={isActive ? "page" : undefined}
                            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                              isActive
                                ? "bg-primary text-white"
                                : "border border-border/40 text-text-muted hover:text-text hover:border-border"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        aria-label="Next page"
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-border/40 text-text-muted hover:text-text hover:border-border disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-text-muted disabled:hover:border-border/40 transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <NoProductFound className="bg-white rounded-2xl border border-border/35 p-12 mt-0" />
            )}
          </div>
        </div>
      </Container>

      {/* Mobile Drawer (Bottom Sheet) */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            {/* Backdrop blur overlay */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileDrawer}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50"
            />

            {/* Bottom Sheet Container */}
            <m.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 h-[88vh] bg-white rounded-t-[24px] shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              {/* Drag handle decoration */}
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto my-3 shrink-0" />

              {/* Drawer Header */}
              <div className="px-6 border-b border-border/30 flex items-center justify-between shrink-0">
                <h3 className="text-lg font-bold text-text">Filter Products</h3>
                <button type="button"
                  onClick={closeMobileDrawer}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 active:bg-gray-100 text-text-muted hover:text-text cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content (Scrollable accordion sections) */}
              <div className="flex-1 overflow-y-auto px-6 py-1">
                {/* Categories */}
                <div className="border-b border-border/30">
                  <button type="button"
                    onClick={() => toggleSection("categories")}
                    className="w-full flex items-center justify-between py-1 text-sm font-semibold text-text select-none text-left cursor-pointer"
                  >
                    <span>
                      Categories{" "}
                      {draftCategories.length > 0 &&
                        `(${draftCategories.length})`}
                    </span>
                    <span
                      className="text-xs transition-transform duration-200"
                      style={{
                        transform: openSections.categories
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    >
                      ▼
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {openSections.categories && (
                      <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pb-1">
                          <CategoryList
                            categories={displayCategories}
                            selectedCategories={draftCategories}
                            setSelectedCategories={setDraftCategories}
                          />
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Brands */}
                <div className="border-b border-border/30">
                  <button type="button"
                    onClick={() => toggleSection("brands")}
                    className="w-full flex items-center justify-between py-4 text-sm font-semibold text-text select-none text-left cursor-pointer"
                  >
                    <span>
                      Brands{" "}
                      {draftBrands.length > 0 && `(${draftBrands.length})`}
                    </span>
                    <span
                      className="text-xs transition-transform duration-200"
                      style={{
                        transform: openSections.brands
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    >
                      ▼
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {openSections.brands && (
                      <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pb-4">
                          <BrandList
                            brands={displayBrands}
                            selectedBrands={draftBrands}
                            setSelectedBrands={setDraftBrands}
                          />
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Price */}
                <div className="border-b border-border/30">
                  <button type="button"
                    onClick={() => toggleSection("price")}
                    className="w-full flex items-center justify-between py-4 text-sm font-semibold text-text select-none text-left cursor-pointer"
                  >
                    <span>Price Range {draftPrice && `(1)`}</span>
                    <span
                      className="text-xs transition-transform duration-200"
                      style={{
                        transform: openSections.price
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    >
                      ▼
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {openSections.price && (
                      <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pb-4">
                          <PriceList
                            selectedPrice={draftPrice}
                            setSelectedPrice={setDraftPrice}
                          />
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Skin Concerns */}
                <div className="border-b border-border/30">
                  <button type="button"
                    onClick={() => toggleSection("concern")}
                    className="w-full flex items-center justify-between py-4 text-sm font-semibold text-text select-none text-left cursor-pointer"
                  >
                    <span>
                      Skin Concern{" "}
                      {draftSkinConcerns.length > 0 &&
                        `(${draftSkinConcerns.length})`}
                    </span>
                    <span
                      className="text-xs transition-transform duration-200"
                      style={{
                        transform: openSections.concern
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    >
                      ▼
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {openSections.concern && (
                      <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pb-4">
                          <SkinConcernList
                            selectedSkinConcerns={draftSkinConcerns}
                            setSelectedSkinConcerns={setDraftSkinConcerns}
                          />
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Benefits */}
                <div className="border-b border-border/30">
                  <button type="button"
                    onClick={() => toggleSection("benefits")}
                    className="w-full flex items-center justify-between py-4 text-sm font-semibold text-text select-none text-left cursor-pointer"
                  >
                    <span>
                      Benefits{" "}
                      {draftBenefits.length > 0 && `(${draftBenefits.length})`}
                    </span>
                    <span
                      className="text-xs transition-transform duration-200"
                      style={{
                        transform: openSections.benefits
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    >
                      ▼
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {openSections.benefits && (
                      <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pb-4">
                          <BenefitsList
                            selectedBenefits={draftBenefits}
                            setSelectedBenefits={setDraftBenefits}
                          />
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Drawer Footer (Sticky bottom buttons) */}
              <div className="border-t border-border/30 p-4 bg-white flex items-center justify-between gap-4 shrink-0">
                <button type="button"
                  onClick={resetMobileFilters}
                  className="w-1/2 py-3.5 border border-border rounded-xl text-sm font-semibold text-text-muted hover:text-text active:bg-gray-50 transition-colors cursor-pointer"
                >
                  Reset All
                </button>
                <button type="button"
                  onClick={applyMobileFilters}
                  className="w-1/2 py-3.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/95 transition-colors cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;