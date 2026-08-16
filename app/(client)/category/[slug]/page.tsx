import CategoryProducts from "@/components/layout/Category/CatergoryProducts";
import Container from "@/components/Container";
import Title from "@/components/layout/Products/Title";
import { getCategories } from "@/lib/frontend-data";
import React from "react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategories().find((item) => item.slug.current === slug);

  return {
    title: category ? category.title : slug,
    description:
      category?.description ||
      `Browse ${category?.title ?? slug} skincare products at Vault Skin.`,
  };
}

const CategoryPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  return (
    <div className="py-10">
      <Container>
        <Title>
          Products by Category:{" "}
          <span className="font-bold text-green-600 capitalize tracking-wide">
            {slug && slug}
          </span>
        </Title>
        <CategoryProducts categories={getCategories()} slug={slug} />
      </Container>
    </div>
  );
};

export default CategoryPage;