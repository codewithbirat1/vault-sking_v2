/**
 * Shape used for search results — maps from local product data.
 */
export type SearchResult = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  category: string;
  brand: string;
  variant: string;
  price: string;
  status?: string | null;
  rating?: number;
  matches?: ReadonlyArray<{
    indices: ReadonlyArray<readonly [number, number]>;
    key?: string;
    refIndex?: number;
    value?: string;
  }>;
};

/**
 * Client-side ranking of results already returned by the API.
 *
 * Rank products according to the spec:
 * 1. Exact name match
 * 2. Name starts with query
 * 3. Name contains query
 * 4. Brand match
 * 5. Category / variant match
 * 6. Anything else
 */
export function rankResults(query: string, products: SearchResult[]): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return products;

  const score = (item: SearchResult): number => {
    const name = (item.name ?? "").toLowerCase();
    const brand = (item.brand ?? "").toLowerCase();
    const category = (item.category ?? "").toLowerCase();
    const variant = (item.variant ?? "").toLowerCase();

    if (name === q) return 100;
    if (name.startsWith(q)) return 90;
    if (name.includes(q)) return 80;
    if (brand.includes(q)) return 70;
    if (category.includes(q)) return 60;
    if (variant.includes(q)) return 50;
    return 10;
  };

  return products.slice().sort((a, b) => score(b) - score(a));
}
