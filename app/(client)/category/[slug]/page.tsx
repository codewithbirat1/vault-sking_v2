import CategoryProducts from "@/components/layout/Category/CatergoryProducts";
import Container from "@/components/Container";
import Title from "@/components/layout/Products/Title";
import { fetchCategories } from "@/lib/product";
import React from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { canonicalUrl } from "@/lib/seo";

const normalizeSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const findCategory = async (slug: string) => {
  const categories = await fetchCategories();
  const normalizedSlug = normalizeSlug(slug);
  const category =
    categories.find((item) => item.slug.current === slug) ??
    categories.find(
      (item) =>
        normalizeSlug(item.slug.current) === normalizedSlug ||
        normalizeSlug(item.title) === normalizedSlug ||
        normalizeSlug(item._id) === normalizedSlug,
    ) ??
    (normalizedSlug === "cleansers"
      ? categories.find(
          (item) => normalizeSlug(item.slug.current) === "facewash",
        )
      : undefined);

  if (!category) notFound();

  if (slug !== category.slug.current) {
    permanentRedirect(
      `/category/${encodeURIComponent(category.slug.current)}`,
    );
  }

  return { category, categories };
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { category } = await findCategory(slug);
  const categoryUrl = canonicalUrl(
    `/category/${encodeURIComponent(category.slug.current)}`,
  );

  return {
    title: { absolute: `${category.title} | Vault Skin` },
    description:
      category.description ||
      `Browse ${category.title} skincare products at Vault Skin.`,
    alternates: { canonical: categoryUrl },
    openGraph: {
      title: `${category.title} | Vault Skin`,
      description:
        category.description ||
        `Browse ${category.title} skincare products at Vault Skin.`,
      url: categoryUrl,
    },
  };
}

const CategoryPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const { category, categories } = await findCategory(slug);

  return (
    <div className="py-10">
      <Container>
        <Title>
          Products by Category:{" "}
          <span className="font-bold text-green-600 capitalize tracking-wide">
            {category.title}
          </span>
        </Title>
        <CategoryProducts categories={categories} slug={category.slug.current} />
      </Container>
    </div>
  );
};

export default CategoryPage;