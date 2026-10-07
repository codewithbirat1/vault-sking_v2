import { NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase.config";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Product ID is required." },
      { status: 400 },
    );
  }

  try {
    const productRef = doc(db, "products", id);
    const productDoc = await getDoc(productRef);

    if (productDoc.exists()) {
      const data = productDoc.data();
      const slug = data?.slug?.current;
      
      if (slug) {
        return NextResponse.redirect(
          new URL(`/product/${encodeURIComponent(slug)}`, req.url),
        );
      }
    }
  } catch (error) {
    console.error("Failed to redirect to product:", error);
    return NextResponse.json(
      { error: "Unable to look up the requested product." },
      { status: 500 },
    );
  }

  return NextResponse.json({ error: "Product not found." }, { status: 404 });
}
