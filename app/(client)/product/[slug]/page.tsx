import AddToCartButton from "@/components/layout/Products/AddToCartButton";
import Container from "@/components/Container";
import FavoriteButton from "@/components/layout/Products/FavoriteButton";
import ImageView from "@/components/layout/Products/ImageView";
import PriceView from "@/components/layout/Products/PriceView";
import ProductDescription from "@/components/layout/Products/ProductDescription";
import ProductAdditionalInfo from "@/components/layout/Products/ProductAdditionalInfo";
import ProductIngredients from "@/components/layout/Products/ProductIngredients";
import ProductFAQ from "@/components/layout/Products/ProductFAQ";
import ProductReviews from "@/components/layout/Products/ProductReviews";
import ProductBenefits from "@/components/layout/Products/ProductBenefits";
import ProductUsage from "@/components/layout/Products/ProductUsage";
import ProductTabs, {
  type Tab,
} from "@/components/layout/Products/ProductTabs";
import {  StarIcon, Check, Tag } from "lucide-react";
import { notFound } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { Product } from "@/data/products";
import RecommendedProducts from "@/components/layout/Products/RecommendedProducts";
import type { Metadata } from "next";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

import { getSafeImageSrc } from "@/lib/image";

const getImageSrc = (image: unknown) => {
  if (!image || typeof image !== "object") return "";

  const imageObj = image as {
    src?: unknown;
    url?: unknown;
    asset?: { url?: unknown };
  };

  const candidates = [imageObj.src, imageObj.url, imageObj.asset?.url];
  const firstValid = candidates.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  );

  return typeof firstValid === "string" ? getSafeImageSrc(firstValid.trim()) : "";
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const q = query(
    collection(db, "products"),
    where("slug.current", "==", slug),
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return { title: "Product" };
  }

  const product = snapshot.docs[0].data() as Product;
  
  const productImages = (product.images ?? []).map((img) => getImageSrc(img)).filter(Boolean);
  const ogImage = productImages.length > 0 ? productImages[0] : (typeof product.thumbnail === "string" ? getSafeImageSrc(product.thumbnail) : "");

  return {
    title: product.name,
    description:
      product.description?.slice(0, 160) ||
      `Shop ${product.name} at Vault Skin — authentic skincare in Nepal.`,
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160) || `Shop ${product.name} at Vault Skin.`,
      images: ogImage ? [{ url: ogImage }] : [],
    },
  };
}

export default async function SingleProductPage({ params }: Props) {
  const { slug } = await params;

  const q = query(
    collection(db, "products"),
    where("slug.current", "==", slug),
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    notFound();
  }

  const doc = snapshot.docs[0];

  const product = {
    ...(doc.data() as Omit<Product, "_id">),
    _id: doc.id,
  };


  const productImages = (product.images ?? []).reduce<
    { src: string; alt: string }[]
  >((acc, image) => {
    const src = getImageSrc(image);
    if (src.length > 0) {
      acc.push({
        src,
        alt: image?.alt?.trim() || product?.name || "Product image",
      });
    }
    return acc;
  }, []);

  const normalizedImages =
    productImages.length > 0
      ? productImages
      : typeof product?.thumbnail === "string" &&
          product.thumbnail.trim().length > 0
        ? [
            {
              src: product.thumbnail.trim(),
              alt: product?.name || "Product image",
            },
          ]
        : [];

  return (
    <>
      <Container className="flex flex-col md:flex-row gap-8 py-5 md:py-8">
        {normalizedImages.length > 0 && (
          <ImageView images={normalizedImages} isStock={product?.stock} />
        )}
        <div className="w-full lg:w-[50%] flex flex-col gap-5">
          <div className="space-y-2">
            {product?.badges && product.badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {product.badges.map((badge) => (
                  <span
                    key={badge}
                    className="px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700 rounded-full"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}
            <h2 className="text-2xl font-bold">{product?.name}</h2>
            <p className="text-sm text-gray-600 tracking-wide">
              {product?.description}
            </p>
            <div className="flex items-center gap-0.5 text-xs p-1">
              {[...Array(5)].map((_, index) => (
                <StarIcon
                  key={index}
                  className={
                    index < 4
                      ? "w-4 h-4  fill-yellow-700 "
                      : "w-4 h-4 text-primary fill-transparent"
                  }
                />
              ))}
              <p className="font-semibold">{`(12)`}</p>
            </div>
          </div>
          <div className="border-t border-b border-gray-200 ">
            <PriceView
              price={product?.price}
              discount={product?.discount}
              className="text-lg font-bold mb-1 mt-2"
            />
            <p
              className={`mb-2 px-4 py-1 text-sm text-center inline-block font-semibold rounded-lg ${product?.stock === 0 ? "bg-red-100 text-red-600" : "text-green-600 bg-green-100"}`}
            >
              {(product?.stock as number) > 0 ? "In Stock" : "Out of Stock"}
            </p>
          </div>
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-border z-50 md:relative md:p-0 md:bg-transparent md:border-none md:z-auto flex items-center gap-3">
            <AddToCartButton
              product={product}
              className="flex-1 md:w-auto md:flex-none"
            />
            <FavoriteButton showProduct={true} product={product} />
          </div>
    

          {(product?.certifications && product.certifications.length > 0) ||
          (product?.tags && product.tags.length > 0) ? (
            <div className="pt-4 border-t border-gray-200 space-y-4">
              {product?.certifications && product.certifications.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Certifications
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {product.certifications.map((cert) => (
                      <div
                        key={cert}
                        className="flex items-center gap-1.5 text-sm text-gray-700"
                      >
                        <Check size={16} className="text-green-500" />
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product?.tags && product.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <div
                        key={tag}
                        className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md"
                      >
                        <Tag size={12} />
                        <span>{tag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </Container>
      <Container className="pb-10">
        {(() => {
          const prod = product;
          const tabs: Tab[] = [];

          if (prod.richDescription) {
            tabs.push({
              id: "desc",
              label: "Description",
              content: <ProductDescription data={prod.richDescription} />,
            });
          }

          if (prod.specifications && prod.specifications.length > 0) {
            tabs.push({
              id: "specs",
              label: "Specifications",
              content: <ProductAdditionalInfo product={prod} />,
            });
          }

          if (prod.ingredients && prod.ingredients.length > 0) {
            tabs.push({
              id: "ingredients",
              label: "Ingredients",
              content: <ProductIngredients ingredients={prod.ingredients} />,
            });
          }

          if (prod.benefits && prod.benefits.length > 0) {
            tabs.push({
              id: "benefits",
              label: "Benefits",
              content: <ProductBenefits benefits={prod.benefits} />,
            });
          }

          const hasUsageInfo =
            (prod.howToUse && prod.howToUse.length > 0) ||
            (prod.warnings && prod.warnings.length > 0) ||
            (prod.storageInstructions && prod.storageInstructions.length > 0);

          if (hasUsageInfo) {
            tabs.push({
              id: "usage",
              label: "How to Use",
              content: (
                <ProductUsage
                  howToUse={prod.howToUse}
                  warnings={prod.warnings}
                  storageInstructions={prod.storageInstructions}
                />
              ),
            });
          }

          if (prod.faqs && prod.faqs.length > 0) {
            tabs.push({
              id: "faq",
              label: "FAQ",
              content: <ProductFAQ faq={prod.faqs} />,
            });
          }

          tabs.push({
            id: "reviews",
            label: "Reviews",
            content: <ProductReviews />,
          });

          return <ProductTabs tabs={tabs} />;
        })()}
        <RecommendedProducts currentProductId={product._id} />
      </Container>
    </>
  );
}
