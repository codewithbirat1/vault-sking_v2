import Link from "next/link";
import type { Brand } from "@/data/products";
import Title from "../Products/Title";
import BrandCarousel from "./BrandCarousel";
import { GitCompareArrows, Headset, ShieldCheck, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase.config";

const extraData = [
  {
    title: "Easy Returns",
    description: "Hassle-free return policy",
    icon: <GitCompareArrows size={42} />,
  },
  {
    title: "Customer Support",
    description: "Friendly 24/7 customer support",
    icon: <Headset size={42} />,
  },
  {
    title: "Secure Payment",
    description: "100% safe & encrypted checkout",
    icon: <ShieldCheck size={42} />, // or Shield
  },
  {
    title: "Fast Delivery",
    description: "Quick shipping across Nepal",
    icon: <Truck size={42} />, // or PackageCheck
  },
];

const ShopByBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "brands"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          ...(doc.data() as Omit<Brand, "_id">),
          _id: doc.id,
        }));

        setBrands(data);
        setIsLoading(false);
      },
      (error) => {
        console.error(error);
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  if (!isLoading && !brands?.length) return null;

  return (
    <section className="w-full rounded-2xl bg-surface p-5 md:p-7">
      <div className="mb-6 flex items-center justify-between border-b border-grey/60 pb-3">
        <Title className="text-accent">Shop By Brands</Title>

        <Link
          href="/shop"
          className="text-sm font-semibold tracking-wide transition-colors hover:text-primary"
        >
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-neutral-200/80 dark:bg-neutral-800/80"
            />
          ))}
        </div>
      ) : (
        <BrandCarousel brands={brands} />
      )}

      <div className="mt-4 grid grid-cols-1 gap-6 border-t border-accent/90 pt-4 sm:grid-cols-2 lg:grid-cols-4">
        {extraData.map((item) => (
          <div key={item.title} className="group flex items-center gap-4">
            <span className="text-primary transition-transform duration-300 group-hover:scale-90">
              {item.icon}
            </span>

            <div>
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ShopByBrands;
