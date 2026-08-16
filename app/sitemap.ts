import { MetadataRoute } from "next";
import { fetchProducts } from "@/lib/product";
import { getCategories, getAllBlogs } from "@/data/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `https://${process.env.NEXT_PUBLIC_SITE_URL}`
    : "https://vaultskin.co";

  // Static routes
  const staticRoutes = [
    "",
    "/about",
    "/contact",
    "/shop",
    "/blog",
    "/brand",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Categories
  const categories = getCategories();
  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/category/${category.slug.current}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await fetchProducts();
    productRoutes = products.map((product) => ({
      url: `${baseUrl}/product/${product.slug?.current || product._id}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));
  } catch (error) {
    console.error("Error fetching products for sitemap:", error);
  }

  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const blogs = await getAllBlogs();
    blogRoutes = blogs.map((blog) => ({
      url: `${baseUrl}/blog/${blog.slug?.current || blog._id}`,
      lastModified: new Date(blog.publishedAt || new Date()).toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Error fetching blogs for sitemap:", error);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes];
}
