import { db } from "@/config/firebase.config";
import { collection, getDocs, doc, getDoc, getDocFromServer } from "firebase/firestore";

export type ProductImage = {
  src?: string;
  url?: string;
  alt?: string;
};

export type ProductSlug = {
  current: string;
};

export type Product = {
  _id: string;
  _type: "product";
  id: string;
  slug: ProductSlug;
  name: string;
  description: string;
  richDescription?: string;
  price: number;
  discount: number;
  stock: number;
  sku: string;
  category: string;
  brand: string;
  images: ProductImage[];
  thumbnail: string;
  ingredients: Array<{ title: string; description: string }>;
  benefits: string[];
  howToUse: string[];
  warnings: string[];
  storageInstructions: string[];
  faqs: Array<{ question: string; answer: string }>;
  specifications: Array<{ label: string; value: string }>;
  certifications: string[];
  reviews: Array<{
    id: number;
    author: string;
    rating: number;
    date: string;
    title: string;
    content: string;
  }>;
  ratings: number;
  gallery: ProductImage[];
  badges: string[];
  tags: string[];
  categories?: string[];
  variant?: string;
  status?: "new" | "hot" | "sale";
  isFeatured?: boolean;
};

export type Category = {
  _id: string;
  title: string;
  slug: ProductSlug;
  description: string;
  image: string;
  productCount?: number;
};

export type Brand = {
  _id: string;
  title: string;
  slug: ProductSlug;
  description: string;
  image: string;
};

export type Blog = {
  _id: string;
  title: string;
  slug: ProductSlug;
  mainImage: string;
  blogcategories: Array<{ title: string }>;
  publishedAt: string;
  author: { name: string };
  body: string;
};

export type Announcement = {
  text: string;
  emoji?: string;
};

export type OrderItem = {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  email: string;
  totalPrice: number;
  status: "pending" | "paid" | "shipped" | "cancelled";
  invoice?: { number: string; hosted_invoice_url?: string };
  amountDiscount?: number;
  products?: Array<{
    product: Product;
    quantity: number;
  }>;
};

