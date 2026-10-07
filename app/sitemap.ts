import { MetadataRoute } from "next";
import { fetchCategories, fetchProducts } from "@/lib/product";
import { getAllBlogs, getBrands } from "@/data/products";
import { canonicalUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "",
    "/about",
    "/contact",
    "/shop",
    "/blog",
    "/deal",
  ];

  const [products, categories, blogs] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
    getAllBlogs(),
  ]);

  const uniquePaths = new Set<string>(staticPaths);
  const productSlugs = new Set<string>();
  const productRoutes = products.flatMap((product) => {
    const slug = product.slug?.current?.trim();
    if (!slug || !product.name?.trim() || productSlugs.has(slug)) return [];

    productSlugs.add(slug);
    return [{ url: canonicalUrl(`/product/${encodeURIComponent(slug)}`) }];
  });

  const categorySlugs = new Set<string>();
  const categoryRoutes = categories.flatMap((category) => {
    const slug = category.slug.current.trim();
    if (!slug || categorySlugs.has(slug)) return [];

    categorySlugs.add(slug);
    return [{ url: canonicalUrl(`/category/${encodeURIComponent(slug)}`) }];
  });

  const brands = getBrands();
  const brandRoutes = brands.flatMap((brand) => {
    const brandKey = brand.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    const hasProducts = products.some(
      (product) =>
        product.brand?.toLowerCase().replace(/[^a-z0-9]/g, "") === brandKey &&
        Boolean(product.slug?.current?.trim()),
    );
    if (!hasProducts) return [];

    return [
      {
        url: canonicalUrl(`/brand/${encodeURIComponent(brand.slug.current)}`),
      },
    ];
  });

  const blogSlugs = new Set<string>();
  const blogRoutes = blogs.flatMap((blog) => {
    const slug = blog.slug?.current?.trim();
    if (!slug || !blog.title?.trim() || blogSlugs.has(slug)) return [];

    blogSlugs.add(slug);
    return [{ url: canonicalUrl(`/blog/${encodeURIComponent(slug)}`) }];
  });

  return [
    ...Array.from(uniquePaths, (path) => ({ url: canonicalUrl(path) })),
    ...categoryRoutes,
    ...productRoutes,
    ...brandRoutes,
    ...blogRoutes,
  ];
}
