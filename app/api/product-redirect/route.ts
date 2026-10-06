import { NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase.config";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    const productRef = doc(db, "products", id);
    const productDoc = await getDoc(productRef);

    if (productDoc.exists()) {
      const data = productDoc.data();
      const slug = data?.slug?.current;
      
      if (slug) {
        return NextResponse.redirect(new URL(`/product/${slug}?review=true`, req.url));
      }
    }
  } catch (error) {
    console.error("Failed to redirect to product:", error);
  }

  // Fallback if product or slug not found
  return NextResponse.redirect(new URL("/", req.url));
}
