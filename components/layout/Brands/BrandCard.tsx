import Link from "next/link";
import Image from "next/image";
import type { Brand } from "@/data/products";

interface BrandCardProps {
  brand: Brand;
}

const BrandCard = ({ brand }: BrandCardProps) => {
  if (!brand?.image || brand.image.trim().length === 0) return null;

  return (
    <Link
      href={{
        pathname: "/shop",
        query: { brand: brand.slug?.current },
      }}
      className="group flex h-20 items-center justify-center rounded-xl border border-border bg-white p-3 transition-all duration-300 hover:border-primary hover:shadow-md"
    >
      <div className="relative flex h-14 w-full items-center justify-center overflow-hidden">
        <Image
          src={brand.image}
          alt={brand.title || "Brand"}
          width={140}
          height={56}
          className="max-h-14 max-w-full w-auto h-auto object-contain transition-all duration-300 group-hover:scale-105"
        />
      </div>
    </Link>
  );
};

export default BrandCard;