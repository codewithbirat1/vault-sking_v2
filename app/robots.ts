import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://vaultskin.co";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/cart", "/checkout", "/order", "/api"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