// const products: Product[] = [
//   {
//     _id: "prod-001",
//     _type: "product",
//     id: "prod-001",
//     slug: { current: "vitamin-c-brightening-serum" },
//     name: "Vitamin C Brightening Serum",
//     description:
//       "A daily antioxidant serum that visibly brightens and evens skin tone.",
//     richDescription:
//       "This multitasking serum combines vitamin C, niacinamide, and ferulic acid to brighten dullness, support collagen, and protect against environmental stressors. It layers beautifully under moisturizer and sunscreen for a radiant complexion.",
//     price: 3200,
//     discount: 400,
//     stock: 18,
//     sku: "SK-VC-001",
//     category: "Serums",
//     brand: "The Ordinary",
//     images: [
//       {
//         _key: "img-1",
//         url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
//         alt: "Vitamin C serum",
//       },
//       {
//         _key: "img-2",
//         url: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80",
//         alt: "Serum bottle",
//       },
//     ],
//     thumbnail:
//       "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
//     ingredients: [
//       {
//         title: "Vitamin C",
//         description: "Brightens the look of dull skin and supports collagen.",
//       },
//       {
//         title: "Niacinamide",
//         description: "Helps smooth texture and refine pores.",
//       },
//     ],
//     benefits: ["Brightening", "Antioxidant protection", "Even tone"],
//     howToUse: [
//       "Apply 2-3 drops to cleansed skin in the morning.",
//       "Follow with moisturizer and sunscreen.",
//     ],
//     warnings: ["Avoid contact with eyes.", "Patch test before first use."],
//     storageInstructions: [
//       "Store in a cool, dry place away from direct sunlight.",
//     ],
//     faqs: [
//       {
//         question: "Is it suitable for sensitive skin?",
//         answer: "Yes, it is designed to be gentle and fragrance-free.",
//       },
//     ],
//     specifications: [
//       { label: "Skin Type", value: "Normal, Dry, Oily" },
//       { label: "Texture", value: "Lightweight serum" },
//     ],
//     certifications: ["Cruelty-free", "Dermatologist tested"],
//     reviews: [
//       {
//         id: 1,
//         author: "Nira",
//         rating: 5,
//         date: "2026-06-01",
//         title: "Glowing skin",
//         content: "Love how radiant my skin looks after a week.",
//       },
//     ],
//     ratings: 4.8,
//     gallery: [
//       {
//         _key: "gal-1",
//         url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
//       },
//     ],
//     badges: ["Best Seller", "Vitamin C"],
//     tags: ["brightening", "serum", "vitamin-c"],
//     categories: ["serums", "brightening"],
//     variant: "serum",
//     status: "new",
//     isFeatured: true,
//   },
//   {
//     _id: "prod-002",
//     _type: "product",
//     id: "prod-002",
//     slug: { current: "hydrating-gel-cream" },
//     name: "Hydrating Gel Cream",
//     description:
//       "A lightweight gel cream that locks in moisture without feeling heavy.",
//     richDescription:
//       "This moisturizer is designed for skin that needs hydration with a fresh, bouncy finish. It combines glycerin and ceramides to support the skin barrier and maintain comfort all day.",
//     price: 2800,
//     discount: 300,
//     stock: 24,
//     sku: "SK-HC-002",
//     category: "Moisturizers",
//     brand: "CeraVe",
//     images: [
//       {
//         _key: "img-3",
//         url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
//         alt: "Gel cream",
//       },
//     ],
//     thumbnail:
//       "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
//     ingredients: [
//       { title: "Ceramides", description: "Reinforces the skin barrier." },
//       { title: "Glycerin", description: "Attracts and retains hydration." },
//     ],
//     benefits: ["Deep hydration", "Barrier support", "Non-greasy"],
//     howToUse: ["Massage over damp skin after cleansing."],
//     warnings: ["For external use only."],
//     storageInstructions: ["Keep sealed and away from heat."],
//     faqs: [
//       {
//         question: "Can I use it day and night?",
//         answer: "Yes, it works well morning and evening.",
//       },
//     ],
//     specifications: [{ label: "Texture", value: "Gel cream" }],
//     certifications: ["Dermatologist tested"],
//     reviews: [
//       {
//         id: 2,
//         author: "Mina",
//         rating: 4,
//         date: "2026-05-20",
//         title: "Comforting",
//         content: "Perfect for humid weather.",
//       },
//     ],
//     ratings: 4.6,
//     gallery: [
//       {
//         _key: "gal-2",
//         url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
//       },
//     ],
//     badges: ["Hydrating"],
//     tags: ["moisturizer", "hydration", "gel"],
//     categories: ["moisturizers", "hydration"],
//     variant: "moisturizer",
//     status: "hot",
//     isFeatured: true,
//   },
// ];

const categories: Category[] = [
  {
    _id: "cat-1",
    title: "Facewash",
    slug: { current: "facewash" },
    description: "Gentle daily essentials",
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
    productCount: 1,
  },
  {
    _id: "cat-2",
    title: "Moisturizers",
    slug: { current: "moisturizers" },
    description: "Bouncy hydration for every skin type",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    productCount: 1,
  },
  {
    _id: "cat-3",
    title: "Serums",
    slug: { current: "serums" },
    description: "Targeted treatment formulas",
    image:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80",
    productCount: 1,
  },
  {
    _id: "cat-4",
    title: "Sunscreens",
    slug: { current: "sunscreen" },
    description: "Everyday daily protection",
    image:
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=800&q=80",
    productCount: 1,
  },
  {
    _id: "cat-5",
    title: "Face Masks",
    slug: { current: "face-masks" },
    description: "Weekly treatment rituals",
    image:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80",
    productCount: 1,
  },
  {
    _id: "cat-6",
    title: "Toners",
    slug: { current: "toners" },
    description: "Hydrating prep for your routine",
    image:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    productCount: 1,
  },
];

