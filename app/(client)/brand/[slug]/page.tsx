import Container from "@/components/Container";
import ProductCard from "@/components/layout/Products/ProductCard";
import Title from "@/components/layout/Products/Title";
import { getBrands } from "@/lib/frontend-data";
import { fetchProducts } from "@/lib/product";
import { canonicalUrl } from "@/lib/seo";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

const normalizeSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const getBrand = (slug: string) => {
  const normalizedSlug = normalizeSlug(slug);
  return getBrands().find(
    (brand) =>
      normalizeSlug(brand.slug.current) === normalizedSlug ||
      normalizeSlug(brand.title) === normalizedSlug ||
      normalizeSlug(brand._id) === normalizedSlug,
  );
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) notFound();

  const brandUrl = canonicalUrl(
    `/brand/${encodeURIComponent(brand.slug.current)}`,
  );

  return {
    title: { absolute: `${brand.title} | Vault Skin` },
    description: brand.description,
    alternates: { canonical: brandUrl },
    openGraph: {
      title: `${brand.title} | Vault Skin`,
      description: brand.description,
      url: brandUrl,
    },
  };
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) notFound();

  if (slug !== brand.slug.current) {
    permanentRedirect(`/brand/${encodeURIComponent(brand.slug.current)}`);
  }

  const brandKey = brand.title.toLowerCase().replace(/[^a-z0-9]/g, "");
  const products = (await fetchProducts()).filter(
    (product) =>
      product.brand?.toLowerCase().replace(/[^a-z0-9]/g, "") === brandKey &&
      Boolean(product.slug?.current?.trim()),
  );

  return (
    <Container className="py-10">
      <Title className="mb-5">{brand.title}</Title>
      <p className="mb-6 text-sm text-gray-600">{brand.description}</p>
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-600">
          No products from this brand are currently available.
        </p>
      )}
    </Container>
  );
}
