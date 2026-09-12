import ProductCard from "../Products/ProductCard";
import type { Product } from "@/data/products";

export default function RecommendedProducts({ products = [] }: { products?: Product[] }) {
  if (!products.length) return null;

  return (
    <div className="print:hidden">
      <div className="py-10 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-text">
          You might also like
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} index={99} />
        ))}
      </div>
    </div>
  );
}