const brands: Brand[] = [
  {
    _id: "brand-1",
    title: "SkinInspired",
    slug: { current: "skin-inspired" },
    description: "Dermatologist-developed skincare",
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
  },
 
];

const announcement: Announcement = {
  text: "Free shipping on orders over NPR 5,000",
  emoji: "✨",
};

const orders: OrderItem[] = [
  {
    orderNumber: "ORD-1001",
    orderDate: "2026-06-12",
    customerName: "Asha B.",
    email: "asha@example.com",
    totalPrice: 5800,
    status: "paid",
    invoice: { number: "INV-1001" },
  },
];

// export function getProducts(): Product[] {
//   return products;
// }

// export function getProductBySlug(slug: string): Product | undefined {
//   return products.find((product) => product.slug.current === slug);
// }

// export function getFeaturedProducts(): Product[] {
//   return products.filter((product) => product.isFeatured);
// }

// export function getDealProducts(): Product[] {
//   return products.filter(
//     (product) => product.discount > 0 || product.status === "sale",
//   );
// }

// export function getRelatedProducts(currentSlug: string): Product[] {
//   const current = getProductBySlug(currentSlug);
//   if (!current) return [];
//   return products
//     .filter(
//       (product) =>
//         product._id !== current._id && product.category === current.category,
//     )
//     .slice(0, 4);
// }

export function getCategories(): Category[] {
  return categories;
}

export function getBrands(): Brand[] {
  return brands;
}

export async function getAllBlogs(): Promise<Blog[]> {
  const snapshot = await getDocs(collection(db, "blogs"));
  return snapshot.docs.map((doc) => ({
    ...(doc.data() as Omit<Blog, "_id">),
    _id: doc.id,
  }));
}

export async function getLatestBlogs(limitCount = 4): Promise<Blog[]> {
  const blogs = await getAllBlogs();
  return [...blogs]
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, limitCount);
}

export async function getSingleBlog(slug: string): Promise<Blog | undefined> {
  const blogs = await getAllBlogs();
  return blogs.find((blog) => blog.slug.current === slug);
}

export async function getOthersBlog(
  currentSlug: string,
  limit = 5,
): Promise<Blog[]> {
  const blogs = await getAllBlogs();
  return blogs
    .filter((blog) => blog.slug.current !== currentSlug)
    .slice(0, limit);
}

export async function getBlogCategories(): Promise<Array<{ title: string }>> {
  const blogs = await getAllBlogs();
  const titles = new Set<string>();
  blogs.forEach((blog) =>
    blog.blogcategories?.forEach((c) => c.title && titles.add(c.title)),
  );
  return Array.from(titles).map((title) => ({ title }));
}

export async function getActiveAnnouncement(): Promise<Announcement> {
  try {
    const snap = await getDocFromServer(doc(db, "announcements", "active"));
    if (snap.exists()) {
      return snap.data() as Announcement;
    }
  } catch {
    try {
      const snap = await getDoc(doc(db, "announcements", "active"));
      if (snap.exists()) {
        return snap.data() as Announcement;
      }
    } catch {
      // fall through to default
    }
  }
  return announcement;
}

export function getMyOrders(): OrderItem[] {
  return orders;
}

// export function getProductsByCategory(categorySlug: string): Product[] {
//   return products.filter(
//     (product) =>
//       product.categories?.includes(categorySlug) ||
//       product.category.toLowerCase() === categorySlug.toLowerCase(),
//   );
// }

// export function getProductsByBrand(brandSlug: string): Product[] {
//   return products.filter(
//     (product) =>
//       product.brand.toLowerCase().replace(/\s+/g, "-") ===
//       brandSlug.toLowerCase(),
//   );
// }

// export function getProductById(productId: string): Product | undefined {
//   return products.find(
//     (product) => product.id === productId || product._id === productId,
//   );
// }

// export default products;
